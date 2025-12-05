import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiTopUp } from '../services/mockBackend';
import { useNavigate } from 'react-router-dom';
import { CreditCard, QrCode, Smartphone, CheckCircle, ArrowLeft } from 'lucide-react';

const PACKAGES = [50000, 100000, 200000, 500000];

export const TopUp: React.FC = () => {
    const { user, refreshProfile } = useAuth();
    const navigate = useNavigate();
    const [amount, setAmount] = useState<number | null>(null);
    const [method, setMethod] = useState('MOMO');
    const [isProcessing, setIsProcessing] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!user) return <div className="p-8 text-center">Vui lòng đăng nhập</div>;

    const handlePayment = async () => {
        if (!amount) return;
        setIsProcessing(true);
        try {
            await apiTopUp(user.id, amount, method);
            await refreshProfile();
            setSuccess(true);
        } catch (e) {
            alert("Lỗi thanh toán");
        } finally {
            setIsProcessing(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-md mx-auto py-16 px-4 text-center">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
                    <CheckCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">Thanh toán thành công!</h2>
                <p className="text-slate-600 mb-8">Tài khoản của bạn đã được cộng <span className="font-bold">{amount?.toLocaleString()} đ</span></p>
                <div className="flex gap-4 justify-center">
                    <button onClick={() => navigate('/profile')} className="px-6 py-2 bg-slate-200 text-slate-800 rounded-lg font-medium hover:bg-slate-300">Về hồ sơ</button>
                    <button onClick={() => navigate('/')} className="px-6 py-2 bg-brand-600 text-white rounded-lg font-medium hover:bg-brand-700">Dùng công cụ ngay</button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <button onClick={() => navigate(-1)} className="flex items-center text-slate-500 hover:text-brand-600 mb-6">
                <ArrowLeft className="w-4 h-4 mr-1" /> Quay lại
            </button>
            
            <h1 className="text-2xl font-bold text-slate-900 mb-8">Nạp tiền vào tài khoản</h1>

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Method Selection */}
                <div className="space-y-6">
                    <h3 className="font-bold text-slate-700">1. Chọn phương thức thanh toán</h3>
                    <div className="grid gap-4">
                        <PaymentMethod 
                            id="MOMO" 
                            name="Ví Momo" 
                            icon={<Smartphone className="w-6 h-6 text-pink-600"/>} 
                            selected={method === 'MOMO'} 
                            onSelect={setMethod} 
                        />
                        <PaymentMethod 
                            id="BANK" 
                            name="Chuyển khoản Ngân hàng (QR)" 
                            icon={<QrCode className="w-6 h-6 text-blue-600"/>} 
                            selected={method === 'BANK'} 
                            onSelect={setMethod} 
                        />
                        <PaymentMethod 
                            id="CARD" 
                            name="Thẻ quốc tế (Visa/Master)" 
                            icon={<CreditCard className="w-6 h-6 text-slate-600"/>} 
                            selected={method === 'CARD'} 
                            onSelect={setMethod} 
                        />
                    </div>
                </div>

                {/* Amount Selection */}
                <div className="space-y-6">
                    <h3 className="font-bold text-slate-700">2. Chọn gói nạp</h3>
                    <div className="grid grid-cols-2 gap-4">
                        {PACKAGES.map(pkg => (
                            <button
                                key={pkg}
                                onClick={() => setAmount(pkg)}
                                className={`p-4 rounded-xl border-2 text-center transition-all ${
                                    amount === pkg 
                                    ? 'border-brand-600 bg-brand-50 text-brand-700 font-bold shadow-md' 
                                    : 'border-slate-200 hover:border-brand-300 text-slate-700'
                                }`}
                            >
                                {pkg.toLocaleString()} đ
                            </button>
                        ))}
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mt-8">
                        <div className="flex justify-between mb-2">
                            <span className="text-slate-600">Số tiền nạp:</span>
                            <span className="font-bold text-slate-900">{amount ? amount.toLocaleString() : 0} đ</span>
                        </div>
                        <div className="flex justify-between mb-6">
                            <span className="text-slate-600">Phí giao dịch:</span>
                            <span className="font-bold text-green-600">Miễn phí</span>
                        </div>
                        <button
                            disabled={!amount || isProcessing}
                            onClick={handlePayment}
                            className="w-full py-3 bg-brand-600 text-white rounded-xl font-bold shadow-lg hover:bg-brand-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? 'Đang xử lý...' : `Thanh toán ${amount ? amount.toLocaleString() + ' đ' : ''}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PaymentMethod = ({ id, name, icon, selected, onSelect }: any) => (
    <button 
        onClick={() => onSelect(id)}
        className={`flex items-center p-4 rounded-xl border-2 transition-all w-full text-left ${
            selected ? 'border-brand-500 bg-white ring-2 ring-brand-100' : 'border-slate-200 bg-white hover:bg-slate-50'
        }`}
    >
        <div className="w-12 h-12 bg-slate-50 rounded-lg flex items-center justify-center mr-4">
            {icon}
        </div>
        <span className="font-medium text-slate-800">{name}</span>
        {selected && <CheckCircle className="ml-auto w-5 h-5 text-brand-600" />}
    </button>
);