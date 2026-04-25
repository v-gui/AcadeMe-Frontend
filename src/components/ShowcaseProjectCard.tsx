import React from 'react';
import logoBlockchain from '../assets/logoBlockchain.svg';

interface ShowcaseProjectCardProps {
    id: string;
    title: string;
    description: string;
    tags: string[];
    date: string;
    imageUrl?: string;
    onView: (id: string) => void;
}

const ShowcaseProjectCard: React.FC<ShowcaseProjectCardProps> = ({
    id,
    title,
    description,
    tags,
    date,
    imageUrl,
    onView
}) => {
    return (
        <div 
            onClick={() => onView(id)} 
            className="flex flex-col bg-white rounded-[24px] shadow-lg hover:shadow-2xl transition-all cursor-pointer h-[420px] overflow-hidden group border border-gray-100"
        >
            
            <div className="h-48 w-full bg-gray-50 relative overflow-hidden shrink-0 flex items-center justify-center p-2">
                <img 
                    src={imageUrl || logoBlockchain} 
                    alt={title}

                    onError={(e) => { e.currentTarget.src = logoBlockchain; }} 
                    className="w-full h-full object-cover rounded-[16px] group-hover:scale-105 transition-transform duration-500" 
                />
            </div>

            
            <div className="p-6 flex flex-col flex-1 text-left">
                <h3 className="font-black text-[#003465] text-lg mb-2 line-clamp-1 truncate" title={title}>
                    {title}
                </h3>
                <p className="text-gray-500 text-xs line-clamp-3 mb-4 flex-1 italic leading-relaxed">
                    {description}
                </p>

                
                <div className="mt-auto flex flex-col gap-4">
                    
                    
                    <div className="flex gap-2 overflow-hidden flex-nowrap w-full">
                        {tags && tags.length > 0 ? (
                            tags.map((tag, i) => (
                                <span 
                                    key={i} 
                                    className="bg-blue-50 text-[#006ACB] text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap shrink-0"
                                >
                                    {tag}
                                </span>
                            ))
                        ) : (
                            <span className="bg-gray-50 text-gray-400 text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full whitespace-nowrap">
                                Sem tags
                            </span>
                        )}
                    </div>

                    
                    <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            {date}
                        </span>
                        
                        <span className="text-[10px] font-black text-[#006ACB] uppercase tracking-widest group-hover:translate-x-1 transition-transform flex items-center gap-1">
                            Acessar <span className="text-lg leading-none">›</span>
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ShowcaseProjectCard;