
import React, { useEffect, useRef } from 'react';
import { Song } from '../types';
import { X, Play, BarChart3 } from 'lucide-react';

interface MobileQueueProps {
    isOpen: boolean;
    onClose: () => void;
    queue: Song[];
    currentSong: Song;
    onPlay: (song: Song) => void;
}

export const MobileQueue: React.FC<MobileQueueProps> = ({
    isOpen,
    onClose,
    queue,
    currentSong,
    onPlay
}) => {
    const activeRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to active song when opened
    useEffect(() => {
        if (isOpen && activeRef.current) {
            activeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[70] bg-black/80 backdrop-blur-md flex flex-col animate-in slide-in-from-bottom duration-300"
            onClick={onClose}
        >
            <div
                className="mt-auto h-[70vh] w-full bg-[#1e1e1e] rounded-t-3xl flex flex-col shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <div className="flex items-baseline gap-2">
                        <h2 className="text-xl font-bold text-white">Playing Queue</h2>
                        <span className="text-gray-400 text-sm">({queue.length})</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* List */}
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {queue.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500">
                            Queue is empty
                        </div>
                    ) : (
                        queue.map((song) => {
                            const isActive = song.id === currentSong.id;
                            return (
                                <div
                                    key={song.id}
                                    ref={isActive ? activeRef : null}
                                    onClick={() => onPlay(song)}
                                    className={`flex items-center gap-4 p-3 rounded-xl active:scale-[0.98] transition-all ${isActive ? 'bg-white/10' : 'hover:bg-white/5'
                                        }`}
                                >
                                    {/* Animation / Number */}
                                    <div className="w-8 flex justify-center text-spotGreen">
                                        {isActive ? (
                                            <BarChart3 size={18} className="animate-pulse" />
                                        ) : (
                                            <span className="text-gray-500 text-sm hidden group-hover:block">
                                                <Play size={16} />
                                            </span>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className={`font-medium truncate ${isActive ? 'text-spotGreen' : 'text-white'}`}>
                                            {song.title}
                                        </h3>
                                        <p className="text-sm text-gray-400 truncate">
                                            {song.artist}
                                        </p>
                                    </div>

                                    {/* Duration (Mock for now if not available) */}
                                    <span className="text-xs text-gray-500">3:00</span>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};
