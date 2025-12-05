import React, { useState } from 'react';
import { Upload, FileText, Copy, AlertCircle, Sparkles } from 'lucide-react';
import { performOCR } from '../services/geminiService';
import { ProcessingState } from '../types';

export const OCRTool: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [resultText, setResultText] = useState('');
    const [state, setState] = useState<ProcessingState>({ status: 'idle' });

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setState({ status: 'idle' });
            setResultText('');
        }
    };

    const runOCR = async () => {
        if (!file) return;

        setState({ status: 'processing', message: 'AI đang phân tích hình ảnh...' });
        
        try {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = async () => {
                const base64Data = reader.result as string;
                // Remove data URL prefix
                const base64Content = base64Data.split(',')[1];
                
                const text = await performOCR(base64Content, file.type);
                setResultText(text);
                setState({ status: 'success', message: 'Hoàn tất!' });
            };
        } catch (err) {
            setState({ status: 'error', message: 'Có lỗi xảy ra. Vui lòng thử lại.' });
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(resultText);
        alert('Đã sao chép vào bộ nhớ tạm!');
    };

    return (
        <div className="max-w-4xl mx-auto">
             <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-brand-500" />
                            AI Chuyển ảnh thành văn bản (OCR)
                        </h1>
                        <p className="text-slate-500">Sử dụng công nghệ AI tiên tiến để trích xuất văn bản từ hình ảnh, tài liệu scan.</p>
                    </div>
                </div>

                <div className="p-8 grid md:grid-cols-2 gap-8">
                    {/* Left: Input */}
                    <div className="space-y-6">
                         <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative h-64 flex flex-col items-center justify-center">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            {file ? (
                                <div className="text-center">
                                    <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-green-100 text-green-600 mb-3">
                                        <FileText className="w-6 h-6" />
                                    </div>
                                    <p className="font-medium text-slate-900 break-all px-4">{file.name}</p>
                                    <p className="text-xs text-slate-500 mt-1">Nhấp để đổi ảnh khác</p>
                                </div>
                            ) : (
                                <>
                                    <Upload className="w-10 h-10 text-slate-400 mb-4" />
                                    <h3 className="text-base font-medium text-slate-900 mb-1">Tải ảnh lên</h3>
                                    <p className="text-xs text-slate-500">JPG, PNG (Rõ nét để có kết quả tốt nhất)</p>
                                </>
                            )}
                        </div>

                        <button
                            onClick={runOCR}
                            disabled={!file || state.status === 'processing'}
                            className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {state.status === 'processing' ? 'Đang phân tích...' : 'Trích xuất văn bản'}
                        </button>

                         {state.status === 'error' && (
                            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                <AlertCircle className="w-4 h-4" />
                                {state.message}
                            </div>
                        )}
                    </div>

                    {/* Right: Output */}
                    <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col h-full min-h-[300px]">
                        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
                            <h3 className="font-semibold text-slate-700">Kết quả</h3>
                            <button 
                                onClick={copyToClipboard}
                                disabled={!resultText}
                                className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1 disabled:opacity-50"
                            >
                                <Copy className="w-4 h-4" />
                                Sao chép
                            </button>
                        </div>
                        
                        <div className="flex-1">
                            {state.status === 'processing' ? (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-3">
                                    <div className="w-8 h-8 border-4 border-slate-200 border-t-brand-500 rounded-full animate-spin"></div>
                                    <p className="text-sm">Đang đọc tài liệu...</p>
                                </div>
                            ) : resultText ? (
                                <textarea 
                                    className="w-full h-full bg-transparent border-0 focus:ring-0 resize-none text-slate-800 text-sm leading-relaxed"
                                    value={resultText}
                                    readOnly
                                />
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-400 text-sm italic">
                                    Văn bản sau khi trích xuất sẽ hiện ở đây.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};