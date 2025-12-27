import React from 'react';
import { Home, Search, Library, Sparkles, LogOut, Disc } from 'lucide-react';
import { ViewState } from '../types';

interface SidebarProps {
  currentView: ViewState;
  setView: (view: ViewState) => void;
  mobile?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, mobile }) => {
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
      </nav>


    </div>
  );
};