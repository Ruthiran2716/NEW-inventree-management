"use client";

import React, { useState } from 'react';
import { AppProvider, useApp } from '../components/AppContext';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardView from '../components/DashboardView';
import InventoryView from '../components/InventoryView';
import ProcurementView from '../components/ProcurementView';
import SuppliersView from '../components/SuppliersView';
import WarehouseMapView from '../components/WarehouseMapView';
import BarcodeGeneratorView from '../components/BarcodeGeneratorView';
import ReportsView from '../components/ReportsView';
import ActivityLogsView from '../components/ActivityLogsView';
import SettingsView from '../components/SettingsView';
import { AnimatePresence, motion } from 'framer-motion';
import { X, CheckCircle, Info, AlertTriangle } from 'lucide-react';

function DashboardContent() {
  const { activeTab, toasts, removeToast } = useApp();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // Router dispatcher mapping active page view
  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView />;
      case 'Products':
      case 'Categories':
      case 'Warehouses':
      case 'Stock Transfer':
      case 'Stock Adjustment':
        return <InventoryView />;
      case 'Purchase Requests':
      case 'RFQs':
      case 'Quotations':
      case 'Purchase Orders':
      case 'Goods Receipts':
      case 'Invoices':
      case 'Payments':
      case 'Returns':
        return <ProcurementView />;
      case 'Suppliers':
        return <SuppliersView />;
      case 'Warehouse Map':
        return <WarehouseMapView />;
      case 'Barcode Generator':
        return <BarcodeGeneratorView />;
      case 'Reports':
        return <ReportsView />;
      case 'Activity Logs':
        return <ActivityLogsView />;
      case 'Settings':
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* Background Animated Meshes */}
      <div className="mesh-bg">
        <div className="mesh-circle-1" />
        <div className="mesh-circle-2" />
        <div className="mesh-circle-3" />
      </div>

      {/* Sidebar navigation */}
      <Sidebar collapsed={sidebarCollapsed} setCollapsed={setSidebarCollapsed} />

      {/* Main View Area */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Sticky Header */}
        <Header />

        {/* Scrollable View Content wrapper */}
        <main className="flex-1 p-6 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>

      </div>

      {/* Notifications Toasts stack */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3.5 max-w-sm w-full select-none pointer-events-none">
        <AnimatePresence>
          {toasts.map((toast) => (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className="pointer-events-auto"
            >
              <div className="glass-panel border-card-border p-4 rounded-2xl shadow-2xl flex items-start gap-3 relative overflow-hidden">
                {toast.type === 'success' && <CheckCircle className="text-success mt-0.5" size={16} />}
                {toast.type === 'info' && <Info className="text-primary mt-0.5" size={16} />}
                {toast.type === 'error' && <AlertTriangle className="text-danger mt-0.5" size={16} />}
                
                <div className="flex-1 text-xs font-semibold leading-relaxed pr-3 text-slate-800 dark:text-slate-200">
                  {toast.message}
                </div>
                
                <button 
                  onClick={() => removeToast(toast.id)}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-lg transition"
                >
                  <X size={12} />
                </button>
                
                {/* Visual loading ticker bar at bottom */}
                <div className={`absolute bottom-0 left-0 h-1 bg-gradient-to-r ${
                  toast.type === 'success' ? 'from-success to-emerald-400' :
                  toast.type === 'error' ? 'from-danger to-rose-400' : 'from-primary to-secondary'
                } w-full animate-[pulse_3.5s_infinite]`} style={{ animationDuration: '3.8s' }} />
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

    </div>
  );
}

export default function Home() {
  return (
    <AppProvider>
      <DashboardContent />
    </AppProvider>
  );
}
