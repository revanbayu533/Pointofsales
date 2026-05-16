import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit2, Trash2, X, Truck, Loader2, AlertCircle } from 'lucide-react';
import { Supplier } from '../types';
import { getSuppliers, addSupplier, updateSupplier, deleteSupplier } from '../utils/api';

const EMPTY: Omit<Supplier, 'id' | 'createdAt'> = {
  kode: '', nama: '', alamat: '', telepon: '', email: '',
};

export default function SupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<Omit<Supplier, 'id' | 'createdAt'>>(EMPTY);
  const [editId, setEditId] = useState<string | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      setSuppliers(await getSuppliers());
    } catch {
      setError('Gagal memuat data. Pastikan server backend berjalan di port 3001.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = suppliers.filter((s) => {
    const q = search.toLowerCase();
    return s.nama.toLowerCase().includes(q) || s.kode.toLowerCase().includes(q) || (s.telepon || '').includes(q);
  });

  const handleSubmit = async () => {
    if (!form.kode || !form.nama) return alert('Kode dan Nama wajib diisi');
    setSaving(true);
    try {
      if (editId) {
        await updateSupplier({ ...form, id: editId, createdAt: suppliers.find((s) => s.id === editId)!.createdAt });
      } else {
        await addSupplier(form);
      }
      setShowModal(false); setForm(EMPTY); setEditId(null);
      await load();
    } catch (e: unknown) {
      alert((e as Error).message || 'Gagal menyimpan');
    } finally { setSaving(false); }
  };

  const handleEdit = (s: Supplier) => {
    setForm({ kode: s.kode, nama: s.nama, alamat: s.alamat, telepon: s.telepon, email: s.email });
    setEditId(s.id); setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSupplier(id);
      setDeleteConfirm(null); await load();
    } catch (e: unknown) { alert((e as Error).message || 'Gagal menghapus'); }
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
          <input className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300" placeholder="Cari supplier..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button onClick={() => { setForm(EMPTY); setEditId(null); setShowModal(true); }} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-green-700 transition-colors">
          <Plus size={16} /> Tambah Supplier
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-400"><Loader2 size={28} className="animate-spin mr-2" /> Memuat data...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Kode</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Nama</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden md:table-cell">Alamat</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Telepon</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Email</th>
                  <th className="text-center px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-slate-400"><Truck size={36} className="mx-auto mb-2 opacity-30" /><p>Tidak ada supplier ditemukan</p></td></tr>
                ) : (
                  filtered.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-slate-500">{s.kode}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{s.nama}</td>
                      <td className="px-4 py-3 text-slate-500 hidden md:table-cell max-w-xs truncate">{s.alamat}</td>
                      <td className="px-4 py-3 text-slate-600">{s.telepon}</td>
                      <td className="px-4 py-3 text-slate-500 hidden lg:table-cell">{s.email}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <button onClick={() => handleEdit(s)} className="p-1.5 rounded-lg text-green-600 hover:bg-green-50 transition-colors"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteConfirm(s.id)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-4 py-3 border-t border-slate-100 text-xs text-slate-400">Total: {suppliers.length} supplier</div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">{editId ? 'Edit Supplier' : 'Tambah Supplier Baru'}</h2>
              <button onClick={() => setShowModal(false)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Kode Supplier *"><input className={inputCls} value={form.kode} onChange={(e) => setForm({ ...form, kode: e.target.value })} placeholder="SUP001" /></Field>
                <Field label="Telepon"><input className={inputCls} value={form.telepon} onChange={(e) => setForm({ ...form, telepon: e.target.value })} placeholder="08..." /></Field>
              </div>
              <Field label="Nama Supplier *"><input className={inputCls} value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} placeholder="Nama perusahaan / toko" /></Field>
              <Field label="Alamat"><textarea className={inputCls + ' resize-none'} rows={2} value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} placeholder="Alamat lengkap" /></Field>
              <Field label="Email"><input type="email" className={inputCls} value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="email@supplier.com" /></Field>
            </div>
            <div className="flex gap-2 px-5 py-4 border-t border-slate-100">
              <button onClick={() => setShowModal(false)} className="flex-1 py-2.5 rounded-xl border border-slate-200 text-sm text-slate-600 hover:bg-slate-50">Batal</button>
              <button onClick={handleSubmit} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-60 flex items-center justify-center gap-2">
                {saving && <Loader2 size={14} className="animate-spin" />}
                {editId ? 'Simpan Perubahan' : 'Tambah Supplier'}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-3"><Trash2 size={20} className="text-red-600" /></div>
            <h3 className="font-semibold text-slate-800 mb-1">Hapus Supplier?</h3>
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
