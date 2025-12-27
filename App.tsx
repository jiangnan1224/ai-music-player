import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { SongCard } from './components/SongCard';
import { Button } from './components/Button';
import { api } from './services/api';
import { cloudService } from './services/cloudStorage';
import { getMusicRecommendation } from './services/geminiService';
import { Song, User, ViewState, TopListCategory, Playlist } from './types';
import { Search, Loader2, Sparkles, LogIn, Disc, LayoutGrid, List, Clock, Heart, Play, Menu, X, Repeat, Repeat1, Shuffle, ChevronLeft } from 'lucide-react';
import { LyricsSidebar } from './components/LyricsSidebar';
import { QueueSidebar } from './components/QueueSidebar';
import { UserDropdown } from './components/UserDropdown';
import { CreatePlaylistModal } from './components/CreatePlaylistModal';
import { PlaylistDetail } from './components/PlaylistDetail';
import { AddToPlaylistModal } from './components/AddToPlaylistModal';
import { ImportPlaylistModal } from './components/ImportPlaylistModal';
import { MobilePlayer } from './components/MobilePlayer';

// Hardcoded password
const HARDCODED_PASSWORD = 'jiangnan';

// Login Component
const LoginScreen = ({ onLogin }: { onLogin: (u: string) => void }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password) {
      setError('Please enter username and password');
      return;
    }

    setLoading(true);
    setError('');

    try {
      let user;
      if (isRegistering) {
        user = await cloudService.auth.register(username.trim(), password);
        // Auto login after register? Or just notify?
        // Let's notify success and switch to login or just auto login.
        // The API returns the user object, so we can consider them logged in.
      } else {
        user = await cloudService.auth.login(username.trim(), password);
      }

      // Save to localStorage
      localStorage.setItem('tunestream_user', JSON.stringify(user));
      onLogin(user.username);
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black flex items-center justify-center p-4">
      <form onSubmit={handleSubmit} className="bg-black/40 backdrop-blur-xl p-8 rounded-2xl border border-white/10 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <img src="/icon.png" alt="TuneStream" className="w-12 h-12 mr-3" />
          <h1 className="text-4xl font-bold text-white">TuneStream</h1>
        </div>

        <div className="flex justify-center mb-6">
          <div className="bg-white/10 p-1 rounded-full flex">
            <button
              type="button"
              onClick={() => { setIsRegistering(false); setError(''); }}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${!isRegistering ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => { setIsRegistering(true); setError(''); }}
              className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${isRegistering ? 'bg-white text-black shadow-lg' : 'text-gray-400 hover:text-white'}`}
            >
              Register
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm animate-pulse">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Username</label>
            <input
              type="text"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 outline-none focus:bg-white/20 transition-all focus:border-spotGreen/50"
              placeholder="Enter your username"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(''); }}
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Password</label>
            <input
              type="password"
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-gray-400 outline-none focus:bg-white/20 transition-all focus:border-spotGreen/50"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(''); }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-spotGreen hover:bg-spotGreen/90 disabled:bg-gray-600 disabled:text-gray-400 text-black font-bold py-3 rounded-lg transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center"
          >
            {loading ? <Loader2 className="animate-spin" /> : (isRegistering ? 'Create Account' : 'Log In')}
          </button>
        </div>
      </form>
    </div>
  );
};

import { useSwipe } from './utils/useSwipe';
import { useRef } from 'react';

const App = () => {
  const [user, setUser] = useState<User | null>(() => {
    // Load user from localStorage on mount
    const savedUser = localStorage.getItem('tunestream_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [view, setView] = useState<ViewState>(ViewState.HOME);

  // Player State - load from localStorage
  const [currentSong, setCurrentSong] = useState<Song | null>(() => {
    const saved = localStorage.getItem('tunestream_current_song');
    return saved ? JSON.parse(saved) : null;
  });
  const [isPlaying, setIsPlaying] = useState(false); // Always start paused on page load
  const [queue, setQueue] = useState<Song[]>(() => {
    const saved = localStorage.getItem('tunestream_queue');
    return saved ? JSON.parse(saved) : [];
  });

  // Data State
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [songs, setSongs] = useState<Song[]>([]);
  const [library, setLibrary] = useState<Song[]>(() => {
    const saved = localStorage.getItem('tunestream_library');
    return saved ? JSON.parse(saved) : [];
  });
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // Dashboard State
  const [homeData, setHomeData] = useState<Record<string, { list: any, songs: Song[] }>>({});
  const [categories, setCategories] = useState<Record<string, TopListCategory[]>>({ netease: [], qq: [], kuwo: [] });
  const [activeCategory, setActiveCategory] = useState<Record<string, string>>({ netease: '', qq: '', kuwo: '' });
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [playlistViewMode, setPlaylistViewMode] = useState<'grid' | 'list'>('grid');

  // Lyrics & Queue State
  const [showLyrics, setShowLyrics] = useState(false);
  const [showQueue, setShowQueue] = useState(false);
  const [showMobilePlayer, setShowMobilePlayer] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Playlist UI State
  const [showCreatePlaylist, setShowCreatePlaylist] = useState(false);
  const [showImportPlaylist, setShowImportPlaylist] = useState(false);
  const [selectedSongToAdd, setSelectedSongToAdd] = useState<Song | null>(null);

  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [progress, setProgress] = useState(0);
  const seekHandlerRef = useRef<((e: React.ChangeEvent<HTMLInputElement>) => void) | null>(null);

  // Playback mode: 'loop' | 'shuffle' | 'repeat-one'
  type PlaybackMode = 'loop' | 'shuffle' | 'repeat-one';
  const [playbackMode, setPlaybackMode] = useState<PlaybackMode>(() => {
    const saved = localStorage.getItem('tunestream_playback_mode');
    return (saved as PlaybackMode) || 'loop';
  });

  // Gemini State
  const [mood, setMood] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiMessage, setAiMessage] = useState<{ title: string, msg: string } | null>(null);

  // Mobile Swipe Handlers
  const swipeHandlers = useSwipe({
    onSwipeRight: () => setShowMobileSidebar(true),
  });

  // Handle Mobile Player State via Hash (Robust Back Button Support)
  useEffect(() => {
    const handleHashChange = () => {
      const isPlayerOpen = window.location.hash === '#player';
      setShowMobilePlayer(isPlayerOpen);
    };

    // Initial check
    handleHashChange();

    // Listen for hash changes (Back button, manual hash set)
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const openMobilePlayer = () => {
    window.location.hash = 'player';
  };

  const closeMobilePlayer = () => {
    // Only go back if we are actually in the player hash state
    if (window.location.hash === '#player') {
      window.history.back();
    } else {
      // Fallback for edge cases
      setShowMobilePlayer(false);
    }
  };

  // Save library to localStorage
  useEffect(() => {
    localStorage.setItem('tunestream_library', JSON.stringify(library));
  }, [library]);

  // Persist player state to localStorage
  useEffect(() => {
    if (currentSong) {
      localStorage.setItem('tunestream_current_song', JSON.stringify(currentSong));
    } else {
      localStorage.removeItem('tunestream_current_song');
    }
  }, [currentSong]);

  useEffect(() => {
    localStorage.setItem('tunestream_queue', JSON.stringify(queue));
  }, [queue]);

  // Removed localStorage persistence for playlists as we sync to cloud now
  // useEffect(() => {
  //   localStorage.setItem('tunestream_playlists', JSON.stringify(playlists));
  // }, [playlists]);

  // Load playlists from Cloud
  useEffect(() => {
    if (user) {
      loadPlaylists();
    }
  }, [user]);

  const loadPlaylists = async () => {
    try {
      const list = await cloudService.playlists.list();
      setPlaylists(list);
    } catch (e) {
      console.error("Failed to load playlists", e);
    }
  };

  // Initial Load (Get some default songs)
  useEffect(() => {
    if (user && view === ViewState.HOME) {
      loadHomeDashboard();
    }
  }, [user, view]);

  const loadHomeDashboard = async () => {
    if (Object.keys(homeData).length > 0) return; // Already loaded

    setIsLoading(true);
    try {
      const sources = ['netease', 'qq', 'kuwo'];
      const newHomeData: Record<string, { list: any, songs: Song[] }> = {};
      const newCategories: Record<string, TopListCategory[]> = { ...categories };
      const newActive: Record<string, string> = { ...activeCategory };

      await Promise.all(sources.map(async (sourceKey) => {
        // 1. Fetch Categories
        const cats = await api.getTopListCategories(sourceKey);
        // Take top 5 categories as "Featured" tabs to avoid clutter
        const featuredCats = cats.slice(0, 5);
        newCategories[sourceKey] = featuredCats;

        // 2. Default to first category
        if (featuredCats.length > 0) {
          const defaultCat = featuredCats[0];
          newActive[sourceKey] = defaultCat.id;

          // 3. Fetch Songs for default
          // 3. Fetch Songs for default
          const topListSongs = await api.getTopListSongs(sourceKey, defaultCat.id);
          newHomeData[sourceKey] = {
            list: { id: defaultCat.id, name: defaultCat.name },
            songs: topListSongs.slice(0, 5) // Preview 5
          };
        }
      }));

      setCategories(newCategories);
      setActiveCategory(newActive);
      setHomeData(newHomeData);
    } catch (e) {
      console.error("Failed to load home dashboard", e);
    }
    setIsLoading(false);
  };

  const handleCategorySelect = async (sourceKey: string, categoryId: string, categoryName: string) => {
    setActiveCategory(prev => ({ ...prev, [sourceKey]: categoryId }));

    // Fetch new data for this section
    // We set a loading state just for this section ideally, but global is fine for now or we can just swap
    // We set a loading state just for this section ideally, but global is fine for now or we can just swap
    const songs = await api.getTopListSongs(sourceKey, categoryId);
    setHomeData(prev => ({
      ...prev,
      [sourceKey]: {
        list: { id: categoryId, name: categoryName },
        songs: songs.slice(0, 5)
      }
    }));
  };

  const handleSeeAll = async (source: string, listId: string, name: string) => {
    setIsLoading(true);
    try {
      const allSongs = await api.getTopListSongs(source, listId);
      setSelectedPlaylist({ id: listId, name, songs: allSongs });
      setSongs(allSongs); // Update main songs list
      setView(ViewState.TOP_LIST);
    } catch (e) {
      console.error("Failed to load full playlist", e);
    }
    setIsLoading(false);
  };

  const handleHomeSongPlay = async (song: Song, source: string, listId: string) => {
    // Load full list for proper queue
    try {
      const fullSongs = await api.getTopListSongs(source, listId);
      playSong(song, fullSongs);
    } catch (e) {
      console.error("Failed to load full list for playback", e);
      // Fallback to just playing the song
      playSong(song, [song]);
    }
  };

  const executeSearch = async (query: string) => {
    if (!query.trim()) return;
    setSearchQuery(query);
    setIsLoading(true);
    setPage(1);
    const results = await api.search(query, 1);
    setSongs(results);
    setIsLoading(false);
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleLoadMore = async () => {
    const nextPage = page + 1;
    setIsLoading(true);
    const results = await api.search(searchQuery, nextPage);

    setSongs(prev => [...prev, ...results]);
    setPage(nextPage);
    setIsLoading(false);
  };

  const handleMagicDJ = async () => {
    if (!mood.trim()) return;
    setAiLoading(true);
    const rec = await getMusicRecommendation(mood);
    setAiMessage({ title: `DJ Recommendation`, msg: `Because you're feeling "${mood}", try "${rec.song}" by ${rec.artist}. Reason: ${rec.reason}` });

    // Auto search the recommendation
    const results = await api.search(`${rec.song} ${rec.artist}`);
    setSongs(results);
    setAiLoading(false);
  };

  const playSong = (song: Song, contextList?: Song[]) => {
    setCurrentSong(song);
    setIsPlaying(true);

    if (contextList && contextList.length > 0) {
      // Replace queue with context list
      setQueue(contextList);
    } else if (!queue.find(s => s.id === song.id)) {
      // Append if not in queue and no context
      setQueue(prev => [...prev, song]);
    }
  };

  const toggleLibrary = (song: Song) => {
    if (library.find(s => s.id === song.id)) {
      setLibrary(prev => prev.filter(s => s.id !== song.id));
    } else {
      setLibrary(prev => [...prev, song]);
    }
  };

  const handleNext = () => {
    if (!currentSong || queue.length === 0) return;

    const idx = queue.findIndex(s => s.id === currentSong.id);

    // Repeat single song
    if (playbackMode === 'repeat-one') {
      // Just replay the current song
      playSong(currentSong);
      return;
    }

    // Shuffle mode
    if (playbackMode === 'shuffle') {
      const randomIdx = Math.floor(Math.random() * queue.length);
      playSong(queue[randomIdx]);
      return;
    }

    // Loop mode (default)
    if (idx < queue.length - 1) {
      playSong(queue[idx + 1]);
    } else {
      playSong(queue[0]); // Loop back to start
    }
  };

  const handlePrev = () => {
    if (!currentSong || queue.length === 0) return;

    const idx = queue.findIndex(s => s.id === currentSong.id);

    // In shuffle mode, just pick random
    if (playbackMode === 'shuffle') {
      const randomIdx = Math.floor(Math.random() * queue.length);
      playSong(queue[randomIdx]);
      return;
    }

    // For loop and repeat-one, go to previous
    if (idx > 0) {
      playSong(queue[idx - 1]);
    } else {
      // Loop to end
      playSong(queue[queue.length - 1]);
    }
  };

  const togglePlaybackMode = () => {
    const modes: PlaybackMode[] = ['loop', 'shuffle', 'repeat-one'];
    const currentIdx = modes.indexOf(playbackMode);
    const nextMode = modes[(currentIdx + 1) % modes.length];
    setPlaybackMode(nextMode);
    localStorage.setItem('tunestream_playback_mode', nextMode);
  };

  // Playlist Management Functions
  const createPlaylist = async (name: string, description?: string) => {
    const newPlaylist: Playlist = {
      id: crypto.randomUUID(), // Temp ID for optimistic, backend might assign real one if we let it
      name,
      description: description || '',
      songs: [],
      coverUrl: `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(name)}&backgroundColor=121212`,
      createdAt: Date.now(),
      updatedAt: Date.now()
    };

    // Optimistic update
    setPlaylists(prev => [...prev, newPlaylist]);

    try {
      // Backend create
      // Note: backend create expects the full object logic we defined in service? 
      // Actually service.create takes Playlist object.
      // We should match backend expectation. 
      await cloudService.playlists.create(newPlaylist);
      // Reload to ensure sync
      loadPlaylists();
    } catch (e) {
      console.error(e);
      // Revert if failed? For now simpler to just log
    }

    return newPlaylist;
  };

  const deletePlaylist = async (playlistId: string) => {
    // Optimistic
    setPlaylists(prev => prev.filter(p => p.id !== playlistId));
    try {
      await cloudService.playlists.delete(playlistId);
    } catch (e) {
      console.error(e);
      loadPlaylists(); // Revert/Sync on error
    }
  };

  const renamePlaylist = async (playlistId: string, newName: string, newDescription?: string) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const updated = { ...playlist, name: newName, description: newDescription, updatedAt: Date.now() };

    // Optimistic
    setPlaylists(prev => prev.map(p => p.id === playlistId ? updated : p));

    try {
      await cloudService.playlists.update(updated);
    } catch (e) {
      console.error(e);
      loadPlaylists();
    }
  };

  const addSongToPlaylist = async (playlistId: string, song: Song) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    // Check header/cover update logic
    const isGenerated = !playlist.coverUrl || playlist.coverUrl.includes('api.dicebear.com');
    const shouldUpdateCover = playlist.songs.length === 0 && isGenerated;

    const updated: Playlist = {
      ...playlist,
      songs: [...playlist.songs, song],
      coverUrl: shouldUpdateCover ? song.coverUrl : playlist.coverUrl,
      updatedAt: Date.now()
    };

    setPlaylists(prev => prev.map(p => p.id === playlistId ? updated : p));

    try {
      await cloudService.playlists.update(updated);
    } catch (e) {
      console.error(e);
      loadPlaylists();
    }
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string | number) => {
    const playlist = playlists.find(p => p.id === playlistId);
    if (!playlist) return;

    const updated: Playlist = {
      ...playlist,
      songs: playlist.songs.filter(s => s.id !== songId),
      updatedAt: Date.now()
    };

    setPlaylists(prev => prev.map(p => p.id === playlistId ? updated : p));

    try {
      await cloudService.playlists.update(updated);
    } catch (e) {
      console.error(e);
      loadPlaylists();
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('tunestream_user');
    setUser(null);
  };

  if (!user) {
    return <LoginScreen onLogin={(u) => setUser({ id: '1', username: u })} />;
  }

  return (
    <div className="flex flex-col h-screen bg-black">
      <div className="flex flex-1 overflow-hidden relative">
        <div className="hidden md:flex">
          <Sidebar
            currentView={view}
            setView={(v) => {
              setView(v);
              setAiMessage(null);
              if (v === ViewState.HOME) loadHomeDashboard();
              if (v === ViewState.LIBRARY) setSongs(library);
              if (v === ViewState.SEARCH) {
                setSongs([]);
                setSearchQuery('');
              }
            }}
            playlists={playlists}
            onCreatePlaylist={() => setShowCreatePlaylist(true)}
            onImportPlaylist={() => setShowImportPlaylist(true)}
            onSelectPlaylist={(playlist) => {
              setSelectedPlaylist(playlist);
              setView(ViewState.PLAYLIST_DETAIL);
            }}
          />
        </div>

        {/* Mobile Sidebar Overlay with Transitions */}
        <div
          className={`fixed inset-0 z-50 bg-black/80 backdrop-blur-sm md:hidden transition-opacity duration-300 ease-in-out ${showMobileSidebar ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            }`}
          onClick={() => setShowMobileSidebar(false)}
        >
          <div
            className={`w-64 h-full bg-black border-r border-gray-800 p-4 transition-transform duration-300 ease-in-out ${showMobileSidebar ? 'translate-x-0' : '-translate-x-full'
              }`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2 text-white">
                <img src="/icon.png" alt="TuneStream" className="w-8 h-8" />
                <span className="text-xl font-bold">TuneStream</span>
              </div>
              <button onClick={() => setShowMobileSidebar(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            <Sidebar
              currentView={view}
              setView={(v) => {
                setView(v);
                setShowMobileSidebar(false);
                setAiMessage(null);
                if (v === ViewState.HOME) loadHomeDashboard();
                if (v === ViewState.LIBRARY) setSongs(library);
                if (v === ViewState.SEARCH) {
                  setSongs([]);
                  setSearchQuery('');
                }
              }}
              mobile
              playlists={playlists}
              onCreatePlaylist={() => setShowCreatePlaylist(true)}
              onImportPlaylist={() => setShowImportPlaylist(true)}
              onSelectPlaylist={(playlist) => {
                setSelectedPlaylist(playlist);
                setView(ViewState.PLAYLIST_DETAIL);
                setShowMobileSidebar(false);
              }}
            />
          </div>
        </div>

        {/* Main Content */}
        <main
          className="flex-1 overflow-y-auto bg-gradient-to-b from-[#1f1f1f] to-[#121212] relative w-full"
          onTouchStart={swipeHandlers.onTouchStart}
          onTouchEnd={swipeHandlers.onTouchEnd}
        >
          {/* Header/Top Bar */}
          <div className="sticky top-0 bg-[#000000aa] backdrop-blur-md p-4 md:p-6 z-30 flex justify-between items-center transition-all bg-opacity-80">
            <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
              {/* Mobile Menu Button */}
              <button className="md:hidden text-white p-2 -ml-2 hover:bg-white/10 rounded-full" onClick={() => setShowMobileSidebar(true)}>
                <Menu size={24} />
              </button>

              {view === ViewState.SEARCH ? (
                <form onSubmit={handleSearch} className="relative w-full max-w-sm md:w-96 flex-1 md:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    autoFocus
                    type="text"
                    className="w-full bg-white text-black rounded-full py-2 md:py-3 pl-10 md:pl-12 pr-4 outline-none font-medium text-sm md:text-base shadow-lg"
                    placeholder="Search music..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </form>
              ) : (
                <h2 className="text-xl md:text-2xl font-bold capitalize truncate">{view === ViewState.PLAYLIST_DETAIL ? 'Playlist' : view.replace('_', ' ').toLowerCase()}</h2>
              )}
            </div>

            <div className="flex items-center gap-4 ml-2 flex-shrink-0">
              <UserDropdown user={user} onLogout={handleLogout} />
            </div>
          </div>

          {/* Content Area */}
          <div className="px-3 md:px-6 pb-24">

            {/* Magic DJ View */}
            {view === ViewState.MAGIC_DJ && (
              <div className="max-w-2xl mx-auto mt-10">
                <div className="bg-gradient-to-br from-purple-900/50 to-blue-900/50 p-8 rounded-2xl border border-white/10 text-center">
                  <Sparkles size={48} className="mx-auto text-purple-400 mb-4" />
                  <h2 className="text-3xl font-bold mb-4">Gemini Magic DJ</h2>
                  <p className="text-gray-300 mb-8">Tell me how you're feeling, and I'll curate the perfect vibe for you.</p>

                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="e.g., Nostalgic for the 80s, Heartbroken, Energetic workout..."
                      className="flex-1 bg-white/10 border border-white/20 rounded-full px-6 py-3 text-white placeholder-gray-400 outline-none focus:bg-white/20 transition-all"
                      value={mood}
                      onChange={(e) => setMood(e.target.value)}
                    />
                    <Button onClick={handleMagicDJ} disabled={aiLoading}>
                      {aiLoading ? <Loader2 className="animate-spin" /> : 'Curate'}
                    </Button>
                  </div>

                  {aiMessage && (
                    <div className="mt-8 bg-black/40 p-6 rounded-xl text-left animate-fade-in border-l-4 border-spotGreen">
                      <h4 className="font-bold text-spotGreen mb-1">{aiMessage.title}</h4>
                      <p className="text-gray-200 text-sm leading-relaxed">{aiMessage.msg}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Playlist Detail View */}
            {view === ViewState.PLAYLIST_DETAIL && selectedPlaylist && (
              <PlaylistDetail
                playlist={selectedPlaylist}
                onBack={() => setView(ViewState.LIBRARY)}
                onPlay={(song, songs) => playSong(song, songs)}
                onRemoveSong={(songId) => {
                  if (selectedPlaylist) {
                    removeSongFromPlaylist(selectedPlaylist.id, songId);
                    // Update selectedPlaylist to reflect changes
                    setSelectedPlaylist({
                      ...selectedPlaylist,
                      songs: selectedPlaylist.songs.filter(s => s.id !== songId)
                    });
                  }
                }}
                onRenamePlaylist={(name, desc) => {
                  if (selectedPlaylist) {
                    renamePlaylist(selectedPlaylist.id, name, desc);
                    setSelectedPlaylist({ ...selectedPlaylist, name, description: desc });
                  }
                }}
                onDeletePlaylist={() => {
                  if (selectedPlaylist) {
                    deletePlaylist(selectedPlaylist.id);
                    setView(ViewState.LIBRARY);
                  }
                }}
                isFavorite={(songId) => !!library.find(s => s.id === songId)}
                toggleFavorite={toggleLibrary}
              />
            )}

            {/* Song Grid */}
            <div className="mt-8">
              {view === ViewState.LIBRARY && songs.length === 0 ? (
                <div className="text-center text-gray-400 mt-20">
                  <Disc size={64} className="mx-auto mb-4 opacity-50" />
                  <p>Your library is empty. Go add some songs!</p>
                </div>
              ) : (
                <>
                  {view === ViewState.HOME && (
                    <div className="space-y-12">
                      {['netease', 'qq', 'kuwo'].map(sourceKey => {
                        const section = homeData[sourceKey];
                        if (!section) return null;

                        return (
                          <div key={sourceKey}>
                            <div className="flex flex-col gap-4 mb-6">
                              <div className="flex justify-between items-end border-b border-white/10 pb-4">
                                <h3 className="text-2xl font-bold capitalize">
                                  {sourceKey === 'netease' ? '网易云音乐' : sourceKey === 'qq' ? 'QQ音乐' : '酷我音乐'}
                                </h3>
                                <button
                                  onClick={() => handleSeeAll(sourceKey, activeCategory[sourceKey], categories[sourceKey]?.find(c => c.id === activeCategory[sourceKey])?.name || 'Top List')}
                                  className="text-sm font-bold text-gray-400 hover:text-white hover:underline uppercase tracking-widest"
                                >
                                  See All
                                </button>
                              </div>

                              {/* Category Chips */}
                              <div className="flex gap-2 overflow-x-auto pb-2 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
                                {categories[sourceKey]?.map(cat => (
                                  <button
                                    key={cat.id}
                                    onClick={() => handleCategorySelect(sourceKey, cat.id, cat.name)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-colors
                                            ${activeCategory[sourceKey] === cat.id
                                        ? 'bg-white text-black'
                                        : 'bg-white/10 text-white hover:bg-white/20'}`}
                                  >
                                    {cat.name}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                              {section.songs.map(song => (
                                <SongCard
                                  key={song.id}
                                  song={song}
                                  onPlay={(s) => handleHomeSongPlay(s, sourceKey, section.list.id)}
                                  isCurrent={currentSong?.id === song.id}
                                  isPlaying={isPlaying && currentSong?.id === song.id}
                                  isFavorite={!!library.find(s => s.id === song.id)}
                                  onToggleFavorite={(e) => { e.stopPropagation(); toggleLibrary(song); }}
                                  onAddToPlaylist={(e) => {
                                    e.stopPropagation();
                                    setSelectedSongToAdd(song);
                                  }}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {(view === ViewState.LIBRARY || view === ViewState.SEARCH || view === ViewState.TOP_LIST) && (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                      {songs.map(song => (
                        <SongCard
                          key={song.id}
                          song={song}
                          onPlay={(s) => playSong(s, songs)}
                          isCurrent={currentSong?.id === song.id}
                          isPlaying={isPlaying && currentSong?.id === song.id}
                          isFavorite={!!library.find(s => s.id === song.id)}
                          onToggleFavorite={(e) => { e.stopPropagation(); toggleLibrary(song); }}
                          onAddToPlaylist={(e) => {
                            e.stopPropagation();
                            setSelectedSongToAdd(song);
                          }}
                        />
                      ))}
                    </div>
                  )}

                  {view === ViewState.SEARCH && songs.length === 0 && !isLoading && (
                    <div className="animate-fade-in">
                      <h3 className="text-2xl font-bold mb-6">Browse All</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {[
                          { name: 'Pop', color: '#8c67ac' },
                          { name: 'Rock', color: '#e91429' },
                          { name: 'Hip Hop', color: '#ba5d07' },
                          { name: 'Electronic', color: '#006450' },
                          { name: 'R&B', color: '#1e3264' },
                          { name: 'K-Pop', color: '#e1118c' },
                          { name: 'Jazz', color: '#777777' },
                          { name: 'Classical', color: '#8d67ab' },
                        ].map((g) => (
                          <div
                            key={g.name}
                            className="h-40 rounded-xl p-4 cursor-pointer hover:scale-105 transition-transform overflow-hidden relative shadow-lg"
                            style={{ backgroundColor: g.color }}
                            onClick={() => executeSearch(g.name)}
                          >
                            <span className="text-2xl font-bold">{g.name}</span>
                            <img
                              src={`https://ui-avatars.com/api/?name=${g.name}&background=random&color=fff&size=128`}
                              className="absolute -bottom-4 -right-4 w-24 h-24 rotate-[25deg] shadow-lg rounded-md"
                              alt=""
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Load More Button - Only show in Search view if we have results */}
                  {view === ViewState.SEARCH && songs.length > 0 && !isLoading && (
                    <div className="flex justify-center mt-8">
                      <Button onClick={handleLoadMore}>
                        Load More
                      </Button>
                    </div>
                  )}

                  {/* Show loader at bottom while appending */}
                  {isLoading && songs.length > 0 && (
                    <div className="flex justify-center mt-8">
                      <Loader2 className="animate-spin text-spotGreen" />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </main>
        {showLyrics && currentSong && (
          <LyricsSidebar
            currentSong={currentSong}
            currentTime={currentTime}
            onClose={() => setShowLyrics(false)}
          />
        )}
        {showQueue && currentSong && (
          <QueueSidebar
            queue={queue}
            currentSong={currentSong}
            onClose={() => setShowQueue(false)}
            onPlay={(s) => playSong(s, queue)}
            library={library}
            toggleLibrary={toggleLibrary}
          />
        )}
      </div>

      {/* Footer Player */}
      {currentSong && (
        <>
          <div onClick={() => window.innerWidth < 768 && openMobilePlayer()}>
            <Player
              currentSong={currentSong}
              isPlaying={isPlaying}
              onPlayPause={() => setIsPlaying(!isPlaying)}
              onNext={handleNext}
              onPrev={handlePrev}
              addToLibrary={toggleLibrary}
              isFavorite={!!library.find(s => s.id === currentSong.id)}
              toggleLyrics={() => { setShowLyrics(!showLyrics); setShowQueue(false); }}
              toggleQueue={() => { setShowQueue(!showQueue); setShowLyrics(false); }}
              onTimeUpdate={(t) => setCurrentTime(t)}
              onDurationChange={(d) => setDuration(d)}
              onProgressChange={(p) => setProgress(p)}
              onSeekHandlerReady={(handler) => { seekHandlerRef.current = handler; }}
              playbackMode={playbackMode}
              togglePlaybackMode={togglePlaybackMode}
            />
          </div>
          {/* Mobile Player Overlay - Persistent for transitions */}
          <MobilePlayer
            currentSong={currentSong}
            isPlaying={isPlaying}
            onPlayPause={() => setIsPlaying(!isPlaying)}
            onNext={handleNext}
            onPrev={handlePrev}
            isOpen={showMobilePlayer}
            onClose={closeMobilePlayer}
            progress={progress}
            duration={duration}
            onSeek={(e) => {
              if (seekHandlerRef.current) {
                seekHandlerRef.current(e);
              }
            }}
            isFavorite={!!library.find(s => s.id === currentSong.id)}
            toggleFavorite={() => toggleLibrary(currentSong)}
            queue={queue}
            onPlay={(song) => playSong(song, queue)} // Play context is current queue
            playbackMode={playbackMode}
            togglePlaybackMode={togglePlaybackMode}
          />

        </>
      )}

      {/* Create Playlist Modal */}
      <CreatePlaylistModal
        isOpen={showCreatePlaylist}
        onClose={() => setShowCreatePlaylist(false)}
        onCreate={(name, description) => {
          createPlaylist(name, description);
          setShowCreatePlaylist(false);
        }}
      />

      <ImportPlaylistModal
        isOpen={showImportPlaylist}
        onClose={() => setShowImportPlaylist(false)}
        onImport={async (name, songs) => {
          const newPlaylist = await createPlaylist(name, `Imported from Netease (${songs.length} songs)`);
          setPlaylists(prev => prev.map(p =>
            p.id === newPlaylist.id
              ? { ...p, songs: songs, coverUrl: songs[0]?.coverUrl || p.coverUrl }
              : p
          ));
        }}
      />

      {/* Add to Playlist Modal */}
      <AddToPlaylistModal
        isOpen={!!selectedSongToAdd}
        onClose={() => setSelectedSongToAdd(null)}
        playlists={playlists}
        song={selectedSongToAdd}
        onAddToPlaylist={(playlistId, song) => {
          addSongToPlaylist(playlistId, song);
        }}
        onCreateNew={() => {
          setSelectedSongToAdd(null);
          setShowCreatePlaylist(true);
        }}
      />
    </div>
  );
};

export default App;