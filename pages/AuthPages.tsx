import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { AlertCircle, User, Mail, Lock, ArrowRight } from 'lucide-react';

export const Login: React.FC = () => {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await login(email, password);
            navigate('/profile'); // Redirect to profile or home
        } catch (err: any) {
            setError(err.message || "Đăng nhập thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Chào mừng trở lại</h1>
                    <p className="text-slate-500">Đăng nhập để quản lý tài khoản của bạn</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between mb-1">
                             <label className="block text-sm font-medium text-slate-700">Mật khẩu</label>
                             <a href="#" className="text-xs text-brand-600 hover:underline">Quên mật khẩu?</a>
                        </div>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="password" 
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-bold hover:bg-brand-700 transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                    >
                        {loading ? 'Đang xử lý...' : 'Đăng nhập'} <ArrowRight className="w-4 h-4"/>
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Chưa có tài khoản? <Link to="/register" className="text-brand-600 font-bold hover:underline">Đăng ký ngay</Link>
                </p>
            </div>
        </div>
    );
};

export const Register: React.FC = () => {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            await register(email, password, name);
            navigate('/profile');
        } catch (err: any) {
            setError(err.message || "Đăng ký thất bại");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[80vh] flex items-center justify-center px-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-100 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-slate-900">Tạo tài khoản mới</h1>
                    <p className="text-slate-500">Trải nghiệm đầy đủ tính năng EasyConvert Hub</p>
                </div>

                {error && (
                    <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg flex items-center gap-2 text-sm">
                        <AlertCircle className="w-4 h-4" /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên</label>
                        <div className="relative">
                            <User className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="text" 
                                required
                                value={name}
                                onChange={e => setName(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                placeholder="Nguyễn Văn A"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                        <div className="relative">
                            <Mail className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="email" 
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                placeholder="name@example.com"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Mật khẩu</label>
                        <div className="relative">
                            <Lock className="w-5 h-5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input 
                                type="password" 
                                required
                                minLength={6}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:outline-none"
                                placeholder="Tối thiểu 6 ký tự"
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-brand-600 text-white py-2.5 rounded-lg font-bold hover:bg-brand-700 transition-colors disabled:opacity-70"
                    >
                        {loading ? 'Đang tạo tài khoản...' : 'Đăng ký miễn phí'}
                    </button>
                </form>

                <p className="mt-6 text-center text-sm text-slate-600">
                    Đã có tài khoản? <Link to="/login" className="text-brand-600 font-bold hover:underline">Đăng nhập</Link>
                </p>
            </div>
        </div>
    );
};