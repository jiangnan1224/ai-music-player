import React, { useState, useEffect } from 'react';
import { Music, Plus, X, Check } from 'lucide-react';
import { Playlist, Song } from '../types';

interface AddToPlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    playlists: Playlist[];
    song: Song | null;
    onAddToPlaylist: (playlistId: string, song: Song) => void;
    onCreateNew: () => void;
}

export const AddToPlaylistModal: React.FC<AddToPlaylistModalProps> = ({
    isOpen,
    onClose,
    playlists,
    song,
    onAddToPlaylist,
    onCreateNew
}) => {
    const [selectedPlaylistIds, setSelectedPlaylistIds] = useState<Set<string>>(new Set());

    useEffect(() => {
        if (isOpen) {
            setSelectedPlaylistIds(new Set());
        }
    }, [isOpen]);

    if (!isOpen || !song) return null;

    const toggleSelection = (playlistId: string) => {
        const newSelected = new Set(selectedPlaylistIds);
        if (newSelected.has(playlistId)) {
            newSelected.delete(playlistId);
        } else {
            newSelected.add(playlistId);
        }
        setSelectedPlaylistIds(newSelected);
    };

    const handleConfirm = () => {
        selectedPlaylistIds.forEach(playlistId => {
            onAddToPlaylist(playlistId, song);
        });
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
                    <div>
                        <h2 className="text-xl font-bold text-white leading-tight">Add to playlist</h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Song Preview (Compact) */}
                <div className="px-6 py-4 bg-[#202020] flex items-center gap-3 border-b border-white/5">
                    <img src={song.coverUrl} alt={song.title} className="w-10 h-10 rounded shadow object-cover" />
                    <div className="min-w-0 flex-1">
                        <div className="text-white font-medium truncate text-sm">{song.title}</div>
                        <div className="text-gray-400 truncate text-xs">{song.artist}</div>
                    </div>
                </div>

                {/* Playlist List */}
                <div className="max-h-[320px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
                    {/* Create New Option */}
                    <button
                        onClick={() => {
                            onCreateNew();
                            onClose();
                        }}
                        className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-white/5 transition-colors group mb-1"
                    >
                        <div className="w-12 h-12 bg-gradient-to-br from-spotGreen/20 to-spotGreen/10 rounded-md flex items-center justify-center border border-spotGreen/20 group-hover:border-spotGreen/50 transition-colors">
                            <Plus size={24} className="text-spotGreen" />
                        </div>
                        <div className="text-left">
                            <div className="text-white font-medium">New Playlist</div>
                        </div>
                    </button>

                    <div className="h-px bg-white/5 my-1 mx-3" />

                    {/* Existing Playlists */}
                    {playlists.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 text-sm">
                            No playlists found
                        </div>
                    ) : (
                        playlists.map((playlist) => {
                            const alreadyExists = playlist.songs.some(s => s.id === song.id);
                            const isSelected = selectedPlaylistIds.has(playlist.id);

                            return (
                                <button
                                    key={playlist.id}
                                    onClick={() => !alreadyExists && toggleSelection(playlist.id)}
                                    disabled={alreadyExists}
                                    className={`w-full flex items-center gap-4 p-3 rounded-lg transition-all text-left group
                                        ${alreadyExists
                                            ? 'cursor-default opacity-60'
                                            : isSelected
                                                ? 'bg-white/10'
                                                : 'hover:bg-white/5 cursor-pointer'
                                        }`}
                                >
                                    <div className={`w-12 h-12 rounded-md flex items-center justify-center shadow-lg overflow-hidden flex-shrink-0 relative
                                        ${playlist.coverUrl ? '' : 'bg-gradient-to-br from-gray-700 to-gray-800'}`}
                                    >
                                        {playlist.coverUrl ? (
                                            <img src={playlist.coverUrl} className="w-full h-full object-cover" alt="" />
                                        ) : (
                                            <Music size={20} className="text-gray-400" />
                                        )}
                                        {/* Selection Checkmark Overlay */}
                                        {isSelected && !alreadyExists && (
                                            <div className="absolute inset-0 bg-spotGreen/80 flex items-center justify-center animate-fade-in">
                                                <Check size={20} className="text-black font-bold" />
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <div className={`font-medium truncate ${alreadyExists ? 'text-gray-400' : isSelected ? 'text-spotGreen' : 'text-white'}`}>
                                            {playlist.name}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            {playlist.songs.length} songs
                                        </div>
                                    </div>

                                    {alreadyExists ? (
                                        <div className="px-3 py-1 rounded-full border border-spotGreen/30 text-spotGreen text-xs font-medium flex items-center gap-1">
                                            Added
                                        </div>
                                    ) : isSelected && (
                                        <div className="w-5 h-5 rounded-full bg-spotGreen flex items-center justify-center">
                                            <Check size={12} className="text-black" />
                                        </div>
                                    )}
                                </button>
                            );
                        })
                    )}
                </div>

                <div className="p-4 border-t border-white/5 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 rounded-full font-bold text-sm text-white hover:bg-white/10 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        disabled={selectedPlaylistIds.size === 0}
                        className="px-6 py-2 rounded-full font-bold text-sm text-black bg-spotGreen hover:bg-spotGreen/90 disabled:bg-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
