"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from './AppContext';
import { Warehouse, Product } from '../lib/db';
import { 
  Warehouse as WhIcon, 
  Map, 
  Layers, 
  ChevronRight, 
  Box, 
  Check, 
  Info,
  Maximize2
} from 'lucide-react';

export default function WarehouseMapView() {
  const { warehouses, products } = useApp();
  const [selectedWhId, setSelectedWhId] = useState('wh-1');
  const [selectedBin, setSelectedBin] = useState<{ zone: string; rack: string; binName: string } | null>(null);

  const activeWh = useMemo(() => {
    return warehouses.find(w => w.id === selectedWhId) || warehouses[0];
  }, [warehouses, selectedWhId]);

  const binDetail = useMemo(() => {
    if (!selectedBin) return null;
    
    // Find if any product is placed in this warehouse zone/rack/bin
    const prod = products.find(p => 
      p.warehouseId === selectedWhId && 
      p.zone === selectedBin.zone && 
      p.rack === selectedBin.rack && 
      p.bin === selectedBin.binName
    );

    return prod || null;
  }, [selectedBin, products, selectedWhId]);

  return (
    <div className="space-y-6">
      
      {/* Top Selector Panel */}
      <div className="glass-panel p-5 rounded-2xl border border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-primary/10 text-primary rounded-xl">
            <WhIcon size={20} />
          </div>
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">
              Warehouse Map Visualization
            </h3>
            <p className="text-xs text-slate-400">Click Bins to inspect stock batch details and rack mappings</p>
          </div>
        </div>

        <select 
          value={selectedWhId}
          onChange={(e) => {
            setSelectedWhId(e.target.value);
            setSelectedBin(null);
          }}
          className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
        >
          {warehouses.map(wh => (
            <option key={wh.id} value={wh.id}>{wh.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Visual Map Layout */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-card-border space-y-6">
          <div className="flex justify-between items-center border-b border-card-border/30 pb-3">
            <span className="text-xs font-bold text-slate-400 tracking-wider uppercase flex items-center gap-1.5">
              <Map size={14} className="text-primary" />
              Depot Floor Map: {activeWh.name.split(' ')[0]}
            </span>
            <div className="flex items-center gap-3 text-[10px]">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-primary" /> Allocated</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-slate-100 dark:bg-slate-800 border border-dashed border-card-border" /> Empty Slot</span>
            </div>
          </div>

          <div className="space-y-6">
            {activeWh.zones.map((zone) => (
              <div key={zone.name} className="space-y-3">
                <h4 className="text-xs font-bold text-primary tracking-wider uppercase border-l-2 border-primary pl-2">
                  {zone.name} Layout
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {zone.racks.map((rack) => (
                    <div key={rack.name} className="p-4 bg-slate-50/50 dark:bg-slate-900/30 rounded-xl border border-card-border/50 space-y-3">
                      <span className="text-[10px] font-bold text-slate-400 tracking-wide block">
                        {rack.name}
                      </span>

                      {/* Bins Grid */}
                      <div className="grid grid-cols-3 gap-2">
                        {rack.bins.map((bin) => {
                          const isAllocated = products.some(p => 
                            p.warehouseId === selectedWhId && 
                            p.zone === zone.name && 
                            p.rack === rack.name && 
                            p.bin === bin.name &&
                            p.quantity > 0
                          );

                          const isSelected = selectedBin?.zone === zone.name && 
                                            selectedBin?.rack === rack.name && 
                                            selectedBin?.binName === bin.name;

                          return (
                            <button
                              key={bin.name}
                              onClick={() => setSelectedBin({ zone: zone.name, rack: rack.name, binName: bin.name })}
                              className={`p-2.5 rounded-lg border text-center transition-all duration-150 relative ${
                                isSelected ? 'border-primary ring-2 ring-primary/20 bg-primary/5' : 
                                isAllocated 
                                  ? 'border-primary/20 bg-primary/10 hover:bg-primary/15 text-primary font-bold' 
                                  : 'border-slate-200 dark:border-slate-800 border-dashed hover:border-slate-400 text-slate-400'
                              }`}
                            >
                              <span className="text-[10px] block leading-none">{bin.name.split(' ')[1]}</span>
                              <span className="text-[8px] text-slate-400 font-normal mt-0.5 block">
                                {isAllocated ? 'STK' : 'EMP'}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bin Inspection Panel */}
        <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
          <div className="border-b border-card-border/30 pb-3">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-1.5">
              <Layers size={14} className="text-secondary" />
              Bin Inspector
            </h4>
            <p className="text-[10px] text-slate-400">Detailed slots inspection status</p>
          </div>

          {selectedBin ? (
            <div className="space-y-4 animate-in fade-in duration-200">
              
              {/* Coordinates Card */}
              <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-card-border/40 text-xs space-y-1">
                <span className="text-slate-400 block text-[10px] uppercase font-bold tracking-wider">Coordinates</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {selectedBin.zone} • {selectedBin.rack} • {selectedBin.binName}
                </span>
              </div>

              {/* Stored product summary */}
              {binDetail ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Stored Product</span>
                    <h5 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                      {binDetail.name}
                    </h5>
                    <p className="text-[10px] text-slate-400">SKU: {binDetail.sku} • Brand: {binDetail.brand}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-xs pt-2 border-t border-card-border/30">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Stock Level</span>
                      <span className="font-bold text-slate-800 dark:text-slate-100">
                        {binDetail.quantity} {binDetail.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Item Status</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        binDetail.status === 'In Stock' ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
                      }`}>
                        {binDetail.status}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs pt-2 border-t border-card-border/30">
                    {binDetail.batchNumber && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Batch Code:</span>
                        <span className="font-mono font-semibold">{binDetail.batchNumber}</span>
                      </div>
                    )}
                    {binDetail.expiryDate && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Expiry Date:</span>
                        <span className="font-mono font-semibold text-danger">{binDetail.expiryDate}</span>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-xs text-slate-400 space-y-2">
                  <Box size={24} className="mx-auto text-slate-300 dark:text-slate-700" />
                  <p>Slot is currently empty.</p>
                  <p className="text-[10px] text-slate-500">Available to allocate raw materials or finished products.</p>
                </div>
              )}
            </div>
          ) : (
            <div className="py-16 text-center text-xs text-slate-400 space-y-2">
              <Info size={24} className="mx-auto text-slate-300 dark:text-slate-700" />
              <p>Select a bin in the warehouse floor map to inspect details.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
