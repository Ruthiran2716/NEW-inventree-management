"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from './AppContext';
import { Search, Clock, FileText } from 'lucide-react';

export default function ActivityLogsView() {
  const { logs } = useApp();
  const [query, setQuery] = useState('');

  const filteredLogs = useMemo(() => {
    return logs.filter(l => 
      l.action.toLowerCase().includes(query.toLowerCase()) ||
      l.details.toLowerCase().includes(query.toLowerCase()) ||
      l.userName.toLowerCase().includes(query.toLowerCase())
    );
  }, [logs, query]);

  return (
    <div className="space-y-4">
      
      {/* Filters Header */}
      <div className="flex justify-between items-center gap-4">
        <div className="relative w-full md:w-72">
          <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search audit trail logs..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-card-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
          />
        </div>
        
        <span className="text-xs text-slate-400 hidden sm:inline-block">
          Showing {filteredLogs.length} audit records
        </span>
      </div>

      {/* Logs timeline layout */}
      <div className="glass-panel p-5 rounded-2xl border border-card-border">
        <div className="space-y-6">
          {filteredLogs.map((log) => (
            <div key={log.id} className="flex gap-4 text-xs">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-card-border font-bold text-slate-500">
                  {log.userRole[0]}
                </div>
                <div className="w-[1px] flex-1 bg-slate-200 dark:bg-slate-800 mt-2" />
              </div>

              <div className="space-y-1 pb-4 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800 dark:text-slate-200">{log.userName}</span>
                  <span className="text-[10px] text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">
                    {log.userRole}
                  </span>
                  <span className="text-[9px] text-slate-400 flex items-center gap-1 ml-auto">
                    <Clock size={10} /> {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-start gap-2 pt-1">
                  <span className="px-2 py-0.5 rounded bg-primary/10 text-primary text-[9px] font-black uppercase tracking-wider">
                    {log.action}
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed flex-1">
                    {log.details}
                  </p>
                </div>
              </div>
            </div>
          ))}
          {filteredLogs.length === 0 && (
            <div className="py-12 text-center text-slate-400 text-xs">
              No audit logs matched query terms
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
