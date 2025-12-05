import React from 'react';
import { HashRouter, Routes, Route, Link, useNavigate } from 'react-router-dom';
import { Home } from './pages/Home';
import { ImageConverter } from './pages/ImageConverter';
import { OCRTool } from './pages/OCRTool';
import { PDFTool } from './pages/PDFTool';
import { WordCounter } from './pages/WordCounter';
import { PasswordGenerator } from './pages/PasswordGenerator';
import { ComingSoon } from './pages/ComingSoon';
import { BackgroundRemover } from './pages/BackgroundRemover';
import { Login, Register } from './pages/AuthPages';
import { Profile } from './pages/Profile';
import { TopUp } from './pages/TopUp';
import { VipUpgrade } from './pages/VipUpgrade';
import { BookmarkPopup } from './components/BookmarkPopup';
import { PremiumGuard } from './components/PremiumGuard';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToolDef, ToolCategory } from './types';
import { 
    Image, FileText, FileType, Scissors, Menu, X, Github, 
    Wand2, Video, Mic, Calculator, QrCode, Lock, 
    Type, FileSpreadsheet, FileArchive, Share2, User as UserIcon, Plus, Crown
} from 'lucide-react';
import { isUserVip } from './services/mockBackend';

// --- DATA DEFINITION ---
const TOOLS: ToolDef[] = [
    // --- IMAGE TOOLS ---
    {
        id: 'img-convert',
        name: 'Chuyển đổi ảnh',
        description: 'Đổi đuôi ảnh sang JPG, PNG, WebP và nén giảm dung lượng.',
        icon: Image,
        category: ToolCategory.IMAGE,
        path: '/image-converter',
        isPopular: true
    },
    {
        id: 'bg-remove',
        name: 'Tách nền ảnh AI',
        description: 'Xóa phông nền tự động trong 5 giây (Premium).',
        icon: Scissors,
        category: ToolCategory.IMAGE,
        path: '/bg-remove', // Updated path
        isPopular: true,
        isPremium: true, 
        price: 2000 
    },
    {
        id: 'img-compress',
        name: 'Nén ảnh',
        description: 'Giảm dung lượng ảnh mà không giảm chất lượng.',
        icon: FileArchive,
        category: ToolCategory.IMAGE,
        path: '/image-converter', 
    },
    {
        id: 'watermark-remover',
        name: 'Xóa Watermark',
        description: 'Dùng AI xóa logo/chữ đóng dấu trên ảnh.',
        icon: Wand2,
        category: ToolCategory.IMAGE,
        path: '/coming-soon',
        comingSoon: true
    },

    // --- PDF TOOLS (Updated Premium Tool) ---
    {
        id: 'pdf-word',
        name: 'PDF sang Word Pro',
        description: 'Chuyển đổi file PDF sang Word giữ nguyên định dạng (Premium).',
        icon: FileType,
        category: ToolCategory.PDF,
        path: '/pdf-tool',
        isPopular: true,
        isPremium: true,
        price: 5000 
    },
    {
        id: 'pdf-excel',
        name: 'PDF sang Excel',
        description: 'Trích xuất bảng tính từ PDF sang Excel.',
        icon: FileSpreadsheet,
        category: ToolCategory.PDF,
        path: '/coming-soon',
        comingSoon: true
    },
    {
        id: 'pdf-merge',
        name: 'Ghép file PDF',
        description: 'Gộp nhiều file PDF thành một file duy nhất.',
        icon: FileType,
        category: ToolCategory.PDF,
        path: '/coming-soon',
        comingSoon: true
    },
    
    // --- AI TOOLS ---
    {
        id: 'ocr',
        name: 'Scan ảnh ra chữ',
        description: 'Trích xuất văn bản từ hình ảnh cực nhanh bằng Gemini AI.',
        icon: FileText,
        category: ToolCategory.AI,
        path: '/ocr',
        isPopular: true,
        isPremium: true, // Example: Pay 1000 or Watch Ad
        price: 1000 
    },
    {
        id: 'ai-writer',
        name: 'AI Viết bài',
        description: 'Tự động viết blog, caption Facebook, email.',
        icon: Wand2,
        category: ToolCategory.AI,
        path: '/coming-soon',
        comingSoon: true
    },
    {
        id: 'ai-summarize',
        name: 'Tóm tắt văn bản',
        description: 'AI đọc và tóm tắt nội dung dài thành ngắn gọn.',
        icon: FileText,
        category: ToolCategory.AI,
        path: '/coming-soon',
        comingSoon: true
    },

    // --- UTILITY ---
    {
        id: 'word-counter',
        name: 'Bộ đếm từ',
        description: 'Đếm số từ, ký tự, đoạn văn và thời gian đọc.',
        icon: Type,
        category: ToolCategory.UTILITY,
        path: '/word-counter',
        isNew: true
    },
    {
        id: 'password-gen',
        name: 'Tạo mật khẩu',
        description: 'Tạo chuỗi mật khẩu mạnh ngẫu nhiên bảo mật cao.',
        icon: Lock,
        category: ToolCategory.UTILITY,
        path: '/password-generator',
        isNew: true
    },
    {
        id: 'qr-gen',
        name: 'Tạo mã QR',
        description: 'Tạo mã QR cho link, wifi, văn bản miễn phí.',
        icon: QrCode,
        category: ToolCategory.UTILITY,
        path: '/coming-soon',
        comingSoon: true
    },
    {
        id: 'calc-percent',
        name: 'Tính phần trăm',
        description: 'Công cụ tính % tăng giảm giá nhanh chóng.',
        icon: Calculator,
        category: ToolCategory.UTILITY,
        path: '/coming-soon',
        comingSoon: true
    },

    // --- VIDEO/AUDIO ---
    {
        id: 'video-convert',
        name: 'Chuyển đổi Video',
        description: 'Convert MP4 sang MP3, AVI, MOV.',
        icon: Video,
        category: ToolCategory.VIDEO,
        path: '/coming-soon',
        comingSoon: true
    },
    {
        id: 'speech-text',
        name: 'Giọng nói thành chữ',
        description: 'Chuyển file ghi âm thành văn bản (Speech to Text).',
        icon: Mic,
        category: ToolCategory.VIDEO,
        path: '/coming-soon',
        comingSoon: true
    }
];

// --- COMPONENTS ---

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    const { user, isAuthenticated } = useAuth();
    const isVip = isUserVip(user);
    
    return (
        <header className="bg-white/80 backdrop-blur-md sticky top-0 z-40 border-b border-slate-200">
            <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white font-bold text-xl group-hover:rotate-12 transition-transform">
                        E
                    </div>
                    <span className="font-bold text-xl text-slate-800 tracking-tight">EasyConvert Hub</span>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden md:flex items-center gap-6">
                    <Link to="/" className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors">Trang chủ</Link>
                    <Link to="/image-converter" className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors">Xử lý ảnh</Link>
                    <Link to="/ocr" className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors">AI Tools</Link>
                    
                    {/* User Action Area */}
                    <div className="pl-6 border-l border-slate-200 flex items-center gap-4">
                        {isAuthenticated && user ? (
                            <div className="flex items-center gap-4">
                                {!isVip && (
                                    <Link to="/vip-upgrade" className="text-xs font-bold text-white bg-gradient-to-r from-yellow-500 to-orange-500 px-3 py-1.5 rounded-full hover:shadow-lg transition-all animate-pulse">
                                        Nâng cấp VIP
                                    </Link>
                                )}
                                {isVip && (
                                    <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                                        <Crown className="w-3 h-3" /> VIP
                                    </span>
                                )}
                                <Link to="/topup" className="text-sm font-semibold text-brand-600 bg-brand-50 px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors flex items-center gap-1">
                                    <Plus className="w-3 h-3" />
                                    {user.balance.toLocaleString()} đ
                                </Link>
                                <Link to="/profile" className="w-8 h-8 bg-slate-800 text-white rounded-full flex items-center justify-center hover:ring-2 hover:ring-brand-500 transition-all">
                                    <span className="font-bold text-xs">{user.name.charAt(0)}</span>
                                </Link>
                            </div>
                        ) : (
                            <div className="flex items-center gap-2">
                                <Link to="/login" className="text-slate-600 hover:text-brand-600 font-medium text-sm px-3 py-2">Đăng nhập</Link>
                                <Link to="/register" className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors">
                                    Đăng ký
                                </Link>
                            </div>
                        )}
                    </div>
                </nav>

                {/* Mobile Menu Btn */}
                <button className="md:hidden p-2 text-slate-600" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                    {isMenuOpen ? <X /> : <Menu />}
                </button>
            </div>

            {/* Mobile Nav */}
            {isMenuOpen && (
                <div className="md:hidden absolute top-16 left-0 w-full bg-white border-b border-slate-200 p-4 shadow-xl">
                    <nav className="flex flex-col gap-4">
                        {isAuthenticated && user && (
                             <div className="flex items-center justify-between bg-slate-50 p-3 rounded-lg">
                                <span className="font-bold text-slate-700">{user.name}</span>
                                <span className="font-bold text-brand-600">{user.balance.toLocaleString()} đ</span>
                             </div>
                        )}
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium">Trang chủ</Link>
                        <Link to="/vip-upgrade" onClick={() => setIsMenuOpen(false)} className="text-yellow-600 font-bold bg-yellow-50 p-2 rounded-lg text-center">Nâng cấp VIP</Link>
                        <Link to="/bg-remove" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium">Tách nền AI</Link>
                        <Link to="/image-converter" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium">Xử lý ảnh</Link>
                        <Link to="/ocr" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium">AI Tools</Link>
                        
                        <div className="h-px bg-slate-100 my-2"></div>
                        
                        {isAuthenticated ? (
                            <>
                                <Link to="/topup" onClick={() => setIsMenuOpen(false)} className="text-brand-600 font-bold">Nạp tiền</Link>
                                <Link to="/profile" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium">Hồ sơ cá nhân</Link>
                            </>
                        ) : (
                            <>
                                <Link to="/login" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium">Đăng nhập</Link>
                                <Link to="/register" onClick={() => setIsMenuOpen(false)} className="text-brand-600 font-bold">Đăng ký ngay</Link>
                            </>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
};

const Footer: React.FC = () => (
    <footer className="bg-slate-50 border-t border-slate-200 py-12 mt-12">
        <div className="container mx-auto px-4 text-center">
            <h3 className="font-bold text-lg text-slate-900 mb-4">EasyConvert Hub</h3>
            <p className="text-slate-500 text-sm max-w-md mx-auto mb-8">
                Công cụ chuyển đổi file miễn phí tốt nhất. Bảo mật, nhanh chóng và không cần cài đặt.
            </p>
            <div className="flex justify-center gap-6 mb-8">
                <a href="#" className="text-slate-400 hover:text-brand-600 transition-colors"><Github className="w-5 h-5"/></a>
            </div>
            <p className="text-slate-400 text-xs">© 2024 EasyConvert Hub. All rights reserved.</p>
        </div>
    </footer>
);

export default function App() {
    return (
        <HashRouter>
            <AuthProvider>
                <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
                    <Header />
                    <main className="flex-grow">
                        <Routes>
                            <Route path="/" element={<Home tools={TOOLS} />} />
                            <Route path="/image-converter" element={<ImageConverter />} />
                            
                            {/* PROTECTED ROUTE: BG REMOVE (Premium) */}
                            <Route path="/bg-remove" element={
                                <PremiumGuard tool={TOOLS.find(t => t.id === 'bg-remove')!}>
                                    <BackgroundRemover />
                                </PremiumGuard>
                            } />

                            {/* PROTECTED ROUTE: OCR (Low Cost / Ad) */}
                            <Route path="/ocr" element={
                                <PremiumGuard tool={TOOLS.find(t => t.id === 'ocr')!}>
                                    <OCRTool />
                                </PremiumGuard>
                            } />
                            
                            {/* PROTECTED ROUTE: PDF (Higher Cost / Ad) */}
                            <Route path="/pdf-tool" element={
                                <PremiumGuard tool={TOOLS.find(t => t.id === 'pdf-word')!}>
                                    <PDFTool />
                                </PremiumGuard>
                            } />
                            
                            <Route path="/word-counter" element={<WordCounter />} />
                            <Route path="/password-generator" element={<PasswordGenerator />} />
                            <Route path="/coming-soon" element={<ComingSoon />} />
                            
                            {/* AUTH ROUTES */}
                            <Route path="/login" element={<Login />} />
                            <Route path="/register" element={<Register />} />
                            <Route path="/profile" element={<Profile />} />
                            <Route path="/topup" element={<TopUp />} />
                            <Route path="/vip-upgrade" element={<VipUpgrade />} />
                        </Routes>
                    </main>
                    <Footer />
                    <BookmarkPopup />
                </div>
            </AuthProvider>
        </HashRouter>
    );
}