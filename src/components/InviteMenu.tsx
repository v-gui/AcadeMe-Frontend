import React from 'react';
import Avatar from './Avatar';

interface InviteMenuItem {
    id: string;
    title: string;
    subtitle: string;
    avatarName: string;
    avatarImage?: string;
}

interface InviteMenuProps {
    menuRef: React.RefObject<HTMLDivElement>;
    title: string;
    emptyMessage: string;
    isOpen: boolean;
    count: number;
    items: InviteMenuItem[];
    onToggle: () => void;
    onAccept: (id: string) => void;
    onDecline: (id: string) => void;
}

/**
 * Shared notification dropdown for project-related invites.
 * Keeping this in one place avoids visual drift between student and professor profiles.
 */
const InviteMenu: React.FC<InviteMenuProps> = ({
    menuRef,
    title,
    emptyMessage,
    isOpen,
    count,
    items,
    onToggle,
    onAccept,
    onDecline
}) => {
    return (
        <div className="relative" ref={menuRef}>
            <button
                onClick={onToggle}
                className={`relative p-3 rounded-full transition-all flex items-center justify-center ${
                    isOpen
                        ? 'bg-blue-100 text-blue-600 shadow-inner'
                        : 'bg-white text-gray-400 hover:bg-gray-100 shadow-sm border border-gray-100'
                }`}
                aria-label={title}
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                </svg>
                {count > 0 && (
                    <span className="absolute top-0 right-0 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white animate-bounce">
                        {count}
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute top-full right-0 mt-3 w-80 bg-white rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-gray-100 overflow-hidden z-[1001] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-4 border-b border-gray-50 bg-gray-50/50 text-left">
                        <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</h3>
                    </div>
                    <div className="max-h-72 overflow-y-auto text-left">
                        {items.length > 0 ? (
                            items.map((item) => (
                                <div key={item.id} className="p-4 border-b border-gray-50 last:border-none flex flex-col gap-3">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={item.avatarName} image={item.avatarImage} size="sm" />
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-xs font-bold text-[#003465] truncate">{item.title}</span>
                                            <span className="text-[10px] text-gray-400 font-medium truncate">{item.subtitle}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => onAccept(item.id)}
                                            className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-blue-700 transition"
                                        >
                                            Aceitar
                                        </button>
                                        <button
                                            onClick={() => onDecline(item.id)}
                                            className="px-3 bg-red-100 text-red-500 py-1.5 rounded-lg text-[10px] font-bold uppercase hover:bg-red-200 transition"
                                            aria-label={`Recusar convite para ${item.title}`}
                                        >
                                            X
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="p-8 text-center text-gray-400 text-xs italic font-medium">{emptyMessage}</div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default InviteMenu;
