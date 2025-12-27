import { Song } from './types';

export const API_BASE_URL = 'https://music-dl.sayqz.com'; // Base URL as requested
export const DEFAULT_COVER = 'https://picsum.photos/300/300';

// Mock data to ensure the UI looks good if the API is down or requires specific auth headers not provided
export const MOCK_SONGS: Song[] = [
  {
    id: '1',
    title: 'Midnight City',
    artist: 'M83',
    album: 'Hurry Up, We\'re Dreaming',
    coverUrl: 'https://picsum.photos/id/10/300/300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    duration: 240
  },
  {
    id: '2',
    title: 'Starboy',
    artist: 'The Weeknd',
    album: 'Starboy',
    coverUrl: 'https://picsum.photos/id/20/300/300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    duration: 210
  },
  {
    id: '3',
    title: 'Get Lucky',
    artist: 'Daft Punk',
    album: 'Random Access Memories',
    coverUrl: 'https://picsum.photos/id/30/300/300',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    duration: 248
  }
];