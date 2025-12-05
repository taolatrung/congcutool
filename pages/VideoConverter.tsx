import React, { useState, useRef, useEffect } from 'react';
import { Upload, Film, Music, Settings, Download, RefreshCw, PlayCircle, FileVideo, Check, AlertCircle } from 'lucide-react';
import { ProcessingState } from '../types';

const FORMATS = [
    { value: 'mp4', label: 'MP4 (Video)', icon: Film },
    { value: 'mp3', label: 'MP3 (Audio)', icon: Music },
    { value: 'gif', label: 'GIF (Animation)', icon: FileVideo },
    { value: 'avi', label: 'AVI', icon: Film },
];

const RESOLUTIONS = [
    { value: '1080', label: 'Full HD (1080p)' },
    { value: '720', label: 'HD (720p)' },
    { value: '480', label: 'SD (480p)' },
];

export const VideoConverter: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [format, setFormat] = useState('mp4');
    const [resolution, setResolution] = useState('720');
    const [mute, setMute] = useState(false);
    
    // Processing State
    const [state, setState] = useState<ProcessingState>({ status: 'idle' });
    const [progress, setProgress] = useState(0);

    const videoRef = useRef<HTMLVideoElement>(null);

    // Cleanup URL
    useEffect(() => {
        return () => {
            if (previewUrl) URL.revokeObjectURL(previewUrl);
        };
    }, [previewUrl]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            
            // Basic validation
            if (selectedFile.size > 100 * 1024 * 1024) { // 100MB limit
                alert("File quá lớn! Vui lòng chọn video dưới 100MB cho bản miễn phí.");
                return;
            }

            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setState({ status: 'idle' });
            setProgress(0);
        }
    };

    const handleConvert = () => {
        if (!file) return;

        setState({ status: 'processing', message: 'Đang khởi động engine xử lý...' });
        setProgress(0);

        // --- SIMULATION LOGIC ---
        // In a real app, this would use ffmpeg.wasm or send the file to a backend API.
        // Here we simulate the experience.
        
        let currentProgress = 0;
        const interval = setInterval(() => {
            currentProgress += Math.random() * 5; // Random increment
            if (currentProgress > 100) {
                currentProgress = 100;
                clearInterval(interval);
                setState({ status: 'success', message: 'Chuyển đổi thành công!' });
            } else {
                setProgress(Math.round(currentProgress));
                
                // Update status messages based on progress
                let msg = 'Đang xử lý...';
                if (currentProgress < 30) msg = 'Đang tải video lên server...';
                else if (currentProgress < 60) msg = `Đang chuyển đổi sang ${format.toUpperCase()}...`;
                else if (currentProgress < 90) msg = 'Đang tối ưu hóa định dạng...';
                else msg = 'Đang tạo link tải về...';
                
                setState(prev => ({ ...prev, message: msg }));
            }
        }, 200);
    };

    const handleDownload = () => {
        // In simulation, we just download the original file renamed
        if (!file) return;
        const link = document.createElement('a');
        link.href = URL.createObjectURL(file);
        link.download = `converted_${file.name.split('.')[0]}.${format}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-pink-50 to-white">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Film className="w-6 h-6 text-pink-600" />
                        Chuyển đổi Video Online
                    </h1>
                    <p className="text-slate-500">Chuyển đổi định dạng MP4, AVI, MOV hoặc tách nhạc MP3 từ video.</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Upload Area */}
                    {!file && (
                        <div className="border-2 border-dashed border-pink-200 bg-pink-50/20 rounded-2xl p-16 text-center hover:bg-pink-50 transition-colors relative cursor-pointer group">
                            <input 
                                type="file" 
                                accept="video/*" 
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-md text-pink-600 mb-6 group-hover:scale-110 transition-transform">
                                <Upload className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">Chọn Video từ máy tính</h3>
                            <p className="text-slate-500">Hỗ trợ MP4, MOV, AVI, MKV (Tối đa 100MB)</p>
                        </div>
                    )}

                    {/* Editor Area */}
                    {file && (
                        <div className="grid lg:grid-cols-2 gap-8">
                            {/* Left: Preview */}
                            <div className="space-y-4">
                                <div className="bg-slate-900 rounded-xl overflow-hidden aspect-video relative flex items-center justify-center">
                                    {previewUrl && (
                                        <video 
                                            ref={videoRef}
                                            src={previewUrl} 
                                            controls 
                                            className="w-full h-full object-contain"
                                        />
                                    )}
                                </div>
                                <div className="flex justify-between items-center text-sm text-slate-500 px-1">
                                    <span className="font-medium text-slate-700 truncate max-w-[200px]" title={file.name}>
                                        {file.name}
                                    </span>
                                    <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                                </div>
                                <button 
                                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                                    className="w-full py-2 border border-slate-200 text-slate-600 hover:text-red-600 hover:border-red-200 rounded-lg font-medium text-sm flex items-center justify-center gap-2 transition-colors"
                                >
                                    <RefreshCw className="w-4 h-4" /> Chọn video khác
                                </button>
                            </div>

                            {/* Right: Settings & Process */}
                            <div className="flex flex-col h-full bg-slate-50 rounded-xl border border-slate-200 p-6">
                                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                                    <Settings className="w-5 h-5 text-slate-500" /> Cấu hình chuyển đổi
                                </h3>

                                <div className="space-y-6 flex-grow">
                                    {/* Format Selection */}
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-3">Định dạng đầu ra</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            {FORMATS.map(fmt => (
                                                <button
                                                    key={fmt.value}
                                                    onClick={() => setFormat(fmt.value)}
                                                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                                                        format === fmt.value 
                                                        ? 'bg-pink-600 border-pink-600 text-white shadow-md' 
                                                        : 'bg-white border-slate-200 text-slate-600 hover:border-pink-300'
                                                    }`}
                                                >
                                                    <fmt.icon className="w-5 h-5" />
                                                    <span className="font-medium text-sm">{fmt.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Resolution Selection (Only for Video formats) */}
                                    {['mp4', 'avi'].includes(format) && (
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-3">Độ phân giải</label>
                                            <select 
                                                value={resolution}
                                                onChange={(e) => setResolution(e.target.value)}
                                                className="w-full p-3 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-pink-500 outline-none"
                                            >
                                                {RESOLUTIONS.map(res => (
                                                    <option key={res.value} value={res.value}>{res.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                    )}

                                    {/* Additional Options */}
                                    <div className="flex items-center gap-2">
                                        <input 
                                            type="checkbox" 
                                            id="mute" 
                                            checked={mute} 
                                            onChange={(e) => setMute(e.target.checked)}
                                            className="w-4 h-4 text-pink-600 rounded focus:ring-pink-500"
                                        />
                                        <label htmlFor="mute" className="text-sm text-slate-600 select-none">Tắt âm thanh (Mute)</label>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="mt-8 pt-6 border-t border-slate-200">
                                    {state.status === 'idle' && (
                                        <button 
                                            onClick={handleConvert}
                                            className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-pink-200 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                                        >
                                            <RefreshCw className="w-5 h-5" />
                                            Bắt đầu chuyển đổi
                                        </button>
                                    )}

                                    {state.status === 'processing' && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between text-sm font-medium text-slate-700">
                                                <span>{state.message}</span>
                                                <span>{progress}%</span>
                                            </div>
                                            <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                                <div 
                                                    className="bg-pink-600 h-2.5 rounded-full transition-all duration-300 ease-out" 
                                                    style={{ width: `${progress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-slate-400 text-center">Vui lòng không tắt trình duyệt</p>
                                        </div>
                                    )}

                                    {state.status === 'success' && (
                                        <div className="space-y-4 animate-fade-in-up">
                                            <div className="p-3 bg-green-50 border border-green-100 rounded-lg flex items-center gap-3 text-green-700">
                                                <Check className="w-5 h-5" />
                                                <span className="font-medium">Đã xử lý xong!</span>
                                            </div>
                                            <button 
                                                onClick={handleDownload}
                                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-green-200 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
                                            >
                                                <Download className="w-5 h-5" />
                                                Tải file về máy
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Info Section */}
            <div className="mt-8 grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center">
                    <h3 className="font-bold text-slate-800 mb-2">Tốc độ cao</h3>
                    <p className="text-sm text-slate-500">Công nghệ xử lý đám mây giúp chuyển đổi video nhanh chóng mà không làm nóng máy.</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center">
                    <h3 className="font-bold text-slate-800 mb-2">Bảo mật tuyệt đối</h3>
                    <p className="text-sm text-slate-500">File của bạn được xóa tự động sau 1 giờ. Không ai có thể truy cập ngoại trừ bạn.</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center">
                    <h3 className="font-bold text-slate-800 mb-2">Hỗ trợ đa định dạng</h3>
                    <p className="text-sm text-slate-500">Chuyển đổi qua lại giữa MP4, AVI, MOV, MKV và trích xuất âm thanh MP3.</p>
                </div>
            </div>
        </div>
    );
};