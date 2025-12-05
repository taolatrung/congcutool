import React, { useState, useRef } from 'react';
import { Upload, Download, RefreshCw, Settings, Check } from 'lucide-react';
import { ProcessingState } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const ImageConverter: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [format, setFormat] = useState<'image/jpeg' | 'image/png' | 'image/webp'>('image/jpeg');
    const [quality, setQuality] = useState(0.8);
    const [state, setState] = useState<ProcessingState>({ status: 'idle' });
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const { t } = useLanguage();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            setFile(selectedFile);
            setPreviewUrl(URL.createObjectURL(selectedFile));
            setState({ status: 'idle' });
        }
    };

    const convertImage = () => {
        if (!file || !canvasRef.current) return;

        setState({ status: 'processing', progress: 0 });

        const img = new Image();
        img.onload = () => {
            if (!canvasRef.current) return;
            const ctx = canvasRef.current.getContext('2d');
            canvasRef.current.width = img.width;
            canvasRef.current.height = img.height;
            
            // Draw white background for transparent images converting to JPG
            if (format === 'image/jpeg') {
                ctx!.fillStyle = '#FFFFFF';
                ctx!.fillRect(0, 0, img.width, img.height);
            }
            
            ctx!.drawImage(img, 0, 0);
            
            // Convert
            const dataUrl = canvasRef.current.toDataURL(format, quality);
            
            // Trigger download
            const link = document.createElement('a');
            link.download = `converted-${file.name.split('.')[0]}.${format.split('/')[1]}`;
            link.href = dataUrl;
            link.click();

            setState({ status: 'success', message: t('action.success') });
        };
        img.src = URL.createObjectURL(file);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">{t('page.img_convert.title')}</h1>
                    <p className="text-slate-500">{t('page.img_convert.sub')}</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Upload Area */}
                    {!file && (
                        <div className="border-2 border-dashed border-slate-300 rounded-xl p-12 text-center hover:bg-slate-50 transition-colors relative">
                            <input 
                                type="file" 
                                accept="image/*" 
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-50 text-brand-600 mb-4">
                                <Upload className="w-8 h-8" />
                            </div>
                            <h3 className="text-lg font-medium text-slate-900 mb-1">{t('page.img_convert.upload_title')}</h3>
                            <p className="text-sm text-slate-500">JPG, PNG, WebP (Max 10MB)</p>
                        </div>
                    )}

                    {/* Editor Area */}
                    {file && (
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Preview */}
                            <div className="space-y-4">
                                <div className="aspect-square rounded-xl bg-slate-100 overflow-hidden relative flex items-center justify-center border border-slate-200">
                                    {previewUrl && <img src={previewUrl} alt="Preview" className="max-w-full max-h-full object-contain" />}
                                </div>
                                <button 
                                    onClick={() => { setFile(null); setPreviewUrl(null); }}
                                    className="text-sm text-red-500 hover:text-red-600 font-medium flex items-center justify-center w-full"
                                >
                                    <RefreshCw className="w-4 h-4 mr-2" />
                                    {t('action.choose_another')}
                                </button>
                            </div>

                            {/* Controls */}
                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-slate-700">{t('page.img_convert.format_label')}</label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {(['image/jpeg', 'image/png', 'image/webp'] as const).map((f) => (
                                            <button
                                                key={f}
                                                onClick={() => setFormat(f)}
                                                className={`py-2 px-4 rounded-lg text-sm font-medium border ${
                                                    format === f 
                                                    ? 'border-brand-500 bg-brand-50 text-brand-700' 
                                                    : 'border-slate-200 hover:border-slate-300 text-slate-600'
                                                }`}
                                            >
                                                {f.split('/')[1].toUpperCase()}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-slate-700 flex justify-between">
                                        {t('page.img_convert.quality_label')}
                                        <span className="text-brand-600">{Math.round(quality * 100)}%</span>
                                    </label>
                                    <input 
                                        type="range" 
                                        min="0.1" 
                                        max="1" 
                                        step="0.1" 
                                        value={quality} 
                                        onChange={(e) => setQuality(parseFloat(e.target.value))}
                                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                                    />
                                </div>

                                <button
                                    onClick={convertImage}
                                    disabled={state.status === 'processing'}
                                    className="w-full py-3 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                                >
                                    {state.status === 'processing' ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                                            {t('action.processing')}
                                        </>
                                    ) : (
                                        <>
                                            <Download className="w-5 h-5 mr-2" />
                                            {t('page.img_convert.btn_convert')}
                                        </>
                                    )}
                                </button>
                                
                                {state.status === 'success' && (
                                    <div className="p-3 bg-green-50 text-green-700 rounded-lg text-sm flex items-center">
                                        <Check className="w-4 h-4 mr-2" />
                                        {state.message}
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
        </div>
    );
};