import React, { useState, useEffect } from 'react';
import { Type, AlignLeft, Clock, FileText } from 'lucide-react';

export const WordCounter: React.FC = () => {
    const [text, setText] = useState('');
    const [stats, setStats] = useState({
        words: 0,
        chars: 0,
        charsNoSpace: 0,
        paragraphs: 0,
        sentences: 0,
        readTime: 0
    });

    useEffect(() => {
        const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
        const chars = text.length;
        const charsNoSpace = text.replace(/\s/g, '').length;
        const paragraphs = text.trim() === '' ? 0 : text.split(/\n+/).length;
        const sentences = text.trim() === '' ? 0 : text.split(/[.!?]+/).length - 1;
        const readTime = Math.ceil(words / 200); // Avg reading speed 200 wpm

        setStats({ words, chars, charsNoSpace, paragraphs, sentences, readTime });
    }, [text]);

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <AlignLeft className="w-6 h-6 text-brand-500" />
                        Bộ đếm từ & Ký tự
                    </h1>
                    <p className="text-slate-500">Công cụ đếm từ, ký tự, đoạn văn và ước tính thời gian đọc miễn phí.</p>
                </div>

                <div className="p-6 bg-slate-50 border-b border-slate-100">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        <StatBox label="Từ" value={stats.words} />
                        <StatBox label="Ký tự" value={stats.chars} />
                        <StatBox label="Ký tự (không dấu cách)" value={stats.charsNoSpace} />
                        <StatBox label="Đoạn văn" value={stats.paragraphs} />
                        <StatBox label="Câu" value={stats.sentences} />
                        <StatBox label="Phút đọc" value={stats.readTime} icon={<Clock className="w-3 h-3 ml-1" />} />
                    </div>
                </div>

                <div className="p-8">
                    <textarea
                        className="w-full h-96 p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent resize-none text-slate-800 leading-relaxed shadow-inner"
                        placeholder="Nhập hoặc dán văn bản của bạn vào đây..."
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                    ></textarea>
                    
                    <div className="flex justify-between items-center mt-4">
                        <button 
                            onClick={() => setText('')}
                            className="text-sm text-red-500 hover:text-red-600 font-medium"
                        >
                            Xóa tất cả
                        </button>
                        <button 
                            onClick={() => {navigator.clipboard.writeText(text); alert('Đã sao chép!');}}
                            className="px-4 py-2 bg-slate-800 text-white rounded-lg text-sm font-medium hover:bg-slate-700 transition-colors"
                        >
                            Sao chép văn bản
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatBox = ({ label, value, icon }: { label: string, value: number, icon?: React.ReactNode }) => (
    <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100 flex flex-col items-center justify-center text-center">
        <span className="text-2xl font-bold text-brand-600 flex items-center">{value} {icon}</span>
        <span className="text-xs text-slate-500 font-medium mt-1">{label}</span>
    </div>
);