import React, { useState } from 'react';
import { X, Download, Loader2, Music, CheckCircle } from 'lucide-react';
import { api } from '../services/api';
import { Song } from '../types';

interface ImportPlaylistModalProps {
    isOpen: boolean;
    onClose: () => void;
    onImport: (name: string, songs: Song[]) => void;
}

export const ImportPlaylistModal: React.FC<ImportPlaylistModalProps> = ({ isOpen, onClose, onImport }) => {
    const [step, setStep] = useState<'input' | 'fetching' | 'naming'>('input');
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [fetchedSongs, setFetchedSongs] = useState<Song[]>([]);
    const [playlistName, setPlaylistName] = useState('');

    if (!isOpen) return null;

    const handleFetch = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Extract ID from URL or use raw input
        let id = input.trim();
        const urlMatch = id.match(/id=(\d+)/);
        if (urlMatch) {
            id = urlMatch[1];
        }

        if (!id || !/^\d+$/.test(id)) {
            setError('Please enter a valid Netease playlist ID or URL');
            return;
        }

        setStep('fetching');
        try {
            const songs = await api.getPlaylist('netease', id);
            if (songs.length === 0) {
                throw new Error('No songs found or playlist is private');
            }
            setFetchedSongs(songs);
            setPlaylistName('Imported Playlist'); // Default name
            setStep('naming');
        } catch (err) {
            setError('Failed to fetch playlist. Please check the ID and try again.');
            setStep('input');
        }
    };

    const handleImport = (e: React.FormEvent) => {
        e.preventDefault();
        if (!playlistName.trim()) return;
        onImport(playlistName.trim(), fetchedSongs);
        handleClose();
    };

    const handleClose = () => {
        // Reset state on close
        setStep('input');
        setInput('');
        setError('');
        setFetchedSongs([]);
        setPlaylistName('');
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={handleClose}>
            <div
                className="bg-[#282828] rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all border border-white/5"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="p-6 border-b border-white/5 flex items-center justify-between bg-[#282828]">
                    <h2 className="text-xl font-bold text-white leading-tight">Import Playlist</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 -mr-2 text-gray-400 hover:text-white rounded-full hover:bg-white/10 transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {step === 'input' && (
                        <form onSubmit={handleFetch} className="space-y-4">
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-red-600/20 rounded-full flex items-center justify-center text-red-500">
                                    <Music size={40} />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Netease Playlist Link or ID</label>
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    className="w-full bg-[#3e3e3e] border border-transparent rounded-md px-4 py-3 text-white placeholder-gray-400 outline-none focus:bg-[#333] focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all font-medium"
                                    placeholder="e.g. https://music.163.com/playlist?id=..."
                                    autoFocus
                                />
                                {error && <p className="text-red-400 text-xs">{error}</p>}
                            </div>

                            <p className="text-xs text-gray-500 leading-relaxed">
                                Note: Only public playlists are supported. We can retrieve the songs, but you'll need to name the playlist yourself.
                            </p>

                            <button
                                type="submit"
                                disabled={!input.trim()}
                                className="w-full py-3 bg-white hover:bg-gray-100 disabled:bg-gray-600 disabled:text-gray-400 text-black font-bold rounded-full transition-all mt-4"
                            >
                                Find Playlist
                            </button>
                        </form>
                    )}

                    {step === 'fetching' && (
                        <div className="flex flex-col items-center justify-center py-8 space-y-4">
                            <Loader2 size={40} className="text-spotGreen animate-spin" />
                            <p className="text-gray-300 font-medium">Fetching songs...</p>
                        </div>
                    )}

                    {step === 'naming' && (
                        <form onSubmit={handleImport} className="space-y-6">
                            <div className="flex items-center gap-4 bg-white/5 p-4 rounded-lg border border-white/5">
                                <div className="w-12 h-12 bg-spotGreen/20 rounded-md flex items-center justify-center text-spotGreen flex-shrink-0">
                                    <CheckCircle size={24} />
                                </div>
                                <div>
                                    <p className="text-white font-bold">Found {fetchedSongs.length} songs</p>
                                    <p className="text-xs text-gray-400">Ready to import</p>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Playlist Name</label>
                                <input
                                    type="text"
                                    value={playlistName}
                                    onChange={(e) => setPlaylistName(e.target.value)}
                                    className="w-full bg-[#3e3e3e] border border-transparent rounded-md px-4 py-3 text-white placeholder-gray-400 outline-none focus:bg-[#333] focus:border-white/20 focus:ring-1 focus:ring-white/20 transition-all font-bold text-lg"
                                    placeholder="My Playlist"
                                    autoFocus
                                    maxLength={50}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!playlistName.trim()}
                                className="w-full py-3 bg-spotGreen hover:bg-spotGreen/90 disabled:bg-gray-700 disabled:text-gray-500 text-black font-bold rounded-full transition-all transform hover:scale-105 active:scale-95"
                            >
                                Import Playlist
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};
