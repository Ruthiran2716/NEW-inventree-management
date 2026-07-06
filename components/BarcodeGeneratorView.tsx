"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from './AppContext';
import { Product } from '../lib/db';
import { 
  ScanLine, 
  QrCode, 
  Search, 
  Printer, 
  CheckCircle,
  FileCheck,
  PackageCheck,
  AlertTriangle
} from 'lucide-react';

export default function BarcodeGeneratorView() {
  const { products, setProducts, logAction, showToast } = useApp();
  
  const [skuQuery, setSkuQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanQtyAdjust, setScanQtyAdjust] = useState(1);

  // Auto select product details
  const activeProduct = useMemo(() => {
    return products.find(p => p.id === selectedProductId);
  }, [products, selectedProductId]);

  // Simulate scanning action
  const handleSimulateScan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!skuQuery) {
      showToast("Enter a barcode or SKU code to scan.", "error");
      return;
    }

    const prod = products.find(p => p.sku === skuQuery.toUpperCase() || p.barcode === skuQuery);
    
    if (prod) {
      setScanResult(prod);
      showToast(`Scan Successful: ${prod.name} matched.`, "success");
    } else {
      setScanResult(null);
      showToast(`No item matches barcode &ldquo;${skuQuery}&rdquo;`, "error");
    }
  };

  const applyScanAdjust = (action: 'add' | 'remove') => {
    if (!scanResult) return;
    
    const delta = action === 'add' ? scanQtyAdjust : -scanQtyAdjust;
    const nextQty = scanResult.quantity + delta;

    if (nextQty < 0) {
      showToast("Inventory quantity cannot be negative.", "error");
      return;
    }

    setProducts(prev => prev.map(p => {
        if (p.id === scanResult.id) {
        const nextStatus: Product['status'] = nextQty === 0 ? 'Out of Stock' : nextQty <= p.minStock ? 'Low Stock' : 'In Stock';
        const updated: Product = { ...p, quantity: nextQty, status: nextStatus };
        setScanResult(updated); // Sync local display
        return updated;
      }
      return p;
    }));

    logAction("Barcode Adjust", `Scanned barcode ${scanResult.barcode} (${scanResult.sku}) and adjusted quantity by ${delta} Pcs`);
    showToast(`Inventory updated successfully! New qty: ${nextQty}`, "success");
  };

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Generator Box */}
        <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-5">
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide flex items-center gap-2">
              <QrCode size={18} className="text-primary" />
              Barcode &amp; QR Label Generator
            </h3>
            <p className="text-xs text-slate-400 mt-1">Generate ISO labels for physical bins and packaging.</p>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Select Product to Label</label>
              <select 
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
              >
                <option value="">Select item...</option>
                {products.map(p => (
                  <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                ))}
              </select>
            </div>

            {activeProduct ? (
              <div className="p-5 bg-white dark:bg-slate-950/40 rounded-2xl border border-card-border flex flex-col items-center gap-4 text-center animate-in fade-in duration-200">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{activeProduct.name}</span>
                
                {/* Barcode visual generator */}
                <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center">
                  {/* Mock Barcode Bars */}
                  <div className="flex items-end h-10 w-44 justify-between bg-white px-1">
                    {[1, 2, 4, 1, 2, 3, 1, 4, 2, 1, 3, 1, 2, 4, 1, 2, 3, 1].map((bar, i) => (
                      <span 
                        key={i} 
                        className="bg-black inline-block rounded-sm"
                        style={{ 
                          width: `${bar * 1.5}px`, 
                          height: i % 3 === 0 ? '100%' : '85%' 
                        }} 
                      />
                    ))}
                  </div>
                  <span className="font-mono text-[9px] text-black tracking-[0.25em]">{activeProduct.barcode}</span>
                </div>

                {/* QR Visual */}
                <div className="space-y-1 bg-white p-3 rounded-lg border border-slate-200 flex flex-col items-center">
                  {/* Mock QR SVG */}
                  <svg width="64" height="64" viewBox="0 0 64 64" fill="none" className="text-black">
                    <rect width="64" height="64" fill="white" />
                    <rect x="4" y="4" width="16" height="16" fill="black" />
                    <rect x="8" y="8" width="8" height="8" fill="white" />
                    <rect x="44" y="4" width="16" height="16" fill="black" />
                    <rect x="48" y="8" width="8" height="8" fill="white" />
                    <rect x="4" y="44" width="16" height="16" fill="black" />
                    <rect x="8" y="48" width="8" height="8" fill="white" />
                    
                    {/* Noise blocks */}
                    <rect x="24" y="8" width="4" height="8" fill="black" />
                    <rect x="32" y="4" width="8" height="4" fill="black" />
                    <rect x="28" y="20" width="8" height="12" fill="black" />
                    <rect x="16" y="28" width="8" height="4" fill="black" />
                    <rect x="44" y="24" width="12" height="8" fill="black" />
                    <rect x="36" y="40" width="16" height="16" fill="black" />
                    <rect x="24" y="48" width="8" height="8" fill="black" />
                  </svg>
                  <span className="font-mono text-[8px] text-black uppercase">{activeProduct.sku}</span>
                </div>

                <button 
                  onClick={() => {
                    window.print();
                    showToast("Sent print job to local spooler", "info");
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-card-border text-[11px] font-bold rounded-lg hover:bg-slate-200/50"
                >
                  <Printer size={12} /> Print Bin Label
                </button>
              </div>
            ) : (
              <div className="py-12 text-center text-xs text-slate-400">
                Choose a product above to generate live barcode prints
              </div>
            )}
          </div>
        </div>

        {/* Scanner Simulator */}
        <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-5">
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide flex items-center gap-2">
              <ScanLine size={18} className="text-secondary" />
              Barcode Scanning Simulator
            </h3>
            <p className="text-xs text-slate-400 mt-1">Simulate optical/laser hand scanners in warehouse operations.</p>
          </div>

          <form onSubmit={handleSimulateScan} className="flex gap-2">
            <input 
              type="text" 
              placeholder="Swipe barcode (e.g. 871239847120) or SKU..."
              value={skuQuery}
              onChange={(e) => setSkuQuery(e.target.value)}
              className="flex-1 p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
            />
            <button 
              type="submit"
              className="px-4 py-2.5 bg-secondary hover:bg-secondary/90 text-white rounded-xl text-xs font-bold transition shadow-md shadow-secondary/10"
            >
              Simulate Swipe
            </button>
          </form>

          {scanResult ? (
            <div className="p-4 bg-success/5 rounded-2xl border border-success/15 space-y-4 animate-in fade-in duration-200">
              <div className="flex justify-between items-start">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-success font-bold flex items-center gap-1">
                    <CheckCircle size={10} /> Scan Match Success
                  </span>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">{scanResult.name}</h4>
                  <span className="text-[9px] text-slate-400">SKU: {scanResult.sku} • Bin: {scanResult.bin}</span>
                </div>
                <span className="font-black text-xs text-slate-800 dark:text-slate-100">
                  Current Stock: {scanResult.quantity}
                </span>
              </div>

              {/* Adjust quantites directly from scanner screen */}
              <div className="flex items-center gap-3 border-t border-success/10 pt-3">
                <div className="flex items-center gap-1.5 flex-1">
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">Scan Qty:</span>
                  <input 
                    type="number" 
                    min={1}
                    value={scanQtyAdjust}
                    onChange={(e) => setScanQtyAdjust(Number(e.target.value))}
                    className="w-16 p-1.5 rounded bg-white dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  />
                </div>
                <div className="flex gap-1.5">
                  <button 
                    onClick={() => applyScanAdjust('remove')}
                    className="px-2.5 py-1.5 bg-danger/10 text-danger hover:bg-danger/20 rounded-lg text-[10px] font-bold transition"
                  >
                    Deduct Stock
                  </button>
                  <button 
                    onClick={() => applyScanAdjust('add')}
                    className="px-2.5 py-1.5 bg-success/10 text-success hover:bg-success/20 rounded-lg text-[10px] font-bold transition"
                  >
                    Add Stock
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 text-center text-xs text-slate-400 space-y-1">
              <p>Scan an item to load instant adjustments panel</p>
              <p className="text-[9px] text-slate-400/70">Example: Type &ldquo;871239847120&rdquo; (Drone) and click Simulate swipe</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
