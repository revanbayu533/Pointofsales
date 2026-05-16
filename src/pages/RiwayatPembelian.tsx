import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, X, ClipboardList, CheckCircle, Clock, XCircle, Loader2, AlertCircle } from 'lucide-react';
import { Purchase } from '../types';
import { getPurchases, updatePurchaseStatus, formatRupiah, formatDate } from '../utils/api';

export default function RiwayatPembelian() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [detail, setDetail] = useState<Purchase | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await getPurchases();
      setPurchases([...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      setError('Gagal memuat data pembelian.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = purchases.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.noPembelian.toLowerCase().includes(q) || p.namaSuplier.toLowerCase().includes(q);
    const matchStatus = filterStatus ? p.status === filterStatus : true;
    return matchSearch && matchStatus;
  });

  const handleStatusChange = async (id: string, newStatus: 'selesai' | 'batal') => {
    if (newStatus === 'batal' && !confirm('Batalkan pembelian ini?')) return;
    setUpdating(true);
    try {
      await updatePurchaseStatus(id, newStatus);
      await load();
      setDetail(null);
    } catch (e: unknown) {
      alert((e as Error).message || 'Gagal mengubah status');
    } finally { setUpdating(false); }
  };

  const statusBadge = (s: string) => {
    const map: Record<string, { cls: string; icon: React.ReactNode }> = {
      selesai: { cls: 'bg-green-100 text-green-700', icon: <CheckCircle size={12} /> },
      pending: { cls: 'bg-yellow-100 text-yellow-700', icon: <Clock size={12} /> },
      batal: { cls: 'bg-red-100 text-red-600', icon: <XCircle size={12} /> },
    };
    const config = map[s] || { cls: 'bg-slate-100 text-slate-500', icon: null };
    return (
      <span className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${config.cls}`}>
        {config.icon} {s}
      </span>
    );
  };

  return (
    <div className="p-5 space-y-4">
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={16} className="shrink-0" />{error}
        </div>
      )}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300" placeholder="Cari no. pembelian atau supplier..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <select className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="">Semua Status</option>
          <option value="selesai">Selesai</option>
          <option value="pending">Pending</option>
          <option value="batal">Batal</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 size={28} className="animate-spin mr-2" /> Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">No. Pembelian</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tanggal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Supplier</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400"><ClipboardList size={36} className="mx-auto mb-2 opacity-30" /><p>Tidak ada data pembelian</p></td></tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{p.noPembelian}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{formatDate(p.tanggal)}</td>
                      <td className="px-4 py-3 text-slate-700">{p.namaSuplier}</td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">{formatRupiah(p.total)}</td>
                      <td className="px-4 py-3 text-center">{statusBadge(p.status)}</td>
                      <td className="px-4 py-3 text-center"><button onClick={() => setDetail(p)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"><Eye size={14} /></button></td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {detail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div><h2 className="font-semibold text-slate-800">{detail.noPembelian}</h2><p className="text-xs text-slate-400">{formatDate(detail.tanggal)}</p></div>
              <div className="flex items-center gap-2">{statusBadge(detail.status)}<button onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button></div>
            </div>
            <div className="p-5 space-y-4">
              <div className="text-sm">
                <p className="text-xs text-slate-400">Supplier</p>
                <p className="font-medium text-slate-700">{detail.namaSuplier}</p>
                {detail.catatan && <p className="mt-2 text-slate-600 bg-slate-50 p-2 rounded-lg text-xs italic">"{detail.catatan}"</p>}
              </div>
              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Produk</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500">Qty</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {detail.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2"><p className="font-medium text-slate-700">{item.namaProduct}</p><p className="text-[10px] text-slate-400">{formatRupiah(item.hargaBeli)} / {item.satuan}</p></td>
                        <td className="px-3 py-2 text-center text-slate-600">{item.qty}</td>
                        <td className="px-3 py-2 text-right font-medium text-slate-700">{formatRupiah(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 space-y-1.5 text-sm">
                <div className="flex justify-between text-slate-600"><span>Subtotal</span><span>{formatRupiah(detail.subtotal)}</span></div>
                {detail.diskon > 0 && <div className="flex justify-between text-red-500"><span>Diskon</span><span>- {formatRupiah(detail.diskon)}</span></div>}
                {detail.pajak > 0 && <div className="flex justify-between text-orange-500"><span>Pajak (PPN)</span><span>+ {formatRupiah(detail.pajak)}</span></div>}
                <div className="flex justify-between font-bold text-slate-800 text-base border-t border-slate-200 pt-2 mt-2"><span>TOTAL</span><span>{formatRupiah(detail.total)}</span></div>
              </div>
              {detail.status === 'pending' && (
                <div className="flex gap-2">
                  <button onClick={() => handleStatusChange(detail.id, 'batal')} disabled={updating} className="flex-1 py-2.5 rounded-xl border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 disabled:opacity-50">Batalkan</button>
                  <button onClick={() => handleStatusChange(detail.id, 'selesai')} disabled={updating} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 flex items-center justify-center gap-2 disabled:opacity-50">
                    {updating && <Loader2 size={14} className="animate-spin" />} Konfirmasi Selesai
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
