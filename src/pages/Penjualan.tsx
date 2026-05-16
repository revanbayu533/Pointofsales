import { useState, useEffect, useCallback } from 'react';
import { Plus, Trash2, Store, CheckCircle, X, Search, Printer, Loader2, AlertCircle } from 'lucide-react';
import { Product, Customer, Sale, SaleItem } from '../types';
import {
  getProducts, getCustomers, addSale, getSales,
  formatRupiah, generateNoTransaksi,
} from '../utils/api';

export default function Penjualan() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customerId, setCustomerId] = useState('');
  const [manualCustomerName, setManualCustomerName] = useState('');
  const [tanggal, setTanggal] = useState(new Date().toISOString().slice(0, 10));

  const [catatan, setCatatan] = useState('');
  const [items, setItems] = useState<SaleItem[]>([]);
  const [diskon, setDiskon] = useState(0);
  const [pajakAktif, setPajakAktif] = useState(true);
  const PAJAK_RATE = 11;
  const pajak = pajakAktif ? PAJAK_RATE : 0;
  const [bayar, setBayar] = useState(0);
  const [searchProduk, setSearchProduk] = useState('');
  const [showProductList, setShowProductList] = useState(false);
  const [successModal, setSuccessModal] = useState<Sale | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const [prods, cs] = await Promise.all([getProducts(), getCustomers()]);
      setProducts(prods);
      setCustomers(cs);
      const umum = cs.find((c) => c.nama.toLowerCase().includes('umum'));
      if (umum) setCustomerId(umum.id);
    } catch {
      setError('Gagal memuat data. Pastikan server backend berjalan di port 3001.');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredProducts = products.filter(
    (p) =>
      (p.nama.toLowerCase().includes(searchProduk.toLowerCase()) ||
        p.kode.toLowerCase().includes(searchProduk.toLowerCase())) &&
      p.stok > 0
  );

  const addItem = (product: Product) => {
    const exists = items.find((i) => i.productId === product.id);
    if (exists) {
      const newQty = exists.qty + 1;
      if (newQty > product.stok) return alert('Stok tidak mencukupi');
      setItems(items.map((i) => i.productId === product.id ? { ...i, qty: newQty, subtotal: newQty * i.hargaJual } : i));
    } else {
      setItems([...items, {
        productId: product.id, kodeProduct: product.kode, namaProduct: product.nama,
        satuan: product.satuan, qty: 1, hargaJual: product.hargaJual, subtotal: product.hargaJual,
      }]);
    }
    setShowProductList(false); setSearchProduk('');
  };

  const updateQty = (productId: string, qty: number) => {
    if (qty <= 0) return removeItem(productId);
    const prod = products.find((p) => p.id === productId);
    if (prod && qty > prod.stok) return alert('Stok tidak mencukupi');
    setItems(items.map((i) => i.productId === productId ? { ...i, qty, subtotal: qty * i.hargaJual } : i));
  };

  const updateHarga = (productId: string, harga: number) => {
    setItems(items.map((i) => i.productId === productId ? { ...i, hargaJual: harga, subtotal: i.qty * harga } : i));
  };

  const removeItem = (productId: string) => setItems(items.filter((i) => i.productId !== productId));

  const subtotal = items.reduce((s, i) => s + i.subtotal, 0);
  const nominalDiskon = (subtotal * diskon) / 100;
  const nominalPajak = ((subtotal - nominalDiskon) * pajak) / 100;
  const total = subtotal - nominalDiskon + nominalPajak;
  const kembalian = bayar - total;

  const handleSubmit = async () => {
    if (!customerId) return alert('Pilih customer terlebih dahulu');
    if (items.length === 0) return alert('Tambahkan item penjualan');
    if (bayar < total) return alert('Jumlah bayar kurang dari total');

    const customer = customers.find((c) => c.id === customerId);
    const finalCustomerName = (customer?.nama.toLowerCase().includes('umum') && manualCustomerName) 
      ? manualCustomerName 
      : (customer?.nama || 'Umum');

    setSaving(true);
    try {
      const result = await addSale({
        tanggal, customerId,
        namaCustomer: finalCustomerName,
        items, subtotal,
        diskon: nominalDiskon, pajak: nominalPajak, total, bayar, kembalian,
        status: 'selesai', catatan,
      });

      const sale: Sale = {
        id: result.id, noTransaksi: result.noTransaksi, tanggal,
        customerId, namaCustomer: finalCustomerName,
        items, subtotal, diskon: nominalDiskon, pajak: nominalPajak,
        total, bayar, kembalian, status: 'selesai', catatan,
        createdAt: new Date().toISOString(),
      };


      await loadData();
      setSuccessModal(sale);
    } catch (e: unknown) {
      alert((e as Error).message || 'Gagal menyimpan transaksi');
    } finally { setSaving(false); }
  };

  const resetForm = async () => {
    setItems([]); setCatatan(''); setDiskon(0);
    setManualCustomerName('');
    setPajakAktif(true); setBayar(0); setSuccessModal(null);
    await loadData();
  };


  if (loading) return (
    <div className="flex items-center justify-center h-96 text-slate-400">
      <Loader2 size={36} className="animate-spin mr-3" /> Memuat data...
    </div>
  );

  return (
    <div className="p-5">
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm mb-4">
          <AlertCircle size={16} className="shrink-0" />{error}
        </div>
      )}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Left */}
        <div className="xl:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <h3 className="font-semibold text-slate-700 mb-4 flex items-center gap-2">
              <Store size={18} className="text-green-500" /> Informasi Penjualan
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Customer *">
                <select className={inputCls} value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                  <option value="">-- Pilih Customer --</option>
                  {customers.map((c) => <option key={c.id} value={c.id}>{c.nama}</option>)}
                </select>
              </Field>
              {customers.find(c => c.id === customerId)?.nama.toLowerCase().includes('umum') && (
                <Field label="Nama Pembeli (Opsional)">
                  <input type="text" className={inputCls} value={manualCustomerName} onChange={(e) => setManualCustomerName(e.target.value)} placeholder="Masukkan nama pembeli..." />
                </Field>
              )}
              <Field label="Tanggal">
                <input type="date" className={inputCls} value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
              </Field>

              <Field label="Catatan" cls="sm:col-span-2">
                <textarea className={inputCls + ' resize-none'} rows={2} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Catatan penjualan (opsional)" />
              </Field>
            </div>
          </div>

          {/* Items */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-slate-700">Item Penjualan</h3>
              <button onClick={() => setShowProductList(true)} className="flex items-center gap-2 bg-green-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                <Plus size={14} /> Tambah Produk
              </button>
            </div>

            {items.length === 0 ? (
              <div className="text-center py-10 text-slate-400">
                <Store size={40} className="mx-auto mb-2 opacity-20" />
                <p className="text-sm">Belum ada item. Klik "Tambah Produk"</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-slate-50 rounded-lg">
                      <th className="text-left px-3 py-2 text-xs font-semibold text-slate-500">Produk</th>
                      <th className="text-center px-3 py-2 text-xs font-semibold text-slate-500 w-24">Qty</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 w-36">Harga Jual</th>
                      <th className="text-right px-3 py-2 text-xs font-semibold text-slate-500 w-36">Subtotal</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {items.map((item) => {
                      const prod = products.find((p) => p.id === item.productId);
                      return (
                        <tr key={item.productId}>
                          <td className="px-3 py-2">
                            <p className="font-medium text-slate-800">{item.namaProduct}</p>
                            <p className="text-xs text-slate-400">{item.kodeProduct} · Stok: {prod?.stok ?? 0} {item.satuan}</p>
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" min={1} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-center text-sm focus:outline-none focus:ring-2 focus:ring-green-300" value={item.qty} onChange={(e) => updateQty(item.productId, Number(e.target.value))} />
                          </td>
                          <td className="px-3 py-2">
                            <input type="number" min={0} className="w-full border border-slate-200 rounded-lg px-2 py-1.5 text-right text-sm focus:outline-none focus:ring-2 focus:ring-green-300" value={item.hargaJual} onChange={(e) => updateHarga(item.productId, Number(e.target.value))} />
                          </td>
                          <td className="px-3 py-2 text-right font-semibold text-slate-700">{formatRupiah(item.subtotal)}</td>
                          <td className="px-3 py-2">
                            <button onClick={() => removeItem(item.productId)} className="p-1 text-red-400 hover:text-red-600 transition-colors"><Trash2 size={14} /></button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Right - Kasir */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-5 space-y-4">
            <h3 className="font-semibold text-slate-700">Kasir</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-700">{formatRupiah(subtotal)}</span>
              </div>
              <Field label="Diskon (%)">
                <input type="number" min={0} max={100} className={inputCls} value={diskon} onChange={(e) => setDiskon(Number(e.target.value))} />
              </Field>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Nominal Diskon</span>
                <span className="text-red-500">- {formatRupiah(nominalDiskon)}</span>
              </div>
              <div className="flex items-center justify-between bg-orange-50 border border-orange-200 rounded-xl px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-orange-700">PPN {PAJAK_RATE}%</span>
                  <span className="text-[10px] bg-orange-100 text-orange-600 font-semibold px-1.5 py-0.5 rounded-md">Indonesia</span>
                </div>
                <button id="toggle-ppn" onClick={() => setPajakAktif(!pajakAktif)} className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none ${pajakAktif ? 'bg-orange-500' : 'bg-slate-300'}`}>
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${pajakAktif ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Nominal PPN ({PAJAK_RATE}%)</span>
                <span className={pajakAktif ? 'text-orange-500 font-medium' : 'text-slate-300'}>+ {formatRupiah(nominalPajak)}</span>
              </div>
              <div className="border-t border-slate-100 pt-3 flex justify-between">
                <span className="font-bold text-slate-800">TOTAL</span>
                <span className="font-bold text-2xl text-green-600">{formatRupiah(total)}</span>
              </div>
              <Field label="Jumlah Bayar (Rp)">
                <input type="number" min={0} className={`${inputCls} text-lg font-semibold text-right`} value={bayar || ''} onChange={(e) => setBayar(Number(e.target.value))} placeholder="0" />
              </Field>
              {bayar > 0 && (
                <div className={`flex justify-between text-base font-bold p-3 rounded-xl ${kembalian >= 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-600'}`}>
                  <span>Kembalian</span><span>{formatRupiah(Math.max(0, kembalian))}</span>
                </div>
              )}
              <div className="grid grid-cols-3 gap-1.5">
                {[total, Math.ceil(total / 10000) * 10000, Math.ceil(total / 50000) * 50000].map((v, i) => (
                  <button key={i} onClick={() => setBayar(v)} className="py-1.5 text-xs rounded-lg bg-slate-100 hover:bg-green-100 hover:text-green-700 text-slate-600 font-medium transition-colors">{formatRupiah(v)}</button>
                ))}
              </div>
            </div>
            <div className="space-y-2 pt-2">
              <button onClick={handleSubmit} disabled={bayar < total || items.length === 0 || saving} className="w-full py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle size={16} />} Proses Pembayaran
              </button>
              <button onClick={resetForm} className="w-full py-2.5 border border-slate-200 text-slate-600 rounded-xl font-medium text-sm hover:bg-slate-50 transition-colors">Reset / Batal</button>
            </div>
          </div>
        </div>
      </div>

      {/* Product Search Modal */}
      {showProductList && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-800">Pilih Produk</h2>
              <button onClick={() => { setShowProductList(false); setSearchProduk(''); }} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"><X size={18} /></button>
            </div>
            <div className="p-4">
              <div className="relative mb-3">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input className="w-full pl-9 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-300" placeholder="Cari produk (stok > 0)..." value={searchProduk} onChange={(e) => setSearchProduk(e.target.value)} autoFocus />
              </div>
              <div className="max-h-80 overflow-y-auto space-y-1">
                {filteredProducts.map((p) => (
                  <button key={p.id} onClick={() => addItem(p)} className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-green-50 transition-colors text-left">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{p.nama}</p>
                      <p className="text-xs text-slate-400">{p.kode} · Stok: {p.stok} {p.satuan}</p>
                    </div>
                    <span className="text-sm font-semibold text-green-600">{formatRupiah(p.hargaJual)}</span>
                  </button>
                ))}
                {filteredProducts.length === 0 && <p className="text-center text-sm text-slate-400 py-8">Tidak ada produk tersedia</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Receipt Modal */}
      {successModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3"><CheckCircle size={28} className="text-green-600" /></div>
                <h3 className="font-bold text-slate-800 text-lg">Pembayaran Berhasil!</h3>
                <p className="font-mono text-xs text-slate-400 mt-0.5">{successModal.noTransaksi}</p>
              </div>
              <div className="bg-slate-50 rounded-xl p-4 text-sm space-y-2 mb-4">
                <div className="flex justify-between text-slate-600"><span>Customer</span><span className="font-medium">{successModal.namaCustomer}</span></div>
                <div className="border-t border-dashed border-slate-200 my-2" />
                {successModal.items.map((i) => (
                  <div key={i.productId} className="flex justify-between text-slate-600">
                    <span className="truncate max-w-[160px]">{i.namaProduct} x{i.qty}</span>
                    <span>{formatRupiah(i.subtotal)}</span>
                  </div>
                ))}
                <div className="border-t border-dashed border-slate-200 my-2" />
                <div className="flex justify-between text-slate-500 text-xs"><span>Subtotal</span><span>{formatRupiah(successModal.subtotal)}</span></div>
                {successModal.diskon > 0 && <div className="flex justify-between text-red-500 text-xs"><span>Diskon</span><span>- {formatRupiah(successModal.diskon)}</span></div>}
                {successModal.pajak > 0 && <div className="flex justify-between text-orange-500 text-xs"><span>PPN {PAJAK_RATE}%</span><span>+ {formatRupiah(successModal.pajak)}</span></div>}
                <div className="border-t border-dashed border-slate-200 my-2" />
                <div className="flex justify-between font-bold text-slate-800"><span>Total</span><span>{formatRupiah(successModal.total)}</span></div>
                <div className="flex justify-between text-slate-600"><span>Bayar</span><span>{formatRupiah(successModal.bayar)}</span></div>
                <div className="flex justify-between text-green-600 font-semibold"><span>Kembalian</span><span>{formatRupiah(successModal.kembalian)}</span></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button onClick={() => window.print()} className="flex items-center justify-center gap-1.5 py-2.5 border border-slate-200 rounded-xl text-sm text-slate-600 hover:bg-slate-50"><Printer size={14} /> Cetak</button>
                <button onClick={resetForm} className="py-2.5 bg-green-600 text-white rounded-xl text-sm font-medium hover:bg-green-700">Transaksi Baru</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const inputCls = 'w-full border border-slate-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-300';
function Field({ label, children, cls }: { label: string; children: React.ReactNode; cls?: string }) {
  return (
    <div className={cls}>
      <label className="block text-xs font-medium text-slate-600 mb-1">{label}</label>
      {children}
    </div>
  );
}
