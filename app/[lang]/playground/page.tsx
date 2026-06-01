'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, RotateCcw, Activity, ShieldCheck, TrendingUp, BarChart2, Loader2, Sparkles } from 'lucide-react';

interface BANTData {
  budget: string;
  authority: string;
  need: string;
  timeline: string;
}

interface AnalysisResult {
  text: string;
  sentiment: string;
  sentimentScore: number;
  bant: BANTData;
  sentimentTrend: number[];
}

export default function VoiceQAPlayground() {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Handle timer count
  useEffect(() => {
    if (isRecording) {
      timerRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setRecordingSeconds(0);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isRecording]);

  const startRecording = async () => {
    setError(null);
    setResult(null);
    audioChunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        setAudioBlob(audioBlob);
        // Stop all audio track nodes to release microphone hardware access
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err: any) {
      console.error('Microphone access denied:', err);
      setError('Cannot access microphone. Please ensure permissions are granted.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const submitAudio = async () => {
    if (!audioBlob) return;
    setIsAnalyzing(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', audioBlob, 'speech-call.wav');

    try {
      const response = await fetch('/api/voice-qa', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Server returned status code ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setResult(data);
      } else {
        throw new Error(data.error || 'Failed analyzing voice data');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during audio processing.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetAll = () => {
    setIsRecording(false);
    setAudioBlob(null);
    setResult(null);
    setError(null);
  };

  // Helper format for timer string
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Title Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 text-indigo-400 px-4 py-1.5 rounded-full border border-indigo-500/20 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            AI Labs Playground
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            AI Voice QA & Qualification Lab
          </h1>
          <p className="mt-3 max-w-2xl mx-auto text-sm sm:text-base text-slate-400">
            Qualify leads instantly. Capture call audio to run automatic Whisper-transcriptions, BANT parameters mining, and sentiment wave analytics.
          </p>
        </div>

        {/* Central Dashboard Card */}
        <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 sm:p-8 shadow-2xl mb-8 relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          {/* Micro-Interaction Recording Interface */}
          <div className="flex flex-col items-center justify-center py-6 border-b border-white/10 mb-8">
            {/* Visualizer Wave Animation */}
            <div className="h-16 flex items-center justify-center gap-1.5 mb-6">
              {isRecording ? (
                // Pulse waves when recording
                Array.from({ length: 9 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1.5 bg-indigo-400 rounded-full animate-bounce"
                    style={{
                      height: `${Math.random() * 40 + 20}px`,
                      animationDelay: `${i * 0.15}s`,
                      animationDuration: '0.8s'
                    }}
                  />
                ))
              ) : (
                // Flat line
                Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="w-1.5 h-1.5 bg-white/20 rounded-full" />
                ))
              )}
            </div>

            {/* Timer Output */}
            <div className="text-3xl font-mono tracking-widest font-bold text-white mb-4">
              {formatTime(isRecording ? recordingSeconds : (audioBlob ? 0 : 0))}
            </div>

            {/* Controller Buttons */}
            <div className="flex items-center gap-4">
              {!isRecording ? (
                <button
                  onClick={startRecording}
                  disabled={isAnalyzing}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  title="Start Recording"
                >
                  <Mic className="w-6 h-6" />
                </button>
              ) : (
                <button
                  onClick={stopRecording}
                  className="flex items-center justify-center w-14 h-14 rounded-full bg-slate-800 hover:bg-slate-700 text-white border border-white/10 shadow-lg transition-all hover:scale-105 active:scale-95"
                  title="Stop Recording"
                >
                  <Square className="w-5 h-5 fill-white" />
                </button>
              )}

              {audioBlob && !isRecording && (
                <>
                  <button
                    onClick={submitAudio}
                    disabled={isAnalyzing}
                    className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 px-6 py-3 rounded-full text-sm font-semibold shadow-lg shadow-indigo-500/20 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                  >
                    {isAnalyzing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Analyzing Voice...
                      </>
                    ) : (
                      <>
                        <Activity className="w-4 h-4" />
                        Analyze Qualification
                      </>
                    )}
                  </button>

                  <button
                    onClick={resetAll}
                    disabled={isAnalyzing}
                    className="flex items-center justify-center w-12 h-12 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                    title="Retry / Record New"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>

            {error && (
              <div className="mt-4 text-xs font-semibold text-red-400 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg">
                ⚠️ {error}
              </div>
            )}
          </div>

          {/* Results Output Block */}
          {result && (
            <div className="animate-fade-in space-y-6">
              {/* Section: Audio Transcript */}
              <div className="bg-white/5 rounded-xl p-4 sm:p-5 border border-white/5">
                <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-2">
                  <Play className="w-3.5 h-3.5" />
                  Whisper Transcript Text
                </div>
                <p className="text-sm sm:text-base leading-relaxed text-slate-200 italic">
                  "{result.text}"
                </p>
              </div>

              {/* Grid: BANT & Sentiment Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Panel 1: BANT Matrix */}
                <div className="bg-white/5 rounded-xl p-5 border border-white/5 flex flex-col">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
                    <ShieldCheck className="w-4 h-4" />
                    BANT Parameter Qualification
                  </div>
                  <div className="space-y-3 flex-1 flex flex-col justify-between">
                    {Object.entries(result.bant).map(([key, value]) => (
                      <div key={key} className="bg-white/5 px-4 py-2.5 rounded-lg border border-white/5 text-xs sm:text-sm text-slate-300">
                        {value}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Panel 2: Sentiment Trends */}
                <div className="bg-white/5 rounded-xl p-5 border border-white/5 flex flex-col">
                  <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-4">
                    <BarChart2 className="w-4 h-4" />
                    Emotion & Sentiment Index
                  </div>
                  
                  {/* Score circle */}
                  <div className="flex items-center justify-between bg-white/5 px-4 py-3 rounded-lg border border-white/5 mb-4">
                    <span className="text-xs font-semibold text-slate-400">Audited State:</span>
                    <span className="text-sm font-bold text-slate-200">{result.sentiment}</span>
                  </div>

                  {/* Visual Graph Progress Bar */}
                  <div className="flex-1 flex flex-col justify-center">
                    <div className="text-xs font-semibold text-slate-400 mb-2">Call Sentiment Flow Progression:</div>
                    <div className="h-10 flex items-end gap-2.5 justify-between px-2 bg-slate-900/50 rounded-lg p-2 border border-white/5">
                      {result.sentimentTrend.map((score, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                          <div
                            className="w-full bg-gradient-to-t from-indigo-500 to-pink-500 rounded-t-sm transition-all duration-500"
                            style={{ height: `${score}%` }}
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 mt-1.5 px-1 font-mono">
                      <span>START</span>
                      <span>MID</span>
                      <span>END</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Prompt guide when idle */}
          {!result && !isRecording && !audioBlob && (
            <div className="text-center py-6 text-slate-500 text-sm font-semibold flex flex-col items-center gap-2">
              <TrendingUp className="w-8 h-8 text-slate-600 animate-pulse" />
              Press the red record button to analyze voice parameters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// NaviGuard-AI Security Audited - 2026-06-01
