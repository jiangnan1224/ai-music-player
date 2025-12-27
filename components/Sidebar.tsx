import React from 'react';
import { Home, Search, Library, Sparkles, LogOut, Disc, Music, Plus, Download } from 'lucide-react';
import { ViewState, Playlist } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  mobile?: boolean;
  playlists: Playlist[];
  onCreatePlaylist: () => void;
  onImportPlaylist: () => void;
  onSelectPlaylist: (playlist: Playlist) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, mobile, playlists, onCreatePlaylist, onImportPlaylist, onSelectPlaylist }) => {
  const navItemClass = (view: ViewState) => `
    flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors duration-200
    ${currentView === view ? 'text-white bg-white/10 rounded-md' : 'text-gray-400 hover:text-white'}
  `;

  return (
    <div className={`w-64 bg-black h-full flex flex-col pt-2 pb-6 ${mobile ? '' : 'hidden md:flex p-6 border-r border-gray-900'}`}>
      {!mobile && (
        <div className="flex items-center gap-2 mb-10 px-2 text-white">
          <Disc size={40} className="text-white" />
          <h1 className="text-2xl font-bold tracking-tighter">TuneStream</h1>
        </div>
      )}

      <nav className="flex-1 space-y-2">
        <div onClick={() => setView(ViewState.HOME)} className={navItemClass(ViewState.HOME)}>
          <Home size={24} />
          <span className="font-bold">Home</span>
        </div>
        <div onClick={() => setView(ViewState.SEARCH)} className={navItemClass(ViewState.SEARCH)}>
          <Search size={24} />
          <span className="font-bold">Search</span>
        </div>
        <div onClick={() => setView(ViewState.LIBRARY)} className={navItemClass(ViewState.LIBRARY)}>
          <Library size={24} />
          <span className="font-bold">Your Library</span>
        </div>

        {/* <div className="mt-8 pt-8 border-t border-gray-800">
          <div
            onClick={() => setView(ViewState.MAGIC_DJ)}
            className={`${navItemClass(ViewState.MAGIC_DJ)} text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600`}
          >
            <Sparkles size={24} className="text-purple-400" />
            <span className="font-bold">Magic DJ (Gemini)</span>
          </div>
        </div> */}

        {/* Playlists Section */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="flex items-center justify-between px-4 mb-3">
            <span className="text-sm font-semibold text-gray-400">MY PLAYLISTS</span>
            <div className="flex items-center gap-1">
              <button
                onClick={onImportPlaylist}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                title="Import from Netease"
              >
                <Download size={18} />
              </button>
              <button
                onClick={onCreatePlaylist}
                className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-white/10 rounded"
                title="Create Playlist"
              >
                <Plus size={18} />
              </button>
            </div>
          </div>

          <div className="space-y-1">
            {(!playlists || playlists.length === 0) ? (
              <div className="px-4 py-6 text-center text-gray-500 text-sm">
                No playlists yet
                <br />
                <button onClick={onCreatePlaylist} className="text-spotGreen hover:underline mt-2">
                  Create your first playlist
                </button>
              </div>
            ) : (
              playlists.map(playlist => (
                <div
                  key={playlist.id}
                  onClick={() => onSelectPlaylist(playlist)}
                  className="flex items-center gap-3 px-4 py-2 cursor-pointer text-gray-400 hover:text-white hover:bg-white/5 rounded-md transition-colors group"
                >
                  <Music size={20} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="font-medium truncate">{playlist.name}</div>
                    <div className="text-xs text-gray-500">{playlist.songs.length} songs</div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </nav>


    </div>
  );
};