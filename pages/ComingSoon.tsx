import React from 'react';
import { Construction, Bell, ArrowLeft } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export const ComingSoon: React.FC = () => {
    const location = useLocation();
    // Try to extract tool name from state or query, default to generic
    const toolName = location.state?.toolName || 'Công cụ này';

    return (
        <div className="max-w-2xl mx-auto text-center py-16 px-4">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-amber-50 rounded-2xl mb-8">
                <Construction className="w-10 h-10 text-amber-500" />
            </div>
            
            <h1 className="text-3xl font-bold text-slate-900 mb-4">
                {toolName} đang được xây dựng!
            </h1>
            <p className="text-slate-600 mb-8 text-lg">
                Đội ngũ kỹ thuật của chúng tôi đang làm việc chăm chỉ để hoàn thiện tính năng này.
                <br />Hãy quay lại sau vài ngày nữa nhé.
            </p>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-slate-100 max-w-md mx-auto mb-8 text-left">
                <h3 className="font-bold text-slate-800 mb-2 flex items-center gap-2">
                    <Bell className="w-4 h-4 text-brand-500" />
                    Nhận thông báo khi xong
                </h3>
                <div className="flex gap-2">
                    <input 
                        type="email" 
                        placeholder="Email của bạn..." 
                        className="flex-1 px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500"
                    />
                    <button className="px-4 py-2 bg-brand-600 text-white font-medium rounded-lg hover:bg-brand-700 transition-colors">
                        Gửi
                    </button>
                </div>
                <p className="text-xs text-slate-400 mt-2">Chúng tôi không spam.</p>
            </div>

            <Link to="/" className="text-brand-600 font-medium hover:text-brand-700 flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Quay về trang chủ
            </Link>
        </div>
    );
};