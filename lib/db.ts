// Database Adapter & Mock Database layer for MrRobot
// Provides standard types and local storage persistence so that all modules
// function dynamically on reload.

export interface Product {
  id: string;
  name: string;
  sku: string;
  barcode: string;
  category: string;
  brand: string;
  unit: string;
  price: number;
  cost: number;
  quantity: number;
  minStock: number;
  maxStock: number;
  warehouseId: string;
  zone: string;
  rack: string;
  bin: string;
  batchNumber?: string;
  serialNumber?: string;
  expiryDate?: string;
  image?: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Overstock';
}

export interface Supplier {
  id: string;
  name: string;
  email: string;
  phone: string;
  rating: number;
  leadTime: number; // in days
  paymentTerms: string;
  status: 'Active' | 'Under Review' | 'Inactive';
  ordersCount: number;
  spendAmount: number;
  qualityScore: number; // 0-100
  deliveryPerformance: number; // 0-100
  activeContracts: number;
}

export interface PurchaseOrder {
  id: string;
  requisitionId?: string;
  supplierId: string;
  supplierName: string;
  orderDate: string;
  deliveryDate?: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  totalAmount: number;
  status: 'Draft' | 'Pending Approval' | 'Approved' | 'Sent' | 'Received' | 'Invoiced' | 'Paid' | 'Cancelled';
  paymentStatus: 'Unpaid' | 'Partially Paid' | 'Paid';
  shippingCost: number;
  taxAmount: number;
  approvedBy?: string;
}

export interface PurchaseRequisition {
  id: string;
  requesterName: string;
  department: string;
  requestDate: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
    estimatedCost: number;
  }[];
  totalEstimatedCost: number;
  priority: 'Low' | 'Medium' | 'High' | 'Urgent';
  status: 'Pending Approval' | 'Approved' | 'Rejected' | 'Converted to PO';
  remarks?: string;
}

export interface RFQ {
  id: string;
  title: string;
  createdDate: string;
  closeDate: string;
  items: {
    productId: string;
    productName: string;
    quantity: number;
  }[];
  suppliers: string[]; // Supplier IDs
  status: 'Draft' | 'Sent' | 'Responses Received' | 'Closed' | 'Awarded';
  responses?: {
    supplierId: string;
    supplierName: string;
    unitPrices: { [productId: string]: number };
    shippingCost: number;
    leadTime: number;
    remarks?: string;
    selected?: boolean;
  }[];
}

export interface Warehouse {
  id: string;
  name: string;
  location: string;
  capacity: number; // total bins/units
  usedCapacity: number;
  manager: string;
  zones: {
    name: string; // Zone A, Zone B
    racks: {
      name: string; // Rack 01, Rack 02
      bins: {
        name: string; // Bin 01, Bin 02
        productId?: string;
        productName?: string;
        quantity?: number;
      }[];
    }[];
  }[];
}

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  userRole: string;
  action: string;
  details: string;
  timestamp: string;
}

export interface AppNotification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  module: 'inventory' | 'procurement' | 'supplier' | 'warehouse' | 'system';
}

// Initial Data
export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Industrial Drone V2",
    sku: "MR-DRN-V2",
    barcode: "871239847120",
    category: "Robotics",
    brand: "AeroTech",
    unit: "Pcs",
    price: 3499,
    cost: 1850,
    quantity: 45,
    minStock: 10,
    maxStock: 80,
    warehouseId: "wh-1",
    zone: "Zone A",
    rack: "Rack 03",
    bin: "Bin 12",
    batchNumber: "BATCH-2026-A",
    expiryDate: "2029-12-31",
    status: "In Stock",
    image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=100"
  },
  {
    id: "prod-2",
    name: "Laser Distance Sensor LX3",
    sku: "MR-LSR-LX3",
    barcode: "871239847121",
    category: "Sensors",
    brand: "SensorTech",
    unit: "Pcs",
    price: 249,
    cost: 110,
    quantity: 120,
    minStock: 25,
    maxStock: 300,
    warehouseId: "wh-1",
    zone: "Zone B",
    rack: "Rack 01",
    bin: "Bin 04",
    batchNumber: "BATCH-2026-X",
    status: "In Stock"
  },
  {
    id: "prod-3",
    name: "Robotic Arm Controller Board",
    sku: "MR-ROB-ARM",
    barcode: "871239847122",
    category: "Robotics",
    brand: "ApexCorp",
    unit: "Pcs",
    price: 899,
    cost: 480,
    quantity: 8,
    minStock: 15,
    maxStock: 50,
    warehouseId: "wh-2",
    zone: "Zone A",
    rack: "Rack 02",
    bin: "Bin 08",
    status: "Low Stock"
  },
  {
    id: "prod-4",
    name: "Conveyor Belt Motor 450W",
    sku: "MR-MOT-450",
    barcode: "871239847123",
    category: "Hardware",
    brand: "DynaDrive",
    unit: "Pcs",
    price: 650,
    cost: 320,
    quantity: 0,
    minStock: 5,
    maxStock: 20,
    warehouseId: "wh-1",
    zone: "Zone C",
    rack: "Rack 05",
    bin: "Bin 02",
    status: "Out of Stock"
  },
  {
    id: "prod-5",
    name: "Lithium Ion Smart Battery Pack",
    sku: "MR-BAT-LIP",
    barcode: "871239847124",
    category: "Power",
    brand: "VoltGrid",
    unit: "Pcs",
    price: 180,
    cost: 95,
    quantity: 340,
    minStock: 50,
    maxStock: 300,
    warehouseId: "wh-3",
    zone: "Zone B",
    rack: "Rack 02",
    bin: "Bin 05",
    batchNumber: "BAT-LI-99",
    expiryDate: "2027-06-30",
    status: "Overstock"
  }
];

export const INITIAL_SUPPLIERS: Supplier[] = [
  {
    id: "sup-1",
    name: "Apex Robotics Inc.",
    email: "procurement@apexrobotics.com",
    phone: "+1 (555) 019-2834",
    rating: 4.8,
    leadTime: 7,
    paymentTerms: "Net 30",
    status: "Active",
    ordersCount: 42,
    spendAmount: 245000,
    qualityScore: 97.5,
    deliveryPerformance: 96.2,
    activeContracts: 3
  },
  {
    id: "sup-2",
    name: "SensorTech Systems",
    email: "sales@sensortech.io",
    phone: "+1 (555) 023-9988",
    rating: 4.2,
    leadTime: 5,
    paymentTerms: "Net 15",
    status: "Active",
    ordersCount: 18,
    spendAmount: 89000,
    qualityScore: 92.0,
    deliveryPerformance: 88.5,
    activeContracts: 1
  },
  {
    id: "sup-3",
    name: "Global Logistics Corp",
    email: "contact@globallogistics.net",
    phone: "+1 (555) 045-1212",
    rating: 3.5,
    leadTime: 14,
    paymentTerms: "Net 60",
    status: "Under Review",
    ordersCount: 29,
    spendAmount: 154000,
    qualityScore: 85.4,
    deliveryPerformance: 79.8,
    activeContracts: 2
  },
  {
    id: "sup-4",
    name: "VoltGrid Power Supplies",
    email: "orders@voltgrid.co",
    phone: "+1 (555) 091-7766",
    rating: 4.9,
    leadTime: 3,
    paymentTerms: "Immediate",
    status: "Active",
    ordersCount: 55,
    spendAmount: 320000,
    qualityScore: 99.1,
    deliveryPerformance: 98.4,
    activeContracts: 4
  }
];

export const INITIAL_WAREHOUSES: Warehouse[] = [
  {
    id: "wh-1",
    name: "Central Warehouse (Chicago)",
    location: "4550 W. Industrial Ave, Chicago, IL",
    capacity: 10000,
    usedCapacity: 6420,
    manager: "Marcus Vance",
    zones: [
      {
        name: "Zone A",
        racks: [
          {
            name: "Rack 01",
            bins: [
              { name: "Bin 01", productId: "prod-1", productName: "Industrial Drone V2", quantity: 20 },
              { name: "Bin 02" },
              { name: "Bin 03" }
            ]
          },
          {
            name: "Rack 02",
            bins: [
              { name: "Bin 01" },
              { name: "Bin 02" }
            ]
          }
        ]
      },
      {
        name: "Zone B",
        racks: [
          {
            name: "Rack 01",
            bins: [
              { name: "Bin 01", productId: "prod-2", productName: "Laser Distance Sensor LX3", quantity: 60 },
              { name: "Bin 02", productId: "prod-2", productName: "Laser Distance Sensor LX3", quantity: 60 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "wh-2",
    name: "East Coast Hub (Boston)",
    location: "80 Route 128, Boston, MA",
    capacity: 5000,
    usedCapacity: 1200,
    manager: "Sarah Jenkins",
    zones: [
      {
        name: "Zone A",
        racks: [
          {
            name: "Rack 01",
            bins: [
              { name: "Bin 01" }
            ]
          },
          {
            name: "Rack 02",
            bins: [
              { name: "Bin 08", productId: "prod-3", productName: "Robotic Arm Controller Board", quantity: 8 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: "wh-3",
    name: "West Coast Fulfillment (Seattle)",
    location: "1200 Terminal Way, Seattle, WA",
    capacity: 8000,
    usedCapacity: 4500,
    manager: "Kenji Sato",
    zones: [
      {
        name: "Zone B",
        racks: [
          {
            name: "Rack 02",
            bins: [
              { name: "Bin 05", productId: "prod-5", productName: "Lithium Ion Smart Battery Pack", quantity: 340 }
            ]
          }
        ]
      }
    ]
  }
];

export const INITIAL_PURCHASE_ORDERS: PurchaseOrder[] = [
  {
    id: "PO-2026-001",
    supplierId: "sup-1",
    supplierName: "Apex Robotics Inc.",
    orderDate: "2026-06-15",
    deliveryDate: "2026-06-22",
    items: [
      { productId: "prod-1", productName: "Industrial Drone V2", quantity: 10, unitPrice: 1850, totalPrice: 18500 },
      { productId: "prod-3", productName: "Robotic Arm Controller Board", quantity: 15, unitPrice: 480, totalPrice: 7200 }
    ],
    totalAmount: 25700,
    status: "Received",
    paymentStatus: "Paid",
    shippingCost: 350,
    taxAmount: 2056,
    approvedBy: "Director Christian"
  },
  {
    id: "PO-2026-002",
    supplierId: "sup-4",
    supplierName: "VoltGrid Power Supplies",
    orderDate: "2026-07-02",
    deliveryDate: "2026-07-09",
    items: [
      { productId: "prod-5", productName: "Lithium Ion Smart Battery Pack", quantity: 200, unitPrice: 95, totalPrice: 19000 }
    ],
    totalAmount: 19000,
    status: "Pending Approval",
    paymentStatus: "Unpaid",
    shippingCost: 150,
    taxAmount: 1520
  },
  {
    id: "PO-2026-003",
    supplierId: "sup-2",
    supplierName: "SensorTech Systems",
    orderDate: "2026-07-04",
    deliveryDate: "2026-07-11",
    items: [
      { productId: "prod-2", productName: "Laser Distance Sensor LX3", quantity: 50, unitPrice: 110, totalPrice: 5500 }
    ],
    totalAmount: 5500,
    status: "Approved",
    paymentStatus: "Unpaid",
    shippingCost: 80,
    taxAmount: 440,
    approvedBy: "Alice Chen"
  }
];

export const INITIAL_REQUISITIONS: PurchaseRequisition[] = [
  {
    id: "PR-2026-001",
    requesterName: "Marcus Vance",
    department: "Warehouse A",
    requestDate: "2026-07-03",
    items: [
      { productId: "prod-4", productName: "Conveyor Belt Motor 450W", quantity: 5, estimatedCost: 320 }
    ],
    totalEstimatedCost: 1600,
    priority: "High",
    status: "Pending Approval",
    remarks: "Critical: Conveyor line 2 is down due to a failed motor."
  },
  {
    id: "PR-2026-002",
    requesterName: "Kenji Sato",
    department: "Logistics",
    requestDate: "2026-07-01",
    items: [
      { productId: "prod-1", productName: "Industrial Drone V2", quantity: 2, estimatedCost: 1850 }
    ],
    totalEstimatedCost: 3700,
    priority: "Medium",
    status: "Approved",
    remarks: "Upgrading delivery dispatch drone capabilities."
  }
];

export const INITIAL_RFQS: RFQ[] = [
  {
    id: "RFQ-2026-001",
    title: "Quarterly Sensors Procurement",
    createdDate: "2026-06-25",
    closeDate: "2026-07-15",
    items: [
      { productId: "prod-2", productName: "Laser Distance Sensor LX3", quantity: 150 }
    ],
    suppliers: ["sup-2", "sup-3"],
    status: "Responses Received",
    responses: [
      {
        supplierId: "sup-2",
        supplierName: "SensorTech Systems",
        unitPrices: { "prod-2": 105 },
        shippingCost: 120,
        leadTime: 4,
        remarks: "Special discounted price for bulk order."
      },
      {
        supplierId: "sup-3",
        supplierName: "Global Logistics Corp",
        unitPrices: { "prod-2": 115 },
        shippingCost: 90,
        leadTime: 12,
        remarks: "Includes extra 1-year product warranty."
      }
    ]
  }
];

export const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "notif-1",
    type: "error",
    title: "Out of Stock Alert",
    message: "Conveyor Belt Motor 450W is completely out of stock. Minimum requirement: 5 Pcs.",
    timestamp: "2026-07-06T08:15:00Z",
    read: false,
    module: "inventory"
  },
  {
    id: "notif-2",
    type: "warning",
    title: "Low Stock Warning",
    message: "Robotic Arm Controller Board is low. Current: 8 Pcs, Minimum: 15 Pcs.",
    timestamp: "2026-07-06T09:00:00Z",
    read: false,
    module: "inventory"
  },
  {
    id: "notif-3",
    type: "info",
    title: "Approval Request",
    message: "PO-2026-002 (VoltGrid Power Supplies) is awaiting your approval ($19,000.00).",
    timestamp: "2026-07-05T14:30:00Z",
    read: false,
    module: "procurement"
  },
  {
    id: "notif-4",
    type: "warning",
    title: "Expiring Products",
    message: "Lithium Ion Smart Battery Pack (Batch BAT-LI-99) expires in less than 12 months.",
    timestamp: "2026-07-04T10:00:00Z",
    read: true,
    module: "inventory"
  }
];

export const INITIAL_LOGS: ActivityLog[] = [
  {
    id: "log-1",
    userId: "user-ceo",
    userName: "Christian Logan",
    userRole: "CEO",
    action: "Login",
    details: "Christian Logan successfully authenticated into the dashboard.",
    timestamp: "2026-07-06T09:30:00+05:30"
  },
  {
    id: "log-2",
    userId: "user-admin",
    userName: "Alice Chen",
    userRole: "Admin",
    action: "Stock Adjust",
    details: "Adjusted stock quantity of Industrial Drone V2 from 42 to 45 Pcs.",
    timestamp: "2026-07-06T09:12:00+05:30"
  },
  {
    id: "log-3",
    userId: "user-store",
    userName: "Robert Vance",
    userRole: "Store Keeper",
    action: "Receive Order",
    details: "Marked PO-2026-001 as Received and updated warehouse bins.",
    timestamp: "2026-07-06T08:45:00+05:30"
  }
];

// Browser LocalStorage Sync Engine
class LocalDB {
  private getStorageItem<T>(key: string, initial: T): T {
    if (typeof window === 'undefined') return initial;
    const item = localStorage.getItem(key);
    return item ? JSON.parse(item) : initial;
  }

  private setStorageItem<T>(key: string, value: T): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(key, JSON.stringify(value));
  }

  get products(): Product[] {
    return this.getStorageItem('mrrobot_products', INITIAL_PRODUCTS);
  }
  set products(val: Product[]) {
    this.setStorageItem('mrrobot_products', val);
  }

  get suppliers(): Supplier[] {
    return this.getStorageItem('mrrobot_suppliers', INITIAL_SUPPLIERS);
  }
  set suppliers(val: Supplier[]) {
    this.setStorageItem('mrrobot_suppliers', val);
  }

  get warehouses(): Warehouse[] {
    return this.getStorageItem('mrrobot_warehouses', INITIAL_WAREHOUSES);
  }
  set warehouses(val: Warehouse[]) {
    this.setStorageItem('mrrobot_warehouses', val);
  }

  get purchaseOrders(): PurchaseOrder[] {
    return this.getStorageItem('mrrobot_purchase_orders', INITIAL_PURCHASE_ORDERS);
  }
  set purchaseOrders(val: PurchaseOrder[]) {
    this.setStorageItem('mrrobot_purchase_orders', val);
  }

  get requisitions(): PurchaseRequisition[] {
    return this.getStorageItem('mrrobot_requisitions', INITIAL_REQUISITIONS);
  }
  set requisitions(val: PurchaseRequisition[]) {
    this.setStorageItem('mrrobot_requisitions', val);
  }

  get rfqs(): RFQ[] {
    return this.getStorageItem('mrrobot_rfqs', INITIAL_RFQS);
  }
  set rfqs(val: RFQ[]) {
    this.setStorageItem('mrrobot_rfqs', val);
  }

  get notifications(): AppNotification[] {
    return this.getStorageItem('mrrobot_notifications', INITIAL_NOTIFICATIONS);
  }
  set notifications(val: AppNotification[]) {
    this.setStorageItem('mrrobot_notifications', val);
  }

  get logs(): ActivityLog[] {
    return this.getStorageItem('mrrobot_logs', INITIAL_LOGS);
  }
  set logs(val: ActivityLog[]) {
    this.setStorageItem('mrrobot_logs', val);
  }

  logActivity(userId: string, userName: string, role: string, action: string, details: string) {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}`,
      userId,
      userName,
      userRole: role,
      action,
      details,
      timestamp: new Date().toISOString()
    };
    const current = this.logs;
    this.logs = [newLog, ...current].slice(0, 100);
  }

  pushNotification(type: AppNotification['type'], title: string, message: string, module: AppNotification['module']) {
    const newNotif: AppNotification = {
      id: `notif-${Date.now()}`,
      type,
      title,
      message,
      timestamp: new Date().toISOString(),
      read: false,
      module
    };
    this.notifications = [newNotif, ...this.notifications];
  }
}

export const db = new LocalDB();
