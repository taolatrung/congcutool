import React, { useState, useRef, useEffect } from 'react';
import { Volume2, PlayCircle, Download, RefreshCw, AlertCircle, StopCircle, Type, User } from 'lucide-react';
import { generateSpeech } from '../services/geminiService';
import { ProcessingState } from '../types';

const VOICES = [
    { id: 'Puck', name: 'Puck (Nam - Trầm ấm)', gender: 'Male' },
    { id: 'Charon', name: 'Charon (Nam - Sâu lắng)', gender: 'Male' },
    { id: 'Kore', name: 'Kore (Nữ - Nhẹ nhàng)', gender: 'Female' },
    { id: 'Fenrir', name: 'Fenrir (Nam - Mạnh mẽ)', gender: 'Male' },
    { id: 'Zephyr', name: 'Zephyr (Nữ - Tự nhiên)', gender: 'Female' },
];

export const TextToSpeech: React.FC = () => {
    const [text, setText] = useState('');
    const [selectedVoice, setSelectedVoice] = useState('Kore');
    const [state, setState] = useState<ProcessingState>({ status: 'idle' });
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    // Cleanup URL on unmount
    useEffect(() => {
        return () => {
            if (audioUrl) URL.revokeObjectURL(audioUrl);
        };
    }, [audioUrl]);

    const handleGenerate = async () => {
        if (!text.trim()) return;
        
        // Stop current audio if playing
        if (audioRef.current) {
            audioRef.current.pause();
            audioRef.current.currentTime = 0;
        }

        setState({ status: 'processing', message: 'AI đang đọc văn bản...' });

        try {
            const audioBlob = await generateSpeech(text, selectedVoice);
            const url = URL.createObjectURL(audioBlob);
            setAudioUrl(url);
            setState({ status: 'success', message: 'Tạo giọng đọc thành công!' });
        } catch (err: any) {
            setState({ status: 'error', message: err.message || 'Có lỗi xảy ra.' });
        }
    };

    const handleDownload = () => {
        if (!audioUrl) return;
        const link = document.createElement('a');
        link.href = audioUrl;
        link.download = `speech-${Date.now()}.wav`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-orange-50 to-white">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Volume2 className="w-6 h-6 text-orange-600" />
                        AI Text to Speech
                    </h1>
                    <p className="text-slate-500">Chuyển đổi văn bản thành giọng nói tự nhiên, cảm xúc bằng công nghệ AI mới nhất.</p>
                </div>

                <div className="grid lg:grid-cols-12 min-h-[500px]">
                    {/* LEFT: Input & Config */}
                    <div className="lg:col-span-7 p-8 border-r border-slate-100 space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <Type className="w-4 h-4 text-slate-500" /> Nhập văn bản cần đọc
                            </label>
                            <textarea
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-orange-500 focus:outline-none min-h-[200px] shadow-sm resize-none text-lg leading-relaxed"
                                placeholder="Nhập nội dung bạn muốn AI đọc vào đây..."
                                maxLength={2000}
                            />
                            <div className="text-right text-xs text-slate-400 mt-2">
                                {text.length}/2000 ký tự
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-500" /> Chọn giọng đọc
                            </label>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {VOICES.map((voice) => (
                                    <button
                                        key={voice.id}
                                        onClick={() => setSelectedVoice(voice.id)}
                                        className={`flex items-center p-3 rounded-lg border transition-all text-left ${
                                            selectedVoice === voice.id
                                                ? 'bg-orange-50 border-orange-500 text-orange-700 shadow-sm'
                                                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                                            selectedVoice === voice.id ? 'bg-orange-200 text-orange-700' : 'bg-slate-100 text-slate-500'
                                        }`}>
                                            {voice.gender === 'Male' ? 'M' : 'F'}
                                        </div>
                                        <div>
                                            <div className="font-bold text-sm">{voice.name}</div>
                                            <div className="text-xs opacity-75">Gemini AI Voice</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={!text.trim() || state.status === 'processing'}
                            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {state.status === 'processing' ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    AI Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <PlayCircle className="w-5 h-5" />
                                    Tạo giọng đọc
                                </>
                            )}
                        </button>
                         {state.status === 'error' && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg mt-2">
                                <AlertCircle className="w-4 h-4" />
                                {state.message}
                            </div>
                        )}
                    </div>

                    {/* RIGHT: Player */}
                    <div className="lg:col-span-5 bg-slate-50/50 p-8 flex flex-col justify-center items-center text-center">
                        {audioUrl ? (
                            <div className="w-full max-w-sm bg-white p-6 rounded-2xl shadow-xl border border-slate-100 animate-fade-in-up">
                                <div className="w-20 h-20 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-pulse">
                                    <Volume2 className="w-10 h-10" />
                                </div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">Đã xong!</h3>
                                <p className="text-sm text-slate-500 mb-6">Giọng đọc: {VOICES.find(v => v.id === selectedVoice)?.name}</p>
                                
                                <audio 
                                    ref={audioRef} 
                                    src={audioUrl} 
                                    controls 
                                    autoPlay
                                    className="w-full mb-6"
                                />

                                <button 
                                    onClick={handleDownload}
                                    className="w-full py-3 bg-white border-2 border-slate-200 text-slate-700 hover:border-orange-500 hover:text-orange-600 rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    Tải file WAV
                                </button>
                            </div>
                        ) : (
                            <div className="text-slate-400">
                                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-dashed border-slate-200">
                                    <Volume2 className="w-10 h-10 opacity-30" />
                                </div>
                                <h3 className="font-bold text-slate-600 mb-1">Chưa có âm thanh</h3>
                                <p className="text-sm">Nhập văn bản và nhấn tạo để nghe thử.</p>
                            </div>
                        )}

                        {state.status === 'processing' && (
                             <div className="mt-8 flex items-center gap-3 text-orange-600 font-medium bg-white px-4 py-2 rounded-full shadow-sm">
                                <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce"></div>
                                <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce delay-75"></div>
                                <div className="w-2 h-2 bg-orange-600 rounded-full animate-bounce delay-150"></div>
                                Đang chuyển văn bản thành giọng nói...
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};