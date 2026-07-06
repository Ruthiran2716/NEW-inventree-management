"use client";

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { 
  LayoutDashboard, 
  Package, 
  Truck, 
  Warehouse, 
  BarChart3, 
  FileText, 
  Settings, 
  User, 
  ChevronDown, 
  ChevronRight, 
  Menu,
  ChevronLeft,
  Activity,
  Layers,
  ArrowLeftRight,
  Sliders,
  QrCode,
  FileCheck,
  FileQuestion,
  Receipt,
  RotateCcw
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (b: boolean) => void;
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const { activeTab, setActiveTab } = useApp();
  const [expandedMenus, setExpandedMenus] = useState<{ [key: string]: boolean }>({
    Inventory: true,
    Procurement: true
  });

  const toggleMenu = (name: string) => {
    setExpandedMenus(prev => ({ ...prev, [name]: !prev[name] }));
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard },
    {
      name: 'Inventory',
      icon: Package,
      subItems: [
        { name: 'Products', label: 'Products' },
        { name: 'Categories', label: 'Categories' },
        { name: 'Warehouses', label: 'Warehouses' },
        { name: 'Stock Transfer', label: 'Stock Transfer' },
        { name: 'Stock Adjustment', label: 'Stock Adjust' },
        { name: 'Barcode Generator', label: 'Barcode System' }
      ]
    },
    {
      name: 'Procurement',
      icon: Truck,
      subItems: [
        { name: 'Purchase Requests', label: 'Requisitions' },
        { name: 'RFQs', label: 'RFQs' },
        { name: 'Quotations', label: 'Quotations' },
        { name: 'Purchase Orders', label: 'Orders' },
        { name: 'Goods Receipts', label: 'Goods Receipts' },
        { name: 'Invoices', label: 'Invoices' },
        { name: 'Payments', label: 'Payments' },
        { name: 'Returns', label: 'Returns' }
      ]
    },
    { name: 'Suppliers', icon: User },
    { name: 'Warehouse Map', icon: Warehouse },
    { name: 'Reports', icon: FileText },
    { name: 'Activity Logs', icon: Activity },
    { name: 'Settings', icon: Settings }
  ];

  return (
    <aside 
      className={`glass-panel border-r border-card-border h-screen sticky top-0 flex flex-col transition-all duration-300 z-30 ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-card-border/50">
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Logo: Geometric robot head inside warehouse box */}
          <div className="relative w-10 h-10 flex-shrink-0 flex items-center justify-center bg-gradient-to-br from-primary to-secondary rounded-lg shadow-lg shadow-primary/20">
            <svg 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              className="text-white drop-shadow-[0_2px_5px_rgba(255,255,255,0.3)]"
            >
              {/* Box container */}
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="1.5" />
              {/* Internal robot outline */}
              <path d="M7 9h10v8H7z" strokeWidth="1.5" fill="rgba(255,255,255,0.1)" />
              {/* Laser scanner eyes */}
              <circle cx="9.5" cy="12.5" r="1.5" fill="#06B6D4" stroke="none" />
              <circle cx="14.5" cy="12.5" r="1.5" fill="#06B6D4" stroke="none" />
              <line x1="8" y1="12.5" x2="16" y2="12.5" stroke="#ef4444" strokeWidth="1" className="animate-pulse" />
              {/* Barcode mouth */}
              <path d="M9 15.5h6" strokeWidth="1.5" />
              <line x1="10" y1="14.5" x2="10" y2="15.5" strokeWidth="1" />
              <line x1="12" y1="14.5" x2="12" y2="15.5" strokeWidth="1" />
              <line x1="14" y1="14.5" x2="14" y2="15.5" strokeWidth="1" />
            </svg>
            {/* Soft pulsing light */}
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-accent rounded-full animate-ping" />
          </div>

          {!collapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-primary via-secondary to-accent tracking-wider leading-none text-lg">
                MrRobot
              </span>
              <span className="text-[10px] text-slate-400 font-medium tracking-tight mt-0.5">
                V1.0 ENTERPRISE
              </span>
            </div>
          )}
        </div>

        <button 
          onClick={() => setCollapsed(!collapsed)}
          className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 select-none scrollbar-thin">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const hasSubItems = !!item.subItems;
          const isExpanded = expandedMenus[item.name];

          if (!hasSubItems) {
            const isActive = activeTab === item.name;
            return (
              <button
                key={item.name}
                onClick={() => setActiveTab(item.name)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 text-sm font-medium ${
                  isActive 
                    ? 'bg-primary text-white shadow-lg shadow-primary/25 border border-primary/20' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                {!collapsed && <span>{item.name}</span>}
              </button>
            );
          }

          return (
            <div key={item.name} className="space-y-1">
              <button
                onClick={() => !collapsed && toggleMenu(item.name)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  activeTab.startsWith(item.name) 
                    ? 'text-primary bg-primary/5 dark:bg-primary/10 border border-primary/10' 
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100/70 dark:hover:bg-slate-800/50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon size={18} className={activeTab.startsWith(item.name) ? 'text-primary' : 'text-slate-400'} />
                  {!collapsed && <span>{item.name}</span>}
                </div>
                {!collapsed && (
                  isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />
                )}
              </button>

              {/* Sub items collapsible menu */}
              {!collapsed && isExpanded && (
                <div className="pl-9 space-y-1 border-l border-slate-200 dark:border-slate-800 ml-5 mt-1">
                  {item.subItems?.map((sub) => {
                    const isSubActive = activeTab === sub.name;
                    return (
                      <button
                        key={sub.name}
                        onClick={() => setActiveTab(sub.name)}
                        className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all duration-150 ${
                          isSubActive
                            ? 'text-primary font-semibold bg-primary/5 dark:bg-primary/15'
                            : 'text-slate-400 hover:text-slate-800 dark:text-slate-500 dark:hover:text-slate-200'
                        }`}
                      >
                        {sub.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </nav>

      {/* Sidebar Footer info */}
      {!collapsed && (
        <div className="p-4 border-t border-card-border/50 bg-slate-50/50 dark:bg-slate-950/20 text-center rounded-b-xl">
          <div className="flex items-center justify-center gap-1.5 text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
            Systems Operational
          </div>
        </div>
      )}
    </aside>
  );
}
