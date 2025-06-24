import algosdk from 'algosdk';

// --- ENCRYPTION UTILS ---
export async function generateSessionKey() {
  // 256-bit random key
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

// --- ALGOD SETUP (TestNet for demo) ---
const algodToken = ''; // free service does not require tokens
const algodServer = 'https://testnet-api.4160.nodely.dev';
const algodPort = 443;
const algodClient = new algosdk.Algodv2(algodToken, algodServer, algodPort);

// Utility: Check Algorand node status (for debugging)
export async function getNodeStatus() {
  try {
    const status = await algodClient.status().do();
    console.log('Node status:', status);
    return status;
  } catch (err) {
    console.error('Failed to get node status:', err);
    throw err;
  }
}

// --- STORE SESSION HASH ON ALGOLAND ---
export async function storeSessionHashOnAlgorand(sessionHash: string, senderMnemonic: string) {
  const sender = algosdk.mnemonicToSecretKey(senderMnemonic);
  const params = await algodClient.getTransactionParams().do();
  const note = new TextEncoder().encode(sessionHash);
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender.addr as unknown as string, // Algorand address to string
    to: sender.addr as unknown as string, // Algorand address to string
    amount: 0,
    note,
    suggestedParams: params,
  } as any); // Type assertion to bypass TS type error
  const signedTxn = txn.signTxn(sender.sk);
  const res = await algodClient.sendRawTransaction(signedTxn).do();
  return res.txid;
}

// --- PAY FOR SESSION ON ALGOLAND ---
export async function payForSessionOnAlgorand({
  amountAlgos,
  senderMnemonic,
  receiverAddress,
  note
}: {
  amountAlgos: number,
  senderMnemonic: string,
  receiverAddress: string,
  note?: string
}) {
  const sender = algosdk.mnemonicToSecretKey(senderMnemonic);
  const params = await algodClient.getTransactionParams().do();
  const txn = algosdk.makePaymentTxnWithSuggestedParamsFromObject({
    from: sender.addr as unknown as string,
    to: receiverAddress as unknown as string,
    amount: algosdk.algosToMicroalgos(amountAlgos),
    note: note ? new TextEncoder().encode(note) : undefined,
    suggestedParams: params,
  } as any);
  const signedTxn = txn.signTxn(sender.sk);
  const res = await algodClient.sendRawTransaction(signedTxn).do();
  return res.txid;
}

// --- EXAMPLE USAGE ---
// 1. Generate a session key (per session)
// const key = await generateSessionKey();
// 2. Encrypt session data (e.g., session metadata)
// const { iv, ciphertext } = await encryptSessionData(JSON.stringify({ sessionId, participants }), key);
// 3. Hash the ciphertext (SHA-256)
// const hashBuffer = await window.crypto.subtle.digest('SHA-256', ciphertext);
// const hashHex = Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
// 4. Store hashHex on Algorand: await storeSessionHashOnAlgorand(hashHex, senderMnemonic);
// 5. Share key+iv out-of-band with the other participant only.
