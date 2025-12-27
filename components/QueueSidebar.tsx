import React, { useEffect, useRef } from 'react';
import { Song } from '../types';
import { X, Play, Music2, AudioLines, Heart } from 'lucide-react';

interface QueueSidebarProps {
    queue: Song[];
    currentSong: Song;
    onClose: () => void;
    onPlay: (song: Song) => void;
    library: Song[];
    toggleLibrary: (song: Song) => void;
}

export const QueueSidebar: React.FC<QueueSidebarProps> = ({ queue, currentSong, onClose, onPlay, library, toggleLibrary }) => {
    const activeRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Scroll to active song on mount
        if (activeRef.current) {
            activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, []);

    return (
        <div className="w-80 md:w-96 bg-[#181818] border-l border-gray-800 flex flex-col h-full flex-shrink-0 transition-all duration-300">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-white">Current Queue</h3>
                    <p className="text-xs text-gray-400">{queue.length} songs</p>
                </div>
                <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                    <X size={16} className="text-white" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
                <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

                {queue.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-gray-500">
                        <Music2 size={48} className="mb-4 opacity-50" />
                        <p className="font-bold">Queue is empty</p>
                    </div>
                ) : (
                    queue.map((song, idx) => {
                        const isCurrent = currentSong.id === song.id;
                        const isFavorite = !!library.find(s => s.id === song.id);
                        return (
                            <div
                                key={`${song.id}-${idx}`}
                                ref={isCurrent ? activeRef : null}
                                onClick={() => onPlay(song)}
                                className={`p-3 rounded-md flex items-center gap-3 cursor-pointer group transition-colors
                     ${isCurrent ? 'bg-white/10' : 'hover:bg-white/5'}`}
                            >
                                {isCurrent ? (
                                    <AudioLines size={16} className="text-spotGreen flex-shrink-0 animate-pulse" />
                                ) : (
                                    <span className="text-gray-500 w-4 text-center text-xs group-hover:hidden">{idx + 1}</span>
                                )}
                                {!isCurrent && (
                                    <Play size={16} className="text-white hidden group-hover:block flex-shrink-0" fill="white" />
                                )}

                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-medium truncate ${isCurrent ? 'text-spotGreen' : 'text-white'}`}>
                                        {song.title}
                                    </p>
                                    <p className="text-xs text-gray-400 truncate">
                                        {song.artist}
                                    </p>
                                </div>

                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleLibrary(song); }}
                                    className={`p-2 hover:scale-110 transition-transform ${isFavorite ? 'text-spotGreen opacity-100' : 'text-gray-400 opacity-0 group-hover:opacity-100'}`}
                                >
                                    <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};
