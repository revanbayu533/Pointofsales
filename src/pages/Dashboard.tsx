import { useState, useEffect, useCallback } from 'react';
import {
  ShoppingCart, Store, Package, TrendingUp, TrendingDown,
  ArrowUpRight, AlertTriangle, Loader2, AlertCircle,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line, Legend,
} from 'recharts';
import { getDashboard, formatRupiah, formatDate } from '../utils/api';
import { PageType } from '../types';

interface DashboardProps { onNavigate: (page: PageType) => void; }

type DashboardData = Awaited<ReturnType<typeof getDashboard>>;

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setData(await getDashboard()); }
    catch { setError('Gagal terhubung ke server. Pastikan backend berjalan di port 3001.'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400">
        <Loader2 size={36} className="animate-spin mr-3" /> Memuat dashboard...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-5">
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-5 py-4 rounded-2xl">
          <AlertCircle size={20} className="shrink-0" />
          <div>
            <p className="font-semibold">Koneksi Database Gagal</p>
            <p className="text-sm mt-0.5">{error}</p>
            <button onClick={load} className="mt-2 text-sm font-medium underline">Coba Lagi</button>
          </div>
        </div>
      </div>
    );
  }

  const { hari, totalProduk, stokRendah, penjualanBulanan, produkTerlaris, stokMenipis } = data;

  return (
    <div className="p-5 space-y-5">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Penjualan Hari Ini"
          value={formatRupiah(hari.totalPendapatan)}
          icon={<Store size={20} />}
          color="green"
          sub={`${hari.totalTransaksi} transaksi`}
          onClick={() => onNavigate('riwayat-penjualan')}
        />
        <StatCard
          label="Pembelian Hari Ini"
          value={formatRupiah(hari.totalPengeluaran)}
          icon={<ShoppingCart size={20} />}
          color="orange"
          sub="total pembelian"
          onClick={() => onNavigate('riwayat-pembelian')}
        />
        <StatCard
          label="Laba Hari Ini"
          value={formatRupiah(hari.laba)}
          icon={hari.laba >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
          color={hari.laba >= 0 ? 'green' : 'red'}
          sub="pendapatan - pembelian"
        />
        <StatCard
          label="Total Produk"
          value={totalProduk.toString()}
          icon={<Package size={20} />}
          color="purple"
          sub={`${stokRendah} stok menipis`}
          onClick={() => onNavigate('produk')}
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        <div className="xl:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-700 mb-4">Grafik Penjualan 6 Bulan Terakhir</h3>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={penjualanBulanan}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="bulan" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v: unknown) => `${(Number(v) / 1000).toFixed(0)}k`} />
              <Tooltip formatter={(v: unknown) => formatRupiah(Number(v))} />
              <Legend />
              <Line type="monotone" dataKey="total" name="Penjualan" stroke="#10b981" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="transaksi" name="Transaksi" stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <h3 className="font-semibold text-slate-700 mb-4">Produk Terlaris (30 Hari)</h3>
          {produkTerlaris.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400 gap-2">
              <Store size={32} className="opacity-30" />
              <p className="text-sm">Belum ada data penjualan</p>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={produkTerlaris} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 10 }} />
                <YAxis dataKey="nama" type="category" tick={{ fontSize: 10 }} width={90} />
                <Tooltip />
                <Bar dataKey="totalQty" name="Qty Terjual" fill="#10b981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Recent Sales from Dashboard API */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">Ringkasan Hari Ini</h3>
            <button onClick={() => onNavigate('riwayat-penjualan')} className="text-green-600 text-xs font-medium flex items-center gap-1 hover:underline">
              Lihat semua <ArrowUpRight size={12} />
            </button>
          </div>
          <div className="space-y-3">
            {[
              { label: 'Total Transaksi', val: `${hari.totalTransaksi} transaksi`, color: 'text-green-600' },
              { label: 'Total Pendapatan', val: formatRupiah(hari.totalPendapatan), color: 'text-green-600' },
              { label: 'Total Pengeluaran', val: formatRupiah(hari.totalPengeluaran), color: 'text-orange-500' },
              { label: 'Laba Bersih', val: formatRupiah(hari.laba), color: hari.laba >= 0 ? 'text-emerald-600' : 'text-red-500' },
            ].map(item => (
              <div key={item.label} className="flex justify-between items-center py-2 border-b border-slate-50 last:border-0">
                <span className="text-sm text-slate-500">{item.label}</span>
                <span className={`text-sm font-semibold ${item.color}`}>{item.val}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Low Stock Alert */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-700">Peringatan Stok Menipis</h3>
            <button onClick={() => onNavigate('produk')} className="text-green-600 text-xs font-medium flex items-center gap-1 hover:underline">
              Kelola produk <ArrowUpRight size={12} />
            </button>
          </div>
          {stokMenipis.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-green-500 gap-2">
              <Package size={28} className="opacity-50" />
              <p className="text-sm text-slate-400">Semua stok aman</p>
            </div>
          ) : (
            <div className="space-y-2">
              {stokMenipis.slice(0, 5).map((p) => (
                <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-2">
                    <AlertTriangle size={14} className={p.stok === 0 ? 'text-red-500' : 'text-yellow-500'} />
                    <div>
                      <p className="text-sm font-medium text-slate-700">{p.nama}</p>
                      <p className="text-xs text-slate-400">{p.kode} · Min: {p.stokMin}</p>
                    </div>
                  </div>
                  <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.stok === 0 ? 'bg-red-100 text-red-600' : 'bg-yellow-100 text-yellow-700'}`}>
                    {p.stok} {p.satuan}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color, sub, onClick }: {
  label: string; value: string; icon: React.ReactNode;
  color: 'blue' | 'orange' | 'green' | 'red' | 'purple'; sub: string; onClick?: () => void;
}) {
  const colors = {
    blue: 'from-blue-500 to-blue-600 shadow-blue-200',
    orange: 'from-orange-500 to-orange-600 shadow-orange-200',
    green: 'from-emerald-500 to-emerald-600 shadow-emerald-200',
    red: 'from-red-500 to-red-600 shadow-red-200',
    purple: 'from-purple-500 to-purple-600 shadow-purple-200',
  };
  return (
    <div className={`bg-white rounded-2xl shadow-sm border border-slate-100 p-4 ${onClick ? 'cursor-pointer hover:shadow-md transition-shadow' : ''}`} onClick={onClick}>
      <div className="flex items-start justify-between">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${colors[color]} shadow-lg flex items-center justify-center text-white`}>{icon}</div>
      </div>
      <div className="mt-3">
        <p className="text-xl font-bold text-slate-800 leading-tight">{value}</p>
        <p className="text-xs text-slate-500 mt-0.5">{label}</p>
        <p className="text-[11px] text-slate-400 mt-1">{sub}</p>
      </div>
    </div>
  );
}

// Keep formatDate usage for compatibility
const _formatDate = formatDate;
void _formatDate;
