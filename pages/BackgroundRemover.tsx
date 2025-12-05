import React, { useState, useEffect } from 'react';
import { Upload, Download, RefreshCw, Layers, Image as ImageIcon, Check, AlertTriangle, Settings, Server } from 'lucide-react';
// Import as namespace to inspect structure
import * as imglyLib from "@imgly/background-removal";
import { ProcessingState } from '../types';

type CDNType = 'jsdelivr' | 'unpkg' | 'imgly';

const CDN_OPTIONS: Record<CDNType, { name: string; url: string; description: string }> = {
    jsdelivr: { 
        name: 'Server 1 (JSDelivr)', 
        url: 'https://cdn.jsdelivr.net/npm/@imgly/background-removal-data@1.5.5/dist/',
        description: 'Server quốc tế ổn định (Khuyên dùng).'
    },
    unpkg: { 
        name: 'Server 2 (Unpkg)', 
        url: 'https://unpkg.com/@imgly/background-removal-data@1.5.5/dist/',
        description: 'Server dự phòng tốc độ cao.'
    },
    imgly: { 
        name: 'Server 3 (Img.ly)', 
        url: 'https://static.img.ly/background-removal-data/1.5.5/dist/',
        description: 'Server gốc (Có thể bị chặn bởi AdBlock).'
    }
};

export const BackgroundRemover: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [originalUrl, setOriginalUrl] = useState<string | null>(null);
    const [processedUrl, setProcessedUrl] = useState<string | null>(null);
    const [state, setState] = useState<ProcessingState>({ status: 'idle' });
    const [progressText, setProgressText] = useState('');
    // Use jsdelivr as default
    const [activeCDN, setActiveCDN] = useState<CDNType>('jsdelivr');
    const [showSettings, setShowSettings] = useState(false);

    // Cleanup object URL on unmount
    useEffect(() => {
        return () => {
            if (originalUrl) URL.revokeObjectURL(originalUrl);
            if (processedUrl) URL.revokeObjectURL(processedUrl);
        };
    }, [originalUrl, processedUrl]);

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
        if (!file) return;

        setState({ status: 'processing' });
        setProgressText('Đang kết nối đến Server AI...');

        try {
            // --- Resolve the correct function from the imported library ---
            let removeBackgroundFn: any = imglyLib;
            if (typeof removeBackgroundFn !== 'function') {
                if (removeBackgroundFn.default && typeof removeBackgroundFn.default === 'function') {
                    removeBackgroundFn = removeBackgroundFn.default;
                } else if (removeBackgroundFn.removeBackground && typeof removeBackgroundFn.removeBackground === 'function') {
                    removeBackgroundFn = removeBackgroundFn.removeBackground;
                }
            }
            if (typeof removeBackgroundFn !== 'function') {
                throw new Error("Lỗi tải thư viện AI (Import failed).");
            }
            // -----------------------------------------------------------

            const config = {
                publicPath: CDN_OPTIONS[activeCDN].url,
                // Pass the File object directly to avoid blob URL CORS issues in workers
                progress: (key: string, current: number, total: number) => {
                    // Normalize progress for better UX
                    if (key.includes('fetch')) {
                         const percent = total > 0 ? Math.round((current / total) * 100) : 0;
                         setProgressText(`Đang tải dữ liệu (${percent}%)...`);
                    } else if (key.includes('compute')) {
                         const percent = total > 0 ? Math.round((current / total) * 100) : 0;
                         setProgressText(`AI đang xử lý (${percent}%)...`);
                    }
                },
                debug: true,
                fetch: (url: string, options?: RequestInit) => {
                    // Custom fetch to handle potential retries or logging if needed
                    return fetch(url, { ...options, mode: 'cors' });
                }
            };

            // Pass file directly instead of URL string
            const blob = await removeBackgroundFn(file, config);
            const url = URL.createObjectURL(blob);
            
            setProcessedUrl(url);
            setState({ status: 'success', message: 'Tách nền thành công!' });
        } catch (error: any) {
            console.error("BG Removal Error:", error);
            let userMsg = 'Lỗi khi xử lý hình ảnh.';
            const errStr = error.toString();
            
            if (errStr.includes('fetch') || errStr.includes('NetworkError') || errStr.includes('Failed to fetch')) {
                userMsg = `Không thể tải dữ liệu từ ${CDN_OPTIONS[activeCDN].name}. Có thể do mạng hoặc AdBlock.`;
            } else if (errStr.includes('Resource metadata') || errStr.includes('404')) {
                userMsg = `Không tìm thấy file mô hình trên ${CDN_OPTIONS[activeCDN].name}.`;
            } else if (errStr.includes('memory') || errStr.includes('OOM')) {
                userMsg = 'Trình duyệt không đủ bộ nhớ. Hãy thử ảnh nhỏ hơn.';
            }

            setState({ 
                status: 'error', 
                message: userMsg
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

    const switchToNextCDN = () => {
        let next: CDNType = 'jsdelivr';
        if (activeCDN === 'jsdelivr') next = 'unpkg';
        else if (activeCDN === 'unpkg') next = 'imgly';
        
        setActiveCDN(next);
        setState({ status: 'idle' });
        // Optional: Trigger process again automatically
        // setTimeout(() => processImage(), 100); 
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-violet-50 to-white flex justify-between items-start">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                            <Layers className="w-6 h-6 text-violet-600" />
                            Tách nền ảnh AI
                        </h1>
                        <p className="text-slate-500">
                            Xóa phông nền tự động với độ chính xác cao ngay trên trình duyệt.
                        </p>
                    </div>
                    
                    <div className="relative">
                        <button 
                            onClick={() => setShowSettings(!showSettings)}
                            className="p-2 text-slate-400 hover:text-brand-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1"
                            title="Cài đặt Server"
                        >
                            <span className="text-xs font-medium text-slate-500 hidden sm:inline">{CDN_OPTIONS[activeCDN].name}</span>
                            <Settings className="w-5 h-5" />
                        </button>
                        
                        {showSettings && (
                            <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-100 p-4 z-20 animate-fade-in-up">
                                <h4 className="font-bold text-slate-800 mb-3 text-sm flex items-center gap-2">
                                    <Server className="w-4 h-4" /> Nguồn dữ liệu AI (CDN)
                                </h4>
                                <div className="space-y-2">
                                    {(Object.keys(CDN_OPTIONS) as CDNType[]).map((key) => (
                                        <button
                                            key={key}
                                            onClick={() => { setActiveCDN(key); setShowSettings(false); setState({ status: 'idle' }); }}
                                            className={`w-full text-left p-3 rounded-lg text-xs transition-colors border ${
                                                activeCDN === key 
                                                ? 'bg-violet-50 border-violet-200 text-violet-700' 
                                                : 'hover:bg-slate-50 border-transparent text-slate-600'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <div className="font-bold mb-0.5">{CDN_OPTIONS[key].name}</div>
                                                {activeCDN === key && <Check className="w-4 h-4" />}
                                            </div>
                                            <div className="opacity-80">{CDN_OPTIONS[key].description}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
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
                                                <p className="text-xs text-slate-400 mt-2">Server đang dùng: {CDN_OPTIONS[activeCDN].name}</p>
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
                                <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between animate-fade-in-up">
                                    <div className="flex gap-3">
                                        <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0" />
                                        <div className="text-sm">
                                            <p className="font-bold text-red-700 mb-1">{state.message}</p>
                                            <p className="text-red-600 mb-1">
                                                Hãy thử đổi sang Server khác.
                                            </p>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={switchToNextCDN}
                                        className="px-4 py-2 bg-white border border-red-200 text-red-700 font-bold rounded-lg text-sm hover:bg-red-50 transition-colors whitespace-nowrap shadow-sm"
                                    >
                                        Đổi Server ngay
                                    </button>
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