import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Camera, 
  Mic, 
  Play, 
  Pause, 
  Square, 
  RotateCcw,
  Eye,
  Volume2,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock,
  Upload,
  FileVideo
} from 'lucide-react';
import { supabase } from '../services/supabase';

interface AnalysisResult {
  overallScore: number;
  eyeContact: number;
  speechClarity: number;
  pacing: number;
  confidence: number;
  gestures: number;
  feedback: string[];
  improvements: string[];
  transcript?: string;
}

export default function VideoAnalysis() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recordedChunks, setRecordedChunks] = useState<Blob[]>([]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
    }
  };

  const startRecording = async () => {
    if (!stream) {
      await startCamera();
      return;
    }

    const mediaRecorder = new MediaRecorder(stream);
    mediaRecorderRef.current = mediaRecorder;
    setRecordedChunks([]);
    
    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        setRecordedChunks(prev => [...prev, event.data]);
      }
    };

    mediaRecorder.start();
    setIsRecording(true);
    setRecordingTime(0);
    setAnalysisResult(null);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
    analyzeVideo();
  };

  const analyzeVideo = async () => {
    setIsAnalyzing(true);
    
    try {
      // Create video blob from recorded chunks
      const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
      
      // Upload video to Supabase storage
      const fileName = `video-analysis-${Date.now()}.webm`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('video-analyses')
        .upload(fileName, videoBlob);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return;
      }

      // Tavus Video Processing Integration
      // ----------------------------------
      // Example: Send videoBlob or uploadData.path to Tavus API for video analysis
      // Replace the following with your actual Tavus API call
      try {
        // const tavusResult = await tavusAnalyze(videoBlob);
        // console.log('Tavus video analysis result:', tavusResult);
      } catch (err) {
        console.error('Error with Tavus video analysis:', err);
      }

      // ElevenLabs Voice Analysis Integration
      // -------------------------------------
      // Example: Extract audio from videoBlob and send to ElevenLabs API for voice analysis
      // Replace the following with your actual ElevenLabs API call
      try {
        // const elevenLabsResult = await elevenLabsAnalyze(videoBlob);
        // console.log('ElevenLabs voice analysis result:', elevenLabsResult);
      } catch (err) {
        console.error('Error with ElevenLabs voice analysis:', err);
      }
      // ----------------------------------
      
      // Here you would integrate with AI services:
      // 1. Tavus for video processing
      // 2. OpenAI/Claude for content analysis
      // 3. ElevenLabs for voice analysis
      
      // For now, we'll simulate the analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const mockResult: AnalysisResult = {
        overallScore: Math.floor(Math.random() * 20) + 80,
        eyeContact: Math.floor(Math.random() * 30) + 70,
        speechClarity: Math.floor(Math.random() * 20) + 80,
        pacing: Math.floor(Math.random() * 25) + 75,
        confidence: Math.floor(Math.random() * 15) + 85,
        gestures: Math.floor(Math.random() * 20) + 80,
        feedback: [
          "Excellent speech clarity and pronunciation",
          "Good use of hand gestures to emphasize points",
          "Confident posture throughout the presentation"
        ],
        improvements: [
          "Maintain more consistent eye contact with the camera",
          "Slow down slightly during complex explanations",
          "Add more pauses for emphasis"
        ],
        transcript: "This is a sample transcript of your speech. In a real implementation, this would be generated by speech-to-text AI."
      };

      // Save analysis to database
      const { data: user } = await supabase.auth.getUser();
      if (user.user) {
        await supabase.from('video_analyses').insert({
          user_id: user.user.id,
          video_url: uploadData.path,
          analysis_result: mockResult,
          duration: recordingTime,
          created_at: new Date().toISOString()
        });
      }

      setAnalysisResult(mockResult);
    } catch (error) {
      console.error('Error analyzing video:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      setUploadedFile(file);
      analyzeUploadedVideo(file);
    }
  };

  const analyzeUploadedVideo = async (file: File) => {
    setIsAnalyzing(true);
    
    try {
      // Upload file to Supabase storage
      const fileName = `uploaded-${Date.now()}-${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('video-analyses')
        .upload(fileName, file);

      if (uploadError) {
        console.error('Upload error:', uploadError);
        return;
      }

      // Tavus Video Processing Integration (Uploaded File)
      // -------------------------------------------------
      // Example: Send file or uploadData.path to Tavus API for video analysis
      // Replace the following with your actual Tavus API call
      try {
        // const tavusResult = await tavusAnalyze(file);
        // console.log('Tavus video analysis result (uploaded):', tavusResult);
      } catch (err) {
        console.error('Error with Tavus video analysis (uploaded):', err);
      }

      // ElevenLabs Voice Analysis Integration (Uploaded File)
      // ----------------------------------------------------
      // Example: Extract audio from file and send to ElevenLabs API for voice analysis
      // Replace the following with your actual ElevenLabs API call
      try {
        // const elevenLabsResult = await elevenLabsAnalyze(file);
        // console.log('ElevenLabs voice analysis result (uploaded):', elevenLabsResult);
      } catch (err) {
        console.error('Error with ElevenLabs voice analysis (uploaded):', err);
      }
      // ----------------------------------------------------

      // Analyze uploaded video (same process as recorded video)
      await analyzeVideo();
    } catch (error) {
      console.error('Error analyzing uploaded video:', error);
    }
  };

  const resetSession = () => {
    setRecordingTime(0);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setUploadedFile(null);
    setRecordedChunks([]);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBackground = (score: number) => {
    if (score >= 80) return 'bg-green-100';
    if (score >= 60) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Video Analysis</h2>
          <p className="text-gray-600">AI-powered analysis of your presentation skills</p>
        </div>
        <div className="flex space-x-3">
          <label className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium cursor-pointer flex items-center space-x-2">
            <Upload className="w-4 h-4" />
            <span>Upload Video</span>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileUpload}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Video Preview */}
      <div className="bg-gray-900 rounded-xl aspect-video relative overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          className="w-full h-full object-cover"
        />
        
        {/* Recording Indicator */}
        {isRecording && (
          <div className="absolute top-4 left-4 flex items-center space-x-2 bg-red-500 px-3 py-1 rounded-full">
            <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
            <span className="text-white text-sm font-medium">REC {formatTime(recordingTime)}</span>
          </div>
        )}

        {/* Analysis Overlay */}
        {isAnalyzing && (
          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <div className="text-center text-white">
              <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-lg font-medium">Analyzing your performance...</p>
              <p className="text-sm text-gray-300">Processing with AI services</p>
            </div>
          </div>
        )}

        {/* No Camera State */}
        {!stream && !isRecording && !uploadedFile && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Camera className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Ready to analyze?</p>
              <p className="text-gray-400">Record a video or upload one for AI analysis</p>
            </div>
          </div>
        )}

        {/* Uploaded File State */}
        {uploadedFile && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <FileVideo className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p className="text-lg mb-2">Video uploaded</p>
              <p className="text-gray-400">{uploadedFile.name}</p>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center space-x-4">
        {!stream && !uploadedFile ? (
          <button
            onClick={startCamera}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors"
          >
            <Camera className="w-5 h-5" />
            <span>Enable Camera</span>
          </button>
        ) : !isRecording && !uploadedFile ? (
          <button
            onClick={startRecording}
            className="bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors"
          >
            <Play className="w-5 h-5" />
            <span>Start Recording</span>
          </button>
        ) : isRecording ? (
          <button
            onClick={stopRecording}
            className="bg-gray-500 hover:bg-gray-600 text-white px-8 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors"
          >
            <Square className="w-5 h-5" />
            <span>Stop & Analyze</span>
          </button>
        ) : null}
        
        {(analysisResult || recordingTime > 0 || uploadedFile) && (
          <button
            onClick={resetSession}
            className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-3 rounded-xl font-medium flex items-center space-x-2 transition-colors"
          >
            <RotateCcw className="w-5 h-5" />
            <span>Reset</span>
          </button>
        )}
      </div>

      {/* Analysis Results */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
        >
          <h3 className="text-xl font-bold text-gray-900 mb-6">AI Analysis Results</h3>
          
          {/* Overall Score */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full text-white text-3xl font-bold mb-4">
              {analysisResult.overallScore}
            </div>
            <h4 className="text-lg font-semibold text-gray-900">Overall Performance</h4>
            <p className="text-gray-600">AI-powered comprehensive analysis</p>
          </div>

          {/* Detailed Scores */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
            {[
              { label: 'Eye Contact', score: analysisResult.eyeContact, icon: Eye },
              { label: 'Speech Clarity', score: analysisResult.speechClarity, icon: Volume2 },
              { label: 'Pacing', score: analysisResult.pacing, icon: Clock },
              { label: 'Confidence', score: analysisResult.confidence, icon: TrendingUp },
              { label: 'Gestures', score: analysisResult.gestures, icon: Mic }
            ].map((metric, index) => (
              <div key={index} className={`p-4 rounded-lg ${getScoreBackground(metric.score)}`}>
                <div className="flex items-center space-x-2 mb-2">
                  <metric.icon className={`w-4 h-4 ${getScoreColor(metric.score)}`} />
                  <span className="text-sm font-medium text-gray-900">{metric.label}</span>
                </div>
                <div className={`text-2xl font-bold ${getScoreColor(metric.score)}`}>
                  {metric.score}%
                </div>
              </div>
            ))}
          </div>

          {/* Feedback */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>What You Did Well</span>
              </h5>
              <ul className="space-y-2">
                {analysisResult.feedback.map((item, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h5 className="font-semibold text-gray-900 mb-3 flex items-center space-x-2">
                <AlertCircle className="w-5 h-5 text-orange-600" />
                <span>Areas for Improvement</span>
              </h5>
              <ul className="space-y-2">
                {analysisResult.improvements.map((item, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start space-x-2">
                    <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2 flex-shrink-0"></div>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Transcript */}
          {analysisResult.transcript && (
            <div>
              <h5 className="font-semibold text-gray-900 mb-3">Speech Transcript</h5>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-sm text-gray-700">{analysisResult.transcript}</p>
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}