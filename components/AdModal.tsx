import React, { useEffect, useState } from 'react';
import { X, PlayCircle, Clock } from 'lucide-react';

interface AdModalProps {
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export const AdModal: React.FC<AdModalProps> = ({ isOpen, onClose, onComplete }) => {
    const [timeLeft, setTimeLeft] = useState(5); // 5 seconds ad
    const [canSkip, setCanSkip] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setTimeLeft(5);
            setCanSkip(false);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    setCanSkip(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4">
            <div className="bg-white rounded-2xl w-full max-w-lg overflow-hidden relative shadow-2xl animate-fade-in-up">
                
                {/* Header / Timer */}
                <div className="bg-slate-900 text-white p-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                        <span className="bg-yellow-500 text-black text-xs font-bold px-2 py-0.5 rounded">Ad</span>
                        <span className="text-sm font-medium">Nhà tài trợ</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-mono text-slate-300">
                        {canSkip ? (
                            <span className="text-green-400 font-bold">Hoàn tất</span>
                        ) : (
                            <>
                                <Clock className="w-4 h-4" />
                                Còn {timeLeft}s
                            </>
                        )}
                    </div>
                </div>

                {/* Ad Content Simulation */}
                <div className="h-64 bg-slate-100 flex flex-col items-center justify-center text-center p-8">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4 animate-bounce">
                        <PlayCircle className="w-8 h-8" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Quảng cáo mô phỏng</h3>
                    <p className="text-slate-500 text-sm">
                        Đang phát quảng cáo để hỗ trợ duy trì server miễn phí...
                    </p>
                </div>

                {/* Actions */}
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
                    <button 
                        onClick={onClose}
                        className="px-4 py-2 text-slate-500 hover:text-slate-700 font-medium text-sm"
                    >
                        Hủy bỏ
                    </button>
                    <button 
                        onClick={onComplete}
                        disabled={!canSkip}
                        className={`px-6 py-2 rounded-lg font-bold flex items-center transition-all ${
                            canSkip 
                            ? 'bg-brand-600 text-white hover:bg-brand-700 shadow-lg' 
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                    >
                        {canSkip ? 'Bỏ qua & Dùng Tool' : `Đợi ${timeLeft}s...`}
                    </button>
                </div>
            </div>
        </div>
    );
};