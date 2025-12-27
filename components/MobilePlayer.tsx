import React, { useState, useEffect } from 'react';
import { Song } from '../types';
import { Play, Pause, SkipBack, SkipForward, Heart, ChevronDown, Repeat, Repeat1, Shuffle, ListMusic } from 'lucide-react';
import { useSwipe } from '../utils/useSwipe';
import { MobileLyrics } from './MobileLyrics';
import { MobileQueue } from './MobileQueue';

interface MobilePlayerProps {
    currentSong: Song;
    isPlaying: boolean;
    onPlayPause: () => void;
    onNext: () => void;
    onPrev: () => void;
    isOpen: boolean;
    onClose: () => void;
    progress: number;
    duration: number;
    onSeek: (e: React.ChangeEvent<HTMLInputElement>) => void;
    isFavorite: boolean;
    toggleFavorite: () => void;
    playbackMode: 'loop' | 'shuffle' | 'repeat-one';
    togglePlaybackMode: () => void;
}

export const MobilePlayer: React.FC<MobilePlayerProps> = ({
    currentSong,
    isPlaying,
    onPlayPause,
    onNext,
    onPrev,
    isOpen,
    onClose,
    progress,
    duration,
    onSeek,
    isFavorite,
    toggleFavorite,
    queue,
    onPlay,
    playbackMode,
    togglePlaybackMode
}) => {
    const [view, setView] = useState<'player' | 'lyrics'>('player');
    const [showQueue, setShowQueue] = useState(false);

    const swipeHandlers = useSwipe({
        onSwipeDown: () => {
            // Only allow swipe down to close on player view, not on lyrics view
            // This prevents conflict with scrolling lyrics
            if (view === 'player') {
                onClose();
            }
        },
        onSwipeLeft: () => setView('lyrics'),
        onSwipeRight: () => {
            if (view === 'lyrics') setView('player');
        }
    });

    // Reset view whenever the player opens (ensures fresh state)
    useEffect(() => {
        if (isOpen) {
            setView('player');
        }
    }, [isOpen]);

    const formatTime = (time: number) => {
        if (isNaN(time)) return "0:00";
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <div
            className={`fixed inset-0 z-[60] bg-black/90 backdrop-blur-3xl flex flex-col transition-transform duration-500 cubic-bezier(0.32, 0.72, 0, 1) overscroll-none ${isOpen ? 'translate-y-0' : 'translate-y-full pointer-events-none'}`}
            style={{ overscrollBehavior: 'none' }}
            onTouchStart={swipeHandlers.onTouchStart}
            onTouchEnd={swipeHandlers.onTouchEnd}
        >
            {/* Background Blur Image */}
            <div
                className="absolute inset-0 opacity-30 pointer-events-none"
                style={{
                    backgroundImage: `url(${currentSong.coverUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    filter: 'blur(40px)'
                }}
            />

            {/* Header */}
            <div className="relative z-10 flex items-center justify-between px-6 py-4 mt-8 flex-shrink-0">
                <button onClick={onClose} className="text-white/80 hover:text-white">
                    <ChevronDown size={32} />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">
                        {view === 'player' ? 'Now Playing' : 'Lyrics'}
                    </span>
                    {/* Page Indicator Dots */}
                    <div className="flex gap-1 mt-1">
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${view === 'player' ? 'bg-white' : 'bg-gray-600'}`} />
                        <div className={`w-1.5 h-1.5 rounded-full transition-colors ${view === 'lyrics' ? 'bg-white' : 'bg-gray-600'}`} />
                    </div>
                </div>
                <button className="text-white/80 hover:text-white">
                    <Shuffle size={24} className="opacity-0" />
                </button>
            </div>

            {/* Sliding Content Container */}
            <div className="flex-1 relative overflow-hidden">
                <div
                    className="absolute inset-0 flex w-[200%] transition-transform duration-500 ease-out"
                    style={{ transform: `translateX(${view === 'player' ? '0%' : '-50%'})` }}
                >
                    {/* PAGE 1: PLAYER (Vinyl) - Width 50% */}
                    <div className="w-[50%] h-full flex-shrink-0 flex flex-col px-8 pb-12">
                        <div className="flex-1 relative flex items-center justify-center overflow-hidden pt-12">
                            {/* Stylus Arm Container - Anchored to Top Right */}
                            {/* Pivot Point */}
                            <div className="absolute top-4 right-10 w-12 h-12 z-30 flex items-center justify-center">
                                <div className="w-8 h-8 rounded-full bg-gray-300 shadow-xl border-2 border-gray-400" />
                                <div className="absolute w-2 h-2 rounded-full bg-gray-500" />
                            </div>

                            {/* The Arm Itself */}
                            <div className={`absolute top-8 right-14 w-24 h-64 z-20 transition-transform duration-700 origin-top-right ease-out
                        ${isPlaying ? 'rotate-[20deg]' : 'rotate-[-25deg]'}`}>
                                {/* Main Arm Shaft */}
                                <div className="w-2 h-48 bg-gradient-to-b from-gray-300 to-gray-400 absolute right-2 top-0 rounded-full shadow-lg" />

                                {/* Counterweight (Visual only at top) */}
                                <div className="w-6 h-8 bg-gray-500 rounded absolute -top-2 -right-1 shadow-md" />

                                {/* Angled Head Shell Holder */}
                                <div className="absolute bottom-16 left-0 w-8 h-2 bg-gray-400 rotate-45 origin-right rounded-full" />

                                {/* Cartridge/Head */}
                                <div className="absolute bottom-12 -left-4 w-8 h-12 bg-gray-800 rounded-sm shadow-md border border-gray-600 rotate-12 flex flex-col items-center justify-end pb-1">
                                    <div className="w-1 h-2 bg-white/50 rounded-full" />
                                </div>
                            </div>

                            {/* Vinyl Record */}
                            <div className={`w-[80vw] h-[80vw] max-w-[320px] max-h-[320px] rounded-full bg-[#101010] border-4 border-[#1a1a1a] shadow-2xl flex items-center justify-center relative
                        ${isPlaying ? 'animate-spin-slow' : ''}`}
                                style={{ animationPlayState: isPlaying ? 'running' : 'paused' }}
                            >
                                {/* Grooves - using radial gradient for better effect */}
                                <div className="absolute inset-0 rounded-full opacity-20"
                                    style={{
                                        background: 'repeating-radial-gradient(#333 0, #333 1px, transparent 2px, transparent 4px)'
                                    }}
                                />

                                {/* Album Art Center */}
                                <div className="w-[50%] h-[50%] rounded-full overflow-hidden border-8 border-[#151515] relative z-10 shadow-inner">
                                    <img src={currentSong.coverUrl} className="w-full h-full object-cover" alt="Album Art" />
                                </div>
                            </div>
                        </div>

                        {/* Song Info & Controls */}
                        <div className="flex flex-col gap-8 mt-auto">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <h2 className="text-2xl font-bold text-white mb-1 truncate max-w-[250px]">{currentSong.title}</h2>
                                    <p className="text-gray-300 text-lg">{currentSong.artist}</p>
                                </div>
                                <button onClick={toggleFavorite} className={`transition-transform active:scale-95 ${isFavorite ? 'text-spotGreen' : 'text-white'}`}>
                                    <Heart size={32} fill={isFavorite ? "currentColor" : "none"} />
                                </button>
                            </div>

                            {/* Progress */}
                            <div className="space-y-2">
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={progress || 0}
                                    onChange={onSeek}
                                    className="w-full h-1 bg-white/20 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                                />
                                <div className="flex justify-between text-xs text-gray-400 font-mono">
                                    <span>{formatTime((progress / 100) * duration)}</span>
                                    <span>{formatTime(duration)}</span>
                                </div>
                            </div>

                            {/* Main Controls */}
                            <div className="flex items-center justify-between px-4">
                                <button
                                    onClick={togglePlaybackMode}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    {playbackMode === 'loop' && <Repeat size={24} />}
                                    {playbackMode === 'shuffle' && <Shuffle size={24} />}
                                    {playbackMode === 'repeat-one' && <Repeat1 size={24} />}
                                </button>
                                <button onClick={onPrev} className="text-white hover:scale-110 transition-transform">
                                    <SkipBack size={40} fill="currentColor" />
                                </button>
                                <button onClick={onPlayPause} className="bg-white text-black p-4 rounded-full hover:scale-105 transition-transform shadow-xl">
                                    {isPlaying ? (
                                        <Pause size={32} fill="currentColor" />
                                    ) : (
                                        <Play size={32} fill="currentColor" className="ml-1" />
                                    )}
                                </button>
                                <button onClick={onNext} className="text-white hover:scale-110 transition-transform">
                                    <SkipForward size={40} fill="currentColor" />
                                </button>
                                <button
                                    onClick={() => setShowQueue(true)}
                                    className="text-gray-400 hover:text-white transition-colors"
                                >
                                    <ListMusic size={24} />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* PAGE 2: LYRICS - Width 50% */}
                    <div className="w-[50%] h-full flex-shrink-0">
                        <MobileLyrics
                            currentSong={currentSong}
                            currentTime={(progress / 100) * duration}
                            isViewActive={view === 'lyrics'}
                        />
                    </div>
                </div>
            </div>
            {/* Mobile Queue Drawer */}
            <MobileQueue
                isOpen={showQueue}
                onClose={() => setShowQueue(false)}
                queue={queue}
                currentSong={currentSong}
                onPlay={(song) => {
                    onPlay(song);
                }}
            />
        </div>
    );
};
