import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, Heart, ListMusic, Mic2, Repeat, Repeat1, Shuffle } from 'lucide-react';
import { Song } from '../types';

interface PlayerProps {
  currentSong: Song | null;
  isPlaying: boolean;
  onPlayPause: () => void;
  onNext: () => void;
  onPrev: () => void;
  addToLibrary: (song: Song) => void;
  isFavorite: boolean;
  toggleLyrics: () => void;
  toggleQueue: () => void;
  onTimeUpdate: (time: number) => void;
  onSeek?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onDurationChange?: (duration: number) => void;
  onProgressChange?: (progress: number) => void;
  onSeekHandlerReady?: (handler: (e: React.ChangeEvent<HTMLInputElement>) => void) => void;
  nextSong?: Song | null;
  playbackMode: 'loop' | 'shuffle' | 'repeat-one';
  togglePlaybackMode: () => void;
}

export const Player: React.FC<PlayerProps> = ({
  currentSong,
  nextSong,
  isPlaying,
  onPlayPause,
  onNext,
  onPrev,
  addToLibrary,
  isFavorite,
  toggleLyrics,
  toggleQueue,
  onTimeUpdate,
  onSeek: externalOnSeek,
  onDurationChange,
  onProgressChange,
  onSeekHandlerReady,
  playbackMode,
  togglePlaybackMode
}) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const nextSongBlobUrlRef = useRef<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);

  // Preload next song as Blob for gapless playback
  useEffect(() => {
    // Reset previous blob
    if (nextSongBlobUrlRef.current) {
      URL.revokeObjectURL(nextSongBlobUrlRef.current);
      nextSongBlobUrlRef.current = null;
    }

    if (nextSong?.audioUrl) {
      console.log('Preloading next song:', nextSong.title);
      fetch(nextSong.audioUrl)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Failed to fetch audio: ${response.status} ${response.statusText}`);
          }
          const contentType = response.headers.get('content-type');
          if (contentType && !contentType.startsWith('audio/')) {
            throw new Error(`Invalid content type: ${contentType}`);
          }
          return response.blob();
        })
        .then(blob => {
          if (blob.size < 1000) {
            // Safety check: too small blob is likely an error message
            console.warn('Blob too small, ignoring:', blob.size);
            return;
          }
          const blobUrl = URL.createObjectURL(blob);
          nextSongBlobUrlRef.current = blobUrl;
          console.log('Preload complete for:', nextSong.title);
        })
        .catch(err => {
          console.warn('Preload failed (likely CORS or 404), falling back to normal URL:', err);
          // Ensure we don't have a broken blob ref
          if (nextSongBlobUrlRef.current) {
            URL.revokeObjectURL(nextSongBlobUrlRef.current);
            nextSongBlobUrlRef.current = null;
          }
        });
    }

    // Cleanup on unmount or change
    return () => {
      if (nextSongBlobUrlRef.current) {
        URL.revokeObjectURL(nextSongBlobUrlRef.current);
        nextSongBlobUrlRef.current = null;
      }
    };
  }, [nextSong]);

  // Play/Pause handling
  useEffect(() => {
    if (audioRef.current) {
      if (isPlaying) {
        // If the source matches current song (normal case)
        // Or if we just switched sources via React state update
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .catch(e => {
              console.warn("Playback failed, retrying...", e);
              // iOS sometimes blocks playback in background
              // Retry after a short delay
              setTimeout(() => {
                if (audioRef.current && isPlaying) {
                  audioRef.current.play()
                    .catch(err => {
                      console.error("Playback retry failed", err);
                      // If it ultimately fails, we might want to notify UI, but for now we just log
                    });
                }
              }, 100);
            });
        }
      } else {
        audioRef.current.pause();
      }
    }
  }, [isPlaying, currentSong]);

  const handleAudioPlaying = () => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'playing';
    }
  };

  const handleAudioPause = () => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'paused';
    }
  };

  // Sync Playback Handler for iOS Gapless
  const handleEnded = () => {
    if (nextSong && audioRef.current) {
      console.log("Gapless switch to:", nextSong.title);

      // 1. Prefer Blob URL for instant switch (Zero Latency)
      const nextSrc = nextSongBlobUrlRef.current || nextSong.audioUrl;

      // 2. Sync switch source
      audioRef.current.src = nextSrc!;

      // 3. Sync play (allowed because we are in 'ended' event handler)
      audioRef.current.play()
        .then(() => {
          // If we successfully used a blob, future cleanup will handle it.
          // Note: changing src DOES NOT revoke the blob automatically, 
          // but our useEffect cleanup handles it when nextSong changes.
        })
        .catch(e => console.error("Gapless play failed", e));

      // 4. Notify React to update state (will trigger re-render)
      onNext();
    } else {
      onNext();
    }
  };


  // Update Media Session Metadata - separate from play/pause to ensure it always updates
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentSong.title,
          artist: currentSong.artist,
          album: currentSong.album || '',
          artwork: [
            { src: currentSong.coverUrl, sizes: '96x96', type: 'image/jpeg' },
            { src: currentSong.coverUrl, sizes: '128x128', type: 'image/jpeg' },
            { src: currentSong.coverUrl, sizes: '192x192', type: 'image/jpeg' },
            { src: currentSong.coverUrl, sizes: '256x256', type: 'image/jpeg' },
            { src: currentSong.coverUrl, sizes: '384x384', type: 'image/jpeg' },
            { src: currentSong.coverUrl, sizes: '512x512', type: 'image/jpeg' },
          ]
        });
      } catch (e) {
        console.warn('Media Session metadata update failed:', e);
      }
    }
  }, [currentSong]);

  // Set up Media Session action handlers - keep separate to ensure they persist
  useEffect(() => {
    if ('mediaSession' in navigator) {
      try {
        navigator.mediaSession.setActionHandler('play', () => {
          onPlayPause();
          // Force state update
          navigator.mediaSession.playbackState = 'playing';
        });
        navigator.mediaSession.setActionHandler('pause', () => {
          onPlayPause();
          // Force state update
          navigator.mediaSession.playbackState = 'paused';
        });
        navigator.mediaSession.setActionHandler('previoustrack', () => {
          onPrev();
          // Keep playing state on track change
          setTimeout(() => {
            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'playing';
            }
          }, 100);
        });
        navigator.mediaSession.setActionHandler('nexttrack', () => {
          onNext();
          // Keep playing state on track change
          setTimeout(() => {
            if ('mediaSession' in navigator) {
              navigator.mediaSession.playbackState = 'playing';
            }
          }, 100);
        });
      } catch (e) {
        console.warn('Media Session action handlers setup failed:', e);
      }
    }
  }, [onPlayPause, onPrev, onNext]);

  // Update Media Session Position State (Critical for iOS)
  useEffect(() => {
    if ('mediaSession' in navigator && audioRef.current && !isNaN(audioRef.current.duration) && audioRef.current.duration > 0) {
      try {
        navigator.mediaSession.setPositionState({
          duration: audioRef.current.duration,
          playbackRate: 1.0, // Always 1.0 for music
          position: Math.min(audioRef.current.currentTime, audioRef.current.duration)
        });
      } catch (e) {
        // Silently ignore - iOS might reject if metadata not set yet
      }
    }
  }, [progress, duration]);

  useEffect(() => {
    // Reset state when song changes
    setProgress(0);
    setDuration(0);
  }, [currentSong]);

  // Expose seek handler to parent
  useEffect(() => {
    if (onSeekHandlerReady) {
      onSeekHandlerReady(handleSeek);
    }
  }, [onSeekHandlerReady]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      const current = audioRef.current.currentTime;
      const total = audioRef.current.duration;
      const prog = (current / total) * 100;
      setProgress(prog);
      setDuration(total);
      onTimeUpdate(current);
      if (onDurationChange && !isNaN(total)) onDurationChange(total);
      if (onProgressChange && !isNaN(prog)) onProgressChange(prog);
    }
  };

  const handleAudioError = (e: React.SyntheticEvent<HTMLAudioElement, Event>) => {
    const error = audioRef.current?.error;
    console.error('Audio playback error:', {
      code: error?.code,
      message: error?.message,
      song: currentSong?.title
    });

    // Auto-skip to next song on error to prevent playback from stopping
    // This handles broken URLs, network failures, codec issues, etc.
    setTimeout(() => {
      console.warn('Skipping to next song due to playback error');
      onNext();
    }, 500);
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (audioRef.current && duration) {
      audioRef.current.currentTime = (val / 100) * duration;
      setProgress(val);
      if (onProgressChange) onProgressChange(val);
    }
    // Also call external handler if provided
    if (externalOnSeek) externalOnSeek(e);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!currentSong) return null;

  return (
    <div className="h-24 bg-black border-t border-gray-900 px-4 flex items-center justify-between sticky bottom-0 z-50">
      <audio
        ref={audioRef}
        src={currentSong.audioUrl}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={handleAudioError}
        onPlaying={handleAudioPlaying}
        onPause={handleAudioPause}
        preload="auto"
        playsInline
      />

      {/* Left: Song Info */}
      <div className="flex items-center gap-2 md:gap-4 w-[60%] md:w-1/4 min-w-0">
        <img
          src={currentSong.coverUrl}
          alt="cover"
          className="h-10 w-10 md:h-14 md:w-14 rounded bg-gray-800 flex-shrink-0"
        />
        <div className="flex flex-col min-w-0 overflow-hidden">
          <span className="text-white text-sm font-semibold hover:underline cursor-pointer truncate">
            {currentSong.title}
          </span>
          <span className="text-gray-400 text-xs hover:text-white cursor-pointer transition-colors truncate">
            {currentSong.artist}
          </span>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); addToLibrary(currentSong); }}
          className={`ml-2 transition-colors flex-shrink-0 ${isFavorite ? 'text-spotGreen' : 'text-gray-400 hover:text-white'}`}
        >
          <Heart size={20} fill={isFavorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Center: Controls */}
      <div className="flex flex-col items-center w-[40%] md:w-2/4 md:max-w-2xl px-2 md:px-4">
        <div className="flex items-center gap-4 md:gap-6 mb-1 md:mb-2">
          <button onClick={(e) => { e.stopPropagation(); onPrev(); }} className="hidden md:block text-gray-400 hover:text-white transition-colors">
            <SkipBack size={20} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onPlayPause(); }}
            className="bg-white rounded-full p-2 hover:scale-105 transition-transform"
          >
            {isPlaying ? (
              <Pause size={20} fill="black" className="text-black" />
            ) : (
              <Play size={20} fill="black" className="text-black ml-1" />
            )}
          </button>
          <button onClick={(e) => { e.stopPropagation(); onNext(); }} className="text-gray-400 hover:text-white transition-colors">
            <SkipForward size={20} />
          </button>
        </div>

        <div className="hidden md:flex w-full items-center gap-2 text-xs text-gray-400 font-mono">
          <span>{formatTime(audioRef.current?.currentTime || 0)}</span>
          <div className="relative w-full h-1 group flex items-center">
            <input
              type="range"
              min="0"
              max="100"
              value={progress || 0}
              onClick={(e) => e.stopPropagation()}
              onChange={handleSeek}
              className="absolute w-full h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-0 [&::-webkit-slider-thumb]:h-0 group-hover:[&::-webkit-slider-thumb]:w-3 group-hover:[&::-webkit-slider-thumb]:h-3 group-hover:[&::-webkit-slider-thumb]:bg-white group-hover:[&::-webkit-slider-thumb]:rounded-full transition-all"
            />
            <div
              className="absolute h-1 bg-white rounded-lg pointer-events-none group-hover:bg-spotGreen"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="hidden md:flex items-center justify-end w-1/4 min-w-[150px] gap-2">
        {/* Playback Mode Button */}
        <button
          onClick={(e) => { e.stopPropagation(); togglePlaybackMode(); }}
          className="text-gray-400 hover:text-white cursor-pointer transition-colors"
          title={playbackMode === 'loop' ? '列表循环' : playbackMode === 'shuffle' ? '随机播放' : '单曲循环'}
        >
          {playbackMode === 'loop' && <Repeat size={20} />}
          {playbackMode === 'shuffle' && <Shuffle size={20} />}
          {playbackMode === 'repeat-one' && <Repeat1 size={20} />}
        </button>
        <ListMusic size={20} className="text-gray-400 hover:text-white cursor-pointer mr-2" onClick={(e) => { e.stopPropagation(); toggleQueue(); }} />
        <Volume2 size={20} className="text-gray-400" />
        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onClick={(e) => e.stopPropagation()}
          onChange={handleVolumeChange}
          className="w-24 h-1 bg-gray-600 rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full hover:[&::-webkit-slider-thumb]:bg-spotGreen"
        />
        <Mic2 size={20} className="text-gray-400 hover:text-white cursor-pointer ml-2" onClick={(e) => { e.stopPropagation(); toggleLyrics(); }} />
      </div>
    </div>
  );
};