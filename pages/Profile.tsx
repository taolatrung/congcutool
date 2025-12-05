import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Transaction } from '../types';
import { apiGetTransactions } from '../services/mockBackend';
import { User, CreditCard, History, LogOut, Plus } from 'lucide-react';

export const Profile: React.FC = () => {
    const { user, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isAuthenticated) navigate('/login');
        if (user) {
            apiGetTransactions(user.id).then(txs => {
                setTransactions(txs);
                setLoading(false);
            });
        }
    }, [user, isAuthenticated, navigate]);

    if (!user) return null;

    return (
        <div className="container mx-auto px-4 py-8">
            <div className="grid lg:grid-cols-3 gap-8">
                {/* Sidebar / User Info */}
                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 text-center">
                        <div className="w-24 h-24 bg-brand-100 rounded-full mx-auto flex items-center justify-center mb-4 text-brand-600">
                            <User className="w-12 h-12" />
                        </div>
                        <h2 className="text-xl font-bold text-slate-900">{user.name}</h2>
                        <p className="text-slate-500 text-sm mb-6">{user.email}</p>
                        
                        <div className="bg-slate-50 rounded-xl p-4 mb-6">
                            <p className="text-xs text-slate-500 uppercase font-semibold mb-1">Số dư hiện tại</p>
                            <p className="text-3xl font-extrabold text-brand-600">{user.balance.toLocaleString()} đ</p>
                        </div>

                        <div className="grid gap-3">
                            <Link to="/topup" className="flex items-center justify-center gap-2 bg-brand-600 text-white py-3 rounded-xl font-bold hover:bg-brand-700 transition-colors">
                                <Plus className="w-4 h-4" /> Nạp tiền
                            </Link>
                            <button onClick={() => logout()} className="flex items-center justify-center gap-2 bg-white border border-red-200 text-red-600 py-3 rounded-xl font-bold hover:bg-red-50 transition-colors">
                                <LogOut className="w-4 h-4" /> Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>

                {/* Main Content / Transactions */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 h-full">
                        <div className="flex items-center gap-2 mb-6 pb-4 border-b border-slate-100">
                            <History className="w-5 h-5 text-slate-400" />
                            <h3 className="text-lg font-bold text-slate-800">Lịch sử giao dịch</h3>
                        </div>

                        {loading ? (
                            <div className="text-center py-12 text-slate-400">Đang tải dữ liệu...</div>
                        ) : transactions.length === 0 ? (
                            <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                <CreditCard className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                <p className="text-slate-500">Chưa có giao dịch nào.</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {transactions.map(tx => (
                                    <div key={tx.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'DEPOSIT' ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                                                {tx.type === 'DEPOSIT' ? <Plus className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900">{tx.description}</p>
                                                <p className="text-xs text-slate-500">{new Date(tx.createdAt).toLocaleString('vi-VN')}</p>
                                            </div>
                                        </div>
                                        <div className={`font-bold ${tx.type === 'DEPOSIT' ? 'text-green-600' : 'text-slate-700'}`}>
                                            {tx.type === 'DEPOSIT' ? '+' : ''}{tx.amount.toLocaleString()} đ
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};