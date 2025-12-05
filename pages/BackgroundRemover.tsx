import React, { useState } from 'react';
import { Upload, Download, RefreshCw, Layers, Image as ImageIcon, Check, AlertTriangle } from 'lucide-react';
// Import as namespace to inspect structure
import * as imglyLib from "@imgly/background-removal";
import { ProcessingState } from '../types';

export const BackgroundRemover: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [processedUrl, setProcessedUrl] = useState<string | null>(null);
    const [state, setState] = useState<ProcessingState>({ status: 'idle' });
    const [progressText, setProgressText] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setOriginalUrl(URL.createObjectURL(selectedFile));
            setProcessedUrl(null);
            setState({ status: 'idle' });
        }
    };

    const processImage = async () => {
        if (!file || !originalUrl) return;

        setState({ status: 'processing' });
        setProgressText('Đang khởi tạo AI (có thể mất 10-30s lần đầu)...');

        try {
            // --- FIX: Resolve the correct function from the imported library ---
            let removeBackgroundFn: any = imglyLib;
            
            // Check if default export is the function (common in JSDelivr bundles)
            if (typeof removeBackgroundFn !== 'function') {
                if (removeBackgroundFn.default && typeof removeBackgroundFn.default === 'function') {
                    removeBackgroundFn = removeBackgroundFn.default;
                } 
                // Check for named export
                else if (removeBackgroundFn.removeBackground && typeof removeBackgroundFn.removeBackground === 'function') {
                    removeBackgroundFn = removeBackgroundFn.removeBackground;
                }
            }

            if (typeof removeBackgroundFn !== 'function') {
                throw new Error("Không thể tìm thấy hàm xử lý AI (Import failed).");
            }
            // -----------------------------------------------------------------

            const config = {
                publicPath: 'https://static.img.ly/background-removal-data/1.5.5/', 
                progress: (key: string, current: number, total: number) => {
                    if (key.includes('fetch')) {
                         const percent = total > 0 ? Math.round((current / total) * 100) : 0;
                         setProgressText(`Đang tải dữ liệu mô hình: ${percent}%`);
                    } else if (key.includes('compute')) {
                         const percent = total > 0 ? Math.round((current / total) * 100) : 0;
                         setProgressText(`Đang tách nền: ${percent > 0 ? percent + '%' : '...'}`);
                    }
                },
                debug: true
            };

            const blob = await removeBackgroundFn(originalUrl, config);
            const url = URL.createObjectURL(blob);
            
            setProcessedUrl(url);
            setState({ status: 'success', message: 'Tách nền thành công!' });
        } catch (error: any) {
            console.error("BG Removal Error:", error);
            let userMsg = 'Lỗi khi xử lý hình ảnh.';
            
            if (error.message?.includes('fetch')) {
                userMsg = 'Không thể tải mô hình AI. Vui lòng kiểm tra kết nối mạng.';
            } else if (error.message?.includes('memory')) {
                userMsg = 'Trình duyệt không đủ bộ nhớ. Hãy thử ảnh nhỏ hơn.';
            } else if (error.message?.includes('Import failed')) {
                userMsg = 'Lỗi tải thư viện AI. Vui lòng làm mới trang.';
            }

            setState({ 
                status: 'error', 
                message: `${userMsg} (${error.message || 'Unknown'})` 
            });
        }
    };

    const downloadImage = () => {
        if (!processedUrl) return;
        const link = document.createElement('a');
        link.href = processedUrl;
        link.download = `removed-bg-${Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-violet-600" />
                        Tách nền ảnh AI
                    </h1>
                    <p className="text-slate-500">
                        Xóa phông nền tự động với độ chính xác cao ngay trên trình duyệt.
                    </p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Upload Area */}
                    {!file && (
                        <div className="border-2 border-dashed border-violet-200 bg-violet-50/30 rounded-2xl p-16 text-center hover:bg-violet-50 transition-colors relative cursor-pointer group">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-md text-violet-600 mb-6 group-hover:scale-110 transition-transform">
                                <Upload className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Tải ảnh lên để tách nền</h3>
                            <p className="text-slate-500">Hỗ trợ JPG, PNG (Tối đa 10MB)</p>
                        </div>
                    )}

                    {/* Processing Area */}
                    {file && (
                        <div className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                {/* Original */}
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <ImageIcon className="w-4 h-4" /> Ảnh gốc
                                    </div>
                                    <div className="aspect-[4/3] rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex items-center justify-center relative">
                                        <img src={originalUrl!} alt="Original" className="max-w-full max-h-full object-contain" />
                                    </div>
                                </div>

                                {/* Result */}
                                <div className="space-y-2">
                                    <div className="text-sm font-medium text-slate-700 flex items-center gap-2">
                                        <Layers className="w-4 h-4" /> Kết quả (Trong suốt)
                                    </div>
                                    <div className="aspect-[4/3] rounded-xl border border-slate-200 overflow-hidden flex items-center justify-center relative checkerboard">
                                        {state.status === 'processing' ? (
                                            <div className="text-center px-4 w-full">
                                                <div className="w-10 h-10 border-4 border-slate-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3"></div>
                                                <p className="text-sm text-slate-600 font-medium animate-pulse">{progressText}</p>
                                                <p className="text-xs text-slate-400 mt-2">Đang xử lý cục bộ trên thiết bị của bạn.</p>
                                            </div>
                                        ) : processedUrl ? (
                                            <img src={processedUrl} alt="Processed" className="max-w-full max-h-full object-contain" />
                                        ) : (
                                            <p className="text-sm text-slate-400 italic">Nhấn xử lý để xem kết quả</p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center pt-4 border-t border-slate-100">
                                <button 
                                    onClick={() => { setFile(null); setProcessedUrl(null); }}
                                    className="text-slate-500 hover:text-red-500 font-medium text-sm flex items-center gap-2"
                                >
                                    <RefreshCw className="w-4 h-4" /> Chọn ảnh khác
                                </button>

                                <div className="flex gap-3 w-full sm:w-auto">
                                    {!processedUrl ? (
                                        <button
                                            onClick={processImage}
                                            disabled={state.status === 'processing'}
                                            className="flex-1 sm:flex-none px-8 py-3 bg-violet-600 hover:bg-violet-700 text-white rounded-xl font-bold shadow-lg shadow-violet-200 transition-all disabled:opacity-70 disabled:cursor-wait"
                                        >
                                            {state.status === 'processing' ? 'Đang xử lý...' : 'Bắt đầu tách nền'}
                                        </button>
                                    ) : (
                                        <button
                                            onClick={downloadImage}
                                            className="flex-1 sm:flex-none px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2"
                                        >
                                            <Download className="w-5 h-5" /> Tải về máy
                                        </button>
                                    )}
                                </div>
                            </div>

                            {state.status === 'error' && (
                                <div className="p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-sm flex items-start gap-3">
                                    <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                                    <div>
                                        <p className="font-bold">Đã xảy ra lỗi</p>
                                        <p>{state.message}</p>
                                        <p className="mt-2 text-xs text-red-500">Gợi ý: Hãy thử tải lại trang hoặc sử dụng trình duyệt Chrome/Edge mới nhất.</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Guide Section */}
            <div className="mt-12 grid md:grid-cols-3 gap-6 text-center">
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">1</div>
                    <h3 className="font-bold text-slate-800">Tải ảnh lên</h3>
                    <p className="text-sm text-slate-500 mt-2">Chọn ảnh cần xóa phông nền (JPG, PNG).</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-violet-50 text-violet-600 rounded-full flex items-center justify-center mx-auto mb-4">2</div>
                    <h3 className="font-bold text-slate-800">AI Xử lý</h3>
                    <p className="text-sm text-slate-500 mt-2">Hệ thống tự động nhận diện chủ thể và tách nền.</p>
                </div>
                <div className="p-6 bg-white rounded-xl shadow-sm border border-slate-100">
                    <div className="w-12 h-12 bg-green-50 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">3</div>
                    <h3 className="font-bold text-slate-800">Tải về</h3>
                    <p className="text-sm text-slate-500 mt-2">Lưu ảnh định dạng PNG trong suốt chất lượng cao.</p>
                </div>
            </div>
        </div>
    );
};