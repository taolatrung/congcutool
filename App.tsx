import React from 'react';
import { HashRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { ImageConverter } from './pages/ImageConverter';
import { OCRTool } from './pages/OCRTool';
import { PDFTool } from './pages/PDFTool';
import { WordCounter } from './pages/WordCounter';
import { PasswordGenerator } from './pages/PasswordGenerator';
import { QRCodeGenerator } from './pages/QRCodeGenerator';
import { PercentageCalculator } from './pages/PercentageCalculator';
import { AIWriterTool } from './pages/AIWriterTool';
import { TextSummarizer } from './pages/TextSummarizer';
import { VideoConverter } from './pages/VideoConverter';
import { SpeechToText } from './pages/SpeechToText';
import { TextToSpeech } from './pages/TextToSpeech';
import { ComingSoon } from './pages/ComingSoon';
import { BackgroundRemover } from './pages/BackgroundRemover';
import { BookmarkPopup } from './components/BookmarkPopup';
import { PremiumGuard } from './components/PremiumGuard';
import { ToolDef, ToolCategory } from './types';
import { 
    Image, FileText, FileType, Scissors, Menu, X, Github, 
    Wand2, Video, Mic, Calculator, QrCode, Lock, 
    Type, FileSpreadsheet, FileArchive, Volume2
} from 'lucide-react';

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
        description: 'Xóa phông nền tự động trong 5 giây (Xem QC).',
        icon: Scissors,
        category: ToolCategory.IMAGE,
        path: '/bg-remove', 
        isPopular: true,
        isPremium: true
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

    // --- PDF TOOLS ---
    {
        id: 'pdf-word',
        name: 'PDF sang Word Pro',
        description: 'Chuyển đổi file PDF sang Word giữ nguyên định dạng (Xem QC).',
        icon: FileType,
        category: ToolCategory.PDF,
        path: '/pdf-tool',
        isPopular: true,
        isPremium: true
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
        isPremium: true
    },
    {
        id: 'ai-writer',
        name: 'AI Viết bài',
        description: 'Tự động viết blog, caption Facebook, email.',
        icon: Wand2,
        category: ToolCategory.AI,
        path: '/ai-writer',
        isNew: true, 
        isPremium: true
    },
    {
        id: 'ai-summarize',
        name: 'Tóm tắt văn bản',
        description: 'AI đọc và tóm tắt nội dung dài thành ngắn gọn.',
        icon: FileText,
        category: ToolCategory.AI,
        path: '/text-summarizer', 
        isNew: true,
        isPremium: true
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
        path: '/qr-generator', 
        isNew: true 
    },
    {
        id: 'calc-percent',
        name: 'Tính phần trăm',
        description: 'Công cụ tính % tăng giảm giá nhanh chóng.',
        icon: Calculator,
        category: ToolCategory.UTILITY,
        path: '/percentage-calculator', 
        isNew: true 
    },

    // --- VIDEO/AUDIO ---
    {
        id: 'video-convert',
        name: 'Chuyển đổi Video',
        description: 'Convert MP4 sang MP3, AVI, MOV.',
        icon: Video,
        category: ToolCategory.VIDEO,
        path: '/video-converter',
        isNew: true 
    },
    {
        id: 'speech-text',
        name: 'Giọng nói thành chữ',
        description: 'Chuyển file ghi âm thành văn bản (Speech to Text).',
        icon: Mic,
        category: ToolCategory.VIDEO,
        path: '/speech-to-text',
        isNew: true,
        isPremium: true
    },
    {
        id: 'text-speech',
        name: 'Văn bản thành giọng nói',
        description: 'AI đọc văn bản thành giọng nói tự nhiên (Text to Speech).',
        icon: Volume2,
        category: ToolCategory.VIDEO,
        path: '/text-to-speech',
        isNew: true,
        isPremium: true
    }
];

// --- COMPONENTS ---

const Header: React.FC = () => {
    const [isMenuOpen, setIsMenuOpen] = React.useState(false);
    
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
                <nav className="hidden md:flex items-center gap-8">
                    <Link to="/" className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors">Trang chủ</Link>
                    <Link to="/image-converter" className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors">Xử lý ảnh</Link>
                    <Link to="/ai-writer" className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors">Viết bài AI</Link>
                    <Link to="/video-converter" className="text-slate-600 hover:text-brand-600 font-medium text-sm transition-colors">Video Tools</Link>
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
                        <Link to="/" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium">Trang chủ</Link>
                        <Link to="/image-converter" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium">Xử lý ảnh</Link>
                        <Link to="/ai-writer" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium">AI Viết bài</Link>
                        <Link to="/video-converter" onClick={() => setIsMenuOpen(false)} className="text-slate-600 font-medium">Video Tools</Link>
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
            <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
                <Header />
                <main className="flex-grow">
                    <Routes>
                        <Route path="/" element={<Home tools={TOOLS} />} />
                        <Route path="/image-converter" element={<ImageConverter />} />
                        
                        {/* PROTECTED ROUTES - Ad Supported (No Login) */}
                        <Route path="/bg-remove" element={
                            <PremiumGuard tool={TOOLS.find(t => t.id === 'bg-remove')!}>
                                <BackgroundRemover />
                            </PremiumGuard>
                        } />

                        <Route path="/ocr" element={
                            <PremiumGuard tool={TOOLS.find(t => t.id === 'ocr')!}>
                                <OCRTool />
                            </PremiumGuard>
                        } />
                        
                            <Route path="/ai-writer" element={
                            <PremiumGuard tool={TOOLS.find(t => t.id === 'ai-writer')!}>
                                <AIWriterTool />
                            </PremiumGuard>
                        } />

                            <Route path="/text-summarizer" element={
                            <PremiumGuard tool={TOOLS.find(t => t.id === 'ai-summarize')!}>
                                <TextSummarizer />
                            </PremiumGuard>
                        } />

                            <Route path="/speech-to-text" element={
                            <PremiumGuard tool={TOOLS.find(t => t.id === 'speech-text')!}>
                                <SpeechToText />
                            </PremiumGuard>
                        } />

                        <Route path="/text-to-speech" element={
                            <PremiumGuard tool={TOOLS.find(t => t.id === 'text-speech')!}>
                                <TextToSpeech />
                            </PremiumGuard>
                        } />

                        <Route path="/video-converter" element={<VideoConverter />} />

                        <Route path="/pdf-tool" element={
                            <PremiumGuard tool={TOOLS.find(t => t.id === 'pdf-word')!}>
                                <PDFTool />
                            </PremiumGuard>
                        } />
                        
                        <Route path="/word-counter" element={<WordCounter />} />
                        <Route path="/password-generator" element={<PasswordGenerator />} />
                        <Route path="/qr-generator" element={<QRCodeGenerator />} />
                        <Route path="/percentage-calculator" element={<PercentageCalculator />} />
                        <Route path="/coming-soon" element={<ComingSoon />} />
                    </Routes>
                </main>
                <Footer />
                <BookmarkPopup />
            </div>
        </HashRouter>
    );
}