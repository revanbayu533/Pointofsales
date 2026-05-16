export interface Product {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  satuan: string;
  hargaBeli: number;
  hargaJual: number;
  stok: number;
  createdAt: string;
}

export interface Supplier {
  id: string;
  kode: string;
  nama: string;
  alamat: string;
  telepon: string;
  email: string;
  createdAt: string;
}

export interface Customer {
  id: string;
  kode: string;
  nama: string;
  alamat: string;
  telepon: string;
  email: string;
  createdAt: string;
}

export interface PurchaseItem {
  productId: string;
  kodeProduct: string;
  namaProduct: string;
  satuan: string;
  qty: number;
  hargaBeli: number;
  subtotal: number;
}

export interface Purchase {
  id: string;
  noPembelian: string;
  tanggal: string;
  supplierId: string;
  namaSuplier: string;
  items: PurchaseItem[];
  subtotal: number;
  diskon: number;
  pajak: number;
  total: number;
  status: 'pending' | 'selesai' | 'batal';
  catatan: string;
  createdAt: string;
}

export interface SaleItem {
  productId: string;
  kodeProduct: string;
  namaProduct: string;
  satuan: string;
  qty: number;
  hargaJual: number;
  subtotal: number;
}

export interface Sale {
  id: string;
  noTransaksi: string;
  tanggal: string;
  customerId: string;
  namaCustomer: string;
  items: SaleItem[];
  subtotal: number;
  diskon: number;
  pajak: number;
  total: number;
  bayar: number;
  kembalian: number;
  status: 'pending' | 'selesai' | 'batal';
  catatan: string;
  createdAt: string;
}

export type PageType =
  | 'dashboard'
  | 'produk'
  | 'supplier'
  | 'customer'
  | 'pembelian'
  | 'penjualan'
  | 'riwayat-pembelian'
  | 'riwayat-penjualan'
  | 'laporan';
