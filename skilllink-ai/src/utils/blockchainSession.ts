import algosdk from 'algosdk';
import { supabase } from '../services/supabase';

// --- ENCRYPTION UTILS ---
export async function generateSessionKey(): Promise<Uint8Array> {
  return window.crypto.getRandomValues(new Uint8Array(32));
}

export async function encryptSessionData(data: string, key: Uint8Array): Promise<{ iv: Uint8Array; ciphertext: ArrayBuffer }> {
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await window.crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['encrypt']);
  const ciphertext = await window.crypto.subtle.encrypt({ name: 'AES-GCM', iv }, cryptoKey, new TextEncoder().encode(data));
  return { iv, ciphertext };
}

export async function decryptSessionData(ciphertext: ArrayBuffer, key: Uint8Array, iv: Uint8Array): Promise<string> {
  const cryptoKey = await window.crypto.subtle.importKey('raw', key, 'AES-GCM', false, ['decrypt']);
  const plaintext = await window.crypto.subtle.decrypt({ name: 'AES-GCM', iv }, cryptoKey, ciphertext);
  return new TextDecoder().decode(plaintext);
}

// --- ALGORAND CONFIGURATION ---
const ALGORAND_CONFIG = {
  testnet: {
    server: 'https://testnet-api.4160.nodely.dev',
    port: 443,
    token: '',
    indexer: 'https://testnet-idx.4160.nodely.dev'
  },
  mainnet: {
    server: 'https://mainnet-api.4160.nodely.dev',
    port: 443,
    token: '',
    indexer: 'https://mainnet-idx.4160.nodely.dev'
  }
};

const isMainnet = import.meta.env.VITE_ALGORAND_NETWORK === 'mainnet';
const config = isMainnet ? ALGORAND_CONFIG.mainnet : ALGORAND_CONFIG.testnet;

const algodClient = new algosdk.Algodv2(config.token, config.server, config.port);
const indexerClient = new algosdk.Indexer(config.token, config.indexer, config.port);

// --- SESSION BLOCKCHAIN INTEGRATION ---
export interface BlockchainSession {
  sessionId: string;
  participants: string[];
  sessionHash: string;
  transactionId: string;
  timestamp: number;
  encrypted: boolean;
  paymentAmount?: number;
  paymentTxId?: string;
}

export class BlockchainSessionService {
  // Store session metadata on Algorand blockchain
  static async storeSessionOnBlockchain(sessionData: {
    sessionId: string;
    participants: string[];
    sessionType: string;
    duration: number;
    skills: string[];
  }, senderMnemonic: string): Promise<string> {
    try {
      const sender = algosdk.mnemonicToSecretKey(senderMnemonic);
      
      // Create session metadata
      const metadata = {
        id: sessionData.sessionId,
        type: sessionData.sessionType,
        participants: sessionData.participants,
        duration: sessionData.duration,
        skills: sessionData.skills,
        timestamp: Date.now()
      };

      // Encrypt session data
      const key = await generateSessionKey();
      const { iv, ciphertext } = await encryptSessionData(JSON.stringify(metadata), key);
      
      // Create hash of encrypted data
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', ciphertext);
      const sessionHash = Array.from(new Uint8Array(hashBuffer))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');

      // Store hash on blockchain
      const params = await algodClient.getTransactionParams().do();
      const note = new TextEncoder().encode(JSON.stringify({
        type: 'skilllink_session',
        hash: sessionHash,
        participants: sessionData.participants.length,
        encrypted: true
      }));

      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: sender.addr.toString(),
        receiver: sender.addr.toString(), // Self-transaction for data storage
        amount: 0,
        note,
        suggestedParams: params,
      });

      const signedTxn = txn.signTxn(sender.sk);
      const txId = txn.txID().toString();
      await algodClient.sendRawTransaction(signedTxn).do();

      // Store encryption key securely (in practice, share with participants only)
      await this.storeEncryptionKey(sessionData.sessionId, key, iv);

      // Save blockchain record to database
      await supabase.from('blockchain_sessions').insert({
        session_id: sessionData.sessionId,
        transaction_id: txId,
        session_hash: sessionHash,
        participants: sessionData.participants,
        encrypted: true,
        created_at: new Date().toISOString()
      });

      return txId;
    } catch (error) {
      console.error('Error storing session on blockchain:', error);
      throw error;
    }
  }

  // Process payment for skill exchange session
  static async processSessionPayment({
    sessionId,
    amountAlgos,
    senderMnemonic,
    receiverAddress,
    sessionMetadata
  }: {
    sessionId: string;
    amountAlgos: number;
    senderMnemonic: string;
    receiverAddress: string;
    sessionMetadata: any;
  }): Promise<string> {
    try {
      const sender = algosdk.mnemonicToSecretKey(senderMnemonic);
      const params = await algodClient.getTransactionParams().do();
      
      const note = new TextEncoder().encode(JSON.stringify({
        type: 'skilllink_payment',
        sessionId,
        metadata: sessionMetadata
      }));

      const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
        sender: String(sender.addr),
        receiver: String(receiverAddress),
        amount: algosdk.algosToMicroalgos(amountAlgos),
        note,
        suggestedParams: params,
      } as any);

      const signedTxn = txn.signTxn(sender.sk);
      const txId = txn.txID().toString();
      await algodClient.sendRawTransaction(signedTxn).do();

      // Record payment in database
      await supabase.from('blockchain_payments').insert({
        session_id: sessionId,
        transaction_id: txId,
        amount_algos: amountAlgos,
        sender_address: sender.addr,
        receiver_address: receiverAddress,
        status: 'completed',
        created_at: new Date().toISOString()
      });

      return txId;
    } catch (error) {
      console.error('Error processing session payment:', error);
      throw error;
    }
  }

  // Verify session integrity
  static async verifySessionIntegrity(sessionId: string): Promise<boolean> {
    try {
      // Get blockchain record
      const { data: blockchainRecord } = await supabase
        .from('blockchain_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (!blockchainRecord) return false;

      // Get transaction from blockchain
      const txInfo = await indexerClient.lookupTransactionByID(blockchainRecord.transaction_id).do();
      
      if (!txInfo.transaction) return false;

      // Verify transaction note contains session hash
      const noteBytes = txInfo.transaction.note;
      if (!noteBytes) return false;

      const noteString = new TextDecoder().decode(new Uint8Array(noteBytes));
      const noteData = JSON.parse(noteString);

      return noteData.hash === blockchainRecord.session_hash;
    } catch (error) {
      console.error('Error verifying session integrity:', error);
      return false;
    }
  }

  // Get session from blockchain
  static async getSessionFromBlockchain(sessionId: string): Promise<any> {
    try {
      // Get encryption key and IV
      const { key, iv } = await this.getEncryptionKey(sessionId);
      if (!key || !iv) throw new Error('Encryption key not found');

      // Get blockchain record
      const { data: blockchainRecord } = await supabase
        .from('blockchain_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (!blockchainRecord) throw new Error('Blockchain record not found');

      // Get transaction from blockchain
      const txInfo = await indexerClient.lookupTransactionByID(blockchainRecord.transaction_id).do();
      
      // In a real implementation, you would decrypt the session data here
      // For now, return the available metadata
      return {
        sessionId,
        transactionId: blockchainRecord.transaction_id,
        sessionHash: blockchainRecord.session_hash,
        participants: blockchainRecord.participants,
        verified: await this.verifySessionIntegrity(sessionId)
      };
    } catch (error) {
      console.error('Error getting session from blockchain:', error);
      throw error;
    }
  }

  // Store encryption key securely (in practice, use secure key management)
  private static async storeEncryptionKey(sessionId: string, key: Uint8Array, iv: Uint8Array): Promise<void> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      // In production, use proper key management service
      // For demo, store encrypted in database (not recommended for production)
      const keyBase64 = btoa(String.fromCharCode(...key));
      const ivBase64 = btoa(String.fromCharCode(...iv));

      await supabase.from('session_keys').insert({
        session_id: sessionId,
        user_id: user.user.id,
        encryption_key: keyBase64,
        iv: ivBase64,
        created_at: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error storing encryption key:', error);
      throw error;
    }
  }

  // Get encryption key (in practice, use secure key management)
  private static async getEncryptionKey(sessionId: string): Promise<{ key: Uint8Array; iv: Uint8Array }> {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('User not authenticated');

      const { data: keyRecord } = await supabase
        .from('session_keys')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', user.user.id)
        .single();

      if (!keyRecord) throw new Error('Encryption key not found');

      const key = new Uint8Array(atob(keyRecord.encryption_key).split('').map(c => c.charCodeAt(0)));
      const iv = new Uint8Array(atob(keyRecord.iv).split('').map(c => c.charCodeAt(0)));

      return { key, iv };
    } catch (error) {
      console.error('Error getting encryption key:', error);
      throw error;
    }
  }

  // Get user's Algorand address from mnemonic
  static getAddressFromMnemonic(mnemonic: string): string {
    try {
      const account = algosdk.mnemonicToSecretKey(mnemonic);
      return account.addr.toString();
    } catch (error) {
      console.error('Error getting address from mnemonic:', error);
      throw error;
    }
  }

  // Generate new Algorand account
  static generateAccount(): { address: string; mnemonic: string } {
    try {
      const account = algosdk.generateAccount();
      const mnemonic = algosdk.secretKeyToMnemonic(account.sk);
      return {
        address: account.addr.toString(),
        mnemonic
      };
    } catch (error) {
      console.error('Error generating account:', error);
      throw error;
    }
  }

  // Get account balance
  static async getAccountBalance(address: string): Promise<number> {
    try {
      const accountInfo = await algodClient.accountInformation(address).do();
      return algosdk.microalgosToAlgos(Number(accountInfo.amount));
    } catch (error) {
      console.error('Error getting account balance:', error);
      return 0;
    }
  }

  // Get transaction history for session payments
  static async getSessionPaymentHistory(sessionId: string): Promise<any[]> {
    try {
      const { data: payments } = await supabase
        .from('blockchain_payments')
        .select('*')
        .eq('session_id', sessionId)
        .order('created_at', { ascending: false });

      return payments || [];
    } catch (error) {
      console.error('Error getting payment history:', error);
      return [];
    }
  }

  // Validate Algorand address
  static isValidAddress(address: string): boolean {
    try {
      return algosdk.isValidAddress(address);
    } catch {
      return false;
    }
  }

  // Get network status
  static async getNetworkStatus(): Promise<any> {
    try {
      const status = await algodClient.status().do();
      return {
        network: isMainnet ? 'mainnet' : 'testnet',
        lastRound: status.lastRound,
        timeSinceLastRound: status.timeSinceLastRound,
        catchupTime: status.catchupTime
      };
    } catch (error) {
      console.error('Error getting network status:', error);
      throw error;
    }
  }
}

// Export utility functions
export {
  algodClient,
  indexerClient
};
