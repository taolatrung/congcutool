import React, { useState } from 'react';
import { FileSpreadsheet, Upload, ArrowRight, Download, RefreshCw, AlertCircle, CheckCircle, FileText } from 'lucide-react';
import { extractTableFromPdf } from '../services/geminiService';
import { ProcessingState } from '../types';
import { useLanguage } from '../context/LanguageContext';

export const PdfToExcel: React.FC = () => {
    const [file, setFile] = useState<File | null>(null);
    const [csvData, setCsvData] = useState<string | null>(null);
    const [state, setState] = useState<ProcessingState>({ status: 'idle' });
    const { t } = useLanguage();

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.size > 10 * 1024 * 1024) { // 10MB limit
                alert("File quá lớn! Vui lòng chọn file PDF dưới 10MB.");
                return;
            }
            if (selectedFile.type !== 'application/pdf') {
                alert("Vui lòng chọn file định dạng PDF.");
                return;
            }
            setFile(selectedFile);
            setCsvData(null);
            setState({ status: 'idle' });
        }
    };

    const handleConvert = () => {
        if (!file) return;

        setState({ status: 'processing', message: t('page.pdf_excel.status_processing') });

        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            try {
                const base64Data = reader.result as string;
                const base64Content = base64Data.split(',')[1];

                const csv = await extractTableFromPdf(base64Content);
                setCsvData(csv);
                setState({ status: 'success', message: t('action.success') });
            } catch (err: any) {
                setState({ status: 'error', message: err.message || t('action.error') });
            }
        };
        reader.onerror = () => {
            setState({ status: 'error', message: t('action.error') });
        };
    };

    const handleDownload = () => {
        if (!csvData) return;
        // Add BOM for Excel to read UTF-8 correctly
        const blob = new Blob(["\ufeff", csvData], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `extracted_data_${Date.now()}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-green-50 to-white">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <FileSpreadsheet className="w-6 h-6 text-green-600" />
                        {t('page.pdf_excel.title')}
                    </h1>
                    <p className="text-slate-500">
                        {t('page.pdf_excel.sub')}
                    </p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Upload Area */}
                    {!file ? (
                        <div className="border-2 border-dashed border-green-200 bg-green-50/20 rounded-2xl p-16 text-center hover:bg-green-50 transition-colors relative cursor-pointer group">
                            <input 
                                type="file" 
                                accept="application/pdf" 
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            />
                            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white shadow-md text-green-600 mb-6 group-hover:scale-110 transition-transform">
                                <Upload className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{t('page.pdf_excel.upload_title')}</h3>
                            <p className="text-slate-500">{t('page.pdf_excel.upload_desc')}</p>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-8">
                            {/* File Info & Actions */}
                            <div className="space-y-6">
                                <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="w-12 h-12 bg-red-100 text-red-600 rounded-lg flex items-center justify-center">
                                            <FileText className="w-6 h-6" />
                                        </div>
                                        <div className="overflow-hidden">
                                            <p className="font-bold text-slate-800 truncate" title={file.name}>{file.name}</p>
                                            <p className="text-sm text-slate-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                        </div>
                                    </div>
                                    
                                    <button 
                                        onClick={() => { setFile(null); setCsvData(null); }}
                                        className="text-sm text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                                    >
                                        <RefreshCw className="w-3 h-3" /> {t('action.choose_another')}
                                    </button>
                                </div>

                                <button 
                                    onClick={handleConvert}
                                    disabled={state.status === 'processing' || !!csvData}
                                    className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all ${
                                        !!csvData 
                                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                        : 'bg-green-600 hover:bg-green-700 text-white shadow-green-200 hover:-translate-y-1'
                                    }`}
                                >
                                    {state.status === 'processing' ? (
                                        <>
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            {t('action.processing')}
                                        </>
                                    ) : !!csvData ? (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            {t('action.success')}
                                        </>
                                    ) : (
                                        <>
                                            <ArrowRight className="w-5 h-5" />
                                            {t('page.pdf_excel.btn_start')}
                                        </>
                                    )}
                                </button>
                                
                                {state.status === 'processing' && (
                                    <p className="text-sm text-center text-slate-500 animate-pulse">
                                        {t('page.pdf_excel.status_processing')}
                                    </p>
                                )}
                                
                                {state.status === 'error' && (
                                    <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                                        <AlertCircle className="w-4 h-4" />
                                        {state.message}
                                    </div>
                                )}
                            </div>

                            {/* Result Area */}
                            <div className="bg-slate-50 rounded-xl border border-slate-200 p-6 flex flex-col relative overflow-hidden">
                                {csvData ? (
                                    <div className="flex flex-col h-full">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-bold text-slate-800">{t('page.pdf_excel.preview')}</h3>
                                            <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">CSV Format</span>
                                        </div>
                                        
                                        <div className="flex-grow bg-white border border-slate-200 rounded-lg p-3 overflow-auto max-h-[200px] mb-4 text-xs font-mono text-slate-600 whitespace-pre">
                                            {csvData.slice(0, 500)}...
                                        </div>
                                        
                                        <button 
                                            onClick={handleDownload}
                                            className="w-full py-3 bg-white border-2 border-green-600 text-green-700 hover:bg-green-50 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
                                        >
                                            <Download className="w-5 h-5" />
                                            {t('page.pdf_excel.btn_download')}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center text-slate-400">
                                        <FileSpreadsheet className="w-12 h-12 mb-4 opacity-20" />
                                        <p className="text-sm text-center">...</p>
                                    </div>
                                )}
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
                    <h3 className="font-bold text-slate-800 mb-2">{t('page.pdf_excel.title')}</h3>
                    <p className="text-sm text-slate-500">{t('page.pdf_excel.sub')}</p>
                </div>
                <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm text-center">
                    <h3 className="font-bold text-slate-800 mb-2">{t('page.pdf_merge.guide_3_t')}</h3>
                    <p className="text-sm text-slate-500">{t('page.pdf_merge.guide_3_d')}</p>
                </div>
            </div>
        </div>
    );
};