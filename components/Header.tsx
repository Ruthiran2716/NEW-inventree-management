"use client";

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from './AppContext';
import { 
  Bell, 
  Search, 
  Sun, 
  Moon, 
  UserCheck, 
  Sliders, 
  Clock, 
  Check, 
  Mail,
  AlertTriangle,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Header() {
  const { 
    activeTab, 
    activeRole, 
    setActiveRole, 
    notifications, 
    setNotifications,
    theme, 
    setTheme,
    showToast
  } = useApp();

  const [notifOpen, setNotifOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchModal, setShowSearchModal] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const roleRef = useRef<HTMLDivElement>(null);

  // Close menus on clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setNotifOpen(false);
      }
      if (roleRef.current && !roleRef.current.contains(event.target as Node)) {
        setRoleOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Listen for Ctrl+K keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setShowSearchModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const roles: ('CEO' | 'Admin' | 'Inventory Manager' | 'Procurement Manager' | 'Warehouse Manager' | 'Finance' | 'Store Keeper')[] = [
    'CEO',
    'Admin',
    'Inventory Manager',
    'Procurement Manager',
    'Warehouse Manager',
    'Finance',
    'Store Keeper'
  ];

  const unreadNotifs = notifications.filter(n => !n.read);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    showToast("All notifications marked as read.", "success");
  };

  const markRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  return (
    <header className="h-16 sticky top-0 bg-background/80 backdrop-blur-md border-b border-card-border/50 flex items-center justify-between px-6 z-20">
      
      {/* Search Bar / Title */}
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-slate-100 uppercase min-w-[120px]">
          {activeTab}
        </h1>
        
        {/* Global Search box */}
        <div 
          onClick={() => setShowSearchModal(true)}
          className="hidden md:flex items-center gap-2.5 max-w-sm w-72 px-3 py-1.5 rounded-xl bg-slate-100/70 hover:bg-slate-200/50 dark:bg-slate-800/40 dark:hover:bg-slate-800/60 border border-slate-200/40 dark:border-slate-800/20 text-slate-400 dark:text-slate-500 cursor-pointer transition-all duration-200"
        >
          <Search size={16} />
          <span className="text-xs text-slate-500/80 dark:text-slate-400/80 flex-1 text-left">
            Global Search...
          </span>
          <kbd className="text-[10px] bg-slate-200 dark:bg-slate-700/60 px-1.5 py-0.5 rounded-md font-sans border border-slate-300/30">
            Ctrl+K
          </kbd>
        </div>
      </div>

      {/* Quick Settings & Navigation Right */}
      <div className="flex items-center gap-3">
        
        {/* AI Quick suggestion indicator */}
        <div className="hidden lg:flex items-center gap-1.5 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10 dark:from-primary/20 dark:via-secondary/15 dark:to-accent/15 px-3 py-1.5 rounded-full border border-primary/20">
          <Sparkles size={14} className="text-primary dark:text-secondary animate-pulse" />
          <span className="text-[11px] font-semibold text-primary dark:text-secondary-400">
            AI Assist Enabled
          </span>
        </div>

        {/* Theme toggle */}
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors"
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="p-2.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors relative"
          >
            <Bell size={18} />
            {unreadNotifs.length > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-danger text-white text-[9px] font-black h-4 w-4 rounded-full flex items-center justify-center border-2 border-background animate-bounce">
                {unreadNotifs.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2.5 w-80 glass-panel rounded-2xl shadow-xl z-50 overflow-hidden border border-card-border">
              <div className="p-3 border-b border-card-border/50 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
                <span className="font-bold text-xs uppercase tracking-wider">Alert Center</span>
                {unreadNotifs.length > 0 && (
                  <button 
                    onClick={markAllRead}
                    className="text-[10px] text-primary dark:text-secondary font-semibold hover:underline"
                  >
                    Mark all read
                  </button>
                )}
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-card-border/30">
                {notifications.length === 0 ? (
                  <div className="py-8 text-center text-xs text-slate-400">
                    No active notifications
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      onClick={() => markRead(notif.id)}
                      className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${
                        !notif.read ? 'bg-primary/5 dark:bg-primary/10' : ''
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <span className={`font-bold capitalize ${
                          notif.type === 'error' ? 'text-danger' : 
                          notif.type === 'warning' ? 'text-warning' : 'text-primary'
                        }`}>
                          {notif.title}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Role Switching Dropdown */}
        <div className="relative" ref={roleRef}>
          <button
            onClick={() => setRoleOpen(!roleOpen)}
            className="flex items-center gap-2 pl-3 pr-2.5 py-1.5 rounded-xl border border-card-border bg-slate-50/50 dark:bg-slate-950/20 hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors text-xs font-semibold text-slate-700 dark:text-slate-300"
          >
            <UserCheck size={14} className="text-primary" />
            <span className="max-w-[100px] truncate">{activeRole}</span>
            <ChevronDown size={12} className="text-slate-400" />
          </button>

          {roleOpen && (
            <div className="absolute right-0 mt-2.5 w-52 glass-panel rounded-2xl shadow-xl z-50 overflow-hidden border border-card-border">
              <div className="px-3 py-2 border-b border-card-border/50 bg-slate-50/50 dark:bg-slate-900/50 text-[10px] font-bold text-slate-400 tracking-wider uppercase">
                Switch Perspective
              </div>
              <div className="p-1 space-y-0.5">
                {roles.map((r) => (
                  <button
                    key={r}
                    onClick={() => {
                      setActiveRole(r);
                      setRoleOpen(false);
                      showToast(`Role switched to ${r}`, "info");
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs transition-colors ${
                      activeRole === r 
                        ? 'bg-primary text-white font-semibold' 
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span>{r}</span>
                    {activeRole === r && <Check size={12} />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Search CMD Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4 z-50">
          <div className="glass-panel w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-card-border max-h-[400px] flex flex-col">
            <div className="p-4 border-b border-card-border/50 flex items-center gap-3">
              <Search className="text-slate-400" size={18} />
              <input 
                type="text"
                placeholder="Search products, suppliers, warehouses, POs..."
                autoFocus
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent border-none text-slate-800 dark:text-slate-100 placeholder-slate-400 text-sm focus:outline-none focus:ring-0"
              />
              <button 
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchQuery('');
                }}
                className="text-xs text-slate-400 hover:text-slate-600 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md"
              >
                ESC
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-2">
              {searchQuery === '' ? (
                <div className="p-4 text-center text-xs text-slate-400 space-y-1">
                  <p>Type keywords to search enterprise inventory</p>
                  <p className="text-[10px] text-slate-400/60">Try searching for &quot;Drone&quot;, &quot;Battery&quot;, &quot;Apex&quot;, or &quot;Chicago&quot;</p>
                </div>
              ) : (
                <div className="p-2 text-center text-xs text-slate-400">
                  Search results for &quot;{searchQuery}&quot; (simulated)
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
