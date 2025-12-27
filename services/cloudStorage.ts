import { Playlist, User } from '../types';

const API_BASE = '/api';

// Helper to get headers with Auth
const getHeaders = () => {
    const userStr = localStorage.getItem('tunestream_user');
    const user = userStr ? JSON.parse(userStr) : null;
    return {
        'Content-Type': 'application/json',
        'X-User-ID': user?.id || ''
    };
};

export const cloudService = {
    auth: {
        login: async (username: string, password: string): Promise<User> => {
            const res = await fetch(`${API_BASE}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) {
                const err = await res.json() as any;
                throw new Error(err.error || 'Login failed');
            }
            return res.json();
        },

        register: async (username: string, password: string): Promise<User> => {
            const res = await fetch(`${API_BASE}/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
            if (!res.ok) {
                const err = await res.json() as any;
                throw new Error(err.error || 'Registration failed');
            }
            return res.json();
        }
    },

    playlists: {
        list: async (): Promise<Playlist[]> => {
            const res = await fetch(`${API_BASE}/playlists`, { headers: getHeaders() });
            if (!res.ok) throw new Error('Failed to fetch playlists');
            return res.json();
        },

        create: async (playlist: Playlist): Promise<void> => {
            const res = await fetch(`${API_BASE}/playlists`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(playlist)
            });
            if (!res.ok) throw new Error('Failed to create playlist');
        },

        update: async (playlist: Playlist): Promise<void> => {
            const res = await fetch(`${API_BASE}/playlists/${playlist.id}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(playlist)
            });
            if (!res.ok) throw new Error('Failed to update playlist');
        },

        delete: async (id: string): Promise<void> => {
            const res = await fetch(`${API_BASE}/playlists/${id}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            if (!res.ok) throw new Error('Failed to delete playlist');
        }
    }
};
