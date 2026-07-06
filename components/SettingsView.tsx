"use client";

import React, { useState } from 'react';
import { useApp } from './AppContext';
import { 
  Building2, 
  Coins, 
  Settings2, 
  RotateCcw, 
  Save, 
  AlertTriangle,
  HardDriveUpload
} from 'lucide-react';

export default function SettingsView() {
  const { showToast, logAction } = useApp();
  
  const [company, setCompany] = useState({
    name: 'MrRobot Corp',
    taxId: 'TX-992183',
    currency: 'USD ($)',
    taxRate: 8, // percent
    alertLimit: 10
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    logAction("Update Settings", "Updated company profile config preferences.");
    showToast("Settings saved successfully.", "success");
  };

  const handleReset = () => {
    if (confirm("Warning: This will clear local storage and reset all inventory data. Proceed?")) {
      localStorage.clear();
      logAction("System Reset", "Wiped application state cache database.");
      showToast("App reset successfully. Reloading...", "info");
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    }
  };

  return (
    <div className="max-w-xl space-y-6">
      
      {/* Configuration Form */}
      <form onSubmit={handleSave} className="glass-panel p-6 rounded-2xl border border-card-border space-y-5">
        <div>
          <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide flex items-center gap-2">
            <Settings2 size={18} className="text-primary" />
            Enterprise Parameters Configuration
          </h3>
          <p className="text-xs text-slate-400 mt-1">Configure legal entities profile and default currencies.</p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5 col-span-2">
            <label className="text-xs font-semibold">Registered Company Name</label>
            <input 
              type="text" 
              value={company.name}
              onChange={(e) => setCompany(prev => ({ ...prev, name: e.target.value }))}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
            />
          </div>
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Taxes Identification Number (TIN)</label>
            <input 
              type="text" 
              value={company.taxId}
              onChange={(e) => setCompany(prev => ({ ...prev, taxId: e.target.value }))}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Reporting Currency</label>
            <select 
              value={company.currency}
              onChange={(e) => setCompany(prev => ({ ...prev, currency: e.target.value }))}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
            >
              <option value="USD ($)">USD ($) - US Dollar</option>
              <option value="EUR (€)">EUR (€) - Euro</option>
              <option value="GBP (£)">GBP (£) - British Pound</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Default VAT Rate (%)</label>
            <input 
              type="number" 
              value={company.taxRate}
              onChange={(e) => setCompany(prev => ({ ...prev, taxRate: Number(e.target.value) }))}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold">Low Stock Threshold Limit</label>
            <input 
              type="number" 
              value={company.alertLimit}
              onChange={(e) => setCompany(prev => ({ ...prev, alertLimit: Number(e.target.value) }))}
              className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-card-border/30 flex justify-end">
          <button 
            type="submit"
            className="px-4 py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5"
          >
            <Save size={14} /> Save Config Settings
          </button>
        </div>
      </form>

      {/* Danger Zone */}
      <div className="glass-panel p-6 rounded-2xl border border-danger/20 space-y-4">
        <div>
          <h3 className="font-black text-danger text-sm uppercase tracking-wide flex items-center gap-2">
            <AlertTriangle size={18} />
            System Maintenance Danger Zone
          </h3>
          <p className="text-xs text-slate-400 mt-1">Irreversible administrative actions.</p>
        </div>

        <div className="p-3.5 bg-danger/5 rounded-xl border border-danger/10 text-xs text-slate-500 leading-relaxed">
          Resetting database will delete all custom products, stock transfers, purchase orders, and supplier updates, reverting the system to default configurations.
        </div>

        <button 
          onClick={handleReset}
          className="px-4 py-2.5 bg-danger text-white hover:bg-danger/90 text-xs font-bold rounded-xl shadow-md shadow-danger/10 flex items-center gap-1.5"
        >
          <RotateCcw size={14} /> Wipe App Database Cache
        </button>
      </div>

    </div>
  );
}
