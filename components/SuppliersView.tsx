"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from './AppContext';
import { Supplier } from '../lib/db';
import { 
  Plus, 
  Search, 
  Trash2, 
  Star, 
  Mail, 
  Phone, 
  ShieldAlert, 
  TrendingUp, 
  Award,
  CheckCircle,
  X
} from 'lucide-react';

export default function SuppliersView() {
  const { suppliers, setSuppliers, logAction, showToast } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newSupplier, setNewSupplier] = useState({
    name: '', email: '', phone: '', rating: 4.5, leadTime: 7, paymentTerms: 'Net 30'
  });

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [suppliers, searchTerm]);

  // Aggregate stats
  const stats = useMemo(() => {
    const total = suppliers.length;
    const avgRating = suppliers.reduce((sum, s) => sum + s.rating, 0) / total;
    const avgLead = suppliers.reduce((sum, s) => sum + s.leadTime, 0) / total;
    const totalSpend = suppliers.reduce((sum, s) => sum + s.spendAmount, 0);
    return {
      total,
      rating: avgRating.toFixed(1),
      leadTime: Math.round(avgLead),
      spend: totalSpend
    };
  }, [suppliers]);

  const handleAddSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSupplier.name || !newSupplier.email) {
      showToast("Supplier name and email are required.", "error");
      return;
    }

    const sup: Supplier = {
      id: `sup-${Date.now()}`,
      name: newSupplier.name,
      email: newSupplier.email,
      phone: newSupplier.phone || '+1 (555) 000-0000',
      rating: Number(newSupplier.rating),
      leadTime: Number(newSupplier.leadTime),
      paymentTerms: newSupplier.paymentTerms,
      status: 'Active',
      ordersCount: 0,
      spendAmount: 0,
      qualityScore: 100,
      deliveryPerformance: 100,
      activeContracts: 0
    };

    setSuppliers(prev => [...prev, sup]);
    logAction("Add Supplier", `Registered new supplier partner ${sup.name}`);
    showToast(`Supplier ${sup.name} registered.`, "success");
    setIsAddModalOpen(false);
    setNewSupplier({ name: '', email: '', phone: '', rating: 4.5, leadTime: 7, paymentTerms: 'Net 30' });
  };

  const deleteSupplier = (id: string, name: string) => {
    if (confirm(`Remove ${name} from partner directories?`)) {
      setSuppliers(prev => prev.filter(s => s.id !== id));
      logAction("Delete Supplier", `Removed supplier ${name}`);
      showToast(`Supplier ${name} deleted.`, "info");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 rounded-xl border border-card-border">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Suppliers</span>
          <span className="text-xl font-black block mt-1">{stats.total} Partners</span>
        </div>
        
        <div className="glass-panel p-4 rounded-xl border border-card-border">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Rating</span>
          <span className="text-xl font-black block mt-1 flex items-center gap-1">
            <Star size={16} fill="var(--warning)" stroke="none" /> {stats.rating} / 5.0
          </span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-card-border">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Avg Lead Time</span>
          <span className="text-xl font-black block mt-1">{stats.leadTime} Days</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-card-border">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Procurement Outflow</span>
          <span className="text-xl font-black block mt-1 text-primary">${stats.spend.toLocaleString()}</span>
        </div>

      </div>

      {/* Main Panel */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          
          <div className="relative w-full md:w-72">
            <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search partner directory..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-card-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
            />
          </div>

          <button 
            onClick={() => setIsAddModalOpen(true)}
            className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition shadow-md shadow-primary/10"
          >
            <Plus size={16} /> Register Supplier
          </button>
        </div>

        {/* Suppliers Cards Layout */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSuppliers.map((sup) => (
            <div key={sup.id} className="glass-panel p-5 rounded-2xl border border-card-border space-y-4 glow-card-hover flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <h4 className="font-black text-slate-800 dark:text-slate-100 text-sm">{sup.name}</h4>
                    <span className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 px-2 py-0.5 rounded font-mono">
                      ID: {sup.id}
                    </span>
                  </div>
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                    sup.status === 'Active' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                  }`}>
                    {sup.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-4 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Mail size={12} />
                    <span className="truncate">{sup.email}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Phone size={12} />
                    <span>{sup.phone}</span>
                  </div>
                </div>

                {/* Scorecards */}
                <div className="mt-4 pt-3 border-t border-card-border/30 grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] block">Lead Time</span>
                    <span className="font-bold">{sup.leadTime} Days</span>
                  </div>
                  <div className="space-y-0.5 border-x border-card-border/30">
                    <span className="text-slate-400 text-[10px] block">Quality score</span>
                    <span className={`font-bold ${sup.qualityScore >= 95 ? 'text-success' : 'text-warning'}`}>{sup.qualityScore}%</span>
                  </div>
                  <div className="space-y-0.5">
                    <span className="text-slate-400 text-[10px] block">Otd rating</span>
                    <span className="font-bold text-primary">{sup.deliveryPerformance}%</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-card-border/30 flex justify-between items-center">
                <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                  <Star size={12} fill="var(--warning)" stroke="none" />
                  <span>Rating: {sup.rating}</span>
                  <span className="mx-1">•</span>
                  <span>{sup.ordersCount} purchase orders</span>
                </div>
                
                <button 
                  onClick={() => deleteSupplier(sup.id, sup.name)}
                  className="p-1 rounded-lg text-danger hover:bg-danger/5 transition"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* REGISTER MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-card-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-card-border/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-black text-sm uppercase tracking-wider">Register Supplier Partner</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleAddSupplier} className="p-6 space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Company Name *</label>
                <input 
                  type="text" 
                  required
                  value={newSupplier.name}
                  onChange={(e) => setNewSupplier(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  placeholder="e.g. Apex Inc."
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Company Email *</label>
                  <input 
                    type="email" 
                    required
                    value={newSupplier.email}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                    placeholder="sales@apex.com"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Contact Phone</label>
                  <input 
                    type="text" 
                    value={newSupplier.phone}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, phone: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                    placeholder="+1 (555) 123-4567"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Initial Rating</label>
                  <input 
                    type="number" 
                    step="0.1" 
                    min="1" 
                    max="5"
                    value={newSupplier.rating}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, rating: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Lead Time (days)</label>
                  <input 
                    type="number" 
                    value={newSupplier.leadTime}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, leadTime: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Payment Terms</label>
                  <select 
                    value={newSupplier.paymentTerms}
                    onChange={(e) => setNewSupplier(prev => ({ ...prev, paymentTerms: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  >
                    <option value="Immediate">Immediate</option>
                    <option value="Net 15">Net 15</option>
                    <option value="Net 30">Net 30</option>
                    <option value="Net 60">Net 60</option>
                  </select>
                </div>
              </div>

              <div className="pt-4 border-t border-card-border/50 flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10"
                >
                  Register Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
