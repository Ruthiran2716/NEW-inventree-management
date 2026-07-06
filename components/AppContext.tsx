"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, Product, Supplier, PurchaseOrder, PurchaseRequisition, RFQ, Warehouse, AppNotification, ActivityLog } from '../lib/db';

type Theme = 'light' | 'dark';
type UserRole = 'CEO' | 'Admin' | 'Inventory Manager' | 'Procurement Manager' | 'Warehouse Manager' | 'Finance' | 'Store Keeper';

interface AppContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  activeRole: UserRole;
  setActiveRole: (r: UserRole) => void;
  activeTab: string;
  setActiveTab: (t: string) => void;
  products: Product[];
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  suppliers: Supplier[];
  setSuppliers: React.Dispatch<React.SetStateAction<Supplier[]>>;
  warehouses: Warehouse[];
  setWarehouses: React.Dispatch<React.SetStateAction<Warehouse[]>>;
  purchaseOrders: PurchaseOrder[];
  setPurchaseOrders: React.Dispatch<React.SetStateAction<PurchaseOrder[]>>;
  requisitions: PurchaseRequisition[];
  setRequisitions: React.Dispatch<React.SetStateAction<PurchaseRequisition[]>>;
  rfqs: RFQ[];
  setRfqs: React.Dispatch<React.SetStateAction<RFQ[]>>;
  notifications: AppNotification[];
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  logs: ActivityLog[];
  setLogs: React.Dispatch<React.SetStateAction<ActivityLog[]>>;
  logAction: (action: string, details: string) => void;
  addNotification: (type: AppNotification['type'], title: string, message: string, module: AppNotification['module']) => void;
  toasts: { id: string; message: string; type: 'success' | 'error' | 'info' }[];
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  removeToast: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark'); // Default to dark mode for premium look
  const [activeRole, setActiveRole] = useState<UserRole>('CEO');
  const [activeTab, setActiveTab] = useState<string>('Dashboard');

  const [products, setProducts] = useState<Product[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [requisitions, setRequisitions] = useState<PurchaseRequisition[]>([]);
  const [rfqs, setRfqs] = useState<RFQ[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  
  const [toasts, setToasts] = useState<{ id: string; message: string; type: 'success' | 'error' | 'info' }[]>([]);

  // Load from local DB on client mount
  useEffect(() => {
    setProducts(db.products);
    setSuppliers(db.suppliers);
    setWarehouses(db.warehouses);
    setPurchaseOrders(db.purchaseOrders);
    setRequisitions(db.requisitions);
    setRfqs(db.rfqs);
    setNotifications(db.notifications);
    setLogs(db.logs);

    // Read dark mode preference from html
    const isDark = document.documentElement.classList.contains('dark') || 
                   (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    setThemeState(isDark ? 'dark' : 'light');
  }, []);

  const setTheme = (t: Theme) => {
    setThemeState(t);
    if (typeof window !== 'undefined') {
      if (t === 'dark') {
        document.documentElement.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        document.documentElement.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }
  };

  // Sync state back to DB on modifications
  useEffect(() => {
    if (products.length > 0) db.products = products;
  }, [products]);
  
  useEffect(() => {
    if (suppliers.length > 0) db.suppliers = suppliers;
  }, [suppliers]);

  useEffect(() => {
    if (warehouses.length > 0) db.warehouses = warehouses;
  }, [warehouses]);

  useEffect(() => {
    if (purchaseOrders.length > 0) db.purchaseOrders = purchaseOrders;
  }, [purchaseOrders]);

  useEffect(() => {
    if (requisitions.length > 0) db.requisitions = requisitions;
  }, [requisitions]);

  useEffect(() => {
    if (rfqs.length > 0) db.rfqs = rfqs;
  }, [rfqs]);

  useEffect(() => {
    if (notifications.length > 0) db.notifications = notifications;
  }, [notifications]);

  useEffect(() => {
    if (logs.length > 0) db.logs = logs;
  }, [logs]);

  const logAction = (action: string, details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId: `user-${activeRole.toLowerCase()}`,
      userName: activeRole === 'CEO' ? 'Christian Logan' : activeRole === 'Admin' ? 'Alice Chen' : 'Staff Member',
      userRole: activeRole,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const addNotification = (type: AppNotification['type'], title: string, message: string, module: AppNotification['module']) => {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      module
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = `toast-${Date.now()}`;
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <AppContext.Provider value={{
      theme, setTheme,
      activeRole, setActiveRole,
      activeTab, setActiveTab,
      products, setProducts,
      suppliers, setSuppliers,
      warehouses, setWarehouses,
      purchaseOrders, setPurchaseOrders,
      requisitions, setRequisitions,
      rfqs, setRfqs,
      notifications, setNotifications,
      logs, setLogs,
      logAction,
      addNotification,
      toasts, showToast, removeToast
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within an AppProvider');
  return context;
}
