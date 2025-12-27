import React, { useState, useRef, useEffect } from 'react';
import { User } from '../types';
import { LogOut, User as UserIcon, Settings, ChevronDown, ExternalLink } from 'lucide-react';

interface UserDropdownProps {
    user: User;
    onLogout: () => void;
}

export const UserDropdown: React.FC<UserDropdownProps> = ({ user, onLogout }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`flex items-center gap-3 bg-black/40 hover:bg-white/10 rounded-full p-1 pl-3 pr-4 transition-all duration-200 border border-transparent ${isOpen ? 'bg-white/10 border-white/10' : ''}`}
            >
                <div className="h-8 w-8 bg-purple-600 rounded-full flex items-center justify-center font-bold text-white shadow-lg">
                    {user.username[0].toUpperCase()}
                </div>
                <span className="font-bold text-sm text-white hidden md:block">{user.username}</span>
                <ChevronDown size={16} className={`text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 md:w-64 bg-[#282828] rounded-xl shadow-2xl border border-white/5 overflow-hidden animate-fade-in z-50 p-2">
                    {/* Account Check */}
                    <div className="px-4 py-3 border-b border-white/10 mb-2">
                        <p className="text-white font-bold text-sm mb-1">Account</p>
                        <div className="flex justify-between items-center bg-white/5 rounded-lg p-2">
                            <span className="text-xs text-gray-300">Plan</span>
                            <span className="text-xs font-bold text-purple-400 border border-purple-500/30 bg-purple-500/10 px-2 py-0.5 rounded-full">Free</span>
                        </div>
                    </div>

                    {/* Menu Items */}
                    <div className="space-y-1">
                        <button className="w-full text-left px-4 py-2.5 rounded-md text-sm text-gray-200 hover:bg-white/10 hover:text-white flex items-center justify-between group transition-colors">
                            <div className="flex items-center gap-3">
                                <UserIcon size={16} className="text-gray-400 group-hover:text-white" />
                                Profile
                            </div>
                        </button>
                        <button className="w-full text-left px-4 py-2.5 rounded-md text-sm text-gray-200 hover:bg-white/10 hover:text-white flex items-center justify-between group transition-colors">
                            <div className="flex items-center gap-3">
                                <Settings size={16} className="text-gray-400 group-hover:text-white" />
                                Settings
                            </div>
                        </button>
                        <button className="w-full text-left px-4 py-2.5 rounded-md text-sm text-gray-200 hover:bg-white/10 hover:text-white flex items-center justify-between group transition-colors">
                            <div className="flex items-center gap-3">
                                <ExternalLink size={16} className="text-gray-400 group-hover:text-white" />
                                Upgrade to Premium
                            </div>
                            <ExternalLink size={12} className="opacity-0 group-hover:opacity-50" />
                        </button>
                    </div>

                    <div className="h-[1px] bg-white/10 my-2 mx-2"></div>

                    <button
                        onClick={onLogout}
                        className="w-full text-left px-4 py-2.5 rounded-md text-sm text-red-400 hover:bg-red-500/10 hover:text-red-300 flex items-center gap-3 transition-colors"
                    >
                        <LogOut size={16} />
                        Log out
                    </button>
                </div>
            )}
        </div>
    );
};
