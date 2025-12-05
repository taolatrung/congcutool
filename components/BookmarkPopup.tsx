import React, { useState, useEffect } from 'react';
import { X, Bookmark } from 'lucide-react';

export const BookmarkPopup: React.FC = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const hasSeenPopup = localStorage.getItem('hasSeenBookmarkPopup');
        if (!hasSeenPopup) {
            const timer = setTimeout(() => setIsVisible(true), 5000);
            return () => clearTimeout(timer);
        }
    }, []);

    const dismiss = () => {
        setIsVisible(false);
        localStorage.setItem('hasSeenBookmarkPopup', 'true');
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-4 right-4 z-50 max-w-sm w-full animate-fade-in-up">
            <div className="bg-slate-900 text-white p-4 rounded-xl shadow-2xl flex items-start gap-3">
                <div className="bg-brand-500 p-2 rounded-lg">
                    <Bookmark className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                    <h4 className="font-bold text-sm mb-1">Đừng để lạc mất công cụ này!</h4>
                    <p className="text-xs text-slate-300 mb-2">Nhấn Ctrl+D (hoặc ⌘+D) để lưu trang này lại. Sử dụng miễn phí mỗi ngày.</p>
                    <button 
                        onClick={dismiss}
                        className="text-xs font-semibold text-brand-400 hover:text-brand-300 transition-colors"
                    >
                        Đã hiểu
                    </button>
                </div>
                <button onClick={dismiss} className="text-slate-400 hover:text-white">
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
};