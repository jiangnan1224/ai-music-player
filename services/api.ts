import { Song, User } from '../types';
import { API_BASE_URL, MOCK_SONGS, DEFAULT_COVER } from '../constants';
import { cache, TTL } from '../utils/cache';

// Flag to force mock mode if the real API is unstable or requires specific unknown headers
const USE_MOCK = false;

export const api = {
  login: async (username: string): Promise<User> => {
    // Simulating login as most public music APIs don't have open registration
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ id: 'u1', username, token: 'mock-jwt-token' });
      }, 800);
    });
  },

  search: async (query: string, page: number = 1): Promise<Song[]> => {
    if (USE_MOCK) {
      return new Promise((resolve) => {
        setTimeout(() => {
          const results = MOCK_SONGS.filter(s =>
            s.title.toLowerCase().includes(query.toLowerCase()) ||
            s.artist.toLowerCase().includes(query.toLowerCase())
          );
          resolve(results.length > 0 ? results : MOCK_SONGS); // Fallback to list if no match
        }, 600);
      });
    }

    try {
      // Using aggregateSearch to get results from multiple platforms
      const res = await fetch(`${API_BASE_URL}/api/?type=aggregateSearch&keyword=${encodeURIComponent(query)}&page=${page}`);

      if (!res.ok) throw new Error('Search failed');
      const data = await res.json();

      if (data.code !== 200 || !data.data || !data.data.results) {
        return [];
      }

      // Adapt the response to our Song interface
      return data.data.results.map((s: any) => ({
        id: s.id,
        title: s.name,
        artist: s.artist,
        album: s.album || 'Unknown Album',
        // Construct URLs dynamically based on API docs
        coverUrl: `${API_BASE_URL}/api/?source=${s.platform}&id=${s.id}&type=pic`,
        audioUrl: `${API_BASE_URL}/api/?source=${s.platform}&id=${s.id}&type=url&br=320k`,
        platform: s.platform,
        // API doesn't return duration in aggregate search, so we might need a fallback or fetch details. 
        // For now, 0 or specific fetch is needed. Let's start with 0.
        duration: 0
      }));
    } catch (e) {
      console.error("API Error, falling back to mock", e);
      return MOCK_SONGS;
    }
  },

  getTopLists: async (source: string = 'netease'): Promise<{ id: string, name: string }[]> => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/?source=${source}&type=toplists`);
      if (!res.ok) throw new Error('Failed to fetch toplists');
      const data = await res.json();
      return data.data?.list?.map((l: any) => ({ id: l.id, name: l.name })) || [];
    } catch (e) {
      console.error(e);
      return [];
    }
  },

  getPlaylist: async (source: string, id: string): Promise<Song[]> => {
    return cache.fetchWithCache(`playlist_${source}_${id}`, TTL.PLAYLISTS, async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/?source=${source}&type=playlist&id=${id}`);
        if (!res.ok) throw new Error('Failed to fetch playlist');
        const data = await res.json();

        return data.data?.list?.map((s: any) => ({
          id: s.id,
          title: s.name,
          artist: s.artist,
          album: s.album || 'Unknown Album',
          coverUrl: s.pic || `${API_BASE_URL}/api/?source=${source}&id=${s.id}&type=pic`,
          audioUrl: s.url || `${API_BASE_URL}/api/?source=${source}&id=${s.id}&type=url&br=320k`,
          platform: source,
          duration: 0
        })) || [];
      } catch (e) {
        console.error(e);
        return [];
      }
    });
  },

  getLyrics: async (source: string, id: string): Promise<string> => {
    return cache.fetchWithCache(`lyrics_${source}_${id}`, TTL.LYRICS, async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/?source=${source}&id=${id}&type=lrc`);
        if (!res.ok) throw new Error('Failed to fetch lyrics');
        const text = await res.text();
        return text;
      } catch (e) {
        console.error(e);
        return "";
      }
    });
  },

  getTopListCategories: async (source: string): Promise<any[]> => {
    return cache.fetchWithCache(`cats_${source}`, TTL.CATEGORIES, async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/?type=toplists&source=${source}`);
        if (!res.ok) throw new Error('Failed to fetch toplist categories');
        const data = await res.json();
        return data.data.list || [];
      } catch (e) {
        console.error(e);
        return [];
      }
    });
  },

  getTopListSongs: async (source: string, id: string): Promise<Song[]> => {
    return cache.fetchWithCache(`toplist_${source}_${id}`, TTL.PLAYLISTS, async () => {
      try {
        // Toplists use type=toplist, not type=playlist
        const res = await fetch(`${API_BASE_URL}/api/?source=${source}&type=toplist&id=${id}`);
        if (!res.ok) throw new Error('Failed to fetch toplist songs');
        const data = await res.json();

        return data.data?.list?.map((s: any) => ({
          id: s.id,
          title: s.name,
          artist: s.artist,
          album: s.album || 'Unknown Album',
          coverUrl: s.pic || `${API_BASE_URL}/api/?source=${source}&id=${s.id}&type=pic`,
          audioUrl: s.url || `${API_BASE_URL}/api/?source=${source}&id=${s.id}&type=url&br=320k`,
          platform: source,
          duration: 0
        })) || [];
      } catch (e) {
        console.error(e);
        return [];
      }
    });
  },

  getStreamUrl: async (id: string | number): Promise<string> => {
    // This function might not be strictly needed if audioUrl is populated in search,
    // but kept for compatibility or advanced usage (e.g. if we had to fetch the link async).
    // Here we can't easily implement it without knowing the platform, unless we carry it in the ID or pass the song object.
    // For now, returning empty or relying on what's in the song object.
    return '';
  }
};