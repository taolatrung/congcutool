import React from 'react';
import { ToolDef } from '../types';
import { ArrowRight, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ToolCardProps {
    tool: ToolDef;
}

export const ToolCard: React.FC<ToolCardProps> = ({ tool }) => {
    const Icon = tool.icon;

    return (
        <Link 
            to={tool.path}
            className="group relative flex flex-col p-6 bg-white rounded-2xl shadow-sm hover:shadow-xl border border-slate-100 transition-all duration-300 transform hover:-translate-y-1"
        >
            {tool.isPopular && (
                <div className="absolute top-4 right-4 text-amber-400">
                    <Star className="w-5 h-5 fill-current" />
                </div>
            )}
            
            <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center mb-4 group-hover:bg-brand-500 transition-colors">
                <Icon className="w-6 h-6 text-brand-600 group-hover:text-white transition-colors" />
            </div>
            
            <h3 className="text-lg font-bold text-slate-800 mb-2">{tool.name}</h3>
            <p className="text-sm text-slate-500 mb-4 line-clamp-2 flex-grow">
                {tool.description}
            </p>
            
            <div className="flex items-center text-brand-600 font-medium text-sm mt-auto">
                Dùng ngay
                <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
            </div>
        </Link>
    );
};