import React, { useState, useRef, useEffect } from 'react';
import { Mic, Upload, FileAudio, StopCircle, Play, Pause, X, CheckCircle, AlertCircle, Copy, Download, RefreshCw } from 'lucide-react';
import { transcribeAudio } from '../services/geminiService';
import { ProcessingState } from '../types';

export const SpeechToText: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'upload' | 'record'>('upload');
    const [file, setFile] = useState<File | null>(null);
    const [result, setResult] = useState('');
    const [state, setState] = useState<ProcessingState>({ status: 'idle' });
    
    // Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    // Audio Preview
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
            if (timerRef.current) clearInterval(timerRef.current);
        };
    }, [audioUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 20 * 1024 * 1024) { // 20MB limit
                alert("File quá lớn! Vui lòng chọn file dưới 20MB.");
                return;
            }
            setFile(selectedFile);
            setAudioUrl(URL.createObjectURL(selectedFile));
            setResult('');
            setState({ status: 'idle' });
        }
    };

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, { type: 'audio/webm' }); // Use webm for browser compatibility
                const recordedFile = new File([blob], "recording.webm", { type: 'audio/webm' });
                setFile(recordedFile);
                setAudioUrl(URL.createObjectURL(blob));
                
                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);
            setFile(null);
            setResult('');
            
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (err) {
            console.error(err);
            alert("Không thể truy cập microphone. Vui lòng kiểm tra quyền truy cập.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
            if (timerRef.current) clearInterval(timerRef.current);
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleTranscribe = async () => {
        if (!file) return;

        setState({ status: 'processing', message: 'AI đang nghe và chép lại...' });
        
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = reader.result as string;
                const base64Content = base64Data.split(',')[1];
                
                // Gemini supports audio/mp3, audio/wav, audio/aac, audio/mpeg, audio/webm
                // We pass the mime type from the file
                const text = await transcribeAudio(base64Content, file.type || 'audio/mp3');
                setResult(text);
                setState({ status: 'success', message: 'Hoàn tất!' });
            };
            reader.onerror = () => {
                throw new Error("Lỗi đọc file.");
            }
        } catch (err: any) {
            setState({ status: 'error', message: err.message || 'Có lỗi xảy ra.' });
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        alert('Đã sao chép!');
    };

    const downloadText = () => {
        const element = document.createElement("a");
        const fileBlob = new Blob([result], {type: 'text/plain'});
        element.href = URL.createObjectURL(fileBlob);
        element.download = "transcript.txt";
        document.body.appendChild(element);
        element.click();
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Mic className="w-6 h-6 text-indigo-600" />
                        Chuyển giọng nói thành văn bản
                    </h1>
                    <p className="text-slate-500">
                        Sử dụng AI để chuyển đổi file ghi âm, bài giảng, cuộc họp thành văn bản chính xác.
                    </p>
                </div>

                <div className="p-8 grid lg:grid-cols-12 gap-8">
                    {/* Left: Input */}
                    <div className="lg:col-span-5 space-y-6">
                        {/* Tabs */}
                        <div className="flex p-1 bg-slate-100 rounded-xl gap-1 mb-6">
                            <button
                                onClick={() => setActiveTab('upload')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                    activeTab === 'upload' ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Upload className="w-4 h-4" /> Tải file lên
                            </button>
                            <button
                                onClick={() => setActiveTab('record')}
                                className={`flex-1 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                                    activeTab === 'record' ? 'bg-white shadow-sm text-red-600' : 'text-slate-500 hover:text-slate-700'
                                }`}
                            >
                                <Mic className="w-4 h-4" /> Ghi âm trực tiếp
                            </button>
                        </div>

                        {/* Upload Mode */}
                        {activeTab === 'upload' && (
                            <div className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors relative ${file ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-300 hover:bg-slate-50'}`}>
                                <input 
                                    type="file" 
                                    accept="audio/*,video/mp4" 
                                    onChange={handleFileChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                />
                                {file ? (
                                    <div>
                                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mx-auto mb-3">
                                            <FileAudio className="w-6 h-6" />
                                        </div>
                                        <p className="font-medium text-slate-900 truncate max-w-[200px] mx-auto">{file.name}</p>
                                        <p className="text-xs text-slate-500 mt-1">{(file.size / (1024*1024)).toFixed(2)} MB</p>
                                        <p className="text-xs text-indigo-600 font-bold mt-2">Nhấp để thay đổi</p>
                                    </div>
                                ) : (
                                    <div>
                                        <Upload className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                                        <p className="font-medium text-slate-900">Chọn file âm thanh</p>
                                        <p className="text-xs text-slate-500 mt-1">MP3, WAV, M4A, AAC (Max 20MB)</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Record Mode */}
                        {activeTab === 'record' && (
                            <div className="bg-slate-900 rounded-xl p-8 text-center text-white flex flex-col items-center justify-center min-h-[200px]">
                                {isRecording ? (
                                    <>
                                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-4 animate-pulse">
                                            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center shadow-lg shadow-red-500/50">
                                                <Mic className="w-8 h-8 text-white" />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-mono font-bold mb-2">{formatTime(recordingTime)}</h3>
                                        <p className="text-slate-400 text-sm mb-6">Đang ghi âm...</p>
                                        <button 
                                            onClick={stopRecording}
                                            className="px-6 py-2 bg-white text-red-600 rounded-full font-bold hover:bg-slate-100 transition-colors flex items-center gap-2"
                                        >
                                            <StopCircle className="w-5 h-5" /> Dừng lại
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        {file ? (
                                            <div className="w-full">
                                                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                                                    <CheckCircle className="w-8 h-8 text-white" />
                                                </div>
                                                <p className="font-bold mb-4">Đã ghi âm xong!</p>
                                                <div className="flex gap-3 justify-center">
                                                    <button 
                                                        onClick={() => { setFile(null); setAudioUrl(null); }}
                                                        className="px-4 py-2 bg-slate-700 text-white rounded-lg text-sm hover:bg-slate-600"
                                                    >
                                                        Ghi lại
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <>
                                                <div 
                                                    onClick={startRecording}
                                                    className="w-20 h-20 bg-slate-700 rounded-full flex items-center justify-center mb-4 cursor-pointer hover:bg-red-500 transition-all group"
                                                >
                                                    <Mic className="w-8 h-8 text-slate-400 group-hover:text-white" />
                                                </div>
                                                <p className="text-slate-400 text-sm">Nhấn vào micro để bắt đầu</p>
                                            </>
                                        )}
                                    </>
                                )}
                            </div>
                        )}

                        {/* Audio Player */}
                        {audioUrl && (
                            <audio 
                                ref={audioRef} 
                                src={audioUrl} 
                                controls 
                                className="w-full h-10 mt-4 rounded-lg" 
                            />
                        )}

                        {/* Action Button */}
                        <button
                            onClick={handleTranscribe}
                            disabled={!file || state.status === 'processing' || isRecording}
                            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-indigo-200 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {state.status === 'processing' ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <FileAudio className="w-5 h-5" />
                                    Bắt đầu chuyển đổi
                                </>
                            )}
                        </button>

                         {state.status === 'error' && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4" />
                                {state.message}
                            </div>
                        )}
                    </div>

                    {/* Right: Output */}
                    <div className="lg:col-span-7 flex flex-col h-full min-h-[400px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                Văn bản kết quả
                            </h3>
                            <div className="flex gap-2">
                                <button 
                                    onClick={downloadText}
                                    disabled={!result}
                                    className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                    title="Tải file .txt"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={copyToClipboard}
                                    disabled={!result}
                                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 font-medium text-sm transition-colors disabled:opacity-50"
                                >
                                    <Copy className="w-4 h-4" /> Sao chép
                                </button>
                            </div>
                        </div>

                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 relative overflow-hidden">
                             {state.status === 'processing' ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                                    <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                                    <p className="text-indigo-600 font-medium animate-pulse">AI đang nghe và chép lại...</p>
                                </div>
                            ) : null}

                            {!result && state.status !== 'processing' ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <FileAudio className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Tải file lên hoặc ghi âm để bắt đầu.</p>
                                </div>
                            ) : (
                                <textarea 
                                    value={result}
                                    readOnly
                                    className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-slate-800 leading-relaxed whitespace-pre-wrap font-mono text-sm"
                                    placeholder="Nội dung văn bản sẽ hiện ở đây..."
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};