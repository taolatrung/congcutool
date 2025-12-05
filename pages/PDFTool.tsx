import React from 'react';
import { FileType, Lock, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const PDFTool: React.FC = () => {
    return (
        <div className="max-w-4xl mx-auto">
             <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden text-center py-16 px-8">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 rounded-2xl mb-6">
                    <FileType className="w-10 h-10 text-red-500" />
                </div>
                
                <h1 className="text-3xl font-bold text-slate-900 mb-4">Chuyển đổi PDF sang Word</h1>
                <p className="text-slate-600 max-w-lg mx-auto mb-8">
                    Tính năng này đang được nâng cấp để hỗ trợ giữ nguyên định dạng 100%. 
                    Hiện tại bạn có thể dùng công cụ OCR để lấy văn bản từ PDF dạng ảnh.
                </p>

                <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
                    <div className="p-6 border border-slate-200 rounded-xl bg-slate-50">
                        <h3 className="font-bold text-slate-800 mb-2">Bản Miễn phí</h3>
                        <ul className="text-sm text-slate-600 space-y-2 text-left">
                            <li>• Chuyển đổi tối đa 3 trang</li>
                            <li>• Chỉ trích xuất văn bản thô</li>
                            <li>• Có quảng cáo</li>
                        </ul>
                    </div>
                    <div className="p-6 border-2 border-brand-500 rounded-xl bg-white relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-brand-500 text-white text-xs px-2 py-1 rounded-bl">Premium</div>
                        <h3 className="font-bold text-brand-700 mb-2 flex items-center gap-2">
                            <Lock className="w-4 h-4" /> Bản Pro
                        </h3>
                        <ul className="text-sm text-slate-600 space-y-2 text-left">
                            <li>• Không giới hạn số trang</li>
                            <li>• Giữ nguyên Layout & Font</li>
                            <li>• Không quảng cáo</li>
                        </ul>
                    </div>
                </div>

                <Link 
                    to="/ocr" 
                    className="inline-flex items-center px-8 py-4 bg-brand-600 text-white font-bold rounded-xl hover:bg-brand-700 transition-colors shadow-lg hover:shadow-xl"
                >
                    Thử dùng OCR thay thế <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
             </div>
        </div>
    );
};