import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { Lock, Crown, Coins, PlayCircle, CheckCircle } from 'lucide-react';
import { ToolDef } from '../types';
import { apiDeduct, isUserVip } from '../services/mockBackend';
import { AdModal } from './AdModal';

interface Props {
    tool: ToolDef;
    children: React.ReactNode;
}

export const PremiumGuard: React.FC<Props> = ({ tool, children }) => {
    const { user, isAuthenticated, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAd, setShowAd] = useState(false);
    const [error, setError] = useState('');

    // --- LOGIC: VIP PASS ---
    const isVip = isUserVip(user);
    if (isVip) return <>{children}</>;

    // --- LOGIC: ALREADY UNLOCKED (Ad watched or Paid) ---
    if (isUnlocked) return <>{children}</>;

    // --- LOGIC: FREE TOOLS (No Guard needed unless we want to enforce ads everywhere) ---
    // If you want all tools to be gated, remove this line.
    if (!tool.isPremium) return <>{children}</>;

    // Default usage price if not specified
    const usagePrice = tool.price || 1000;

    const handlePayPerUse = async () => {
        if (!user) return navigate('/login');
        setIsProcessing(true);
        setError('');
        try {
            await apiDeduct(user.id, usagePrice, tool.name);
            await refreshProfile(); 
            setIsUnlocked(true); 
        } catch (err: any) {
            setError(err.message || "Giao dịch thất bại");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleAdComplete = () => {
        setShowAd(false);
        setIsUnlocked(true);
    };

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <AdModal 
                isOpen={showAd} 
                onClose={() => setShowAd(false)} 
                onComplete={handleAdComplete} 
            />

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative">
                {/* Header */}
                <div className="bg-slate-900 text-white p-6 text-center">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 rounded-full mb-3 backdrop-blur-sm">
                        <Lock className="w-8 h-8 text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold">Mở khóa tính năng</h2>
                    <p className="text-slate-300 text-sm mt-1">
                        Bạn đang truy cập công cụ <span className="text-white font-bold">{tool.name}</span>
                    </p>
                </div>

                {/* Body Options */}
                <div className="p-8">
                    {!isAuthenticated ? (
                        <div className="text-center">
                            <p className="mb-6 text-slate-600">Vui lòng đăng nhập để sử dụng công cụ này.</p>
                            <div className="flex gap-4 justify-center">
                                <Link to="/login" className="px-6 py-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 font-medium">Đăng nhập</Link>
                                <Link to="/register" className="px-6 py-2 bg-white border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-medium">Đăng ký</Link>
                            </div>
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 gap-8 relative">
                            {/* Option 1: Watch Ad */}
                            <div className="border border-slate-200 rounded-xl p-6 hover:border-brand-300 transition-colors flex flex-col items-center text-center group">
                                <div className="w-12 h-12 bg-blue-50 text-brand-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <PlayCircle className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Xem Quảng Cáo</h3>
                                <p className="text-xs text-slate-500 mb-6 flex-grow">
                                    Xem 1 video ngắn (5-30s) để dùng miễn phí lần này.
                                </p>
                                <button 
                                    onClick={() => setShowAd(true)}
                                    className="w-full py-2.5 bg-white border-2 border-brand-600 text-brand-600 rounded-lg font-bold hover:bg-brand-50 transition-colors"
                                >
                                    Xem ngay (Miễn phí)
                                </button>
                            </div>

                            {/* Option 2: Pay Per Use */}
                            <div className="border border-slate-200 rounded-xl p-6 hover:border-amber-300 transition-colors flex flex-col items-center text-center group relative overflow-hidden">
                                {user.balance < usagePrice && (
                                    <div className="absolute inset-0 bg-white/80 z-10 flex items-center justify-center backdrop-blur-[1px]">
                                        <Link to="/topup" className="text-xs font-bold text-red-500 hover:underline">
                                            Số dư không đủ. Nạp thêm?
                                        </Link>
                                    </div>
                                )}
                                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Coins className="w-6 h-6" />
                                </div>
                                <h3 className="font-bold text-slate-900 mb-2">Trả phí nhanh</h3>
                                <p className="text-xs text-slate-500 mb-6 flex-grow">
                                    Thanh toán từ số dư ví để dùng ngay không quảng cáo.
                                </p>
                                <div className="text-lg font-extrabold text-slate-900 mb-4">
                                    {usagePrice.toLocaleString()} đ <span className="text-xs font-normal text-slate-400">/lần</span>
                                </div>
                                <button 
                                    onClick={handlePayPerUse}
                                    disabled={user.balance < usagePrice || isProcessing}
                                    className="w-full py-2.5 bg-amber-500 text-white rounded-lg font-bold hover:bg-amber-600 transition-colors shadow-md disabled:opacity-50"
                                >
                                    {isProcessing ? 'Đang xử lý...' : 'Thanh toán ngay'}
                                </button>
                            </div>

                            {/* Center "OR" */}
                            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-xs font-bold text-slate-500 border-4 border-white hidden md:flex">
                                OR
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer: Upsell VIP */}
                <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-4 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-yellow-400 rounded-lg flex items-center justify-center text-indigo-900 shadow-lg">
                            <Crown className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <div className="text-yellow-400 font-bold text-sm">Gói thành viên VIP</div>
                            <div className="text-slate-300 text-xs">Không giới hạn. Không quảng cáo. Giá từ 20k/tháng.</div>
                        </div>
                    </div>
                    <Link to="/vip-upgrade" className="px-5 py-2 bg-yellow-400 hover:bg-yellow-300 text-indigo-900 font-bold rounded-full text-sm transition-colors shadow-lg whitespace-nowrap">
                        Nâng cấp ngay
                    </Link>
                </div>
            </div>

            {error && (
                <div className="text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl mt-4 text-center text-sm font-medium animate-fade-in-up">
                    {error}
                </div>
            )}
        </div>
    );
};