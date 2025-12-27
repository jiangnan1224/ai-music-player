import React from 'react';
import { Play, Pause, Heart } from 'lucide-react';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
  onPlay: (song: Song) => void;
  isCurrent: boolean;
  isPlaying: boolean;
  isFavorite: boolean;
  onToggleFavorite: (e: React.MouseEvent) => void;
}

export const SongCard: React.FC<SongCardProps> = ({ song, onPlay, isCurrent, isPlaying, isFavorite, onToggleFavorite }) => {
  return (
    <div
      className="group relative bg-spotLight/40 hover:bg-spotLight p-4 rounded-lg transition-all duration-300 cursor-pointer flex flex-col gap-3"
      onClick={() => onPlay(song)}
    >
      <div className="relative aspect-square w-full shadow-lg rounded-md overflow-hidden">
        <img
          src={song.coverUrl}
          alt={song.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className={`
          absolute bottom-2 right-2 bg-spotGreen rounded-full p-3 shadow-xl transform translate-y-1/4 opacity-0 transition-all duration-300 
          group-hover:opacity-100 group-hover:translate-y-0
          ${isCurrent ? 'opacity-100 translate-y-0' : ''}
        `}>
          {isCurrent && isPlaying ? (
            <Pause fill="black" className="text-black ml-0.5" size={20} />
          ) : (
            <Play fill="black" className="text-black ml-0.5" size={20} />
          )}
        </div>

        <button
          onClick={onToggleFavorite}
          className={`absolute top-2 right-2 p-2 rounded-full transform translate-y-[-10px] opacity-0 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300
            ${isFavorite ? 'text-spotGreen opacity-100 translate-y-0' : 'text-white hover:scale-110'}`}
        >
          <Heart size={20} fill={isFavorite ? "currentColor" : "none"} />
        </button>
      </div>
      <div>
        <h3 className={`font-bold truncate ${isCurrent ? 'text-spotGreen' : 'text-white'}`}>
          {song.title}
        </h3>
        <p className="text-sm text-gray-400 truncate line-clamp-2">
          {song.artist}
        </p>
      </div>
    </div>
  );
};