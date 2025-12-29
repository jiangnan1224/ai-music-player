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
  // Dual audio refs for "Ping-Pong" playback
  const audioRefA = useRef<HTMLAudioElement>(null);
  const audioRefB = useRef<HTMLAudioElement>(null);

  // Track which player is currently "Active" (playing the current song)
  const [activePlayer, setActivePlayer] = useState<'A' | 'B'>('A');

  // Blob storage for next song preloading
  const nextSongBlobUrlRef = useRef<string | null>(null);

  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(1);
  const [duration, setDuration] = useState(0);

  // Helper to get refs based on active state
  const getActiveAudioResult = () => activePlayer === 'A' ? audioRefA.current : audioRefB.current;
  const getInactiveAudioResult = () => activePlayer === 'A' ? audioRefB.current : audioRefA.current;

  // 1. Handle Song Loading (Ping-Pong Logic)
  useEffect(() => {
    // When currentSong changes, we need to decide if this is a "normal" load or a "gapless" transition.
    // Ideally, the parent component calls onNext(), which updates currentSong.

    // In a perfect gapless transition, the "inactive" player is ALREADY loaded with this song.
    // So we just need to ensure the active player points to the right element.

    // However, if the user clicked a random song (not next), we need to load it into the active player.
    const activeAudio = getActiveAudioResult();
    const inactiveAudio = getInactiveAudioResult();

    if (activeAudio && currentSong) {
      // Check if active audio is already playing this URL (gapless case)
      // Note: Blob URLs won't match the string URL, so we rely on the fact that handleEnded swapped the state
      const isSrcMatch = activeAudio.src === currentSong.audioUrl || (nextSongBlobUrlRef.current && activeAudio.src === nextSongBlobUrlRef.current);

      if (!isSrcMatch) {
        // Normal load (User clicked a song)
        activeAudio.src = currentSong.audioUrl;
        if (isPlaying) {
          activeAudio.play().catch(e => console.warn("Play error", e));
        }
      }
    }

    // Preload Next Song into Inactive Player
    if (inactiveAudio && nextSong?.audioUrl) {
      console.log('Preloading into inactive player:', nextSong.title);
      fetch(nextSong.audioUrl)
        .then(res => {
          if (!res.ok) throw new Error('Fetch status: ' + res.status);
          const type = res.headers.get('content-type');
          if (type && !type.startsWith('audio/')) throw new Error('Invalid type: ' + type);
          return res.blob();
        })
        .then(blob => {
          if (blob.size < 1000) return;
          const blobUrl = URL.createObjectURL(blob);
          // Revoke old blob
          if (nextSongBlobUrlRef.current) URL.revokeObjectURL(nextSongBlobUrlRef.current);
          nextSongBlobUrlRef.current = blobUrl;

          // Load into inactive player
          inactiveAudio.src = blobUrl;
          inactiveAudio.load();
        })
        .catch(err => {
          console.warn('Preload failed, setting standard URL into inactive:', err);
          // Fallback to standard URL
          inactiveAudio.src = nextSong.audioUrl;
          inactiveAudio.load();
        });
    }

  }, [currentSong, nextSong, activePlayer]);

  // 2. Play/Pause Handler
  useEffect(() => {
    const audio = getActiveAudioResult();
    if (audio) {
      if (isPlaying) {
        audio.play().catch(e => {
          console.warn("Play failed", e);
          // Retry for iOS
          setTimeout(() => {
            if (isPlaying) audio.play().catch(console.error);
          }, 100);
        });
      } else {
        audio.pause();
      }
    }
  }, [isPlaying, activePlayer]);

  // 3. Handle Ended (The Core Gapless Logic)
  const handleEnded = () => {
    console.log("Track ended. Transitioning...");
    const inactiveAudio = getInactiveAudioResult();

    if (inactiveAudio && nextSong && (inactiveAudio.src || nextSong.audioUrl)) {
      // 1. Play the inactive player (which should be preloaded)
      const nextInfo = nextSong.title;
      console.log("Switching to player", activePlayer === 'A' ? 'B' : 'A', "for", nextInfo);

      inactiveAudio.play()
        .then(() => {
          console.log("Gapless transition successful");
        })
        .catch(e => {
          console.error("Gapless transition failed, force playing:", e);
          // Fallback
          if (!inactiveAudio.src) inactiveAudio.src = nextSong.audioUrl;
          inactiveAudio.play();
        });

      // 2. Update local state to swap active players
      setActivePlayer(prev => prev === 'A' ? 'B' : 'A');

      // 3. Notify parent to update visual state (currentSong = nextSong)
      onNext();
    } else {
      onNext();
    }
  };

  // 4. Standard Event Handlers (Delegate to active player)
  const handleTimeUpdate = () => {
    const audio = getActiveAudioResult();
    if (audio) {
      const current = audio.currentTime;
      const total = audio.duration;
      const prog = (current / total) * 100;
      setProgress(prog);
      setDuration(total);
      onTimeUpdate(current);
      if (onDurationChange && !isNaN(total)) onDurationChange(total);
      if (onProgressChange && !isNaN(prog)) onProgressChange(prog);
    }
  };

  const handleAudioError = (e: any) => {
    // Only care if it's the active player erroring
    if (e.target !== getActiveAudioResult()) return;

    console.error("Active player error:", e.target.error, e.target.src);
    setTimeout(onNext, 1000);
  };

  // Media Session Updates (Same as before but using getActiveAudioResult)
  useEffect(() => {
    if ('mediaSession' in navigator && currentSong) {
      // ... (Exact same metadata logic)
      navigator.mediaSession.metadata = new MediaMetadata({
        title: currentSong.title,
        artist: currentSong.artist,
        album: currentSong.album || '',
        artwork: [{ src: currentSong.coverUrl, sizes: '512x512', type: 'image/jpeg' }]
      });
    }
  }, [currentSong]);

  // Handle Seek
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    const audio = getActiveAudioResult();
    if (audio && duration) {
      audio.currentTime = (val / 100) * duration;
      setProgress(val);
      if (onProgressChange) onProgressChange(val);
    }
    if (externalOnSeek) externalOnSeek(e);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    if (audioRefA.current) audioRefA.current.volume = val;
    if (audioRefB.current) audioRefB.current.volume = val;
  };

  // Expose handler
  useEffect(() => {
    if (onSeekHandlerReady) onSeekHandlerReady(handleSeek);
  }, [onSeekHandlerReady, activePlayer]); // Re-bind when player swaps

  // Helper formatter
  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00";
    const min = Math.floor(time / 60);
    const sec = Math.floor(time % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  if (!currentSong) return null;

  return (
    <div className="h-24 bg-black border-t border-gray-900 px-4 flex items-center justify-between sticky bottom-0 z-50">
      {/* Dual Audio Elements */}
      <audio
        ref={audioRefA}
        onTimeUpdate={activePlayer === 'A' ? handleTimeUpdate : undefined}
        onEnded={activePlayer === 'A' ? handleEnded : undefined}
        onError={handleAudioError}
        preload="auto"
        playsInline
      />
      <audio
        ref={audioRefB}
        onTimeUpdate={activePlayer === 'B' ? handleTimeUpdate : undefined}
        onEnded={activePlayer === 'B' ? handleEnded : undefined}
        onError={handleAudioError}
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
          <span>{formatTime(audioRefA.current && activePlayer === 'A' ? audioRefA.current.currentTime : (audioRefB.current ? audioRefB.current.currentTime : 0))}</span>
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