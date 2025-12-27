import React, { useEffect, useState, useRef } from 'react';
import { Song } from '../types';
import { api } from '../services/api';
import { X, Loader2 } from 'lucide-react';

interface LyricsOverlayProps {
    currentSong: Song;
    currentTime: number; // Current playback time in seconds
    onClose: () => void;
}

interface LyricLine {
    time: number;
    text: string;
}

export const LyricsOverlay: React.FC<LyricsOverlayProps> = ({ currentSong, currentTime, onClose }) => {
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
        // Auto scroll to current line
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
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[60] flex flex-col items-center animate-fade-in">
            {/* Header */}
            <div className="w-full flex justify-end p-6">
                <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors">
                    <X size={24} className="text-white" />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 w-full max-w-4xl flex items-center justify-center p-8 overflow-hidden">
                {loading ? (
                    <div className="text-center">
                        <Loader2 size={48} className="animate-spin text-spotGreen mx-auto mb-4" />
                        <p className="text-gray-400">Loading lyrics...</p>
                    </div>
                ) : lyrics.length === 0 ? (
                    <div className="text-center">
                        <p className="text-gray-400 text-xl font-bold">No lyrics available</p>
                    </div>
                ) : (
                    <div ref={containerRef} className="text-center space-y-8 w-full h-full overflow-y-auto hide-scrollbar pb-40 relative">
                        {lyrics.map((line, idx) => {
                            const isActive = line.time <= currentTime && (!lyrics[idx + 1] || lyrics[idx + 1].time > currentTime);
                            return (
                                <p
                                    key={idx}
                                    className={`transition-all duration-500 text-2xl md:text-4xl font-bold leading-relaxed
                      ${isActive ? 'text-white scale-105' : 'text-gray-600 blur-[1px]'}`}
                                >
                                    {line.text}
                                </p>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Current Song Info Footer (Static) */}
            <div className="w-full p-8 text-center bg-gradient-to-t from-black to-transparent">
                <h2 className="text-2xl font-bold text-white mb-2">{currentSong.title}</h2>
                <p className="text-gray-400">{currentSong.artist}</p>
            </div>
        </div>
    );
};
