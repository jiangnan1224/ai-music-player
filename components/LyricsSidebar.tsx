import React, { useEffect, useState, useRef } from 'react';
import { Song } from '../types';
import { api } from '../services/api';
import { X, Loader2 } from 'lucide-react';

interface LyricsSidebarProps {
    currentSong: Song;
    currentTime: number;
    onClose: () => void;
}

interface LyricLine {
    time: number;
    text: string;
}

export const LyricsSidebar: React.FC<LyricsSidebarProps> = ({ currentSong, currentTime, onClose }) => {
    const [lyrics, setLyrics] = useState<LyricLine[]>([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const fetchLyrics = async () => {
            setLoading(true);
            const raw = await api.getLyrics(currentSong.platform || 'netease', String(currentSong.id));
            const parsed = parseLyrics(raw);
            setLyrics(parsed);
            setLoading(false);
        };

        fetchLyrics();
    }, [currentSong]);

    useEffect(() => {
        // Auto scroll logic
        const activeIndex = lyrics.findIndex((line, i) => {
            const nextLine = lyrics[i + 1];
            return line.time <= currentTime && (!nextLine || nextLine.time > currentTime);
        });

        if (activeIndex !== -1 && containerRef.current) {
            const activeEl = containerRef.current.children[activeIndex] as HTMLElement;
            if (activeEl) {
                activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }
    }, [currentTime, lyrics]);

    const parseLyrics = (lrc: string): LyricLine[] => {
        const lines = lrc.split('\n');
        const regex = /^\[(\d{2}):(\d{2}\.\d{2,3})\](.*)/;

        return lines.reduce((acc: LyricLine[], line) => {
            const match = line.match(regex);
            if (match) {
                const min = parseInt(match[1]);
                const sec = parseFloat(match[2]);
                const text = match[3].trim();
                if (text) {
                    acc.push({ time: min * 60 + sec, text });
                }
            }
            return acc;
        }, []);
    };

    return (
        <div className="w-80 md:w-96 bg-[#181818] border-l border-gray-800 flex flex-col h-full flex-shrink-0 transition-all duration-300">
            {/* Header */}
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
                <div>
                    <h3 className="font-bold text-white truncate max-w-[200px]">{currentSong.title}</h3>
                    <p className="text-xs text-gray-400 truncate max-w-[200px]">{currentSong.artist}</p>
                </div>
                <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                    <X size={16} className="text-white" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden relative">
                <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

                {loading ? (
                    <div className="h-full flex flex-col items-center justify-center">
                        <Loader2 size={32} className="animate-spin text-spotGreen mb-4" />
                        <p className="text-gray-400 text-sm">Loading lyrics...</p>
                    </div>
                ) : lyrics.length === 0 ? (
                    <div className="h-full flex items-center justify-center">
                        <p className="text-gray-500 font-bold">No lyrics available</p>
                    </div>
                ) : (
                    <div ref={containerRef} className="h-full overflow-y-auto hide-scrollbar px-6 py-10 space-y-6 text-center">
                        {lyrics.map((line, idx) => {
                            const isActive = line.time <= currentTime && (!lyrics[idx + 1] || lyrics[idx + 1].time > currentTime);
                            return (
                                <p
                                    key={idx}
                                    className={`transition-all duration-300 text-sm font-medium leading-relaxed
                      ${isActive ? 'text-white text-lg font-bold scale-105 my-4' : 'text-gray-500'}`}
                                >
                                    {line.text}
                                </p>
                            );
                        })}
                        <div className="h-32"></div> {/* Padding for bottom scroll */}
                    </div>
                )}
            </div>
        </div>
    );
};
