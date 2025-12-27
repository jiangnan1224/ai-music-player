import React, { useEffect, useState, useRef } from 'react';
import { Song } from '../types';
import { api } from '../services/api';
import { Loader2 } from 'lucide-react';

interface MobileLyricsProps {
    currentSong: Song;
    currentTime: number;
    isViewActive: boolean;
}

interface LyricLine {
    time: number;
    text: string;
}

export const MobileLyrics: React.FC<MobileLyricsProps> = ({ currentSong, currentTime, isViewActive }) => {
    const [lyrics, setLyrics] = useState<LyricLine[]>([]);
    const [loading, setLoading] = useState(true);
    const containerRef = useRef<HTMLDivElement>(null);
    const [userScrolling, setUserScrolling] = useState(false);
    const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

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
        // Auto scroll logic - ONLY if view is actually active AND user is not manually scrolling
        if (!isViewActive || userScrolling) return;

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
    }, [currentTime, lyrics, isViewActive, userScrolling]);

    // Detect user scroll and pause auto-scroll temporarily
    const handleScroll = () => {
        // User is scrolling, pause auto-scroll
        setUserScrolling(true);

        // Clear existing timeout
        if (scrollTimeoutRef.current) {
            clearTimeout(scrollTimeoutRef.current);
        }

        // Resume auto-scroll after 3 seconds of no scrolling
        scrollTimeoutRef.current = setTimeout(() => {
            setUserScrolling(false);
        }, 3000);
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (scrollTimeoutRef.current) {
                clearTimeout(scrollTimeoutRef.current);
            }
        };
    }, []);

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
        <div className="h-full w-full flex flex-col">
            <style>{`
          .hide-scrollbar::-webkit-scrollbar { display: none; }
          .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>

            <div className="flex-1 overflow-hidden relative">
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
                    <div
                        ref={containerRef}
                        className="h-full overflow-y-auto hide-scrollbar px-6 space-y-8 text-center pt-[40vh] pb-[40vh]"
                        onScroll={handleScroll}
                        onTouchStart={() => setUserScrolling(true)}
                    >
                        {lyrics.map((line, idx) => {
                            const isActive = line.time <= currentTime && (!lyrics[idx + 1] || lyrics[idx + 1].time > currentTime);
                            return (
                                <p
                                    key={idx}
                                    className={`transition-all duration-300 font-medium leading-relaxed
                      ${isActive ? 'text-white text-2xl font-bold scale-110 my-6' : 'text-gray-500 text-lg'}`}
                                >
                                    {line.text}
                                </p>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};
