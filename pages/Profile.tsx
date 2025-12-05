import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, ShieldCheck } from 'lucide-react';

export const Profile: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    React.useEffect(() => {
        if (!isAuthenticated) navigate('/login');
    }, [isAuthenticated, navigate]);

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-12">
            <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="bg-gradient-to-r from-slate-800 to-slate-900 p-8 text-center">
                    <div className="w-24 h-24 bg-white/10 backdrop-blur rounded-full mx-auto flex items-center justify-center mb-4 text-white border-4 border-white/20">
                        <User className="w-12 h-12" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-1">{user.name}</h2>
                    <p className="text-slate-400 text-sm">{user.email}</p>
                </div>

                <div className="p-8 space-y-6">
                    <div className="bg-green-50 p-4 rounded-xl flex items-center gap-3 border border-green-100">
                        <ShieldCheck className="w-6 h-6 text-green-600" />
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">Tài khoản tiêu chuẩn</h3>
                            <p className="text-xs text-slate-500">Bạn có thể sử dụng mọi công cụ (hỗ trợ bởi quảng cáo)</p>
                        </div>
                    </div>

                    <button 
                        onClick={() => logout()} 
                        className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-100 text-red-600 py-3 rounded-xl font-bold hover:bg-red-50 hover:border-red-200 transition-colors"
                    >
                        <LogOut className="w-5 h-5" /> Đăng xuất
                    </button>
                </div>
                
                <div className="bg-slate-50 p-4 text-center text-xs text-slate-400 border-t border-slate-100">
                    Tham gia từ {new Date(user.createdAt).toLocaleDateString('vi-VN')}
                </div>
            </div>
        </div>
    );
};