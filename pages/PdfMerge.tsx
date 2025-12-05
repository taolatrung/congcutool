import React, { useState } from 'react';
import { FileType, Upload, ArrowDown, ArrowUp, Trash2, Download, Layers, Plus, FileText, CheckCircle } from 'lucide-react';
import { mergePdfs } from '../services/pdfService';
import { ProcessingState } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const PdfMerge: React.FC = () => {
    const [files, setFiles] = useState<File[]>([]);
    const [state, setState] = useState<ProcessingState>({ status: 'idle' });
    const [mergedUrl, setMergedUrl] = useState<string | null>(null);
    const { t } = useLanguage();

    const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            // Fix: Explicitly cast to 'any' to access 'type' property to resolve TS error
            const newFiles = Array.from(e.target.files).filter((f: any) => f.type === 'application/pdf') as File[];
            if (newFiles.length !== e.target.files.length) {
                alert("Một số file không phải PDF đã bị bỏ qua.");
            }
            setFiles(prev => [...prev, ...newFiles]);
            setMergedUrl(null);
            setState({ status: 'idle' });
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
        setMergedUrl(null);
    };

    const moveFile = (index: number, direction: 'up' | 'down') => {
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === files.length - 1) return;

        const newFiles = [...files];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;
        
        [newFiles[index], newFiles[targetIndex]] = [newFiles[targetIndex], newFiles[index]];
        setFiles(newFiles);
        setMergedUrl(null);
    };

    const handleMerge = async () => {
        if (files.length < 2) {
            alert("Vui lòng chọn ít nhất 2 file PDF để ghép.");
            return;
        }

        setState({ status: 'processing', message: t('action.processing') });
        
        try {
            const mergedBytes = await mergePdfs(files);
            const blob = new Blob([mergedBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            setMergedUrl(url);
            setState({ status: 'success', message: t('action.success') });
        } catch (error: any) {
            setState({ status: 'error', message: error.message });
        }
    };

    const downloadPdf = () => {
        if (!mergedUrl) return;
        const link = document.createElement('a');
        link.href = mergedUrl;
        link.download = `merged-document-${Date.now()}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-red-50 to-white">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Layers className="w-6 h-6 text-red-600" />
                        {t('page.pdf_merge.title')}
                    </h1>
                    <p className="text-slate-500">
                        {t('page.pdf_merge.sub')}
                    </p>
                </div>

                <div className="p-8">
                    {/* Empty State / Upload */}
                    {files.length === 0 ? (
                        <div className="border-2 border-dashed border-red-200 bg-red-50/20 rounded-2xl p-16 text-center hover:bg-red-50 transition-colors relative cursor-pointer group">
                            <input 
                                type="file" 
                                accept="application/pdf" 
                                multiple
                                onChange={handleFilesChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-md text-red-600 mb-6 group-hover:scale-110 transition-transform">
                                <Upload className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('page.pdf_merge.upload_title')}</h3>
                            <p className="text-slate-500">{t('page.pdf_merge.upload_desc')}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            {/* File List */}
                            <div className="space-y-3">
                                {files.map((file, index) => (
                                    <div key={index} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-200 rounded-xl animate-fade-in-up">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className="w-8 h-8 flex-shrink-0 bg-red-100 text-red-600 rounded flex items-center justify-center font-bold text-sm">
                                                {index + 1}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="font-medium text-slate-800 truncate">{file.name}</p>
                                                <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                                            </div>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => moveFile(index, 'up')}
                                                disabled={index === 0}
                                                className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
                                                title="Lên trên"
                                            >
                                                <ArrowUp className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => moveFile(index, 'down')}
                                                disabled={index === files.length - 1}
                                                className="p-2 text-slate-400 hover:text-slate-700 disabled:opacity-30 transition-colors"
                                                title="Xuống dưới"
                                            >
                                                <ArrowDown className="w-4 h-4" />
                                            </button>
                                            <button 
                                                onClick={() => removeFile(index)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-2"
                                                title="Xóa"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Actions Area */}
                            <div className="flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-100">
                                <div className="relative">
                                    <input 
                                        type="file" 
                                        accept="application/pdf" 
                                        multiple
                                        onChange={handleFilesChange}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    />
                                    <button className="w-full md:w-auto px-6 py-3 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors">
                                        <Plus className="w-5 h-5" /> {t('page.pdf_merge.btn_add')}
                                    </button>
                                </div>

                                <div className="flex-grow flex justify-end gap-4">
                                    {!mergedUrl ? (
                                        <button 
                                            onClick={handleMerge}
                                            disabled={files.length < 2 || state.status === 'processing'}
                                            className="w-full md:w-auto px-8 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold shadow-lg shadow-red-200 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {state.status === 'processing' ? t('action.processing') : t('page.pdf_merge.btn_merge')}
                                        </button>
                                    ) : (
                                        <button 
                                            onClick={downloadPdf}
                                            className="w-full md:w-auto px-8 py-3 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold shadow-lg shadow-green-200 transition-all flex items-center justify-center gap-2 animate-bounce-subtle"
                                        >
                                            <Download className="w-5 h-5" /> {t('page.pdf_merge.btn_download')}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            
             {/* Guide */}
             <div className="mt-8 grid md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center">
                    <h3 className="font-bold text-slate-800 mb-2">{t('page.pdf_merge.guide_1_t')}</h3>
                    <p className="text-sm text-slate-500">{t('page.pdf_merge.guide_1_d')}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center">
                    <h3 className="font-bold text-slate-800 mb-2">{t('page.pdf_merge.guide_2_t')}</h3>
                    <p className="text-sm text-slate-500">{t('page.pdf_merge.guide_2_d')}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center">
                    <h3 className="font-bold text-slate-800 mb-2">{t('page.pdf_merge.guide_3_t')}</h3>
                    <p className="text-sm text-slate-500">{t('page.pdf_merge.guide_3_d')}</p>
                </div>
            </div>
        </div>
    );
};