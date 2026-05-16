// ============================================================
//  API CLIENT - Menghubungkan frontend ke backend MySQL
//  Semua operasi CRUD diarahkan ke Express API di port 3001
// ============================================================

import { Product, Supplier, Customer, Purchase, Sale } from '../types';

const BASE = 'http://localhost:3001/api';

// ---- Helper fetch ----
async function apiFetch<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${url}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Terjadi kesalahan pada server');
  return data as T;
}

// ====================================================
// PRODUK
// ====================================================
export const getProducts = (): Promise<Product[]> =>
  apiFetch<Product[]>('/produk');

export const getProduct = (id: string): Promise<Product> =>
  apiFetch<Product>(`/produk/${id}`);

export const addProduct = (p: Omit<Product, 'id' | 'createdAt'>): Promise<{ id: string }> =>
  apiFetch('/produk', { method: 'POST', body: JSON.stringify(p) });

export const updateProduct = (p: Product): Promise<void> =>
  apiFetch(`/produk/${p.id}`, { method: 'PUT', body: JSON.stringify(p) });

export const deleteProduct = (id: string): Promise<void> =>
  apiFetch(`/produk/${id}`, { method: 'DELETE' });

// ====================================================
// SUPPLIER
// ====================================================
export const getSuppliers = (): Promise<Supplier[]> =>
  apiFetch<Supplier[]>('/supplier');

export const addSupplier = (s: Omit<Supplier, 'id' | 'createdAt'>): Promise<{ id: string }> =>
  apiFetch('/supplier', { method: 'POST', body: JSON.stringify(s) });

export const updateSupplier = (s: Supplier): Promise<void> =>
  apiFetch(`/supplier/${s.id}`, { method: 'PUT', body: JSON.stringify(s) });

export const deleteSupplier = (id: string): Promise<void> =>
  apiFetch(`/supplier/${id}`, { method: 'DELETE' });

// ====================================================
// CUSTOMER
// ====================================================
export const getCustomers = (): Promise<Customer[]> =>
  apiFetch<Customer[]>('/customer');

export const addCustomer = (c: Omit<Customer, 'id' | 'createdAt'>): Promise<{ id: string }> =>
  apiFetch('/customer', { method: 'POST', body: JSON.stringify(c) });

export const updateCustomer = (c: Customer): Promise<void> =>
  apiFetch(`/customer/${c.id}`, { method: 'PUT', body: JSON.stringify(c) });

export const deleteCustomer = (id: string): Promise<void> =>
  apiFetch(`/customer/${id}`, { method: 'DELETE' });

// ====================================================
// PEMBELIAN
// ====================================================
export const getPurchases = (): Promise<Purchase[]> =>
  apiFetch<Purchase[]>('/pembelian');

export const addPurchase = (p: Omit<Purchase, 'id' | 'createdAt' | 'noPembelian'>): Promise<{ id: string; noPembelian: string }> =>
  apiFetch('/pembelian', { method: 'POST', body: JSON.stringify(p) });

export const updatePurchaseStatus = (id: string, status: 'selesai' | 'batal'): Promise<void> =>
  apiFetch(`/pembelian/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });

// ====================================================
// PENJUALAN
// ====================================================
export const getSales = (): Promise<Sale[]> =>
  apiFetch<Sale[]>('/penjualan');

export const addSale = (s: Omit<Sale, 'id' | 'createdAt' | 'noTransaksi'>): Promise<{ id: string; noTransaksi: string }> =>
  apiFetch('/penjualan', { method: 'POST', body: JSON.stringify(s) });

// ====================================================
// DASHBOARD & LAPORAN
// ====================================================
export const getDashboard = () =>
  apiFetch<{
    hari: { totalTransaksi: number; totalPendapatan: number; totalPengeluaran: number; laba: number };
    totalProduk: number;
    stokRendah: number;
    penjualanBulanan: { bulan: string; total: number; transaksi: number }[];
    produkTerlaris: { nama: string; totalQty: number; totalOmzet: number }[];
    stokMenipis: { id: string; kode: string; nama: string; stok: number; stokMin: number; satuan: string }[];
  }>('/laporan/dashboard');

export const getLaporanPenjualan = (dari?: string, sampai?: string) => {
  const params = new URLSearchParams();
  if (dari) params.append('dari', dari);
  if (sampai) params.append('sampai', sampai);
  return apiFetch<{ id: string; noTransaksi: string; tanggal: string; namaCustomer: string; total: number; metodeBayar: string }[]>(
    `/laporan/penjualan?${params.toString()}`
  );
};

export const getKategori = () =>
  apiFetch<{ id: number; nama: string }[]>('/kategori');

// ====================================================
// FORMATTING HELPERS (tetap di sini, tidak perlu API)
// ====================================================
export const formatRupiah = (num: number): string =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

export const formatDate = (dateStr: string): string =>
  new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' });

export const generateNoTransaksi = (prefix: string, list: unknown[]): string => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  return `${prefix}-${y}${m}${d}-${String(list.length + 1).padStart(4, '0')}`;
};
