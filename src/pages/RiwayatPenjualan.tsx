import { useState, useEffect, useCallback } from 'react';
import { Search, Eye, X, Printer, ShoppingBag, Loader2, AlertCircle } from 'lucide-react';
import { Sale } from '../types';
import { getSales, formatRupiah, formatDate } from '../utils/api';

export default function RiwayatPenjualan() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const [detail, setDetail] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const data = await getSales();
      setSales([...data].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    } catch {
      setError('Gagal memuat riwayat penjualan. Pastikan server backend berjalan.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = sales.filter((s) => {
    const q = search.toLowerCase();
    return s.noTransaksi.toLowerCase().includes(q) || s.namaCustomer.toLowerCase().includes(q);
  });

  return (
    <div className="p-5 space-y-4">
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={16} className="shrink-0" />{error}
        </div>
      )}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          placeholder="Cari nomor transaksi atau nama customer..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 size={28} className="animate-spin mr-2" /> Memuat riwayat...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">No. Transaksi</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Tanggal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-slate-400">
                      <ShoppingBag size={36} className="mx-auto mb-2 opacity-30" />
                      <p>Tidak ada data penjualan</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">{s.noTransaksi}</td>
                      <td className="px-4 py-3 text-slate-600 text-xs">{formatDate(s.tanggal)}</td>
                      <td className="px-4 py-3 text-slate-700 font-medium">{s.namaCustomer}</td>
                      <td className="px-4 py-3 text-right font-bold text-green-600">{formatRupiah(s.total)}</td>
                      <td className="px-4 py-3 text-center">
                        <button onClick={() => setDetail(s)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      {detail && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-semibold text-slate-800">{detail.noTransaksi}</h2>
                <p className="text-xs text-slate-400">{formatDate(detail.tanggal)}</p>
              </div>
              <button onClick={() => setDetail(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500">
                <X size={18} />
              </button>
            </div>
            <div className="p-5 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-xs text-slate-400">Customer</p>
                  <p className="font-medium text-slate-700">{detail.namaCustomer}</p>
                </div>
                {detail.catatan && (
                  <div>
                    <p className="text-xs text-slate-400">Catatan</p>
                    <p className="text-slate-700 italic">"{detail.catatan}"</p>
                  </div>
                )}
              </div>

              <div className="border border-slate-100 rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Item</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500">Qty</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {detail.items.map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">
                          <p className="font-medium text-slate-700">{item.namaProduct}</p>
                          <p className="text-[10px] text-slate-400">{formatRupiah(item.hargaJual)} / {item.satuan}</p>
                        </td>
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
                <div className="flex justify-between font-bold text-slate-800 text-base border-t border-slate-200 pt-2 mt-2">
                  <span>TOTAL</span><span>{formatRupiah(detail.total)}</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 pt-1">
                  <span>Bayar</span><span>{formatRupiah(detail.bayar)}</span>
                </div>
                <div className="flex justify-between text-xs text-green-600 font-medium">
                  <span>Kembalian</span><span>{formatRupiah(detail.kembalian)}</span>
                </div>
              </div>

              <button onClick={() => window.print()} className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-medium hover:bg-slate-900 transition-colors">
                <Printer size={16} /> Cetak Struk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
