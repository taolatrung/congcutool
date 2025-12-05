import React, { useState } from 'react';
import { ToolDef, ToolCategory } from '../types';
import { ToolCard } from '../components/ToolCard';
import { Search, Zap, Clock, Filter, Grid } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface HomeProps {
    tools: ToolDef[];
}

export const Home: React.FC<HomeProps> = ({ tools }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [activeCategory, setActiveCategory] = useState<string>('ALL');
    const { t } = useLanguage();

    const categories = Object.values(ToolCategory);

    // Helper to get translated category name
    const getCatName = (cat: string) => t(`cat.${cat}`) || cat;
    
    // Helper to get translated tool info for searching
    const getToolName = (tool: ToolDef) => t(`tool.${tool.translationKey}.name`) || tool.name;
    const getToolDesc = (tool: ToolDef) => t(`tool.${tool.translationKey}.desc`) || tool.description;

    const filteredTools = tools.filter(t => {
        const name = getToolName(t).toLowerCase();
        const desc = getToolDesc(t).toLowerCase();
        const search = searchTerm.toLowerCase();
        
        const matchesSearch = name.includes(search) || desc.includes(search);
        const matchesCategory = activeCategory === 'ALL' || t.category === activeCategory;
        return matchesSearch && matchesCategory;
    });

    const popularTools = tools.filter(t => t.isPopular);

    return (
        <div className="space-y-12 pb-12">
            {/* Hero Section */}
            <section className="text-center space-y-6 pt-12 pb-6 px-4 bg-gradient-to-b from-white to-slate-50 border-b border-slate-200/60">
                <div className="inline-flex items-center px-3 py-1 rounded-full bg-brand-50 text-brand-700 text-xs font-medium mb-4 border border-brand-100">
                    <Zap className="w-3 h-3 mr-1" />
                    {t('home.hero.badge')}
                </div>
                <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 tracking-tight">
                    {t('home.hero.title')} <span className="block text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600 mt-2">{t('home.hero.title_highlight')}</span>
                </h1>
                <p className="text-lg text-slate-600 max-w-2xl mx-auto">
                    {t('home.hero.subtitle')}
                </p>

                {/* Search Bar */}
                <div className="max-w-xl mx-auto relative group mt-8">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-slate-400 group-focus-within:text-brand-500 transition-colors" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-11 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent shadow-lg shadow-slate-200/50 hover:shadow-xl transition-shadow"
                        placeholder={t('home.search.placeholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </section>

            {/* Category Filter */}
            <section className="container mx-auto px-4 overflow-x-auto pb-4 hide-scrollbar">
                <div className="flex gap-2 min-w-max md:justify-center">
                    <button
                        onClick={() => setActiveCategory('ALL')}
                        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                            activeCategory === 'ALL' 
                            ? 'bg-slate-900 text-white shadow-md' 
                            : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                        }`}
                    >
                        {t('home.cat.all')}
                    </button>
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${
                                activeCategory === cat 
                                ? 'bg-brand-600 text-white shadow-md' 
                                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                            }`}
                        >
                            {getCatName(cat)}
                        </button>
                    ))}
                </div>
            </section>

            {/* Main Tool Grid */}
            <section className="container mx-auto px-4 min-h-[400px]">
                <div className="flex items-center gap-2 mb-6">
                    {activeCategory === 'ALL' && !searchTerm ? (
                        <>
                            <Grid className="w-5 h-5 text-brand-600" />
                            <h2 className="text-xl font-bold text-slate-800">{t('home.section.popular')}</h2>
                        </>
                    ) : (
                        <>
                            <Filter className="w-5 h-5 text-brand-600" />
                            <h2 className="text-xl font-bold text-slate-800">
                                {searchTerm ? `${t('home.section.results')} "${searchTerm}"` : getCatName(activeCategory)}
                            </h2>
                        </>
                    )}
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {(searchTerm || activeCategory !== 'ALL' ? filteredTools : popularTools).map(tool => (
                        <ToolCard key={tool.id} tool={tool} />
                    ))}
                </div>
                
                {filteredTools.length === 0 && (
                     <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <p className="text-slate-500 font-medium">{t('home.no_results')}</p>
                        <button onClick={() => {setSearchTerm(''); setActiveCategory('ALL');}} className="mt-2 text-brand-600 hover:underline text-sm">{t('home.view_all')}</button>
                     </div>
                )}
            </section>

             {/* All Tools Grouped (Only show on 'ALL' tab and no search) */}
             {activeCategory === 'ALL' && !searchTerm && (
                <div className="space-y-16">
                    {categories.map(cat => {
                        const catTools = tools.filter(t => t.category === cat);
                        if (catTools.length === 0) return null;
                        
                        return (
                            <section key={cat} className="container mx-auto px-4">
                                <div className="flex items-center gap-2 mb-6 border-b border-slate-200 pb-2">
                                    <h2 className="text-lg font-bold text-slate-700">{getCatName(cat)}</h2>
                                    <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full">{catTools.length}</span>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                    {catTools.map(tool => (
                                        <ToolCard key={tool.id} tool={tool} />
                                    ))}
                                </div>
                            </section>
                        );
                    })}
                </div>
             )}
        </div>
    );
};