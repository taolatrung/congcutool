import React, { useState } from 'react';
import { Wand2, Copy, RefreshCw, Eraser, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';
import { generateAIContent } from '../services/geminiService';
import { ProcessingState } from '../types';

const CONTENT_TYPES = [
    { id: 'Blog Post', label: 'Bài viết Blog' },
    { id: 'Facebook Caption', label: 'Caption Facebook/Instagram' },
    { id: 'Email', label: 'Email chuyên nghiệp' },
    { id: 'Product Description', label: 'Mô tả sản phẩm' },
    { id: 'Outline', label: 'Dàn ý (Outline)' },
    { id: 'Rewrite', label: 'Viết lại câu/đoạn văn' },
];

const TONES = [
    { id: 'Professional', label: 'Chuyên nghiệp' },
    { id: 'Friendly', label: 'Thân thiện' },
    { id: 'Witty', label: 'Hài hước' },
    { id: 'Persuasive', label: 'Thuyết phục' },
    { id: 'Formal', label: 'Trang trọng' },
];

export const AIWriterTool: React.FC = () => {
    // Inputs
    const [topic, setTopic] = useState('');
    const [contentType, setContentType] = useState('Blog Post');
    const [tone, setTone] = useState('Professional');
    const [language, setLanguage] = useState('Vietnamese');
    
    // Output
    const [result, setResult] = useState('');
    const [state, setState] = useState<ProcessingState>({ status: 'idle' });

    const handleGenerate = async () => {
        if (!topic.trim()) return;
        
        setState({ status: 'processing', message: 'AI đang suy nghĩ và viết bài...' });
        
        try {
            const content = await generateAIContent(topic, contentType, tone, language);
            setResult(content);
            setState({ status: 'success', message: 'Đã viết xong!' });
        } catch (err: any) {
            setState({ status: 'error', message: err.message || 'Có lỗi xảy ra.' });
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        alert('Đã sao chép nội dung!');
    };

    return (
        <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-violet-600" />
                        Trợ lý Viết bài AI
                    </h1>
                    <p className="text-slate-500">Tạo blog, email, caption mạng xã hội chất lượng cao chỉ trong vài giây.</p>
                </div>

                <div className="grid lg:grid-cols-12 min-h-[600px]">
                    {/* LEFT: Configuration */}
                    <div className="lg:col-span-5 p-8 border-r border-slate-100 space-y-6 bg-slate-50/50">
                        <div>
                            <label className="block text-sm font-bold text-slate-800 mb-2">Chủ đề hoặc Yêu cầu</label>
                            <textarea
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                className="w-full p-4 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:outline-none min-h-[120px] shadow-sm resize-none"
                                placeholder="Ví dụ: Viết 5 lợi ích của việc tập thể dục buổi sáng..."
                            />
                        </div>

                        <div className="grid grid-cols-1 gap-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-800 mb-2">Loại nội dung</label>
                                <select 
                                    value={contentType}
                                    onChange={(e) => setContentType(e.target.value)}
                                    className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 bg-white"
                                >
                                    {CONTENT_TYPES.map(t => (
                                        <option key={t.id} value={t.id}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-2">Giọng văn</label>
                                    <select 
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 bg-white"
                                    >
                                        {TONES.map(t => (
                                            <option key={t.id} value={t.id}>{t.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-800 mb-2">Ngôn ngữ</label>
                                    <select 
                                        value={language}
                                        onChange={(e) => setLanguage(e.target.value)}
                                        className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-violet-500 bg-white"
                                    >
                                        <option value="Vietnamese">Tiếng Việt</option>
                                        <option value="English">English</option>
                                        <option value="Japanese">Japanese</option>
                                        <option value="Korean">Korean</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleGenerate}
                            disabled={!topic || state.status === 'processing'}
                            className="w-full py-4 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-violet-200 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
                        >
                            {state.status === 'processing' ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    AI Đang viết...
                                </>
                            ) : (
                                <>
                                    <Wand2 className="w-5 h-5" />
                                    Tạo nội dung ngay
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

                    {/* RIGHT: Output */}
                    <div className="lg:col-span-7 bg-white p-8 flex flex-col h-full">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                Kết quả
                                {state.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </h3>
                            <div className="flex gap-2">
                                <button 
                                    onClick={() => setResult('')}
                                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Xóa"
                                >
                                    <Eraser className="w-4 h-4" />
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

                        <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-4 relative overflow-hidden group">
                             {state.status === 'processing' ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10 backdrop-blur-sm">
                                    <div className="w-12 h-12 border-4 border-violet-100 border-t-violet-600 rounded-full animate-spin mb-4"></div>
                                    <p className="text-violet-600 font-medium animate-pulse">Đang sáng tạo nội dung...</p>
                                </div>
                            ) : null}

                            {!result && state.status !== 'processing' ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <Wand2 className="w-12 h-12 mb-4 opacity-20" />
                                    <p>Nhập chủ đề và nhấn "Tạo nội dung" để bắt đầu.</p>
                                </div>
                            ) : (
                                <textarea 
                                    value={result}
                                    readOnly
                                    className="w-full h-full bg-transparent border-none resize-none focus:ring-0 text-slate-800 leading-relaxed whitespace-pre-wrap"
                                />
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};