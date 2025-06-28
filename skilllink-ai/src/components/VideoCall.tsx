import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff, 
  Monitor, 
  Settings,
  Users,
  MessageSquare,
  MoreVertical,
  Maximize2,
  Volume2,
  VolumeX,
  Copy,
  UserPlus,
  Loader2,
  X,
  Send
} from 'lucide-react';

interface VideoCallProps {
  roomId?: string;
  onCallEnd?: () => void;
}

interface Participant {
  id: string;
  stream?: MediaStream;
  name: string;
  isLocal?: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export default function VideoCall({ roomId, onCallEnd }: VideoCallProps) {
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{id: string, sender: string, message: string, timestamp: Date}>>([]);
  const [newMessage, setNewMessage] = useState('');
  const [callDuration, setCallDuration] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [roomCode, setRoomCode] = useState<string>('');
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const callStartTime = useRef<Date | null>(null);

  // Generate or use provided room ID
  const currentRoomId = roomId || `room-${Math.random().toString(36).substr(2, 9)}`;

  useEffect(() => {
    initializeCall();
    return () => {
      cleanup();
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (callStartTime.current) {
      interval = setInterval(() => {
        const now = new Date();
        const diff = Math.floor((now.getTime() - callStartTime.current!.getTime()) / 1000);
        setCallDuration(diff);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [callStartTime.current]);

  const initializeCall = async () => {
    try {
      setIsConnecting(true);
      setConnectionError(null);

      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isVideoEnabled,
        audio: isAudioEnabled
      });
      
      setLocalStream(stream);
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Generate room code for sharing
      setRoomCode(currentRoomId.slice(-6).toUpperCase());
      
      setIsConnecting(false);
      callStartTime.current = new Date();
      
      // Add local participant
      setParticipants([{
        id: 'local',
        stream,
        name: 'You',
        isLocal: true,
        audioEnabled: isAudioEnabled,
        videoEnabled: isVideoEnabled
      }]);

      // Simulate adding a remote participant after 3 seconds for demo
      setTimeout(() => {
        addMockParticipant();
      }, 3000);

    } catch (error) {
      console.error('Error initializing video call:', error);
      setConnectionError('Could not access camera/microphone. Please check permissions.');
      setIsConnecting(false);
    }
  };

  const addMockParticipant = () => {
    const mockParticipant: Participant = {
      id: 'mock-user',
      name: 'Demo User',
      audioEnabled: true,
      videoEnabled: true
    };
    
    setParticipants(prev => [...prev, mockParticipant]);
  };

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !isVideoEnabled;
        setIsVideoEnabled(!isVideoEnabled);
        
        // Update local participant
        setParticipants(prev => prev.map(p => 
          p.isLocal ? { ...p, videoEnabled: !isVideoEnabled } : p
        ));
      }
    }
  };

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !isAudioEnabled;
        setIsAudioEnabled(!isAudioEnabled);
        
        // Update local participant
        setParticipants(prev => prev.map(p => 
          p.isLocal ? { ...p, audioEnabled: !isAudioEnabled } : p
        ));
      }
    }
  };

  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        const screenStream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true
        });
        
        setIsScreenSharing(true);
        
        screenStream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      } else {
        setIsScreenSharing(false);
      }
    } catch (error) {
      console.error('Error toggling screen share:', error);
    }
  };

  const endCall = () => {
    cleanup();
    onCallEnd?.();
  };

  const cleanup = () => {
    // Stop local stream
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }

    setParticipants([]);
    setLocalStream(null);
    callStartTime.current = null;
  };

  const copyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    // You could add a toast notification here
  };

  const sendMessage = () => {
    if (!newMessage.trim()) return;
    
    const message = {
      id: Date.now().toString(),
      sender: 'You',
      message: newMessage,
      timestamp: new Date()
    };
    
    setChatMessages(prev => [...prev, message]);
    setNewMessage('');
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  if (connectionError) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 rounded-2xl">
        <div className="text-center text-white p-8">
          <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <PhoneOff className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Connection Failed</h3>
          <p className="text-gray-300 mb-4">{connectionError}</p>
          <button
            onClick={initializeCall}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-lg font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (isConnecting) {
    return (
      <div className="h-full flex items-center justify-center bg-gray-900 rounded-2xl">
        <div className="text-center text-white">
          <Loader2 className="w-12 h-12 animate-spin mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">Connecting...</h3>
          <p className="text-gray-300">Setting up your video call</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative h-full bg-gray-900 rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-20 bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-white font-medium">Live • {formatDuration(callDuration)}</span>
            </div>
            <div className="text-white text-sm">
              {participants.length} participant{participants.length !== 1 ? 's' : ''}
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={copyRoomCode}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
              title="Copy Room Code"
            >
              <Copy className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
              title="Fullscreen"
            >
              <Maximize2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="bg-white/20 hover:bg-white/30 text-white p-2 rounded-lg backdrop-blur-sm transition-colors"
              title="More"
            >
              <MoreVertical className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Grid */}
      <div className="h-full p-4 pt-20 pb-24 overflow-y-auto">
        <div className={`h-full grid gap-4 items-center justify-center ${{
          1: 'grid-cols-1',
          2: 'grid-cols-2',
          3: 'grid-cols-2 grid-rows-2',
          4: 'grid-cols-2 grid-rows-2',
        }[Math.min(participants.length, 4)] || 'grid-cols-3 grid-rows-2'}`}
          style={{ minHeight: '300px' }}
        >
          {participants.length === 0 && (
            <div className="col-span-full flex flex-col items-center justify-center h-full text-gray-400">
              <Users className="w-12 h-12 mb-2" />
              <span>No participants yet</span>
            </div>
          )}
          {participants.map((participant) => (
            <motion.div
              key={participant.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="relative bg-gray-800 rounded-xl overflow-hidden group min-h-[180px]"
            >
              {participant.videoEnabled && participant.stream ? (
                <video
                  ref={participant.isLocal ? localVideoRef : undefined}
                  autoPlay
                  playsInline
                  muted={participant.isLocal}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-16 h-16 bg-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white text-xl font-semibold">
                      {participant.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
              
              {/* Participant Info */}
              <div className="absolute bottom-4 left-4 right-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2 flex items-center justify-between">
                  <span className="text-white font-medium text-sm">{participant.name}</span>
                  <div className="flex items-center space-x-2">
                    {!participant.audioEnabled && (
                      <MicOff className="w-4 h-4 text-red-400" />
                    )}
                    {!participant.videoEnabled && (
                      <VideoOff className="w-4 h-4 text-red-400" />
                    )}
                  </div>
                </div>
              </div>
              
              {participant.isLocal && (
                <div className="absolute top-4 left-4">
                  <span className="bg-indigo-600 text-white px-2 py-1 rounded text-xs font-medium">
                    You
                  </span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 z-20">
        <div className="flex items-center justify-center space-x-4 flex-wrap">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full transition-all ${
              isAudioEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={isAudioEnabled ? 'Mute' : 'Unmute'}
          >
            {isAudioEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full transition-all ${
              isVideoEnabled 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-red-500 hover:bg-red-600 text-white'
            }`}
            title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          >
            {isVideoEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
          </button>
          <button
            onClick={toggleScreenShare}
            className={`p-4 rounded-full transition-all ${
              isScreenSharing 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-gray-700 hover:bg-gray-600 text-white'
            }`}
            title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          >
            <Monitor className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowChat(!showChat)}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all"
            title="Chat"
          >
            <MessageSquare className="w-6 h-6" />
          </button>
          <button
            onClick={() => setShowParticipants(!showParticipants)}
            className="p-4 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all"
            title="Participants"
          >
            <Users className="w-6 h-6" />
          </button>
          <button
            onClick={endCall}
            className="p-4 rounded-full bg-red-500 hover:bg-red-600 text-white transition-all"
            title="End call"
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
      </div>

      {/* Room Code Display */}
      {roomCode && (
        <div className="absolute top-20 left-4 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
          <div className="text-white text-sm">
            <span className="text-gray-300">Room Code: </span>
            <span className="font-mono font-bold">{roomCode}</span>
            <button
              onClick={copyRoomCode}
              className="ml-2 text-indigo-400 hover:text-indigo-300"
              title="Copy Room Code"
            >
              <Copy className="w-3 h-3 inline" />
            </button>
          </div>
        </div>
      )}

      {/* Chat Panel */}
      <AnimatePresence>
        {showChat && (
          <motion.div
            initial={{ x: isMobile ? 0 : 400, y: isMobile ? 400 : 0, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ x: isMobile ? 0 : 400, y: isMobile ? 400 : 0, opacity: 0 }}
            className={`absolute ${isMobile ? 'bottom-0 left-0 right-0 h-2/3' : 'top-0 right-0 w-80 h-full'} bg-white shadow-2xl z-30`}
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">Chat</h3>
                <button
                  onClick={() => setShowChat(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="bg-gray-50 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-medium text-sm text-gray-900">{msg.sender}</span>
                      <span className="text-xs text-gray-500">
                        {msg.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-gray-700 text-sm">{msg.message}</p>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                  <button
                    onClick={sendMessage}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white p-2 rounded-lg"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Participants Panel */}
      <AnimatePresence>
        {showParticipants && (
          <motion.div
            initial={{ x: isMobile ? 0 : 400, y: isMobile ? 400 : 0, opacity: 0 }}
            animate={{ x: 0, y: 0, opacity: 1 }}
            exit={{ x: isMobile ? 0 : 400, y: isMobile ? 400 : 0, opacity: 0 }}
            className={`absolute ${isMobile ? 'bottom-0 left-0 right-0 h-2/3' : 'top-0 right-0 w-80 h-full'} bg-white shadow-2xl z-30`}
          >
            <div className="h-full flex flex-col">
              <div className="p-4 border-b border-gray-200 flex items-center justify-between">
                <h3 className="font-semibold text-gray-900">
                  Participants ({participants.length})
                </h3>
                <button
                  onClick={() => setShowParticipants(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {participant.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{participant.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        {participant.audioEnabled ? (
                          <Mic className="w-3 h-3 text-green-500" />
                        ) : (
                          <MicOff className="w-3 h-3 text-red-500" />
                        )}
                        {participant.videoEnabled ? (
                          <Video className="w-3 h-3 text-green-500" />
                        ) : (
                          <VideoOff className="w-3 h-3 text-red-500" />
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-4 border-t border-gray-200">
                <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 rounded-lg font-medium flex items-center justify-center space-x-2">
                  <UserPlus className="w-4 h-4" />
                  <span>Invite Others</span>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}