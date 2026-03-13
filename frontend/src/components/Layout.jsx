import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Radio, Mic2, Tv, Users, Settings, LogOut, Upload, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';
import { Toaster } from 'sonner';
import ButlerChat from './ButlerChat';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  
  const links = [
    { name: 'Feed', icon: Tv, path: '/' },
    { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
    { name: 'Radio', icon: Radio, path: '/radio' },
    { name: 'Live', icon: Mic2, path: '/live' },
    { name: 'Community', icon: Users, path: '/community' },
  ];

  return (
    <aside className={cn(
      "fixed left-0 top-0 z-40 h-screen w-64 bg-[#0A0A0A] border-r border-white/5 transition-transform duration-300 ease-in-out",
      isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
    )}>
      <div className="flex h-20 items-center justify-between px-6 border-b border-white/5">
        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full overflow-hidden">
            <img src="/logo.jpg" alt="StagePass" className="w-full h-full object-cover" />
          </div>
          <span className="font-heading font-bold text-xl tracking-wider">STAGEPASS</span>
        </Link>
        <button onClick={() => setIsOpen(false)} className="md:hidden text-zinc-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <nav className="p-4 space-y-2">
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={cn(
              "flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group",
              location.pathname === link.path 
                ? "bg-primary text-white shadow-[0_0_20px_rgba(93,92,255,0.3)]" 
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            )}
          >
            <link.icon size={20} className={cn(
              "transition-colors",
              location.pathname === link.path ? "text-white" : "group-hover:text-secondary"
            )} />
            <span className="font-medium">{link.name}</span>
          </Link>
        ))}
      </nav>

      <div className="absolute bottom-0 w-full p-4 border-t border-white/5 bg-[#0A0A0A] space-y-2">
        <Link to="/settings" className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-white hover:bg-white/5 rounded-xl transition-all">
          <Settings size={20} />
          <span>Settings</span>
        </Link>
        <button 
          onClick={() => { alert('Signed out'); }}
          className="flex items-center space-x-3 px-4 py-3 text-zinc-400 hover:text-red-400 hover:bg-red-500/5 rounded-xl transition-all w-full"
          data-testid="sidebar-signout-btn"
        >
          <LogOut size={20} />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      
      <main className="flex-1 md:ml-64 relative min-h-screen flex flex-col">
        {/* Mobile Header */}
        <header className="md:hidden h-16 glass sticky top-0 z-30 flex items-center justify-between px-4">
          <button onClick={() => setIsSidebarOpen(true)} className="text-white">
            <Menu size={24} />
          </button>
          <span className="font-heading font-bold text-lg">STAGEPASS</span>
          <div className="w-8" /> {/* Spacer */}
        </header>

        <div className="flex-1 p-4 md:p-8 lg:p-12 overflow-y-auto">
          {children}
        </div>

        {/* AI Butler - Floating */}
        <div className="fixed bottom-10 right-10 z-[100]">
          <ButlerChat />
        </div>
      </main>
      
      <Toaster position="top-right" theme="dark" />
    </div>
  );
}
