import Link from 'next/link';
import {
  LayoutDashboard,
  Package,
  Users,
  Truck,
  ShoppingCart,
  Store,
  ClipboardList,
  FileText,
  BarChart3,
  ChevronRight,
  Leaf,
} from 'lucide-react';
import { PageType } from '../types';

interface SidebarProps {
  activePage: PageType;
  onNavigate?: (page: PageType) => void;
  isOpen: boolean;
}

interface NavItem {
  label: string;
  page: PageType;
  icon: React.ReactNode;
  group?: string;
}

const navItems: NavItem[] = [
  { label: 'Dashboard', page: 'dashboard', icon: <LayoutDashboard size={18} /> },
  { label: 'Produk', page: 'produk', icon: <Package size={18} />, group: 'Master Data' },
  { label: 'Supplier', page: 'supplier', icon: <Truck size={18} />, group: 'Master Data' },
  { label: 'Customer', page: 'customer', icon: <Users size={18} />, group: 'Master Data' },
  { label: 'Buat Pembelian', page: 'pembelian', icon: <ShoppingCart size={18} />, group: 'Transaksi' },
  { label: 'Buat Penjualan', page: 'penjualan', icon: <Store size={18} />, group: 'Transaksi' },
  { label: 'Riwayat Pembelian', page: 'riwayat-pembelian', icon: <ClipboardList size={18} />, group: 'Riwayat' },
  { label: 'Riwayat Penjualan', page: 'riwayat-penjualan', icon: <FileText size={18} />, group: 'Riwayat' },
  { label: 'Laporan', page: 'laporan', icon: <BarChart3 size={18} />, group: 'Laporan' },
];

export default function Sidebar({ activePage, onNavigate, isOpen }: SidebarProps) {
  const groups = ['', 'Master Data', 'Transaksi', 'Riwayat', 'Laporan'];

  return (
    <aside
      className={`fixed top-0 left-0 z-40 h-full bg-gradient-to-b from-slate-900 to-slate-800 text-white transition-all duration-300 shadow-2xl flex flex-col ${
        isOpen ? 'w-64' : 'w-0 overflow-hidden'
      }`}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center flex-shrink-0 shadow-lg">
          <Leaf size={18} className="text-white fill-white" />
        </div>
        <div className="min-w-0">
          <p className="font-bold text-sm text-white leading-tight truncate">FreshCart</p>
          <p className="text-xs text-slate-400 truncate">Pembelian & Penjualan</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
        {groups.map((group) => {
          const items = navItems.filter((i) => (i.group ?? '') === group);
          if (items.length === 0) return null;
          return (
            <div key={group}>
              {group && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500 px-3 pt-4 pb-1">
                  {group}
                </p>
              )}
              {items.map((item) => {
                const isActive = activePage === item.page;
                const href = `/${item.page}`;
                return (
                  <Link
                    key={item.page}
                    href={href}
                    onClick={() => onNavigate?.(item.page)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                      isActive
                        ? 'bg-green-600 text-white shadow-lg shadow-green-900/40'
                        : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                    }`}
                  >
                    <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}>
                      {item.icon}
                    </span>
                    <span className="flex-1 text-left truncate">{item.label}</span>
                    {isActive && <ChevronRight size={14} className="flex-shrink-0" />}
                  </Link>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-slate-700">
        <p className="text-[10px] text-slate-500 text-center">© 2025 FreshCart v1.0</p>
      </div>
    </aside>
  );
}

