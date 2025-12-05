import React, { useState, useEffect } from 'react';
import { Calculator, Percent, ArrowRight, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

export const PercentageCalculator: React.FC = () => {
    // --- MODE 1: X% of Y ---
    const [mode1, setMode1] = useState({ percent: '', total: '', result: 0 });
    
    // --- MODE 2: X is what % of Y ---
    const [mode2, setMode2] = useState({ part: '', total: '', result: 0 });

    // --- MODE 3: Change from X to Y ---
    const [mode3, setMode3] = useState({ from: '', to: '', result: 0, diff: 0 });

    // Logic 1: Find Value
    useEffect(() => {
        const p = parseFloat(mode1.percent);
        const t = parseFloat(mode1.total);
        if (!isNaN(p) && !isNaN(t)) {
            setMode1(prev => ({ ...prev, result: (p / 100) * t }));
        } else {
            setMode1(prev => ({ ...prev, result: 0 }));
        }
    }, [mode1.percent, mode1.total]);

    // Logic 2: Find Percentage
    useEffect(() => {
        const p = parseFloat(mode2.part);
        const t = parseFloat(mode2.total);
        if (!isNaN(p) && !isNaN(t) && t !== 0) {
            setMode2(prev => ({ ...prev, result: (p / t) * 100 }));
        } else {
            setMode2(prev => ({ ...prev, result: 0 }));
        }
    }, [mode2.part, mode2.total]);

    // Logic 3: Percentage Change
    useEffect(() => {
        const f = parseFloat(mode3.from);
        const t = parseFloat(mode3.to);
        if (!isNaN(f) && !isNaN(t) && f !== 0) {
            const diff = t - f;
            const percent = (diff / f) * 100;
            setMode3(prev => ({ ...prev, result: percent, diff: diff }));
        } else {
            setMode3(prev => ({ ...prev, result: 0, diff: 0 }));
        }
    }, [mode3.from, mode3.to]);

    const formatNumber = (num: number) => {
        return Number.isInteger(num) ? num : parseFloat(num.toFixed(2));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-emerald-50 to-white">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Calculator className="w-6 h-6 text-emerald-600" />
                        Công cụ Tính Phần Trăm
                    </h1>
                    <p className="text-slate-500">Tính nhanh phần trăm, chiết khấu, tỉ lệ tăng trưởng và lợi nhuận.</p>
                </div>

                <div className="p-8 space-y-12">
                    
                    {/* Calculator 1: X% of Y */}
                    <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center font-bold">1</div>
                            <h3 className="font-bold text-slate-800 text-lg">Tính giá trị phần trăm</h3>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 w-full relative">
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                                <input 
                                    type="number" 
                                    placeholder="Ví dụ: 20"
                                    value={mode1.percent}
                                    onChange={e => setMode1({...mode1, percent: e.target.value})}
                                    className="w-full p-4 pr-8 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium text-lg"
                                />
                            </div>
                            <span className="font-medium text-slate-500">của</span>
                            <div className="flex-1 w-full">
                                <input 
                                    type="number" 
                                    placeholder="Ví dụ: 500.000"
                                    value={mode1.total}
                                    onChange={e => setMode1({...mode1, total: e.target.value})}
                                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium text-lg"
                                />
                            </div>
                            <span className="font-medium text-slate-500">=</span>
                            <div className="flex-1 w-full bg-white border-2 border-brand-100 p-4 rounded-xl text-center">
                                <span className="text-2xl font-bold text-brand-600">
                                    {mode1.result ? formatNumber(mode1.result).toLocaleString() : '0'}
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 italic">Công thức: (Phần trăm / 100) * Tổng số</p>
                    </section>

                    {/* Calculator 2: X is what % of Y */}
                    <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                         <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center font-bold">2</div>
                            <h3 className="font-bold text-slate-800 text-lg">Tìm tỉ lệ phần trăm</h3>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 w-full">
                                <input 
                                    type="number" 
                                    placeholder="Số con (VD: 20)"
                                    value={mode2.part}
                                    onChange={e => setMode2({...mode2, part: e.target.value})}
                                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium text-lg"
                                />
                            </div>
                            <span className="font-medium text-slate-500">là bao nhiêu % của</span>
                            <div className="flex-1 w-full">
                                <input 
                                    type="number" 
                                    placeholder="Số tổng (VD: 100)"
                                    value={mode2.total}
                                    onChange={e => setMode2({...mode2, total: e.target.value})}
                                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium text-lg"
                                />
                            </div>
                            <span className="font-medium text-slate-500">=</span>
                            <div className="flex-1 w-full bg-white border-2 border-brand-100 p-4 rounded-xl text-center">
                                <span className="text-2xl font-bold text-brand-600">
                                    {mode2.result ? formatNumber(mode2.result) : '0'}%
                                </span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2 italic">Công thức: (Số con / Số tổng) * 100</p>
                    </section>

                    {/* Calculator 3: Percentage Change */}
                    <section className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                         <div className="flex items-center gap-2 mb-4">
                            <div className="w-8 h-8 bg-brand-100 text-brand-600 rounded-lg flex items-center justify-center font-bold">3</div>
                            <h3 className="font-bold text-slate-800 text-lg">Tính tăng/giảm phần trăm</h3>
                        </div>
                        <div className="flex flex-col md:flex-row items-center gap-4">
                            <div className="flex-1 w-full">
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Giá trị cũ</label>
                                <input 
                                    type="number" 
                                    placeholder="Từ số..."
                                    value={mode3.from}
                                    onChange={e => setMode3({...mode3, from: e.target.value})}
                                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium text-lg"
                                />
                            </div>
                            <div className="text-slate-400 hidden md:block pt-5"><ArrowRight /></div>
                            <div className="flex-1 w-full">
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Giá trị mới</label>
                                <input 
                                    type="number" 
                                    placeholder="Đến số..."
                                    value={mode3.to}
                                    onChange={e => setMode3({...mode3, to: e.target.value})}
                                    className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none font-medium text-lg"
                                />
                            </div>
                            <div className="flex-1 w-full">
                                <label className="text-xs font-medium text-slate-500 mb-1 block">Kết quả</label>
                                <div className={`bg-white border-2 p-4 rounded-xl flex items-center justify-between ${mode3.result > 0 ? 'border-green-200 text-green-700' : mode3.result < 0 ? 'border-red-200 text-red-700' : 'border-slate-200 text-slate-600'}`}>
                                    <div className="font-bold text-xl">
                                        {Math.abs(formatNumber(mode3.result))}%
                                    </div>
                                    <div className="flex items-center text-sm font-medium">
                                        {mode3.result > 0 ? (
                                            <>Tăng <TrendingUp className="w-4 h-4 ml-1" /></>
                                        ) : mode3.result < 0 ? (
                                            <>Giảm <TrendingDown className="w-4 h-4 ml-1" /></>
                                        ) : (
                                            <span>--</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                         <p className="text-xs text-slate-500 mt-2 italic">Chênh lệch giá trị: {formatNumber(mode3.diff).toLocaleString()}</p>
                    </section>

                </div>
            </div>
        </div>
    );
};