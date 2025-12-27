import React, { useState } from 'react';
import { X, Music } from 'lucide-react';

interface CreatePlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (name: string, description?: string) => void;
}

export const CreatePlaylistModal: React.FC<CreatePlaylistModalProps> = ({ isOpen, onClose, onCreate }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onCreate(name.trim(), description.trim() || undefined);
        setName('');
        setDescription('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={onClose}>
            <div
                className="bg-[#282828] rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#282828]">
                    <h2 className="text-xl font-bold text-white leading-tight">Create playlist</h2>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    {/* Cover Art Placeholder */}
                    <div className="flex justify-center mb-6">
                        <div className="w-32 h-32 bg-[#181818] rounded-md shadow-inner flex flex-col items-center justify-center group border-2 border-dashed border-white/10 relative overflow-hidden">
                            <Music size={40} className="text-gray-600 mb-2" />
                            <span className="text-xs text-gray-500 font-medium">Auto-generated</span>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-[#3e3e3e] border border-transparent rounded-md px-4 py-3 text-white placeholder-gray-400 outline-none focus:bg-[#333] focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all font-bold text-lg"
                                placeholder="Playlist name"
                                autoFocus
                                maxLength={50}
                            />
                        </div>

                        <div>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full bg-[#3e3e3e] border border-transparent rounded-md px-4 py-3 text-white placeholder-gray-400 outline-none focus:bg-[#333] focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all resize-none text-sm"
                                placeholder="Description (optional)"
                                rows={3}
                                maxLength={200}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-6">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 rounded-full font-bold text-sm text-white hover:bg-white/10 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!name.trim()}
                            className="px-8 py-2 rounded-full font-bold text-sm text-black bg-white hover:scale-105 active:scale-95 disabled:bg-gray-600 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none transition-all"
                        >
                            Create
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
