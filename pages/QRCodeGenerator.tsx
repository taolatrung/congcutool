import React, { useState, useEffect } from 'react';
import { QrCode, Link as LinkIcon, Type, Wifi, Download, RefreshCw, Palette, Settings } from 'lucide-react';
import QRCode from 'qrcode';

type QRType = 'LINK' | 'TEXT' | 'WIFI';

export const QRCodeGenerator: React.FC = () => {
    const [activeTab, setActiveTab] = useState<QRType>('LINK');
    
    // Inputs
    const [inputValue, setInputValue] = useState('https://easyconvert.hub');
    const [wifiData, setWifiData] = useState({ ssid: '', password: '', encryption: 'WPA' });
    
    // Styles
    const [fgColor, setFgColor] = useState('#000000');
    const [bgColor, setBgColor] = useState('#ffffff');
    const [margin, setMargin] = useState(2);
    
    // Output
    const [qrImage, setQrImage] = useState<string>('');
    const [error, setError] = useState<string>('');

    // Generate Logic
    const generateQR = async () => {
        try {
            setError('');
            let textToEncode = '';

            if (activeTab === 'LINK' || activeTab === 'TEXT') {
                textToEncode = inputValue;
            } else if (activeTab === 'WIFI') {
                // WiFi Format: WIFI:T:WPA;S:MyNetwork;P:mypass;;
                textToEncode = `WIFI:T:${wifiData.encryption};S:${wifiData.ssid};P:${wifiData.password};;`;
                if (wifiData.encryption === 'nopass') {
                    textToEncode = `WIFI:T:nopass;S:${wifiData.ssid};;`;
                }
            }

            if (!textToEncode.trim()) return;

            const url = await QRCode.toDataURL(textToEncode, {
                width: 1000, // High res for download
                margin: margin,
                color: {
                    dark: fgColor,
                    light: bgColor
                },
                errorCorrectionLevel: 'H'
            });
            setQrImage(url);
        } catch (err) {
            console.error(err);
            setError('Không thể tạo mã. Vui lòng kiểm tra lại nội dung.');
        }
    };

    // Auto generate when inputs change (debounce could be added for performance, but client-side is fast enough here)
    useEffect(() => {
        const timer = setTimeout(generateQR, 300);
        return () => clearTimeout(timer);
    }, [inputValue, wifiData, fgColor, bgColor, margin, activeTab]);

    const downloadQR = () => {
        if (!qrImage) return;
        const link = document.createElement('a');
        link.download = `qrcode-${Date.now()}.png`;
        link.href = qrImage;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                {/* Header */}
                <div className="p-8 border-b border-slate-100 bg-gradient-to-r from-blue-50 to-white">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2 flex items-center gap-2">
                        <QrCode className="w-6 h-6 text-brand-600" />
                        Tạo mã QR Online
                    </h1>
                    <p className="text-slate-500">Tạo mã QR miễn phí cho Website, Văn bản, Wifi với màu sắc tùy chỉnh.</p>
                </div>

                <div className="grid lg:grid-cols-12 min-h-[600px]">
                    {/* LEFT COLUMN: Configuration */}
                    <div className="lg:col-span-7 p-8 border-r border-slate-100 space-y-8">
                        
                        {/* Tabs */}
                        <div className="flex p-1 bg-slate-100 rounded-xl gap-1">
                            <TabButton 
                                active={activeTab === 'LINK'} 
                                onClick={() => { setActiveTab('LINK'); setInputValue('https://'); }} 
                                icon={<LinkIcon className="w-4 h-4"/>} 
                                label="Link / URL" 
                            />
                            <TabButton 
                                active={activeTab === 'TEXT'} 
                                onClick={() => { setActiveTab('TEXT'); setInputValue(''); }} 
                                icon={<Type className="w-4 h-4"/>} 
                                label="Văn bản" 
                            />
                            <TabButton 
                                active={activeTab === 'WIFI'} 
                                onClick={() => setActiveTab('WIFI')} 
                                icon={<Wifi className="w-4 h-4"/>} 
                                label="WiFi" 
                            />
                        </div>

                        {/* Input Fields */}
                        <div className="space-y-4">
                            {(activeTab === 'LINK' || activeTab === 'TEXT') && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-2">
                                        {activeTab === 'LINK' ? 'Dán đường dẫn Website' : 'Nhập nội dung văn bản'}
                                    </label>
                                    <textarea
                                        value={inputValue}
                                        onChange={(e) => setInputValue(e.target.value)}
                                        className="w-full p-4 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:outline-none min-h-[120px] resize-none"
                                        placeholder={activeTab === 'LINK' ? "https://example.com" : "Nhập nội dung của bạn..."}
                                    />
                                </div>
                            )}

                            {activeTab === 'WIFI' && (
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-2">Tên mạng (SSID)</label>
                                        <input
                                            type="text"
                                            value={wifiData.ssid}
                                            onChange={(e) => setWifiData({...wifiData, ssid: e.target.value})}
                                            className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                            placeholder="Tên Wifi nhà bạn"
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Mật khẩu</label>
                                            <input
                                                type="text"
                                                value={wifiData.password}
                                                onChange={(e) => setWifiData({...wifiData, password: e.target.value})}
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none"
                                                placeholder="Mật khẩu Wifi"
                                                disabled={wifiData.encryption === 'nopass'}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-slate-700 mb-2">Loại bảo mật</label>
                                            <select
                                                value={wifiData.encryption}
                                                onChange={(e) => setWifiData({...wifiData, encryption: e.target.value})}
                                                className="w-full p-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-brand-500 outline-none bg-white"
                                            >
                                                <option value="WPA">WPA/WPA2</option>
                                                <option value="WEP">WEP</option>
                                                <option value="nopass">Không mật khẩu</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Customization */}
                        <div className="pt-6 border-t border-slate-100">
                            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <Palette className="w-4 h-4 text-brand-500" /> Tùy chỉnh giao diện
                            </h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Màu mã QR</label>
                                    <div className="flex items-center gap-2 border border-slate-200 p-2 rounded-lg">
                                        <input 
                                            type="color" 
                                            value={fgColor} 
                                            onChange={(e) => setFgColor(e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-sm font-mono text-slate-600 uppercase">{fgColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Màu nền</label>
                                    <div className="flex items-center gap-2 border border-slate-200 p-2 rounded-lg">
                                        <input 
                                            type="color" 
                                            value={bgColor} 
                                            onChange={(e) => setBgColor(e.target.value)}
                                            className="w-8 h-8 rounded cursor-pointer border-0 p-0"
                                        />
                                        <span className="text-sm font-mono text-slate-600 uppercase">{bgColor}</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-slate-500 mb-1">Viền (Margin)</label>
                                    <input 
                                        type="range" min="0" max="5" step="1"
                                        value={margin} 
                                        onChange={(e) => setMargin(parseInt(e.target.value))}
                                        className="w-full h-10 accent-brand-600 cursor-pointer"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT COLUMN: Preview */}
                    <div className="lg:col-span-5 bg-slate-50 p-8 flex flex-col items-center justify-center relative">
                        <div className="sticky top-8 w-full flex flex-col items-center">
                            <h3 className="text-lg font-bold text-slate-800 mb-6">Xem trước</h3>
                            
                            <div className="bg-white p-4 rounded-2xl shadow-xl border-4 border-white mb-8 transition-all duration-300">
                                {qrImage ? (
                                    <img 
                                        src={qrImage} 
                                        alt="QR Code" 
                                        className="w-64 h-64 object-contain"
                                    />
                                ) : (
                                    <div className="w-64 h-64 bg-slate-100 flex items-center justify-center text-slate-400 rounded-lg">
                                        <RefreshCw className="w-8 h-8 animate-spin" />
                                    </div>
                                )}
                            </div>

                            {error && (
                                <p className="text-red-500 text-sm mb-4 bg-red-50 px-4 py-2 rounded-lg">{error}</p>
                            )}

                            <button 
                                onClick={downloadQR}
                                disabled={!qrImage || !!error}
                                className="w-full max-w-xs py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-brand-200 transition-all hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Download className="w-5 h-5" />
                                Tải xuống PNG
                            </button>
                            <p className="text-xs text-slate-400 mt-4 text-center">
                                Ảnh chất lượng cao (1000x1000px) • Miễn phí trọn đời
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Guide Info */}
            <div className="mt-12 max-w-3xl mx-auto space-y-8">
                <h2 className="text-2xl font-bold text-slate-900 text-center">Câu hỏi thường gặp</h2>
                <div className="grid md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-2">Mã QR này tồn tại bao lâu?</h4>
                        <p className="text-sm text-slate-600">Vĩnh viễn! Đây là mã QR tĩnh, dữ liệu được nhúng trực tiếp vào hình ảnh nên không bao giờ hết hạn.</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm">
                        <h4 className="font-bold text-slate-800 mb-2">Tôi có thể dùng cho mục đích thương mại?</h4>
                        <p className="text-sm text-slate-600">Có, bạn hoàn toàn có thể sử dụng miễn phí cho in ấn, bao bì sản phẩm hoặc website.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const TabButton = ({ active, onClick, icon, label }: any) => (
    <button
        onClick={onClick}
        className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-all ${
            active 
            ? 'bg-white text-brand-600 shadow-sm' 
            : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
        }`}
    >
        {icon}
        {label}
    </button>
);