"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from './AppContext';
import { Product, db } from '../lib/db';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Check, 
  X, 
  ArrowLeftRight, 
  SlidersHorizontal,
  FolderPlus,
  QrCode,
  Tag,
  Warehouse,
  History
} from 'lucide-react';

export default function InventoryView() {
  const { 
    products, 
    setProducts, 
    warehouses, 
    setWarehouses,
    logAction, 
    showToast 
  } = useApp();

  const [invSubTab, setInvSubTab] = useState<'Products' | 'Categories' | 'Warehouses' | 'Stock Transfer' | 'Stock Adjustment'>('Products');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  
  // Add Product Form State
  const [newProduct, setNewProduct] = useState({
    name: '', sku: '', barcode: '', category: 'Robotics', brand: '', 
    unit: 'Pcs', price: 0, cost: 0, quantity: 1, minStock: 5, maxStock: 100,
    warehouseId: 'wh-1', zone: 'Zone A', rack: 'Rack 01', bin: 'Bin 01',
    batchNumber: '', expiryDate: ''
  });

  // Adjust Product State
  const [adjustTarget, setAdjustTarget] = useState<Product | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustReason, setAdjustReason] = useState('Cycle Count');

  // Transfer State
  const [transferState, setTransferState] = useState({
    productId: '',
    fromWarehouseId: 'wh-1',
    toWarehouseId: 'wh-2',
    qty: 1
  });

  // Categories list
  const categories = useMemo(() => {
    const list = new Set(products.map(p => p.category));
    return ['All', ...Array.from(list)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.sku.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.barcode.includes(searchTerm);
      const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
      return matchSearch && matchCat;
    });
  }, [products, searchTerm, selectedCategory]);

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.sku) {
      showToast("Product name and SKU are required.", "error");
      return;
    }

    const prod: Product = {
      id: `prod-${Date.now()}`,
      name: newProduct.name,
      sku: newProduct.sku.toUpperCase(),
      barcode: newProduct.barcode || String(Math.floor(100000000000 + Math.random() * 900000000000)),
      category: newProduct.category,
      brand: newProduct.brand || 'Generic',
      unit: newProduct.unit,
      price: Number(newProduct.price),
      cost: Number(newProduct.cost),
      quantity: Number(newProduct.quantity),
      minStock: Number(newProduct.minStock),
      maxStock: Number(newProduct.maxStock),
      warehouseId: newProduct.warehouseId,
      zone: newProduct.zone,
      rack: newProduct.rack,
      bin: newProduct.bin,
      batchNumber: newProduct.batchNumber || undefined,
      expiryDate: newProduct.expiryDate || undefined,
      status: Number(newProduct.quantity) === 0 ? 'Out of Stock' : Number(newProduct.quantity) <= Number(newProduct.minStock) ? 'Low Stock' : 'In Stock'
    };

    setProducts(prev => [...prev, prod]);
    logAction("Add Product", `Created new product ${prod.name} (SKU: ${prod.sku})`);
    showToast(`Product ${prod.name} successfully registered.`, "success");
    setIsAddModalOpen(false);
    // Reset form
    setNewProduct({
      name: '', sku: '', barcode: '', category: 'Robotics', brand: '', 
      unit: 'Pcs', price: 0, cost: 0, quantity: 1, minStock: 5, maxStock: 100,
      warehouseId: 'wh-1', zone: 'Zone A', rack: 'Rack 01', bin: 'Bin 01',
      batchNumber: '', expiryDate: ''
    });
  };

  const handleAdjustStock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustTarget) return;

    const currentQty = adjustTarget.quantity;
    const finalQty = currentQty + Number(adjustQty);

    if (finalQty < 0) {
      showToast("Resulting stock level cannot be negative.", "error");
      return;
    }

    setProducts(prev => prev.map(p => {
      if (p.id === adjustTarget.id) {
        const nextStatus: Product['status'] = finalQty === 0 ? 'Out of Stock' : finalQty <= p.minStock ? 'Low Stock' : finalQty >= p.maxStock ? 'Overstock' : 'In Stock';
        return {
          ...p,
          quantity: finalQty,
          status: nextStatus
        };
      }
      return p;
    }));

    logAction("Stock Adjust", `Adjusted ${adjustTarget.name} qty by ${adjustQty} Pcs (${adjustReason}). New qty: ${finalQty}`);
    showToast(`Stock levels updated for ${adjustTarget.name}.`, "success");
    setIsAdjustModalOpen(false);
    setAdjustTarget(null);
    setAdjustQty(0);
  };

  const handleTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const product = products.find(p => p.id === transferState.productId);
    if (!product) {
      showToast("Select a product to transfer.", "error");
      return;
    }

    if (transferState.fromWarehouseId === transferState.toWarehouseId) {
      showToast("Source and target warehouse must be different.", "error");
      return;
    }

    if (product.quantity < transferState.qty) {
      showToast("Insufficient stock for transfer request.", "error");
      return;
    }

    // Deduct stock from source and add it to target (for simple simulation, we edit product's warehouse field or split item)
    setProducts(prev => prev.map(p => {
      if (p.id === product.id) {
        const newQty = p.quantity - transferState.qty;
        const nextStatus: Product['status'] = newQty === 0 ? 'Out of Stock' : newQty <= p.minStock ? 'Low Stock' : 'In Stock';
        return { ...p, quantity: newQty, status: nextStatus };
      }
      return p;
    }));

    // Check if target warehouse already has this item
    const targetItem = products.find(p => p.sku === product.sku && p.warehouseId === transferState.toWarehouseId);
    if (targetItem) {
      setProducts(prev => prev.map(p => {
        if (p.id === targetItem.id) {
          const newQty = p.quantity + Number(transferState.qty);
          const nextStatus: Product['status'] = newQty >= p.maxStock ? 'Overstock' : 'In Stock';
          return { ...p, quantity: newQty, status: nextStatus };
        }
        return p;
      }));
    } else {
      // Create clone in target warehouse
      const newItem: Product = {
        ...product,
        id: `prod-${Date.now()}-tr`,
        quantity: Number(transferState.qty),
        warehouseId: transferState.toWarehouseId,
        zone: 'Zone A', rack: 'Rack 01', bin: 'Bin 01',
        status: 'In Stock'
      };
      setProducts(prev => [...prev, newItem]);
    }

    const fromWh = warehouses.find(w => w.id === transferState.fromWarehouseId)?.name;
    const toWh = warehouses.find(w => w.id === transferState.toWarehouseId)?.name;

    logAction("Stock Transfer", `Transferred ${transferState.qty} Pcs of ${product.name} from ${fromWh} to ${toWh}`);
    showToast(`Transferred ${transferState.qty} Pcs to target depot.`, "success");
  };

  const deleteProduct = (id: string, name: string) => {
    if (confirm(`Are you sure you want to remove ${name} from catalog?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      logAction("Delete Product", `Removed ${name} from inventory.`);
      showToast(`${name} deleted.`, "info");
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sub Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit">
        {(['Products', 'Categories', 'Warehouses', 'Stock Transfer', 'Stock Adjustment'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setInvSubTab(tab)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
              invSubTab === tab 
                ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' 
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* PRODUCTS TAB */}
      {invSubTab === 'Products' && (
        <div className="space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            
            {/* Search and Filters */}
            <div className="flex items-center gap-3 w-full md:w-auto">
              <div className="relative flex-1 md:w-64">
                <Search size={16} className="absolute left-3 top-2.5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search item, SKU or Barcode..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-card-border text-xs focus:ring-1 focus:ring-primary focus:outline-none"
                />
              </div>

              <select 
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-950/20 border border-card-border text-xs focus:outline-none"
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Action Buttons */}
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="w-full md:w-auto flex items-center justify-center gap-1.5 px-4 py-2.5 bg-primary hover:bg-primary-hover text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-primary/10"
            >
              <Plus size={16} /> Add Product
            </button>

          </div>

          {/* Products Table */}
          <div className="glass-panel rounded-2xl border border-card-border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-card-border/50 text-slate-400 font-bold uppercase tracking-wider">
                    <th className="p-4">Item details</th>
                    <th className="p-4">SKU / Barcode</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Warehouse Depot</th>
                    <th className="p-4 text-right">Quantity</th>
                    <th className="p-4 text-right">Price</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-card-border/30">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-card-border text-[10px] text-slate-400 font-semibold overflow-hidden flex-shrink-0">
                            {prod.image ? (
                              <img src={prod.image} alt={prod.name} className="w-full h-full object-cover" />
                            ) : (
                              prod.name[0]
                            )}
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-800 dark:text-slate-100">{prod.name}</h4>
                            <p className="text-[10px] text-slate-400">Brand: {prod.brand}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="font-mono text-[10px] space-y-0.5">
                          <span className="block font-bold text-slate-600 dark:text-slate-300">{prod.sku}</span>
                          <span className="text-slate-400 flex items-center gap-1"><QrCode size={10} /> {prod.barcode}</span>
                        </div>
                      </td>
                      <td className="p-4 text-slate-600 dark:text-slate-300">{prod.category}</td>
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <span className="font-bold text-slate-700 dark:text-slate-200">
                            {warehouses.find(w => w.id === prod.warehouseId)?.name.split(' ')[0] || 'Central'}
                          </span>
                          <span className="block text-[10px] text-slate-400">{prod.zone} • R{prod.rack.split(' ')[1]} • B{prod.bin.split(' ')[1]}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-bold text-slate-800 dark:text-slate-100">
                        {prod.quantity} <span className="text-[10px] text-slate-400 font-normal">{prod.unit}</span>
                      </td>
                      <td className="p-4 text-right font-bold text-slate-800 dark:text-slate-100">
                        ${prod.price.toLocaleString()}
                        <span className="block text-[9px] text-slate-400 font-normal">Cost: ${prod.cost}</span>
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[9px] font-black tracking-wider uppercase ${
                          prod.status === 'In Stock' ? 'bg-success/10 text-success' :
                          prod.status === 'Low Stock' ? 'bg-warning/10 text-warning' :
                          prod.status === 'Out of Stock' ? 'bg-danger/10 text-danger' :
                          'bg-primary/10 text-primary'
                        }`}>
                          {prod.status}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          <button 
                            onClick={() => {
                              setAdjustTarget(prod);
                              setAdjustQty(0);
                              setIsAdjustModalOpen(true);
                            }}
                            title="Adjust quantity"
                            className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                          >
                            <SlidersHorizontal size={12} />
                          </button>
                          <button 
                            onClick={() => deleteProduct(prod.id, prod.name)}
                            title="Delete item"
                            className="p-1.5 rounded-lg bg-danger/5 text-danger hover:bg-danger/10 transition-colors"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={8} className="p-8 text-center text-slate-400">
                        No products match selected search parameters
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* CATEGORIES TAB */}
      {invSubTab === 'Categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {categories.filter(c => c !== 'All').map((cat) => {
            const itemsInCat = products.filter(p => p.category === cat);
            const totalStock = itemsInCat.reduce((sum, p) => sum + p.quantity, 0);
            return (
              <div key={cat} className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 text-primary rounded-xl">
                    <Tag size={18} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 dark:text-slate-100">{cat}</h4>
                    <span className="text-xs text-slate-400">{itemsInCat.length} Products registered</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-card-border/30 flex justify-between text-xs text-slate-500">
                  <span>Total physical units:</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">{totalStock} Pcs</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* WAREHOUSES TAB */}
      {invSubTab === 'Warehouses' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {warehouses.map((wh) => {
            const fillRatio = Math.round((wh.usedCapacity / wh.capacity) * 100);
            const whItems = products.filter(p => p.warehouseId === wh.id);
            return (
              <div key={wh.id} className="glass-panel p-5 rounded-2xl border border-card-border space-y-5">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <h4 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
                      <Warehouse size={16} className="text-primary" />
                      {wh.name}
                    </h4>
                    <p className="text-xs text-slate-400 leading-tight">{wh.location}</p>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">Mgr: {wh.manager}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span>Depot Capacity:</span>
                    <span className={`${fillRatio > 80 ? 'text-danger' : 'text-slate-600 dark:text-slate-300'}`}>
                      {wh.usedCapacity.toLocaleString()} / {wh.capacity.toLocaleString()} Bins ({fillRatio}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-300 ${
                        fillRatio > 80 ? 'bg-danger' : fillRatio > 50 ? 'bg-warning' : 'bg-primary'
                      }`}
                      style={{ width: `${fillRatio}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 border-t border-card-border/30 flex justify-between items-center text-xs">
                  <span className="text-slate-400">Total cataloged items stored:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-100">{whItems.length} categories</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STOCK TRANSFER TAB */}
      {invSubTab === 'Stock Transfer' && (
        <div className="max-w-md glass-panel p-6 rounded-2xl border border-card-border space-y-4">
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <ArrowLeftRight size={18} className="text-primary" />
              Depot Stock Transfer
            </h3>
            <p className="text-xs text-slate-400 mt-1">Lodge a transfer of physical quantities between stock depots.</p>
          </div>

          <form onSubmit={handleTransfer} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Product to transfer</label>
              <select 
                value={transferState.productId}
                onChange={(e) => setTransferState(prev => ({ ...prev, productId: e.target.value }))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
              >
                <option value="">Select item...</option>
                {products.filter(p => p.quantity > 0).map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (SKU: {p.sku}) [Avail: {p.quantity} {p.unit}]
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold">From Warehouse</label>
                <select 
                  value={transferState.fromWarehouseId}
                  onChange={(e) => setTransferState(prev => ({ ...prev, fromWarehouseId: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name.split(' ')[0]}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">To Warehouse</label>
                <select 
                  value={transferState.toWarehouseId}
                  onChange={(e) => setTransferState(prev => ({ ...prev, toWarehouseId: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                >
                  {warehouses.map(w => (
                    <option key={w.id} value={w.id}>{w.name.split(' ')[0]}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold">Transfer quantity</label>
              <input 
                type="number" 
                min={1}
                value={transferState.qty}
                onChange={(e) => setTransferState(prev => ({ ...prev, qty: Number(e.target.value) }))}
                className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
              />
            </div>

            <button 
              type="submit"
              className="w-full py-2.5 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md transition-all duration-200"
            >
              Lodge Transfer
            </button>
          </form>
        </div>
      )}

      {/* STOCK ADJUSTMENT TAB */}
      {invSubTab === 'Stock Adjustment' && (
        <div className="max-w-md glass-panel p-6 rounded-2xl border border-card-border space-y-4">
          <div>
            <h3 className="font-black text-slate-800 dark:text-slate-100 flex items-center gap-2">
              <History size={18} className="text-primary" />
              Stock Adjustments Audit
            </h3>
            <p className="text-xs text-slate-400 mt-1">Manually adjust inventory balances. Choose an item below to begin.</p>
          </div>

          <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1 scrollbar-thin divide-y divide-card-border/30">
            {products.map((p) => (
              <div key={p.id} className="pt-3 flex justify-between items-center text-xs">
                <div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{p.name}</h4>
                  <span className="text-[10px] text-slate-400">SKU: {p.sku} • Current: {p.quantity} Pcs</span>
                </div>
                <button
                  onClick={() => {
                    setAdjustTarget(p);
                    setAdjustQty(0);
                    setIsAdjustModalOpen(true);
                  }}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary hover:text-white rounded-lg text-[10px] font-bold transition-all duration-150"
                >
                  Adjust
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ADD PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-xl rounded-2xl border border-card-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-card-border/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-black text-sm uppercase tracking-wider">Register New Product</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleAddProduct} className="p-6 space-y-4 max-h-[500px] overflow-y-auto scrollbar-thin">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Product Name *</label>
                  <input 
                    type="text" 
                    required
                    value={newProduct.name}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                    placeholder="e.g. Laser Sensor X"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">SKU Code *</label>
                  <input 
                    type="text" 
                    required
                    value={newProduct.sku}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, sku: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                    placeholder="MR-LSR-SN1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Category</label>
                  <select 
                    value={newProduct.category}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  >
                    <option value="Robotics">Robotics</option>
                    <option value="Sensors">Sensors</option>
                    <option value="Hardware">Hardware</option>
                    <option value="Power">Power</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Brand</label>
                  <input 
                    type="text"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, brand: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                    placeholder="e.g. AeroTech"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Barcode</label>
                  <input 
                    type="text"
                    value={newProduct.barcode}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, barcode: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                    placeholder="Auto-generated if empty"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Price ($)</label>
                  <input 
                    type="number"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Cost ($)</label>
                  <input 
                    type="number"
                    value={newProduct.cost}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, cost: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Quantity</label>
                  <input 
                    type="number"
                    value={newProduct.quantity}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Min Stock</label>
                  <input 
                    type="number"
                    value={newProduct.minStock}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, minStock: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Warehouse</label>
                  <select 
                    value={newProduct.warehouseId}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, warehouseId: e.target.value }))}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-[11px] focus:outline-none"
                  >
                    {warehouses.map(w => (
                      <option key={w.id} value={w.id}>{w.name.split(' ')[0]}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Zone</label>
                  <input 
                    type="text" 
                    value={newProduct.zone}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, zone: e.target.value }))}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-[11px] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Rack</label>
                  <input 
                    type="text" 
                    value={newProduct.rack}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, rack: e.target.value }))}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-[11px] focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Bin</label>
                  <input 
                    type="text" 
                    value={newProduct.bin}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, bin: e.target.value }))}
                    className="w-full p-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-[11px] focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Batch Number</label>
                  <input 
                    type="text" 
                    value={newProduct.batchNumber}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, batchNumber: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                    placeholder="BATCH-2026-X"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Expiry Date</label>
                  <input 
                    type="date" 
                    value={newProduct.expiryDate}
                    onChange={(e) => setNewProduct(prev => ({ ...prev, expiryDate: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  />
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STOCK ADJUSTMENT MODAL */}
      {isAdjustModalOpen && adjustTarget && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-card-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-card-border/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <div>
                <h3 className="font-black text-sm uppercase tracking-wider">Adjust Stock level</h3>
                <p className="text-[10px] text-slate-400 mt-0.5">{adjustTarget.name} ({adjustTarget.sku})</p>
              </div>
              <button onClick={() => {
                setIsAdjustModalOpen(false);
                setAdjustTarget(null);
              }} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleAdjustStock} className="p-6 space-y-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-950/20 rounded-xl border border-card-border/30 text-xs flex justify-between">
                <span className="text-slate-400">Current Balance:</span>
                <span className="font-black text-slate-800 dark:text-slate-200">{adjustTarget.quantity} Pcs</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Adjustment Quantity</label>
                <input 
                  type="number" 
                  required
                  placeholder="e.g. -5 to decrease or 10 to increase"
                  value={adjustQty || ''}
                  onChange={(e) => setAdjustQty(Number(e.target.value))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Reason for adjustment</label>
                <select 
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                >
                  <option value="Cycle Count">Cycle Count Audit</option>
                  <option value="Damaged Goods">Damaged/Defective Goods</option>
                  <option value="Expiry">Expired Inventory</option>
                  <option value="Found Stock">Discovered Surplus Stock</option>
                </select>
              </div>

              <div className="pt-4 border-t border-card-border/50 flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsAdjustModalOpen(false);
                    setAdjustTarget(null);
                  }}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10"
                >
                  Apply Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
