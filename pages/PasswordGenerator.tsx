import React, { useState } from 'react';
import { Lock, RefreshCw, Copy, CheckCircle } from 'lucide-react';

export const PasswordGenerator: React.FC = () => {
    const [length, setLength] = useState(16);
    const [options, setOptions] = useState({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: true,
    });
    const [password, setPassword] = useState('');
    const [copied, setCopied] = useState(false);

    const generate = () => {
        const upper = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lower = 'abcdefghijklmnopqrstuvwxyz';
        const nums = '0123456789';
        const syms = '!@#$%^&*()_+~`|}{[]:;?><,./-=';

        let chars = '';
        if (options.uppercase) chars += upper;
        if (options.lowercase) chars += lower;
        if (options.numbers) chars += nums;
        if (options.symbols) chars += syms;

        if (chars === '') return;

        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        setPassword(result);
        setCopied(false);
    };

    // Generate on first load
    React.useEffect(() => {
        generate();
    }, []);

    const copyToClipboard = () => {
        navigator.clipboard.writeText(password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="max-w-2xl mx-auto">
             <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                <div className="p-8 border-b border-slate-100">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <Lock className="w-6 h-6 text-brand-500" />
                        Tạo mật khẩu mạnh
                    </h1>
                    <p className="text-slate-500">Tạo mật khẩu an toàn ngẫu nhiên để bảo vệ tài khoản của bạn.</p>
                </div>

                <div className="p-8 space-y-8">
                    {/* Display */}
                    <div className="relative">
                        <div className="w-full bg-slate-900 text-white text-2xl font-mono p-6 rounded-xl break-all text-center tracking-wider min-h-[5rem] flex items-center justify-center">
                            {password}
                        </div>
                        <button 
                            onClick={copyToClipboard}
                            className="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors text-white"
                            title="Sao chép"
                        >
                            {copied ? <CheckCircle className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5" />}
                        </button>
                    </div>

                    {/* Controls */}
                    <div className="space-y-6">
                        <div>
                            <label className="flex justify-between text-sm font-medium text-slate-700 mb-2">
                                Độ dài mật khẩu: <span className="text-brand-600 font-bold">{length}</span>
                            </label>
                            <input 
                                type="range" min="6" max="50" value={length} 
                                onChange={(e) => setLength(parseInt(e.target.value))}
                                className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-brand-600"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <Toggle label="Chữ hoa (A-Z)" checked={options.uppercase} onChange={() => setOptions({...options, uppercase: !options.uppercase})} />
                            <Toggle label="Chữ thường (a-z)" checked={options.lowercase} onChange={() => setOptions({...options, lowercase: !options.lowercase})} />
                            <Toggle label="Số (0-9)" checked={options.numbers} onChange={() => setOptions({...options, numbers: !options.numbers})} />
                            <Toggle label="Ký tự đặc biệt (!@#)" checked={options.symbols} onChange={() => setOptions({...options, symbols: !options.symbols})} />
                        </div>

                        <button 
                            onClick={generate}
                            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center shadow-lg hover:shadow-xl transition-all"
                        >
                            <RefreshCw className="w-5 h-5 mr-2" />
                            Tạo mật khẩu mới
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const Toggle = ({ label, checked, onChange }: { label: string, checked: boolean, onChange: () => void }) => (
    <label className="flex items-center space-x-3 cursor-pointer p-3 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
        <input type="checkbox" checked={checked} onChange={onChange} className="w-5 h-5 text-brand-600 rounded focus:ring-brand-500 border-gray-300" />
        <span className="text-slate-700 font-medium text-sm">{label}</span>
    </label>
);