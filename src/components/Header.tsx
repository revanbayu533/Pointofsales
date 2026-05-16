import { Menu, Bell, User, ChevronDown } from 'lucide-react';
import { PageType } from '../types';

interface HeaderProps {
  activePage: PageType;
  onToggleSidebar: () => void;
}

const pageTitles: Record<PageType, string> = {
  dashboard: 'Dashboard',
  produk: 'Manajemen Produk',
  supplier: 'Manajemen Supplier',
  customer: 'Manajemen Customer',
  pembelian: 'Buat Pembelian',
  penjualan: 'Buat Penjualan / Kasir',
  'riwayat-pembelian': 'Riwayat Pembelian',
  'riwayat-penjualan': 'Riwayat Penjualan',
  laporan: 'Laporan & Analisa',
};

export default function Header({ activePage, onToggleSidebar }: HeaderProps) {
  const now = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  return (
    <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
        >
          <Menu size={20} />
        </button>
        <div>
          <h1 className="font-semibold text-slate-800 text-base leading-tight">{pageTitles[activePage]}</h1>
          <p className="text-xs text-slate-400">{now}</p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 relative transition-colors">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-slate-100 cursor-pointer transition-colors">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
            <User size={14} className="text-white" />
          </div>
          <span className="text-sm font-medium text-slate-700 hidden sm:block">Admin</span>
          <ChevronDown size={14} className="text-slate-400 hidden sm:block" />
        </div>
      </div>
    </header>
  );
}
