import { Product, Supplier, Customer, Purchase, Sale } from '../types';

const KEYS = {
  products: 'pos_products',
  suppliers: 'pos_suppliers',
  customers: 'pos_customers',
  purchases: 'pos_purchases',
  sales: 'pos_sales',
};

// ---- Generic Helpers ----
function getAll<T>(key: string): T[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(key) || '[]') as T[];
  } catch {
    return [];
  }
}

function saveAll<T>(key: string, data: T[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ---- Products ----
export const getProducts = (): Product[] => getAll<Product>(KEYS.products);
export const saveProducts = (data: Product[]) => saveAll(KEYS.products, data);

export const addProduct = (p: Product) => {
  const list = getProducts();
  list.push(p);
  saveProducts(list);
};
export const updateProduct = (p: Product) => {
  const list = getProducts().map((x) => (x.id === p.id ? p : x));
  saveProducts(list);
};
export const deleteProduct = (id: string) => {
  const list = getProducts().filter((x) => x.id !== id);
  saveProducts(list);
};

// ---- Suppliers ----
export const getSuppliers = (): Supplier[] => getAll<Supplier>(KEYS.suppliers);
export const saveSuppliers = (data: Supplier[]) => saveAll(KEYS.suppliers, data);

export const addSupplier = (s: Supplier) => {
  const list = getSuppliers();
  list.push(s);
  saveSuppliers(list);
};
export const updateSupplier = (s: Supplier) => {
  const list = getSuppliers().map((x) => (x.id === s.id ? s : x));
  saveSuppliers(list);
};
export const deleteSupplier = (id: string) => {
  const list = getSuppliers().filter((x) => x.id !== id);
  saveSuppliers(list);
};

// ---- Customers ----
export const getCustomers = (): Customer[] => getAll<Customer>(KEYS.customers);
export const saveCustomers = (data: Customer[]) => saveAll(KEYS.customers, data);

export const addCustomer = (c: Customer) => {
  const list = getCustomers();
  list.push(c);
  saveCustomers(list);
};
export const updateCustomer = (c: Customer) => {
  const list = getCustomers().map((x) => (x.id === c.id ? c : x));
  saveCustomers(list);
};
export const deleteCustomer = (id: string) => {
  const list = getCustomers().filter((x) => x.id !== id);
  saveCustomers(list);
};

// ---- Purchases ----
export const getPurchases = (): Purchase[] => getAll<Purchase>(KEYS.purchases);
export const savePurchases = (data: Purchase[]) => saveAll(KEYS.purchases, data);

export const addPurchase = (p: Purchase) => {
  const list = getPurchases();
  list.push(p);
  savePurchases(list);
};
export const updatePurchase = (p: Purchase) => {
  const list = getPurchases().map((x) => (x.id === p.id ? p : x));
  savePurchases(list);
};

// ---- Sales ----
export const getSales = (): Sale[] => getAll<Sale>(KEYS.sales);
export const saveSales = (data: Sale[]) => saveAll(KEYS.sales, data);

export const addSale = (s: Sale) => {
  const list = getSales();
  list.push(s);
  saveSales(list);
};
export const updateSale = (s: Sale) => {
  const list = getSales().map((x) => (x.id === s.id ? s : x));
  saveSales(list);
};

// ---- Seed Demo Data ----
export const seedDemoData = () => {
  if (getProducts().length > 0) return;

  const now = new Date().toISOString();
  const products: Product[] = [
    { id: '1', kode: 'PRD001', nama: 'Beras Premium 5kg', kategori: 'Bahan Pokok', satuan: 'Karung', hargaBeli: 65000, hargaJual: 75000, stok: 100, createdAt: now },
    { id: '2', kode: 'PRD002', nama: 'Minyak Goreng 1L', kategori: 'Bahan Pokok', satuan: 'Botol', hargaBeli: 14000, hargaJual: 18000, stok: 200, createdAt: now },
    { id: '3', kode: 'PRD003', nama: 'Gula Pasir 1kg', kategori: 'Bahan Pokok', satuan: 'Kg', hargaBeli: 13000, hargaJual: 16000, stok: 150, createdAt: now },
    { id: '4', kode: 'PRD004', nama: 'Indomie Goreng', kategori: 'Mie Instan', satuan: 'Bungkus', hargaBeli: 2500, hargaJual: 3500, stok: 500, createdAt: now },
    { id: '5', kode: 'PRD005', nama: 'Kopi Kapal Api', kategori: 'Minuman', satuan: 'Sachet', hargaBeli: 1000, hargaJual: 1500, stok: 300, createdAt: now },
    { id: '6', kode: 'PRD006', nama: 'Sabun Lifebuoy', kategori: 'Kebersihan', satuan: 'Buah', hargaBeli: 5000, hargaJual: 7500, stok: 80, createdAt: now },
    { id: '7', kode: 'PRD007', nama: 'Shampo Pantene', kategori: 'Kebersihan', satuan: 'Botol', hargaBeli: 22000, hargaJual: 28000, stok: 60, createdAt: now },
    { id: '8', kode: 'PRD008', nama: 'Teh Botol Sosro', kategori: 'Minuman', satuan: 'Botol', hargaBeli: 4000, hargaJual: 5500, stok: 120, createdAt: now },
  ];

  const suppliers: Supplier[] = [
    { id: '1', kode: 'SUP001', nama: 'PT. Indofood Sukses', alamat: 'Jl. Gatot Subroto No. 1, Jakarta', telepon: '021-12345678', email: 'indofood@supplier.com', createdAt: now },
    { id: '2', kode: 'SUP002', nama: 'CV. Sumber Makmur', alamat: 'Jl. Pahlawan No. 45, Surabaya', telepon: '031-87654321', email: 'makmur@supplier.com', createdAt: now },
    { id: '3', kode: 'SUP003', nama: 'UD. Bintang Jaya', alamat: 'Jl. Pemuda No. 12, Bandung', telepon: '022-11223344', email: 'bintang@supplier.com', createdAt: now },
  ];

  const customers: Customer[] = [
    { id: '1', kode: 'CUS001', nama: 'Budi Santoso', alamat: 'Jl. Mawar No. 5, Jakarta', telepon: '08123456789', email: 'budi@email.com', createdAt: now },
    { id: '2', kode: 'CUS002', nama: 'Siti Rahayu', alamat: 'Jl. Melati No. 10, Bandung', telepon: '08234567890', email: 'siti@email.com', createdAt: now },
    { id: '3', kode: 'CUS003', nama: 'Umum / Tunai', alamat: '-', telepon: '-', email: '-', createdAt: now },
  ];

  saveProducts(products);
  saveSuppliers(suppliers);
  saveCustomers(customers);
};

// ---- Number Formatting ----
export const formatRupiah = (num: number): string => {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);
};

export const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });
};

export const generateNoTransaksi = (prefix: string, list: { noTransaksi?: string; noPembelian?: string }[]): string => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;
  const num = (list.length + 1).toString().padStart(4, '0');
  return `${prefix}-${dateStr}-${num}`;
};
