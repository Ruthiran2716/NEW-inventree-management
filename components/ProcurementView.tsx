"use client";

import React, { useState, useMemo } from 'react';
import { useApp } from './AppContext';
import { PurchaseOrder, PurchaseRequisition, RFQ, Product, db } from '../lib/db';
import { 
  FileText, 
  Send, 
  Check, 
  X, 
  AlertCircle, 
  DollarSign, 
  Truck, 
  Plus, 
  Users, 
  ChevronRight,
  TrendingUp,
  Receipt,
  FileCheck
} from 'lucide-react';

export default function ProcurementView() {
  const { 
    purchaseOrders, setPurchaseOrders,
    requisitions, setRequisitions,
    rfqs, setRfqs,
    suppliers,
    products, setProducts,
    activeRole,
    logAction,
    showToast
  } = useApp();

  const [procSubTab, setProcSubTab] = useState<'Requisitions' | 'RFQs' | 'Quotations' | 'Orders' | 'Goods Receipts' | 'Invoices' | 'Payments'>('Orders');
  
  // Create Requisition Modal Form State
  const [isReqModalOpen, setIsReqModalOpen] = useState(false);
  const [newReq, setNewReq] = useState({
    requesterName: 'Marcus Vance',
    department: 'Warehouse A',
    productId: '',
    quantity: 1,
    priority: 'Medium' as 'Low' | 'Medium' | 'High' | 'Urgent',
    remarks: ''
  });

  // Create PO Modal Form State
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [newPo, setNewPo] = useState({
    supplierId: '',
    productId: '',
    quantity: 1,
    unitPrice: 0,
    shippingCost: 100
  });

  // Requisitions handler
  const handleCreateRequisition = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReq.productId) {
      showToast("Select a product to request.", "error");
      return;
    }

    const product = products.find(p => p.id === newReq.productId);
    if (!product) return;

    const estimatedCost = product.cost * newReq.quantity;

    const req: PurchaseRequisition = {
      id: `PR-2026-0${requisitions.length + 1}`,
      requesterName: newReq.requesterName,
      department: newReq.department,
      requestDate: new Date().toISOString().split('T')[0],
      items: [
        {
          productId: newReq.productId,
          productName: product.name,
          quantity: newReq.quantity,
          estimatedCost: product.cost
        }
      ],
      totalEstimatedCost: estimatedCost,
      priority: newReq.priority,
      status: 'Pending Approval',
      remarks: newReq.remarks || undefined
    };

    setRequisitions(prev => [req, ...prev]);
    logAction("Purchase Requisition", `Submitted requisition ${req.id} for ${newReq.quantity}x ${product.name}`);
    showToast(`Requisition ${req.id} submitted for approval.`, "success");
    setIsReqModalOpen(false);
  };

  const approveRequisition = (id: string) => {
    setRequisitions(prev => prev.map(req => {
      if (req.id === id) {
        logAction("Approve Requisition", `Approved requisition ${id}`);
        showToast(`Requisition ${id} has been approved.`, "success");
        return { ...req, status: 'Approved' };
      }
      return req;
    }));
  };

  // Convert approved requisition to Purchase Order
  const convertToPO = (req: PurchaseRequisition) => {
    const defaultSupplier = suppliers[0]; // mock map
    const item = req.items[0];
    const product = products.find(p => p.id === item.productId);
    const unitCost = product ? product.cost : 100;
    const tax = Math.round(item.quantity * unitCost * 0.08);

    const po: PurchaseOrder = {
      id: `PO-2026-0${purchaseOrders.length + 1}`,
      requisitionId: req.id,
      supplierId: defaultSupplier.id,
      supplierName: defaultSupplier.name,
      orderDate: new Date().toISOString().split('T')[0],
      items: [
        {
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: unitCost,
          totalPrice: item.quantity * unitCost
        }
      ],
      totalAmount: (item.quantity * unitCost) + tax + 150,
      status: 'Draft',
      paymentStatus: 'Unpaid',
      shippingCost: 150,
      taxAmount: tax
    };

    setPurchaseOrders(prev => [po, ...prev]);
    setRequisitions(prev => prev.map(r => r.id === req.id ? { ...r, status: 'Converted to PO' } : r));
    logAction("Convert Requisition", `Converted requisition ${req.id} to Purchase Order draft ${po.id}`);
    showToast(`Converted to draft order: ${po.id}`, "success");
    setProcSubTab('Orders');
  };

  // PO handlers
  const approvePO = (id: string) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === id) {
        logAction("Approve PO", `Approved Purchase Order ${id}`);
        showToast(`PO ${id} approved & dispatched to supplier.`, "success");
        return { ...po, status: 'Approved', approvedBy: activeRole };
      }
      return po;
    }));
  };

  const payPO = (id: string) => {
    setPurchaseOrders(prev => prev.map(po => {
      if (po.id === id) {
        logAction("Pay Invoice", `Settled payment ledger for order ${id}`);
        showToast(`Invoice payment settled for ${id}`, "success");
        return { ...po, paymentStatus: 'Paid', status: po.status === 'Received' ? 'Paid' : po.status };
      }
      return po;
    }));
  };

  // Goods receipt - critical inventory sync!
  const receiveGoods = (po: PurchaseOrder) => {
    // 1. Update PO Status
    setPurchaseOrders(prev => prev.map(o => {
      if (o.id === po.id) {
        return { 
          ...o, 
          status: 'Received', 
          deliveryDate: new Date().toISOString().split('T')[0] 
        };
      }
      return o;
    }));

    // 2. Increment quantity of items in our products inventory database
    setProducts(prev => prev.map(prod => {
      const poItem = po.items.find(item => item.productId === prod.id);
      if (poItem) {
        const nextQty = prod.quantity + poItem.quantity;
        // recalculate status
        const nextStatus: Product['status'] = nextQty >= prod.maxStock ? 'Overstock' : 'In Stock';
        return {
          ...prod,
          quantity: nextQty,
          status: nextStatus
        };
      }
      return prod;
    }));

    logAction("Goods Receipt", `Received dispatch order ${po.id}. Influx of products recorded in warehouse.`);
    showToast(`Goods received. Warehouse levels incremented!`, "success");
    setProcSubTab('Goods Receipts');
  };

  return (
    <div className="space-y-6">
      
      {/* Sub Tabs */}
      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 rounded-xl w-fit overflow-x-auto max-w-full">
        {(['Requisitions', 'RFQs', 'Orders', 'Goods Receipts', 'Invoices', 'Payments'] as const).map(tab => {
          let label = tab as string;
          if (tab === 'Requisitions') label = 'Requisitions';
          else if (tab === 'Orders') label = 'Purchase Orders';
          return (
            <button
              key={tab}
              onClick={() => setProcSubTab(tab)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 whitespace-nowrap ${
                procSubTab === tab 
                  ? 'bg-white dark:bg-slate-800 text-primary shadow-sm' 
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* REQUISITIONS VIEW */}
      {procSubTab === 'Requisitions' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Purchase Requisitions (PR)</h3>
            <button 
              onClick={() => setIsReqModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl transition shadow-md shadow-primary/10"
            >
              <Plus size={14} /> New Requisition
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {requisitions.map((req) => {
              const item = req.items[0];
              return (
                <div key={req.id} className="glass-panel p-5 rounded-2xl border border-card-border flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs">{req.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                        req.priority === 'Urgent' ? 'bg-danger/10 text-danger' :
                        req.priority === 'High' ? 'bg-warning/10 text-warning' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {req.priority} Priority
                      </span>
                      <span className="text-[10px] text-slate-400">• Requested: {req.requestDate}</span>
                    </div>

                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                      {item.quantity}x {item.productName}
                    </h4>
                    <p className="text-[10px] text-slate-400">
                      Requested by {req.requesterName} ({req.department}) • Estimated Cost: <span className="font-semibold text-slate-700 dark:text-slate-200">${req.totalEstimatedCost.toLocaleString()}</span>
                    </p>
                    {req.remarks && (
                      <p className="text-[10px] text-slate-400/80 italic font-medium bg-slate-50 dark:bg-slate-900/50 p-2 rounded-lg max-w-lg">
                        &ldquo;{req.remarks}&rdquo;
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 md:self-center">
                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold tracking-wider uppercase mr-2 ${
                      req.status === 'Approved' ? 'bg-success/10 text-success' :
                      req.status === 'Converted to PO' ? 'bg-primary/10 text-primary' :
                      'bg-warning/10 text-warning'
                    }`}>
                      {req.status}
                    </span>

                    {/* Role approvals permissions check */}
                    {req.status === 'Pending Approval' && (activeRole === 'CEO' || activeRole === 'Admin') && (
                      <button 
                        onClick={() => approveRequisition(req.id)}
                        className="p-1.5 rounded-lg bg-success/10 text-success hover:bg-success/20 transition"
                      >
                        <Check size={14} />
                      </button>
                    )}

                    {req.status === 'Approved' && (
                      <button 
                        onClick={() => convertToPO(req)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary text-white text-xs font-bold rounded-lg hover:bg-primary-hover shadow-sm"
                      >
                        Create PO <ChevronRight size={12} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* RFQs VIEW */}
      {procSubTab === 'RFQs' && (
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Request For Quotation (RFQ)</h3>
            <p className="text-xs text-slate-400">Request pricing parameters from vendor networks.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {rfqs.map(rfq => (
              <div key={rfq.id} className="glass-panel p-5 rounded-2xl border border-card-border space-y-4">
                <div className="flex justify-between items-center border-b border-card-border/30 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">{rfq.id}</span>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">{rfq.title}</h4>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-primary/10 text-primary">
                    {rfq.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px]">Close Date</span>
                    <span className="font-bold">{rfq.closeDate}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Product</span>
                    <span className="font-bold">{rfq.items[0].productName}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Volume</span>
                    <span className="font-bold">{rfq.items[0].quantity} Pcs</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px]">Invite Count</span>
                    <span className="font-bold">{rfq.suppliers.length} vendors</span>
                  </div>
                </div>

                {/* Compare responses visually */}
                {rfq.responses && (
                  <div className="space-y-2 border-t border-card-border/30 pt-3">
                    <h5 className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Received Quotations</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {rfq.responses.map(res => (
                        <div key={res.supplierId} className="p-3 bg-slate-50 dark:bg-slate-900/40 rounded-xl border border-card-border/50 flex justify-between items-center text-xs">
                          <div>
                            <span className="font-bold block text-slate-700 dark:text-slate-300">{res.supplierName}</span>
                            <span className="text-[10px] text-slate-400">Lead: {res.leadTime} days • Ship: ${res.shippingCost}</span>
                          </div>
                          <div className="text-right">
                            <span className="font-black text-xs text-primary dark:text-secondary block">
                              ${(res.unitPrices[rfq.items[0].productId] * rfq.items[0].quantity + res.shippingCost).toLocaleString()}
                            </span>
                            <button
                              onClick={() => {
                                showToast(`Contract awarded to ${res.supplierName}`, "success");
                                logAction("Award Supplier", `Awarded RFQ contract ${rfq.id} to ${res.supplierName}`);
                                setRfqs(prev => prev.map(r => r.id === rfq.id ? { ...r, status: 'Awarded' } : r));
                              }}
                              className="text-[9px] text-primary dark:text-secondary font-bold hover:underline"
                            >
                              Award Contract
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PURCHASE ORDERS VIEW */}
      {procSubTab === 'Orders' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Active Purchase Orders (PO)</h3>
            <span className="text-xs text-slate-400">Track shipment logs and approvals</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {purchaseOrders.map((po) => {
              const item = po.items[0];
              return (
                <div key={po.id} className="glass-panel p-5 rounded-2xl border border-card-border space-y-4 glow-card-hover">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-card-border/30 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-xl">
                        <FileText size={18} className="text-primary" />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                          Order {po.id}
                        </h4>
                        <p className="text-[10px] text-slate-400">Supplier: {po.supplierName} • Created: {po.orderDate}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        po.status === 'Received' || po.status === 'Paid' ? 'bg-success/10 text-success' :
                        po.status === 'Pending Approval' ? 'bg-warning/10 text-warning' :
                        po.status === 'Approved' ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-500'
                      }`}>
                        {po.status}
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        po.paymentStatus === 'Paid' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'
                      }`}>
                        {po.paymentStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Item description</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.productName}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Volume</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{item.quantity} units</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Unit Price</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">${item.unitPrice}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block text-[10px]">Total + Tax & Freight</span>
                      <span className="font-black text-slate-800 dark:text-slate-200 text-sm">${po.totalAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Actions based on PO state & user role */}
                  <div className="flex justify-end gap-2 border-t border-card-border/30 pt-3">
                    {po.status === 'Pending Approval' && (activeRole === 'CEO' || activeRole === 'Admin') && (
                      <button 
                        onClick={() => approvePO(po.id)}
                        className="px-3.5 py-2 bg-success text-white text-xs font-bold rounded-xl hover:bg-success/90 shadow-sm flex items-center gap-1"
                      >
                        <Check size={14} /> Approve & Dispatch PO
                      </button>
                    )}
                    
                    {po.status === 'Approved' && (
                      <button 
                        onClick={() => receiveGoods(po)}
                        className="px-3.5 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover shadow-sm flex items-center gap-1.5"
                      >
                        <Truck size={14} /> Log Goods Receipt
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* GOODS RECEIPTS VIEW */}
      {procSubTab === 'Goods Receipts' && (
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Goods Receipt Notes (GRN)</h3>
            <p className="text-xs text-slate-400">Warehouse stock receipts audit logs.</p>
          </div>

          <div className="glass-panel rounded-2xl border border-card-border overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-card-border/50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">GRN Ticket</th>
                  <th className="p-4">PO Reference</th>
                  <th className="p-4">Item received</th>
                  <th className="p-4 text-right">Qty</th>
                  <th className="p-4">Delivery Date</th>
                  <th className="p-4">Recipient</th>
                  <th className="p-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/30">
                {purchaseOrders.filter(o => o.status === 'Received' || o.status === 'Paid').map((po, idx) => (
                  <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-mono font-bold">GRN-2026-00{idx + 1}</td>
                    <td className="p-4 font-mono">{po.id}</td>
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{po.items[0].productName}</td>
                    <td className="p-4 text-right font-bold">{po.items[0].quantity}</td>
                    <td className="p-4">{po.deliveryDate || '2026-07-06'}</td>
                    <td className="p-4 text-slate-400">Robert Vance</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded bg-success/10 text-success text-[10px] font-bold">
                        Stocked
                      </span>
                    </td>
                  </tr>
                ))}
                {purchaseOrders.filter(o => o.status === 'Received' || o.status === 'Paid').length === 0 && (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No products received in active cycle
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVOICES VIEW */}
      {procSubTab === 'Invoices' && (
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Supplier Invoices</h3>
            <p className="text-xs text-slate-400">Purchase invoices from suppliers.</p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {purchaseOrders.filter(o => o.status === 'Received' || o.status === 'Paid').map((po) => (
              <div key={po.id} className="glass-panel p-4 rounded-2xl border border-card-border flex justify-between items-center text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-slate-700 dark:text-slate-300">INV-{po.id.split('-')[2]}</span>
                    <span className="text-[10px] text-slate-400">Order: {po.id}</span>
                  </div>
                  <h4 className="font-bold text-slate-800 dark:text-slate-100">{po.supplierName}</h4>
                  <p className="text-[10px] text-slate-400">Due: 30 days from delivery</p>
                </div>
                <div className="text-right space-y-2">
                  <span className="font-black text-sm block">${po.totalAmount.toLocaleString()}</span>
                  
                  {po.paymentStatus === 'Unpaid' ? (
                    <button
                      onClick={() => payPO(po.id)}
                      className="px-3 py-1.5 bg-primary hover:bg-primary-hover text-white text-[10px] font-bold rounded-lg transition"
                    >
                      Process Payment
                    </button>
                  ) : (
                    <span className="px-2 py-1 rounded bg-success/10 text-success text-[10px] font-bold">
                      Paid & Settled
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PAYMENTS VIEW */}
      {procSubTab === 'Payments' && (
        <div className="space-y-4">
          <div className="mb-4">
            <h3 className="text-xs font-bold text-slate-400 tracking-wider uppercase">Payment Transaction History</h3>
            <p className="text-xs text-slate-400">Audit trail of bank clearances for outbound settlements.</p>
          </div>

          <div className="glass-panel rounded-2xl border border-card-border overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/50 dark:bg-slate-900/50 border-b border-card-border/50 text-slate-400 font-bold uppercase tracking-wider">
                  <th className="p-4">Txn Hash</th>
                  <th className="p-4">Invoice Reference</th>
                  <th className="p-4">Paid to Supplier</th>
                  <th className="p-4 text-right">Amount Settlement</th>
                  <th className="p-4">Payment Method</th>
                  <th className="p-4">Clearance Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border/30">
                {purchaseOrders.filter(o => o.paymentStatus === 'Paid').map((po, idx) => (
                  <tr key={po.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                    <td className="p-4 font-mono text-[10px] text-slate-400">TXN_9921703{idx}81267</td>
                    <td className="p-4 font-mono">INV-{po.id.split('-')[2]}</td>
                    <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{po.supplierName}</td>
                    <td className="p-4 text-right font-black text-slate-800 dark:text-slate-100">${po.totalAmount.toLocaleString()}</td>
                    <td className="p-4">ACH Wire Transfer</td>
                    <td className="p-4">{po.deliveryDate || '2026-07-06'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE REQUISITION MODAL */}
      {isReqModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 dark:bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="glass-panel w-full max-w-md rounded-2xl border border-card-border shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="px-6 py-4 border-b border-card-border/50 flex justify-between items-center bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="font-black text-sm uppercase tracking-wider">Raise Purchase Requisition</h3>
              <button onClick={() => setIsReqModalOpen(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"><X size={16} /></button>
            </div>
            
            <form onSubmit={handleCreateRequisition} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Requester Name</label>
                  <input 
                    type="text" 
                    value={newReq.requesterName}
                    onChange={(e) => setNewReq(prev => ({ ...prev, requesterName: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Department</label>
                  <input 
                    type="text" 
                    value={newReq.department}
                    onChange={(e) => setNewReq(prev => ({ ...prev, department: e.target.value }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Select Product Needed</label>
                <select 
                  value={newReq.productId}
                  onChange={(e) => setNewReq(prev => ({ ...prev, productId: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                >
                  <option value="">Select item...</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Quantity</label>
                  <input 
                    type="number"
                    min={1}
                    value={newReq.quantity}
                    onChange={(e) => setNewReq(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold">Priority Level</label>
                  <select 
                    value={newReq.priority}
                    onChange={(e) => setNewReq(prev => ({ ...prev, priority: e.target.value as any }))}
                    className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold">Justification / Remarks</label>
                <textarea
                  value={newReq.remarks}
                  rows={2}
                  onChange={(e) => setNewReq(prev => ({ ...prev, remarks: e.target.value }))}
                  className="w-full p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-card-border text-xs focus:outline-none"
                  placeholder="Why is this purchase required?"
                />
              </div>

              <div className="pt-4 border-t border-card-border/50 flex justify-end gap-2.5">
                <button 
                  type="button" 
                  onClick={() => setIsReqModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 text-xs font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-4 py-2 bg-primary hover:bg-primary-hover text-white text-xs font-bold rounded-xl shadow-md shadow-primary/10"
                >
                  Submit Requisition
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
