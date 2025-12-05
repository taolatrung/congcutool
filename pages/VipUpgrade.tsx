import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiBuyVip } from '../services/mockBackend';
import { useNavigate, Link } from 'react-router-dom';
import { Check, Crown, Zap, Shield, Star, ArrowLeft, X } from 'lucide-react';
import { VipPlan } from '../types';

const VIP_PLANS: VipPlan[] = [
    {
        id: 'vip_1m',
        name: '1 Tháng',
        durationDays: 30,
        price: 20000,
        description: 'Thích hợp để trải nghiệm',
    },
    {
        id: 'vip_3m',
        name: '3 Tháng',
        durationDays: 90,
        price: 50000,
        description: 'Tiết kiệm 16%',
    },
    {
        id: 'vip_1y',
        name: '1 Năm',
        durationDays: 365,
        price: 150000,
        description: 'Tiết kiệm 37% - Phổ biến nhất',
        isPopular: true
    }
];

export const VipUpgrade: React.FC = () => {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState<string | null>(null);

    const handleBuy = async (plan: VipPlan) => {
        if (!user) return navigate('/login');
        
        if (user.balance < plan.price) {
            if(confirm("Số dư không đủ. Bạn có muốn nạp thêm tiền không?")) {
                navigate('/topup');
            }
            return;
        }

        if(!confirm(`Xác nhận mua gói ${plan.name} với giá ${plan.price.toLocaleString()}đ?`)) return;

        setProcessing(plan.id);
        try {
            await apiBuyVip(user.id, plan.durationDays, plan.price, plan.name);
            await refreshProfile();
            alert("Nâng cấp VIP thành công!");
            navigate('/profile');
        } catch (e: any) {
            alert(e.message || "Có lỗi xảy ra");
        } finally {
            setProcessing(null);
        }
    };

    return (
        <div className="container mx-auto px-4 py-12">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-brand-600 mb-8">
                <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
            </button>

            <div className="text-center max-w-2xl mx-auto mb-16">
                <span className="bg-yellow-100 text-yellow-700 font-bold px-3 py-1 rounded-full text-xs uppercase tracking-wide">Premium Access</span>
                <h1 className="text-4xl font-extrabold text-slate-900 mt-4 mb-4">Nâng cấp tài khoản VIP</h1>
                <p className="text-slate-600 text-lg">
                    Loại bỏ quảng cáo, mở khóa toàn bộ công cụ cao cấp và ưu tiên xử lý tốc độ cao.
                </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
                {VIP_PLANS.map(plan => (
                    <div 
                        key={plan.id} 
                        className={`relative bg-white rounded-2xl shadow-xl border-2 transition-transform hover:-translate-y-2 flex flex-col ${
                            plan.isPopular ? 'border-yellow-400 scale-105 z-10' : 'border-slate-100'
                        }`}
                    >
                        {plan.isPopular && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white font-bold px-4 py-1 rounded-full text-sm shadow-md flex items-center gap-1">
                                <Star className="w-3 h-3 fill-current" /> Phổ biến nhất
                            </div>
                        )}

                        <div className="p-8 text-center border-b border-slate-100">
                            <h3 className="text-xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                            <div className="text-4xl font-extrabold text-brand-600 mb-2">
                                {plan.price.toLocaleString()} <span className="text-lg text-slate-400 font-normal">đ</span>
                            </div>
                            <p className="text-slate-500 text-sm">{plan.description}</p>
                        </div>

                        <div className="p-8 flex-grow space-y-4">
                            <FeatureItem text="Không quảng cáo" />
                            <FeatureItem text="Mở khóa Tool Premium" />
                            <FeatureItem text="Tốc độ xử lý ưu tiên" />
                            <FeatureItem text="Hỗ trợ 24/7" />
                        </div>

                        <div className="p-8 pt-0">
                            <button
                                onClick={() => handleBuy(plan)}
                                disabled={!!processing}
                                className={`w-full py-4 rounded-xl font-bold transition-colors shadow-lg ${
                                    plan.isPopular 
                                    ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:shadow-orange-200' 
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                }`}
                            >
                                {processing === plan.id ? 'Đang xử lý...' : 'Chọn gói này'}
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Comparison */}
            <div className="mt-20 max-w-3xl mx-auto bg-slate-50 rounded-2xl p-8 border border-slate-200">
                <h3 className="font-bold text-center text-slate-900 mb-8 text-xl">Đặc quyền thành viên</h3>
                <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-4">
                        <div className="font-bold text-slate-500 mb-2 border-b border-slate-200 pb-2">Thành viên thường</div>
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <Check className="w-4 h-4 text-slate-300" /> Tool cơ bản: Miễn phí
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <Check className="w-4 h-4 text-slate-300" /> Tool Premium: Xem QC hoặc Trả phí lẻ
                        </div>
                        <div className="flex items-center gap-2 text-slate-600 text-sm">
                            <X className="w-4 h-4 text-red-400" /> Có quảng cáo
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="font-bold text-brand-600 mb-2 border-b border-slate-200 pb-2">Thành viên VIP</div>
                        <div className="flex items-center gap-2 text-slate-900 font-medium text-sm">
                            <Check className="w-4 h-4 text-green-500" /> Tool cơ bản: Miễn phí
                        </div>
                        <div className="flex items-center gap-2 text-slate-900 font-medium text-sm">
                            <Check className="w-4 h-4 text-green-500" /> Tool Premium: Miễn phí 100%
                        </div>
                        <div className="flex items-center gap-2 text-slate-900 font-medium text-sm">
                            <Check className="w-4 h-4 text-green-500" /> Không quảng cáo
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FeatureItem = ({ text }: { text: string }) => (
    <div className="flex items-center gap-3 text-sm text-slate-700">
        <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center text-green-600 flex-shrink-0">
            <Check className="w-3 h-3" />
        </div>
        {text}
    </div>
);