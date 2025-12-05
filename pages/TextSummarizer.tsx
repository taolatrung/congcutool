import React, { useState } from 'react';
import { FileText, AlignLeft, List, CheckCircle, Copy, RefreshCw, Eraser, AlertCircle, ArrowRight } from 'lucide-react';
import { generateSummary } from '../services/geminiService';
import { ProcessingState } from '../types';

export const TextSummarizer: React.FC = () => {
    // Inputs
    const [inputText, setInputText] = useState('');
    const [length, setLength] = useState<'short' | 'medium' | 'long'>('medium');
    const [format, setFormat] = useState<'paragraph' | 'bullets'>('paragraph');

    // Output
    const [result, setResult] = useState('');
    const [state, setState] = useState<ProcessingState>({ status: 'idle' });

    const handleSummarize = async () => {
        if (!inputText.trim()) return;

        setState({ status: 'processing', message: 'AI đang đọc và tóm tắt...' });

        try {
            const summary = await generateSummary(inputText, length, format);
            setResult(summary);
            setState({ status: 'success', message: 'Hoàn tất!' });
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
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-teal-50 to-white">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <FileText className="w-6 h-6 text-teal-600" />
                        Tóm tắt văn bản AI
                    </h1>
                    <p className="text-slate-500">Rút gọn văn bản dài, bài báo, tài liệu thành những ý chính quan trọng nhất.</p>
                </div>

                <div className="grid lg:grid-cols-2 min-h-[600px] divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
                    {/* LEFT: Input */}
                    <div className="p-8 space-y-6 flex flex-col">
                        <div className="flex justify-between items-center">
                            <label className="text-sm font-bold text-slate-800">Văn bản gốc</label>
                            <button 
                                onClick={() => setInputText('')}
                                className="text-xs text-red-500 hover:text-red-600 flex items-center gap-1"
                            >
                                <Eraser className="w-3 h-3" /> Xóa
                            </button>
                        </div>
                        
                        <textarea
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full flex-grow p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:outline-none shadow-inner resize-none min-h-[300px]"
                            placeholder="Dán văn bản dài cần tóm tắt vào đây..."
                        />
                        
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
                            <h3 className="text-sm font-bold text-slate-700">Cấu hình tóm tắt</h3>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-2">Độ dài</label>
                                    <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                                        {(['short', 'medium', 'long'] as const).map(l => (
                                            <button
                                                key={l}
                                                onClick={() => setLength(l)}
                                                className={`flex-1 py-1.5 text-xs font-medium rounded-md capitalize transition-all ${
                                                    length === l ? 'bg-teal-100 text-teal-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                                }`}
                                            >
                                                {l === 'short' ? 'Ngắn' : l === 'medium' ? 'Vừa' : 'Chi tiết'}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-2">Định dạng</label>
                                    <div className="flex bg-white rounded-lg border border-slate-200 p-1">
                                        <button
                                            onClick={() => setFormat('paragraph')}
                                            className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-all ${
                                                format === 'paragraph' ? 'bg-teal-100 text-teal-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                        >
                                            <AlignLeft className="w-3 h-3" /> Đoạn văn
                                        </button>
                                        <button
                                            onClick={() => setFormat('bullets')}
                                            className={`flex-1 py-1.5 text-xs font-medium rounded-md flex items-center justify-center gap-1 transition-all ${
                                                format === 'bullets' ? 'bg-teal-100 text-teal-700 shadow-sm' : 'text-slate-500 hover:bg-slate-50'
                                            }`}
                                        >
                                            <List className="w-3 h-3" /> Ý chính
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <button 
                            onClick={handleSummarize}
                            disabled={!inputText.trim() || state.status === 'processing'}
                            className="w-full py-4 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-teal-100 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {state.status === 'processing' ? (
                                <>
                                    <RefreshCw className="w-5 h-5 animate-spin" />
                                    Đang xử lý...
                                </>
                            ) : (
                                <>
                                    <ArrowRight className="w-5 h-5" />
                                    Tóm tắt ngay
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
                    <div className="p-8 flex flex-col bg-slate-50/50">
                         <div className="flex justify-between items-center mb-6">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                Kết quả
                                {state.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                            </h3>
                            <button 
                                onClick={copyToClipboard}
                                disabled={!result}
                                className="flex items-center gap-1 px-3 py-1.5 bg-white border border-slate-200 text-slate-700 rounded-lg hover:bg-slate-50 font-medium text-sm transition-colors disabled:opacity-50 shadow-sm"
                            >
                                <Copy className="w-4 h-4" /> Sao chép
                            </button>
                        </div>

                        <div className="flex-grow bg-white border border-slate-200 rounded-xl p-6 relative shadow-sm">
                            {state.status === 'processing' ? (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 z-10 backdrop-blur-sm rounded-xl">
                                    <div className="w-10 h-10 border-4 border-teal-100 border-t-teal-600 rounded-full animate-spin mb-4"></div>
                                    <p className="text-teal-600 font-medium animate-pulse text-sm">Đang phân tích nội dung...</p>
                                </div>
                            ) : null}

                            {!result && state.status !== 'processing' ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                    <FileText className="w-12 h-12 mb-4 opacity-20" />
                                    <p className="text-sm">Kết quả tóm tắt sẽ hiển thị ở đây.</p>
                                </div>
                            ) : (
                                <div className="prose prose-slate prose-sm max-w-none text-slate-800 leading-relaxed whitespace-pre-line">
                                    {result}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};