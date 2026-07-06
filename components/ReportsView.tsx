"use client";

import React, { useMemo } from 'react';
import { useApp } from './AppContext';
import { 
  FileText, 
  Download, 
  Printer, 
  TrendingUp, 
  DollarSign, 
  Archive, 
  CheckCircle,
  Clock
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export default function ReportsView() {
  const { products, purchaseOrders, suppliers, showToast } = useApp();

  // Valuation summary
  const valuation = useMemo(() => {
    let totalItems = 0;
    let totalCostVal = 0;
    let totalRetailVal = 0;

    products.forEach(p => {
      totalItems += p.quantity;
      totalCostVal += p.cost * p.quantity;
      totalRetailVal += p.price * p.quantity;
    });

    return {
      totalItems,
      cost: totalCostVal,
      retail: totalRetailVal,
      margin: totalRetailVal - totalCostVal
    };
  }, [products]);

  // Aging Stock simulation
  const agingStock = useMemo(() => {
    return products.map((p, idx) => {
      let days = 15;
      if (idx === 1) days = 45;
      else if (idx === 2) days = 95;
      else if (idx === 3) days = 120;
      else if (idx === 4) days = 180;

      return {
        ...p,
        daysInStorage: days,
        risk: days > 90 ? 'High' : days > 30 ? 'Medium' : 'Low'
      };
    });
  }, [products]);

  // Pie chart categories distribution
  const categoryData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    products.forEach(p => {
      counts[p.category] = (counts[p.category] || 0) + (p.cost * p.quantity);
    });

    const colors = ['#2563eb', '#06b6d4', '#14b8a6', '#f59e0b', '#ef4444'];
    return Object.keys(counts).map((cat, i) => ({
      name: cat,
      value: counts[cat],
      color: colors[i % colors.length]
    }));
  }, [products]);

  const handleExport = (format: 'CSV' | 'PDF' | 'Excel') => {
    showToast(`Generating ${format} file...`, "info");
    setTimeout(() => {
      if (format === 'PDF') {
        window.print();
      } else {
        // Mock download
        const link = document.createElement("a");
        link.href = "#";
        link.setAttribute("download", `mrrobot_inventory_valuation.${format.toLowerCase()}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast(`${format} export downloaded successfully.`, "success");
      }
    }, 1500);
  };

  return (
    <div className="space-y-6">
      
      {/* Top action header */}
      <div className="glass-panel p-5 rounded-2xl border border-card-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="font-black text-slate-800 dark:text-slate-100 text-sm uppercase tracking-wide">
            Enterprise Financial Valuation
          </h3>
          <p className="text-xs text-slate-400">Inventory assets reporting &amp; stock aging audits</p>
        </div>

        <div className="flex gap-2.5">
          <button 
            onClick={() => handleExport('CSV')}
            className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-card-border text-xs font-bold rounded-xl hover:bg-slate-200/50 flex items-center gap-1.5"
          >
            <Download size={14} /> Export CSV
          </button>
          <button 
            onClick={() => handleExport('PDF')}
            className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-md shadow-primary/10 flex items-center gap-1.5"
          >
            <Printer size={14} /> Print PDF Report
          </button>
        </div>
      </div>

      {/* Grid Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        <div className="glass-panel p-4 rounded-xl border border-card-border">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">FIFO Asset Value</span>
          <span className="text-xl font-black block mt-1 text-slate-800 dark:text-slate-200">${valuation.cost.toLocaleString()}</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-card-border">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Retail Value</span>
          <span className="text-xl font-black block mt-1">${valuation.retail.toLocaleString()}</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-card-border">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Projected Margin</span>
          <span className="text-xl font-black block mt-1 text-success">${valuation.margin.toLocaleString()}</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-card-border">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Total Binned Units</span>
          <span className="text-xl font-black block mt-1">{valuation.totalItems} Units</span>
        </div>

      </div>

      {/* Categories Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
          <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider">
            Asset Allocations By Category
          </h4>
          
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Legend wrapperStyle={{ fontSize: '10px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stock Aging Risk Profile list */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-card-border space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-card-border/50">
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wider flex items-center gap-1.5">
              <Clock size={14} className="text-warning" />
              Stock Aging Audit &amp; Risk profiles
            </h4>
            <span className="text-[10px] text-slate-400">Aging Threshold: 90 days</span>
          </div>

          <div className="space-y-3">
            {agingStock.map((prod) => (
              <div 
                key={prod.id} 
                className={`p-3 rounded-xl border flex items-center justify-between text-xs ${
                  prod.risk === 'High' ? 'bg-danger/5 border-danger/10' :
                  prod.risk === 'Medium' ? 'bg-warning/5 border-warning/10' : 'bg-success/5 border-success/10'
                }`}
              >
                <div>
                  <h5 className="font-bold text-slate-800 dark:text-slate-100">{prod.name}</h5>
                  <p className="text-[10px] text-slate-400">SKU: {prod.sku} • Cost basis: ${prod.cost}</p>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase inline-block ${
                    prod.risk === 'High' ? 'bg-danger/15 text-danger' :
                    prod.risk === 'Medium' ? 'bg-warning/15 text-warning' : 'bg-success/15 text-success'
                  }`}>
                    {prod.daysInStorage} Days Stored
                  </span>
                  <span className="block text-[9px] text-slate-400 mt-1">Holding Cost multiplier active</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
