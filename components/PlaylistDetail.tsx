import React, { useState } from 'react';
import { Play, Trash2, Edit2, Music, Clock, X, Calendar, MoreHorizontal } from 'lucide-react';
import { Playlist, Song } from '../types';

interface PlaylistDetailProps {
    playlist: Playlist;
    onBack: () => void;
    onPlay: (song: Song, playlist: Song[]) => void;
    onRemoveSong: (songId: string | number) => void;
    onRenamePlaylist: (newName: string, newDescription?: string) => void;
    onDeletePlaylist: () => void;
    isFavorite: (songId: string | number) => boolean;
    toggleFavorite: (song: Song) => void;
}

export const PlaylistDetail: React.FC<PlaylistDetailProps> = ({
    playlist,
    onBack,
    onPlay,
    onRemoveSong,
    onRenamePlaylist,
    onDeletePlaylist,
    isFavorite,
    toggleFavorite
}) => {
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [editName, setEditName] = useState(playlist.name);
    const [editDescription, setEditDescription] = useState(playlist.description || '');

    const handlePlayAll = () => {
        if (playlist.songs.length > 0) {
            onPlay(playlist.songs[0], playlist.songs);
        }
    };

    const handleEdit = () => {
        onRenamePlaylist(editName, editDescription || undefined);
        setShowEditModal(false);
    };

    const handleDelete = () => {
        onDeletePlaylist();
        setShowDeleteModal(false);
        onBack();
    };

    const totalDuration = playlist.songs.reduce((acc, song) => acc + (song.duration || 0), 0);
    const formatDuration = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        return `${mins} min`;
    };

    return (
        <div className="h-full flex flex-col -mx-3 md:-mx-6">
            {/* Header Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
                {/* Hero Section */}
                <div className="bg-gradient-to-b from-gray-800 to-[#121212] p-6 md:p-8 pt-10">



                    <div className="flex flex-col md:flex-row gap-6 md:gap-8 items-center md:items-end text-center md:text-left">
                        {/* Artwork */}
                        <div className="w-48 h-48 md:w-60 md:h-60 bg-gradient-to-br from-gray-700 to-gray-800 rounded-lg shadow-2xl flex items-center justify-center flex-shrink-0 group overflow-hidden relative mx-auto md:mx-0">
                            {playlist.coverUrl ? (
                                <img src={playlist.coverUrl} alt={playlist.name} className="w-full h-full object-cover shadow-lg" />
                            ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-gray-500">
                                    <Music size={64} className="mb-2 opacity-50" />
                                </div>
                            )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 flex flex-col gap-2 md:gap-4 mb-2 items-center md:items-start">
                            <div>
                                <p className="text-xs font-bold text-white uppercase tracking-wider mb-1 opacity-70">Playlist</p>
                                <h1 className="text-3xl md:text-7xl font-bold text-white tracking-tight mb-2 md:mb-4 leading-tight">{playlist.name}</h1>
                                {playlist.description && (
                                    <p className="text-gray-400 text-sm md:text-base max-w-2xl line-clamp-2 md:line-clamp-none">{playlist.description}</p>
                                )}
                            </div>

                            <div className="flex items-center gap-2 text-xs md:text-sm text-gray-300 font-medium">
                                <span className="text-white">User</span>
                                <span>•</span>
                                <span>{playlist.songs.length} songs</span>
                                <span className="text-gray-400 hidden md:inline">• {totalDuration > 0 ? formatDuration(totalDuration) : '0 min'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions Bar */}
                {/* Actions Bar */}
                <div className="bg-[#121212] px-4 md:px-8 py-4 md:py-6 flex items-center justify-between md:justify-start gap-6 sticky top-0 z-10 shadow-xl md:shadow-none border-b border-white/5 md:border-none">
                    <div className="flex items-center gap-4 md:gap-6">
                        <div className="flex items-center gap-2 md:gap-4">
                            <button
                                onClick={() => setShowEditModal(true)}
                                className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full"
                                title="Edit details"
                            >
                                <Edit2 size={22} className="md:w-6 md:h-6" />
                            </button>
                            <button
                                onClick={() => setShowDeleteModal(true)}
                                className="text-gray-400 hover:text-red-400 transition-colors p-2 hover:bg-white/10 rounded-full"
                                title="Delete playlist"
                            >
                                <Trash2 size={22} className="md:w-6 md:h-6" />
                            </button>
                            <button className="text-gray-400 hover:text-white transition-colors p-2 hover:bg-white/10 rounded-full">
                                <MoreHorizontal size={22} className="md:w-6 md:h-6" />
                            </button>
                        </div>
                    </div>

                    <button
                        onClick={handlePlayAll}
                        disabled={playlist.songs.length === 0}
                        className="bg-spotGreen hover:bg-spotGreen/90 disabled:bg-gray-800 disabled:text-gray-500 disabled:cursor-not-allowed text-black w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-105 active:scale-95"
                    >
                        <Play size={24} fill="currentColor" className="ml-1 md:w-7 md:h-7" />
                    </button>
                </div>

                {/* Songs Table Header */}
                <div className="px-6 md:px-8 pb-2 sticky top-[88px] z-10 bg-[#121212] hidden md:block">
                    <div className="flex items-center border-b border-white/10 pb-2 text-sm text-gray-400 font-medium tracking-wide">
                        <div className="w-12 text-center text-base">#</div>
                        <div className="flex-1">Title</div>
                        <div className="flex-1">Album</div>
                        <div className="w-12 flex justify-center"><Clock size={16} /></div>
                        <div className="w-12"></div>
                    </div>
                </div>

                {/* Songs List */}
                {/* Songs List */}
                <div className="px-2 md:px-8 pb-32">
                    {playlist.songs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center">
                            <Music size={48} className="text-gray-600 mb-6" />
                            <h3 className="text-2xl font-bold text-white mb-2">It's a bit empty here</h3>
                            <p className="text-gray-400 text-sm mb-6">Find some songs you love and add them to this playlist.</p>
                            <button onClick={onBack} className="px-8 py-3 bg-white text-black font-bold rounded-full hover:scale-105 transition-transform">
                                Browse Library
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-0.5">
                            {playlist.songs.map((song, index) => (
                                <div
                                    key={`${song.id}-${playlist.id}-${index}`}
                                    className="flex items-center p-2 rounded-md hover:bg-white/10 group transition-colors text-sm text-gray-400 group-hover:text-white"
                                >
                                    <div className="w-8 md:w-12 text-center flex items-center justify-center relative hidden md:flex">
                                        <span className="group-hover:hidden text-gray-500 font-medium">{index + 1}</span>
                                        <button
                                            onClick={() => onPlay(song, playlist.songs)}
                                            className="hidden group-hover:inline-block text-white"
                                        >
                                            <Play size={14} fill="currentColor" />
                                        </button>
                                    </div>

                                    <div className="flex-1 flex items-center gap-4 min-w-0 pr-4">
                                        <img
                                            src={song.coverUrl}
                                            alt={song.title}
                                            className="w-10 h-10 rounded shadow-sm flex-shrink-0"
                                        />
                                        <div className="min-w-0">
                                            <div className="font-medium text-white truncate text-base mb-0.5">{song.title}</div>
                                            <div className="group-hover:text-white text-gray-500 truncate text-xs">{song.artist}</div>
                                        </div>
                                    </div>

                                    <div className="flex-1 hidden md:flex items-center min-w-0 pr-4">
                                        <span className="truncate group-hover:text-white text-gray-500">{song.album}</span>
                                    </div>

                                    <div className="w-12 flex justify-center hidden md:flex">
                                        {/* Placeholder duration since we don't have it on Song yet */}
                                        <span className="text-xs">3:45</span>
                                    </div>

                                    <div className="w-12 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleFavorite(song);
                                            }}
                                            className={`${isFavorite(song.id) ? 'text-spotGreen opacity-100' : 'text-gray-400 hover:text-white'}`}
                                            title="Like"
                                        >
                                            <div className={isFavorite(song.id) ? "" : "hover:scale-110 transition-transform"}>
                                                <span className="text-lg">{isFavorite(song.id) ? '♥' : '♡'}</span>
                                            </div>
                                        </button>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onRemoveSong(song.id);
                                            }}
                                            className="text-gray-400 hover:text-red-400 transition-colors"
                                            title="Remove from playlist"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Edit Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowEditModal(false)}>
                    <div className="bg-[#282828] rounded-xl p-6 w-full max-w-lg shadow-2xl transform transition-all" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold text-white">Edit details</h2>
                            <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-white"><X size={24} /></button>
                        </div>

                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="w-full md:w-36 md:h-36 bg-[#3E3E3E] rounded-md shadow-lg flex items-center justify-center flex-shrink-0 group relative overflow-hidden">
                                <Music size={40} className="text-gray-500" />
                                <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                    <span className="text-white text-sm font-medium">Choose photo</span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        value={editName}
                                        onChange={(e) => setEditName(e.target.value)}
                                        className="w-full bg-[#3E3E3E] border border-transparent rounded-md px-3 py-2 text-white outline-none focus:bg-[#333] focus:border-[#555] text-sm font-medium transition-all"
                                        placeholder="Name"
                                        maxLength={50}
                                    />
                                </div>
                                <div>
                                    <textarea
                                        value={editDescription}
                                        onChange={(e) => setEditDescription(e.target.value)}
                                        className="w-full h-24 bg-[#3E3E3E] border border-transparent rounded-md px-3 py-2 text-white outline-none focus:bg-[#333] focus:border-[#555] text-sm resize-none transition-all placeholder-gray-500"
                                        placeholder="Add an optional description"
                                        maxLength={200}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-6">
                            <button
                                onClick={handleEdit}
                                className="px-8 py-3 bg-white hover:bg-gray-100 text-black font-bold rounded-full transition-transform hover:scale-105"
                            >
                                Save
                            </button>
                        </div>

                        <p className="text-[11px] text-gray-400 mt-4">By proceeding, you agree to give Tunestream access to the image you choose to upload. Please make sure you have the right to upload the image.</p>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4" onClick={() => setShowDeleteModal(false)}>
                    <div className="bg-[#282828] rounded-xl p-8 w-full max-w-sm text-center shadow-2xl" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold text-white mb-2">Delete from Library?</h2>
                        <p className="text-gray-400 text-sm mb-6">
                            This will delete <span className="text-white font-medium">{playlist.name}</span> from your library.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="px-6 py-2 bg-transparent hover:bg-white/5 border border-gray-600 text-white font-bold rounded-full transition-colors text-sm tracking-wide"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-6 py-2 bg-spotGreen hover:bg-spotGreen/90 text-black font-bold rounded-full transition-all hover:scale-105 text-sm tracking-wide"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
