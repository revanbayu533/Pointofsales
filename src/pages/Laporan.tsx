import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
  LineChart, Line,
} from 'recharts';
import { getProducts, getSales, getPurchases, formatRupiah, getDashboard, formatDate } from '../utils/api';
import { TrendingUp, ShoppingCart, Store, Package, Loader2, AlertCircle } from 'lucide-react';
import { Product, Sale, Purchase } from '../types';

const COLORS = ['#10b981', '#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4', '#84cc16'];

type Period = '7' | '30' | '90' | 'all';

export default function Laporan() {
  const [period, setPeriod] = useState<Period>('30');
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [prods, s, p] = await Promise.all([getProducts(), getSales(), getPurchases()]);
      setProducts(prods); setSales(s); setPurchases(p);
    } catch {
      setError('Gagal memuat data laporan.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const cutoff = useMemo(() => {
    if (period === 'all') return new Date(0);
    const d = new Date();
    d.setDate(d.getDate() - Number(period));
    return d;
  }, [period]);

  const filteredSales = sales.filter((s) => s.status === 'selesai' && new Date(s.tanggal) >= cutoff);
  const filteredPurchases = purchases.filter((p) => p.status === 'selesai' && new Date(p.tanggal) >= cutoff);

  const totalPenjualan = filteredSales.reduce((s, x) => s + x.total, 0);
  const totalPembelian = filteredPurchases.reduce((s, x) => s + x.total, 0);
  
  // HPP Calculation from Sale Items
  const totalHPP = filteredSales.reduce((acc, s) => {
    return acc + s.items.reduce((ia, item) => {
      const p = products.find((x) => x.id === item.productId);
      return ia + (p ? p.hargaBeli * item.qty : 0);
    }, 0);
  }, 0);

  const labaKotor = totalPenjualan - totalHPP;
  const marginPersen = totalPenjualan > 0 ? ((labaKotor / totalPenjualan) * 100).toFixed(1) : '0';

  const dailyData = useMemo(() => {
    const days: Record<string, { name: string; penjualan: number; laba: number }> = {};
    const numDays = period === 'all' ? 30 : Number(period);
    const now = new Date();
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      days[key] = { name: d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' }), penjualan: 0, laba: 0 };
    }
    filteredSales.forEach((s) => {
      const key = s.tanggal.slice(0, 10);
      if (days[key]) {
        days[key].penjualan += s.total;
        const hpp = s.items.reduce((ia, item) => {
          const p = products.find((x) => x.id === item.productId);
          return ia + (p ? p.hargaBeli * item.qty : 0);
        }, 0);
        days[key].laba += s.total - hpp;
      }
    });
    return Object.values(days);
  }, [filteredSales, products, period]);

  const topProducts = useMemo(() => {
    const map: Record<string, { nama: string; qty: number; total: number; laba: number }> = {};
    filteredSales.forEach((s) => {
      s.items.forEach((item) => {
        if (!map[item.productId]) map[item.productId] = { nama: item.namaProduct, qty: 0, total: 0, laba: 0 };
        const prod = products.find((p) => p.id === item.productId);
        const hpp = prod ? prod.hargaBeli * item.qty : 0;
        map[item.productId].qty += item.qty;
        map[item.productId].total += item.subtotal;
        map[item.productId].laba += item.subtotal - hpp;
      });
    });
    return Object.values(map).sort((a, b) => b.total - a.total).slice(0, 5);
  }, [filteredSales, products]);

  if (loading) return (
    <div className="flex items-center justify-center h-96 text-slate-400">
      <Loader2 size={36} className="animate-spin mr-3" /> Memuat data laporan...
    </div>
  );

  return (
    <div className="p-5 space-y-5">
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={16} className="shrink-0" />{error}
        </div>
      )}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm text-slate-500 font-medium">Periode:</span>
        {([['7', '7 Hari'], ['30', '30 Hari'], ['90', '90 Hari'], ['all', 'Semua']] as [Period, string][]).map(([v, l]) => (
          <button key={v} onClick={() => setPeriod(v)} className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${period === v ? 'bg-green-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}>{l}</button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard label="Total Penjualan" value={formatRupiah(totalPenjualan)} icon={<Store size={18} />} color="green" sub={`${filteredSales.length} transaksi`} />
        <KPICard label="Total Pembelian" value={formatRupiah(totalPembelian)} icon={<ShoppingCart size={18} />} color="orange" sub={`${filteredPurchases.length} transaksi`} />
        <KPICard label="Laba Kotor" value={formatRupiah(labaKotor)} icon={<TrendingUp size={18} />} color={labaKotor >= 0 ? 'green' : 'red'} sub={`Margin ${marginPersen}%`} />
        <KPICard label="Total Produk" value={products.length.toString()} icon={<Package size={18} />} color="purple" sub={`${products.filter(p => p.stok < 10).length} stok rendah`} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wider">Grafik Performa Harian</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={dailyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} tickFormatter={(v: any) => `${(Number(v) / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: any) => formatRupiah(Number(v))} />
              <Legend verticalAlign="top" height={36}/>
              <Line type="monotone" dataKey="penjualan" name="Penjualan" stroke="#10b981" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="laba" name="Laba" stroke="#3b82f6" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-700 mb-4 text-sm uppercase tracking-wider">Top 5 Produk (Omzet)</h3>
          <div className="space-y-4">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-lg bg-green-50 text-green-600 text-xs font-bold flex items-center justify-center">{i+1}</span>
                  <div>
                    <p className="text-sm font-medium text-slate-700">{p.nama}</p>
                    <p className="text-[10px] text-slate-400">{p.qty} terjual</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-800">{formatRupiah(p.total)}</p>
                  <p className="text-[10px] text-green-600 font-medium">Laba: {formatRupiah(p.laba)}</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && <p className="text-center py-10 text-slate-400 text-sm italic">Belum ada data</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

function KPICard({ label, value, icon, color, sub }: { label: string; value: string; icon: React.ReactNode; color: string; sub: string }) {
  const gradients: Record<string, string> = {
    blue: 'from-blue-500 to-blue-600',
    orange: 'from-orange-500 to-orange-600',
    green: 'from-emerald-500 to-emerald-600',
    red: 'from-red-500 to-red-600',
    purple: 'from-purple-500 to-purple-600',
  };
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradients[color] || gradients.blue} flex items-center justify-center text-white mb-3 shadow`}>{icon}</div>
      <p className="text-xl font-bold text-slate-800 leading-tight">{value}</p>
      <p className="text-xs text-slate-500 mt-0.5">{label}</p>
      <p className="text-[10px] text-slate-400 mt-1">{sub}</p>
    </div>
  );
}
