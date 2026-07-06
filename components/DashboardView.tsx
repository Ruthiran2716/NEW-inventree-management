"use client";

import React, { useMemo } from 'react';
import { useApp } from './AppContext';
import { 
  TrendingUp, 
  TrendingDown, 
  AlertOctagon, 
  AlertTriangle, 
  Layers, 
  Users, 
  Home, 
  DollarSign, 
  Activity,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  FileClock
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
  Cell,
  PieChart,
  Pie
} from 'recharts';

export default function DashboardView() {
  const { 
    products, 
    suppliers, 
    warehouses, 
    purchaseOrders, 
    activeRole, 
    logs,
    setActiveTab
  } = useApp();

  // Metrics computations
  const metrics = useMemo(() => {
    let totalValue = 0;
    let totalCostValue = 0;
    let outOfStock = 0;
    let lowStock = 0;
    let overStock = 0;
    
    products.forEach(p => {
      totalValue += p.price * p.quantity;
      totalCostValue += p.cost * p.quantity;
      if (p.quantity === 0) outOfStock++;
      else if (p.quantity <= p.minStock) lowStock++;
      else if (p.quantity >= p.maxStock) overStock++;
    });

    const pendingPOs = purchaseOrders.filter(po => po.status === 'Pending Approval');
    const totalPurchases = purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
    const approvedPOs = purchaseOrders.filter(po => po.status === 'Approved' || po.status === 'Received');
    
    // Inventory Health Score: % of items NOT out of stock or low stock
    const healthyItems = products.filter(p => p.quantity > p.minStock).length;
    const healthScore = products.length > 0 ? Math.round((healthyItems / products.length) * 100) : 100;

    return {
      inventoryValue: totalValue,
      inventoryCost: totalCostValue,
      outOfStock,
      lowStock,
      overStock,
      pendingPOsCount: pendingPOs.length,
      pendingPOsAmount: pendingPOs.reduce((sum, po) => sum + po.totalAmount, 0),
      totalPurchases,
      healthScore
    };
  }, [products, purchaseOrders]);

  // Recharts Chart Mock Data
  const trendData = [
    { name: 'Jan', Sales: 45000, Purchases: 38000 },
    { name: 'Feb', Sales: 52000, Purchases: 41000 },
    { name: 'Mar', Sales: 49000, Purchases: 45000 },
    { name: 'Apr', Sales: 63000, Purchases: 48000 },
    { name: 'May', Sales: 58000, Purchases: 52000 },
    { name: 'Jun', Sales: 71000, Purchases: 59000 },
    { name: 'Jul', Sales: 75000, Purchases: 62000 }
  ];

  // Warehouse Utilization Chart Data
  const warehouseData = useMemo(() => {
    return warehouses.map(wh => ({
      name: wh.name.split(' ')[0], // First name token
      Capacity: wh.capacity,
      Used: wh.usedCapacity,
      Utilization: Math.round((wh.usedCapacity / wh.capacity) * 100)
    }));
  }, [warehouses]);

  // Supplier rating distribution (for PieChart)
  const supplierRatingData = useMemo(() => {
    const excellent = suppliers.filter(s => s.rating >= 4.5).length;
    const good = suppliers.filter(s => s.rating >= 4.0 && s.rating < 4.5).length;
    const fair = suppliers.filter(s => s.rating < 4.0).length;
    
    return [
      { name: 'Excellent (4.5+)', value: excellent, color: '#14b8a6' },
      { name: 'Good (4.0-4.4)', value: good, color: '#2563eb' },
      { name: 'Under Review', value: fair, color: '#f59e0b' }
    ];
  }, [suppliers]);

  const recentApprovals = useMemo(() => {
    return purchaseOrders.filter(po => po.status === 'Pending Approval').slice(0, 3);
  }, [purchaseOrders]);

  const criticalStock = useMemo(() => {
    return products.filter(p => p.quantity <= p.minStock).slice(0, 3);
  }, [products]);

  return (
    <div className="space-y-6">
      
      {/* CEO Welcome Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 glass-panel rounded-2xl border border-card-border relative overflow-hidden">
        <div className="space-y-1 z-10">
          <div className="flex items-center gap-2">
            <span className="bg-primary/10 text-primary dark:bg-primary/20 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-wider uppercase">
              {activeRole} Dashboard
            </span>
            <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
          </div>
          <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
            Welcome back, Christian Logan
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs max-w-xl leading-relaxed">
            Enterprise procurement cycle is active. We detected {metrics.lowStock} low‑stock items and {metrics.pendingPOsCount} pending orders that require executive authorization.
          </p>
        </div>
        
        {/* Quick action actions */}
        <div className="flex gap-2.5 z-10">
          <button 
            onClick={() => setActiveTab('Purchase Orders')}
            className="px-4 py-2.5 bg-gradient-to-r from-primary to-primary-hover hover:shadow-lg hover:shadow-primary/20 text-white rounded-xl text-xs font-bold transition-all duration-200"
          >
            Authorize Purchase Orders
          </button>
          <button 
            onClick={() => setActiveTab('Stock Adjustment')}
            className="px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-bold border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 transition-all duration-200"
          >
            Adjust Stock
          </button>
        </div>
        
        {/* Glow circle overlay */}
        <div className="absolute right-0 top-0 w-48 h-48 bg-gradient-to-br from-primary/10 to-secondary/5 rounded-full filter blur-2xl -z-0 pointer-events-none" />
      </div>

      {/* Grid KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Inventory Value */}
        <div className="glass-panel p-5 rounded-2xl border border-card-border glow-card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Valuation</span>
            <div className="p-2 bg-primary/10 text-primary rounded-xl">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 leading-none block">
              ${(metrics.inventoryValue).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-slate-400 font-medium tracking-tight">
              Cost basis: ${(metrics.inventoryCost).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Procurement Spend */}
        <div className="glass-panel p-5 rounded-2xl border border-card-border glow-card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Procurement Cost</span>
            <div className="p-2 bg-secondary/10 text-secondary rounded-xl">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 leading-none block">
              ${(metrics.totalPurchases).toLocaleString()}
            </span>
            <span className="text-[10px] text-success font-semibold flex items-center gap-1">
              <TrendingUp size={10} /> +4.2% from last month
            </span>
          </div>
        </div>

        {/* Stock Alert states */}
        <div className="glass-panel p-5 rounded-2xl border border-card-border glow-card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Stock Alerts</span>
            <div className={`p-2 rounded-xl ${metrics.outOfStock > 0 ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'}`}>
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <div className="flex items-baseline gap-2">
              <span className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 leading-none block">
                {metrics.lowStock}
              </span>
              <span className="text-xs font-semibold text-danger">
                {metrics.outOfStock} critical
              </span>
            </div>
            <span className="text-[10px] text-slate-400 font-medium tracking-tight">
              Needs reorder dispatch
            </span>
          </div>
        </div>

        {/* Inventory Health Score */}
        <div className="glass-panel p-5 rounded-2xl border border-card-border glow-card-hover">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-bold text-slate-400 tracking-wider uppercase">Health Score</span>
            <div className="p-2 bg-accent/10 text-accent rounded-xl">
              <ShieldCheck size={16} />
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-xl md:text-2xl font-black text-slate-800 dark:text-slate-100 leading-none block">
              {metrics.healthScore}%
            </span>
            <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full overflow-hidden">
              <div 
                className="bg-accent h-full rounded-full transition-all duration-500" 
                style={{ width: `${metrics.healthScore}%` }}
              />
            </div>
          </div>
        </div>

      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Core Trend Area Chart */}
        <div className="lg:col-span-2 glass-panel p-5 rounded-2xl border border-card-border">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
                Purchase vs Sales Volume
              </h3>
              <p className="text-[11px] text-slate-400">Quarterly procurement ledger projection</p>
            </div>
            <span className="text-[10px] bg-slate-100 dark:bg-slate-800/80 px-2 py-1 rounded-md text-slate-500">
              Live Feed
            </span>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorPurchases" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--secondary)" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="var(--secondary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="Sales" stroke="var(--primary)" strokeWidth={2} fillOpacity={1} fill="url(#colorSales)" />
                <Area type="monotone" dataKey="Purchases" stroke="var(--secondary)" strokeWidth={2} fillOpacity={1} fill="url(#colorPurchases)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Warehouse Capacity bar chart */}
        <div className="glass-panel p-5 rounded-2xl border border-card-border">
          <div className="mb-5">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide">
              Warehouse Capacities
            </h3>
            <p className="text-[11px] text-slate-400">Total volume usage vs limits</p>
          </div>
          
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={warehouseData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.1)" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{ 
                    background: 'rgba(15, 23, 42, 0.9)', 
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '11px'
                  }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="Capacity" fill="#475569" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Used" fill="var(--primary)" radius={[4, 4, 0, 0]}>
                  {warehouseData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.Utilization > 75 ? 'var(--danger)' : 'var(--primary)'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Critical actions & logs section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Reorders & Approvals Action list */}
        <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-card-border/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <FileClock size={16} className="text-warning" />
              Awaiting Action items
            </h3>
            <span className="text-[10px] text-slate-400">Current queue</span>
          </div>

          <div className="space-y-3.5">
            {/* Low stock alerts */}
            {criticalStock.map((prod) => (
              <div key={prod.id} className="flex items-center justify-between p-3 rounded-xl bg-danger/5 border border-danger/10">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-danger animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      {prod.name}
                    </h4>
                    <p className="text-[10px] text-slate-400">SKU: {prod.sku} • Bin: {prod.bin}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-danger leading-tight block">
                    {prod.quantity} {prod.unit}
                  </span>
                  <span className="text-[9px] text-slate-400">Min: {prod.minStock}</span>
                </div>
              </div>
            ))}

            {/* Pending Approvals */}
            {recentApprovals.map((po) => (
              <div key={po.id} className="flex items-center justify-between p-3 rounded-xl bg-warning/5 border border-warning/10">
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-tight">
                      Order: {po.id}
                    </h4>
                    <p className="text-[10px] text-slate-400">Supplier: {po.supplierName}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold text-warning leading-tight block">
                    ${po.totalAmount.toLocaleString()}
                  </span>
                  <span className="text-[9px] text-slate-400">Req: Authorization</span>
                </div>
              </div>
            ))}
            
            {criticalStock.length === 0 && recentApprovals.length === 0 && (
              <div className="py-8 text-center text-xs text-slate-400 flex flex-col items-center gap-2">
                <CheckCircle size={24} className="text-success" />
                No pending actions. Systems stable.
              </div>
            )}
          </div>
        </div>

        {/* Recent logs audit trails */}
        <div className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-card-border/50">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 uppercase tracking-wide flex items-center gap-2">
              <Activity size={16} className="text-primary" />
              Enterprise Activity Feed
            </h3>
            <button 
              onClick={() => setActiveTab('Activity Logs')}
              className="text-[10px] text-primary dark:text-secondary hover:underline flex items-center gap-1 font-semibold"
            >
              View audit log <ArrowRight size={10} />
            </button>
          </div>

          <div className="space-y-4 overflow-y-auto max-h-[220px] pr-2 scrollbar-thin">
            {logs.slice(0, 5).map((log) => (
              <div key={log.id} className="flex gap-3 text-xs">
                <div className="flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-bold text-[9px] text-slate-500 border border-card-border">
                    {log.userRole[0]}
                  </div>
                  <div className="w-[1px] flex-1 bg-slate-200 dark:bg-slate-800 mt-2" />
                </div>
                <div className="space-y-0.5 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200">{log.userName}</span>
                    <span className="text-[10px] text-slate-400">({log.userRole})</span>
                    <span className="text-[9px] text-slate-400">• {new Date(log.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    <span className="font-bold text-primary mr-1 bg-primary/5 dark:bg-primary/10 px-1.5 py-0.5 rounded-md text-[9px]">
                      {log.action}
                    </span>
                    {log.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
}
