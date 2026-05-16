import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Package, AlertCircle, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { getProducts, addProduct, updateProduct, deleteProduct, formatRupiah, getKategori } from '../utils/api';

const EMPTY: Omit<Product, 'id' | 'createdAt'> = {
  kode: '', nama: '', kategori: '', satuan: 'Pcs', hargaBeli: 0, hargaJual: 0, stok: 0,
};

const SATUANS = ['Pcs', 'Kg', 'Gram', 'Liter', 'Botol', 'Bungkus', 'Karung', 'Buah', 'Lusin', 'Box', 'Sachet'];

export default function Produk() {
  const [products, setProducts] = useState<Product[]>([]);
  const [kategoris, setKategoris] = useState<string[]>(['Bahan Pokok', 'Minuman', 'Mie Instan', 'Kebersihan', 'Elektronik', 'Pakaian', 'Lainnya']);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Omit<Product, 'id' | 'createdAt'>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [filterKategori, setFilterKategori] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const [prods, cats] = await Promise.all([getProducts(), getKategori()]);
      setProducts(prods);
      if (cats.length > 0) setKategoris(cats.map(c => c.nama));
    } catch {
      setError('Gagal memuat data. Pastikan server backend berjalan di port 3001.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = products.filter((p) => {
    const q = search.toLowerCase();
    const matchSearch = p.nama.toLowerCase().includes(q) || p.kode.toLowerCase().includes(q) || p.kategori.toLowerCase().includes(q);
    const matchKat = filterKategori ? p.kategori === filterKategori : true;
    return matchSearch && matchKat;
  });

  const handleSubmit = async () => {
    if (!form.kode || !form.nama) return alert('Kode dan Nama wajib diisi');
    setSaving(true);
    try {
      if (editId) {
        await updateProduct({ ...form, id: editId, createdAt: products.find((p) => p.id === editId)!.createdAt });
      } else {
        await addProduct(form);
      }
      setShowModal(false);
      setForm(EMPTY);
      setEditId(null);
      await load();
    } catch (e: unknown) {
      alert((e as Error).message || 'Gagal menyimpan');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (p: Product) => {
    setForm({ kode: p.kode, nama: p.nama, kategori: p.kategori, satuan: p.satuan, hargaBeli: p.hargaBeli, hargaJual: p.hargaJual, stok: p.stok });
    setEditId(p.id);
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setDeleteConfirm(null);
      await load();
    } catch (e: unknown) {
      alert((e as Error).message || 'Gagal menghapus');
    }
  };

  return (
    <div className="p-5 space-y-4">
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
          <AlertCircle size={16} className="shrink-0" />
          {error}
        </div>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
            placeholder="Cari produk..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-300"
          value={filterKategori}
          onChange={(e) => setFilterKategori(e.target.value)}
        >
          <option value="">Semua Kategori</option>
          {kategoris.map((k) => <option key={k}>{k}</option>)}
        </select>
        <button
          onClick={() => { setForm(EMPTY); setEditId(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors"
        >
          <Plus size={16} /> Tambah Produk
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400">
            <Loader2 size={28} className="animate-spin mr-2" /> Memuat data...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kode</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nama Produk</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Kategori</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden sm:table-cell">Satuan</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Harga Beli</th>
                  <th className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Harga Jual</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Stok</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-12 text-slate-400">
                      <Package size={36} className="mx-auto mb-2 opacity-30" />
                      <p>Tidak ada produk ditemukan</p>
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.kode}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{p.nama}</td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <span className="bg-green-50 text-green-700 text-xs px-2 py-1 rounded-full">{p.kategori}</span>
                      </td>
                      <td className="px-4 py-3 text-slate-500 hidden sm:table-cell">{p.satuan}</td>
                      <td className="px-4 py-3 text-right text-slate-700">{formatRupiah(p.hargaBeli)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-green-600">{formatRupiah(p.hargaJual)}</td>
                      <td className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold px-2 py-1 rounded-full ${p.stok === 0 ? 'bg-red-100 text-red-600' : p.stok < 10 ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                          {p.stok}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(p)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">
          Menampilkan {filtered.length} dari {products.length} produk
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">{editId ? 'Edit Produk' : 'Tambah Produk Baru'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Kode Produk *">
                  <input className={inputCls} value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} placeholder="PRD001" />
                </Field>
                <Field label="Satuan">
                  <select className={inputCls} value={form.satuan} onChange={(e) => setForm({ ...form, satuan: e.target.value })}>
                    {SATUANS.map((s) => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Nama Produk *">
                <input className={inputCls} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama produk" />
              </Field>
              <Field label="Kategori">
                <select className={inputCls} value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
                  <option value="">Pilih Kategori</option>
                  {kategoris.map((k) => <option key={k}>{k}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Harga Beli">
                  <input type="number" className={inputCls} value={form.hargaBeli} onChange={(e) => setForm({ ...form, hargaBeli: Number(e.target.value) })} />
                </Field>
                <Field label="Harga Jual">
                  <input type="number" className={inputCls} value={form.hargaJual} onChange={(e) => setForm({ ...form, hargaJual: Number(e.target.value) })} />
                </Field>
                <Field label="Stok Awal">
                  <input type="number" className={inputCls} value={form.stok} onChange={(e) => setForm({ ...form, stok: Number(e.target.value) })} />
                </Field>
              </div>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t border-slate-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50 transition-colors">Batal</button>
              <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editId ? 'Simpan Perubahan' : 'Tambah Produk'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="font-semibold text-slate-800 mb-1">Hapus Produk?</h3>
            <p className="text-sm text-slate-500 mb-4">Tindakan ini tidak dapat dibatalkan.</p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700">Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300';
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
