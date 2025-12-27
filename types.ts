export interface Song {
  id: string | number;
  title: string;
  artist: string;
  album: string;
  coverUrl: string;
  audioUrl?: string; // The stream URL
  duration?: number;
  platform?: string; // Source platform (netease, kuwo, etc.)
}

export interface User {
  id: string;
  username: string;
  token?: string;
}

export enum ViewState {
  HOME = 'HOME',
  SEARCH = 'SEARCH',
  LIBRARY = 'LIBRARY',
  MAGIC_DJ = 'MAGIC_DJ',
  PLAYLIST_DETAIL = 'PLAYLIST_DETAIL'
}

export interface PlayerState {
  currentSong: Song | null;
  isPlaying: boolean;
  volume: number;
  progress: number; // 0-100
}

export interface TopListCategory {
  id: string;
  name: string;
  pic?: string;
  updateFrequency?: string;
}

export interface Playlist {
  id: string;
  name: string;
  description?: string;
  songs: Song[];
  coverUrl?: string;
  createdAt: number;
  updatedAt: number;
}