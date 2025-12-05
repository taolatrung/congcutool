import React, { useState } from 'react';
import { Lock, PlayCircle } from 'lucide-react';
import { ToolDef } from '../types';
import { AdModal } from './AdModal';
import { useLanguage } from '../context/LanguageContext';

interface Props {
    tool: ToolDef;
    children: React.ReactNode;
}

export const PremiumGuard: React.FC<Props> = ({ tool, children }) => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [showAd, setShowAd] = useState(false);
    const { t } = useLanguage();

    // --- LOGIC: ALREADY UNLOCKED (Ad watched) ---
    if (isUnlocked) return <>{children}</>;

    // --- LOGIC: FREE TOOLS ---
    if (!tool.isPremium) return <>{children}</>;

    const handleAdComplete = () => {
        setShowAd(false);
        setIsUnlocked(true);
    };

    // Helper to get tool name (translated if available)
    const toolName = t(`tool.${tool.translationKey}.name`) || tool.name;

    return (
        <div className="max-w-4xl mx-auto py-12 px-4">
            <AdModal 
                isOpen={showAd} 
                onClose={() => setShowAd(false)} 
                onComplete={handleAdComplete} 
            />

            <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden relative max-w-lg mx-auto">
                {/* Header */}
                <div className="bg-slate-900 text-white p-8 text-center">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 rounded-full mb-4 backdrop-blur-sm">
                        <Lock className="w-10 h-10 text-amber-400" />
                    </div>
                    <h2 className="text-2xl font-bold mb-2">{t('premium.title')}</h2>
                    <p className="text-slate-300">
                        {t('premium.sub')} <span className="text-white font-bold block mt-1 text-lg">{toolName}</span>
                    </p>
                </div>

                {/* Body Options */}
                <div className="p-8">
                    <div className="text-center space-y-6">
                            <p className="text-slate-600">
                            {t('premium.desc')}
                        </p>
                        
                        <button 
                            onClick={() => setShowAd(true)}
                            className="w-full py-4 bg-brand-600 hover:bg-brand-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-brand-200 transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
                        >
                            <PlayCircle className="w-6 h-6" />
                            {t('premium.btn_watch')}
                        </button>
                        
                        <p className="text-xs text-slate-400">
                            {t('premium.footer')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};