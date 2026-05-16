const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const pool = require('./db');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ====================================================
// HELPER
// ====================================================
const generateNo = async (prefix, table, column) => {
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth() + 1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const dateStr = `${y}${m}${d}`;
  const [rows] = await pool.query(
    `SELECT COUNT(*) as cnt FROM ${table} WHERE DATE(created_at) = CURDATE()`
  );
  const num = String(rows[0].cnt + 1).padStart(4, '0');
  return `${prefix}-${dateStr}-${num}`;
};

// ====================================================
// HEALTH CHECK
// ====================================================
app.get('/api/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', message: 'Terhubung ke database MySQL' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ====================================================
// PRODUK
// ====================================================
app.get('/api/produk', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produk WHERE aktif = 1 ORDER BY nama');
    // Map snake_case ke camelCase untuk frontend
    const mapped = rows.map(r => ({
      id: r.id, kode: r.kode, nama: r.nama, kategori: r.kategori,
      satuan: r.satuan, hargaBeli: Number(r.harga_beli), hargaJual: Number(r.harga_jual),
      stok: r.stok, stokMin: r.stok_min, deskripsi: r.deskripsi,
      aktif: r.aktif, createdAt: r.created_at,
    }));
    res.json(mapped);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/produk/:id', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM produk WHERE id = ?', [req.params.id]);
    if (!rows.length) return res.status(404).json({ error: 'Produk tidak ditemukan' });
    const r = rows[0];
    res.json({
      id: r.id, kode: r.kode, nama: r.nama, kategori: r.kategori,
      satuan: r.satuan, hargaBeli: Number(r.harga_beli), hargaJual: Number(r.harga_jual),
      stok: r.stok, stokMin: r.stok_min, deskripsi: r.deskripsi, createdAt: r.created_at,
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/produk', async (req, res) => {
  try {
    const { kode, nama, kategori, satuan, hargaBeli, hargaJual, stok, stokMin, deskripsi } = req.body;
    if (!kode || !nama) return res.status(400).json({ error: 'Kode dan nama wajib diisi' });
    const id = uuidv4();
    await pool.query(
      'INSERT INTO produk (id,kode,nama,kategori,satuan,harga_beli,harga_jual,stok,stok_min,deskripsi) VALUES (?,?,?,?,?,?,?,?,?,?)',
      [id, kode, nama, kategori||'', satuan||'pcs', hargaBeli||0, hargaJual||0, stok||0, stokMin||5, deskripsi||null]
    );
    res.status(201).json({ id, message: 'Produk berhasil ditambahkan' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Kode produk sudah ada' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/produk/:id', async (req, res) => {
  try {
    const { kode, nama, kategori, satuan, hargaBeli, hargaJual, stok, stokMin, deskripsi } = req.body;
    await pool.query(
      'UPDATE produk SET kode=?,nama=?,kategori=?,satuan=?,harga_beli=?,harga_jual=?,stok=?,stok_min=?,deskripsi=? WHERE id=?',
      [kode, nama, kategori||'', satuan||'pcs', hargaBeli||0, hargaJual||0, stok||0, stokMin||5, deskripsi||null, req.params.id]
    );
    res.json({ message: 'Produk berhasil diperbarui' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Kode produk sudah ada' });
    res.status(500).json({ error: err.message });
  }
});

app.delete('/api/produk/:id', async (req, res) => {
  try {
    await pool.query('UPDATE produk SET aktif = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Produk berhasil dihapus' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ====================================================
// SUPPLIER
// ====================================================
app.get('/api/supplier', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM supplier WHERE aktif = 1 ORDER BY nama');
    const mapped = rows.map(r => ({
      id: r.id, kode: r.kode, nama: r.nama, alamat: r.alamat,
      telepon: r.telepon, email: r.email, kontakPerson: r.kontak_person, createdAt: r.created_at,
    }));
    res.json(mapped);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/supplier', async (req, res) => {
  try {
    const { kode, nama, alamat, telepon, email, kontakPerson } = req.body;
    if (!kode || !nama) return res.status(400).json({ error: 'Kode dan nama wajib diisi' });
    const id = uuidv4();
    await pool.query(
      'INSERT INTO supplier (id,kode,nama,alamat,telepon,email,kontak_person) VALUES (?,?,?,?,?,?,?)',
      [id, kode, nama, alamat||'', telepon||'', email||'', kontakPerson||null]
    );
    res.status(201).json({ id, message: 'Supplier berhasil ditambahkan' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Kode supplier sudah ada' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/supplier/:id', async (req, res) => {
  try {
    const { kode, nama, alamat, telepon, email, kontakPerson } = req.body;
    await pool.query(
      'UPDATE supplier SET kode=?,nama=?,alamat=?,telepon=?,email=?,kontak_person=? WHERE id=?',
      [kode, nama, alamat||'', telepon||'', email||'', kontakPerson||null, req.params.id]
    );
    res.json({ message: 'Supplier berhasil diperbarui' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/supplier/:id', async (req, res) => {
  try {
    await pool.query('UPDATE supplier SET aktif = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Supplier berhasil dihapus' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ====================================================
// CUSTOMER
// ====================================================
app.get('/api/customer', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM customer WHERE aktif = 1 ORDER BY nama');
    const mapped = rows.map(r => ({
      id: r.id, kode: r.kode, nama: r.nama, alamat: r.alamat,
      telepon: r.telepon, email: r.email, poin: r.poin,
      totalBelanja: Number(r.total_belanja), createdAt: r.created_at,
    }));
    res.json(mapped);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/customer', async (req, res) => {
  try {
    const { kode, nama, alamat, telepon, email } = req.body;
    if (!kode || !nama) return res.status(400).json({ error: 'Kode dan nama wajib diisi' });
    const id = uuidv4();
    await pool.query(
      'INSERT INTO customer (id,kode,nama,alamat,telepon,email) VALUES (?,?,?,?,?,?)',
      [id, kode, nama, alamat||'', telepon||'', email||'']
    );
    res.status(201).json({ id, message: 'Customer berhasil ditambahkan' });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'Kode customer sudah ada' });
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/customer/:id', async (req, res) => {
  try {
    const { kode, nama, alamat, telepon, email } = req.body;
    await pool.query(
      'UPDATE customer SET kode=?,nama=?,alamat=?,telepon=?,email=? WHERE id=?',
      [kode, nama, alamat||'', telepon||'', email||'', req.params.id]
    );
    res.json({ message: 'Customer berhasil diperbarui' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.delete('/api/customer/:id', async (req, res) => {
  try {
    await pool.query('UPDATE customer SET aktif = 0 WHERE id = ?', [req.params.id]);
    res.json({ message: 'Customer berhasil dihapus' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ====================================================
// PEMBELIAN
// ====================================================
app.get('/api/pembelian', async (req, res) => {
  try {
    const [headers] = await pool.query('SELECT * FROM pembelian ORDER BY created_at DESC');
    const result = await Promise.all(headers.map(async (h) => {
      const [details] = await pool.query('SELECT * FROM detail_pembelian WHERE pembelian_id = ?', [h.id]);
      return {
        id: h.id, noPembelian: h.no_pembelian, tanggal: h.tanggal,
        supplierId: h.supplier_id, namaSuplier: h.nama_supplier,
        subtotal: Number(h.subtotal), diskon: Number(h.diskon),
        pajak: Number(h.pajak), total: Number(h.total),
        status: h.status, catatan: h.catatan, createdAt: h.created_at,
        items: details.map(d => ({
          productId: d.produk_id, kodeProduct: d.kode_produk, namaProduct: d.nama_produk,
          satuan: d.satuan, qty: d.qty, hargaBeli: Number(d.harga_beli), subtotal: Number(d.subtotal),
        })),
      };
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/pembelian', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { supplierId, namaSuplier, tanggal, items, subtotal, diskon, pajak, total, status, catatan } = req.body;
    if (!supplierId || !items?.length) return res.status(400).json({ error: 'Data tidak lengkap' });

    const id = uuidv4();
    const noPembelian = await generateNo('PBL', 'pembelian', 'no_pembelian');

    await conn.query(
      'INSERT INTO pembelian (id,no_pembelian,tanggal,supplier_id,nama_supplier,subtotal,diskon,pajak,total,status,catatan) VALUES (?,?,?,?,?,?,?,?,?,?,?)',
      [id, noPembelian, tanggal, supplierId, namaSuplier, subtotal, diskon, pajak, total, status||'selesai', catatan||'']
    );

    for (const item of items) {
      await conn.query(
        'INSERT INTO detail_pembelian (pembelian_id,produk_id,kode_produk,nama_produk,satuan,qty,harga_beli,subtotal) VALUES (?,?,?,?,?,?,?,?)',
        [id, item.productId, item.kodeProduct, item.namaProduct, item.satuan, item.qty, item.hargaBeli, item.subtotal]
      );
      // Update stok jika status selesai
      if (status === 'selesai') {
        // Log stok
        const [[prod]] = await conn.query('SELECT stok FROM produk WHERE id = ?', [item.productId]);
        const stokSebelum = prod?.stok || 0;
        await conn.query('UPDATE produk SET stok = stok + ? WHERE id = ?', [item.qty, item.productId]);
        await conn.query(
          'INSERT INTO log_stok (produk_id,nama_produk,tipe,qty,stok_sebelum,stok_sesudah,referensi,keterangan) VALUES (?,?,?,?,?,?,?,?)',
          [item.productId, item.namaProduct, 'masuk', item.qty, stokSebelum, stokSebelum + item.qty, noPembelian, 'Pembelian']
        );
      }
    }

    await conn.commit();
    res.status(201).json({ id, noPembelian, message: 'Pembelian berhasil disimpan' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
});

app.put('/api/pembelian/:id/status', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { status } = req.body;
    const [[purchase]] = await conn.query('SELECT * FROM pembelian WHERE id = ?', [req.params.id]);
    if (!purchase) return res.status(404).json({ error: 'Data tidak ditemukan' });

    if (status === 'selesai' && purchase.status !== 'selesai') {
      const [details] = await conn.query('SELECT * FROM detail_pembelian WHERE pembelian_id = ?', [req.params.id]);
      for (const d of details) {
        const [[prod]] = await conn.query('SELECT stok FROM produk WHERE id = ?', [d.produk_id]);
        const stokSebelum = prod?.stok || 0;
        await conn.query('UPDATE produk SET stok = stok + ? WHERE id = ?', [d.qty, d.produk_id]);
        await conn.query(
          'INSERT INTO log_stok (produk_id,nama_produk,tipe,qty,stok_sebelum,stok_sesudah,referensi,keterangan) VALUES (?,?,?,?,?,?,?,?)',
          [d.produk_id, d.nama_produk, 'masuk', d.qty, stokSebelum, stokSebelum + d.qty, purchase.no_pembelian, 'Konfirmasi Pembelian']
        );
      }
    }

    await conn.query('UPDATE pembelian SET status = ? WHERE id = ?', [status, req.params.id]);
    await conn.commit();
    res.json({ message: 'Status pembelian diperbarui' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
});

// ====================================================
// PENJUALAN
// ====================================================
app.get('/api/penjualan', async (req, res) => {
  try {
    const [headers] = await pool.query('SELECT * FROM penjualan ORDER BY created_at DESC');
    const result = await Promise.all(headers.map(async (h) => {
      const [details] = await pool.query('SELECT * FROM detail_penjualan WHERE penjualan_id = ?', [h.id]);
      return {
        id: h.id, noTransaksi: h.no_transaksi, tanggal: h.tanggal,
        customerId: h.customer_id, namaCustomer: h.nama_customer,
        subtotal: Number(h.subtotal), diskon: Number(h.diskon),
        pajak: Number(h.pajak), total: Number(h.total),
        bayar: Number(h.bayar), kembalian: Number(h.kembalian),
        metodeBayar: h.metode_bayar, status: h.status,
        catatan: h.catatan, kasir: h.kasir, createdAt: h.created_at,
        items: details.map(d => ({
          productId: d.produk_id, kodeProduct: d.kode_produk, namaProduct: d.nama_produk,
          satuan: d.satuan, qty: d.qty, hargaJual: Number(d.harga_jual), subtotal: Number(d.subtotal),
        })),
      };
    }));
    res.json(result);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.post('/api/penjualan', async (req, res) => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const { customerId, namaCustomer, tanggal, items, subtotal, diskon, pajak, total, bayar, kembalian, metodeBayar, status, catatan, kasir } = req.body;
    if (!customerId || !items?.length) return res.status(400).json({ error: 'Data tidak lengkap' });

    const id = uuidv4();
    const noTransaksi = await generateNo('JL', 'penjualan', 'no_transaksi');

    await conn.query(
      'INSERT INTO penjualan (id,no_transaksi,tanggal,customer_id,nama_customer,subtotal,diskon,pajak,total,bayar,kembalian,metode_bayar,status,catatan,kasir) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [id, noTransaksi, tanggal, customerId, namaCustomer, subtotal, diskon, pajak, total, bayar, kembalian, metodeBayar||'tunai', status||'selesai', catatan||'', kasir||'Admin']
    );

    for (const item of items) {
      await conn.query(
        'INSERT INTO detail_penjualan (penjualan_id,produk_id,kode_produk,nama_produk,satuan,qty,harga_jual,subtotal) VALUES (?,?,?,?,?,?,?,?)',
        [id, item.productId, item.kodeProduct, item.namaProduct, item.satuan, item.qty, item.hargaJual, item.subtotal]
      );
      // Kurangi stok
      const [[prod]] = await conn.query('SELECT stok FROM produk WHERE id = ?', [item.productId]);
      const stokSebelum = prod?.stok || 0;
      await conn.query('UPDATE produk SET stok = stok - ? WHERE id = ?', [item.qty, item.productId]);
      await conn.query(
        'INSERT INTO log_stok (produk_id,nama_produk,tipe,qty,stok_sebelum,stok_sesudah,referensi,keterangan) VALUES (?,?,?,?,?,?,?,?)',
        [item.productId, item.namaProduct, 'keluar', item.qty, stokSebelum, stokSebelum - item.qty, noTransaksi, 'Penjualan']
      );
    }

    // Update total belanja customer
    await conn.query('UPDATE customer SET total_belanja = total_belanja + ?, poin = poin + ? WHERE id = ?',
      [total, Math.floor(total / 10000), customerId]);

    await conn.commit();
    res.status(201).json({ id, noTransaksi, message: 'Penjualan berhasil disimpan' });
  } catch (err) {
    await conn.rollback();
    res.status(500).json({ error: err.message });
  } finally { conn.release(); }
});

// ====================================================
// LAPORAN / DASHBOARD
// ====================================================
app.get('/api/laporan/dashboard', async (req, res) => {
  try {
    const [[penjualan]] = await pool.query(`
      SELECT 
        COUNT(*) as total_transaksi,
        COALESCE(SUM(total), 0) as total_pendapatan,
        COALESCE(SUM(total), 0) as omzet_hari
      FROM penjualan 
      WHERE DATE(tanggal) = CURDATE() AND status = 'selesai'
    `);

    const [[pembelian]] = await pool.query(`
      SELECT COALESCE(SUM(total), 0) as total_pengeluaran
      FROM pembelian WHERE DATE(tanggal) = CURDATE() AND status = 'selesai'
    `);

    const [[stokRendah]] = await pool.query(
      'SELECT COUNT(*) as cnt FROM produk WHERE stok <= stok_min AND aktif = 1'
    );

    const [[totalProduk]] = await pool.query('SELECT COUNT(*) as cnt FROM produk WHERE aktif = 1');

    const [penjualanBulanan] = await pool.query(`
      SELECT 
        DATE_FORMAT(tanggal, '%Y-%m') as bulan,
        DATE_FORMAT(tanggal, '%b %Y') as label,
        COALESCE(SUM(total), 0) as total,
        COUNT(*) as transaksi
      FROM penjualan 
      WHERE tanggal >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH) AND status = 'selesai'
      GROUP BY DATE_FORMAT(tanggal, '%Y-%m')
      ORDER BY bulan ASC
    `);

    const [produkTerlaris] = await pool.query(`
      SELECT 
        dp.nama_produk as nama,
        SUM(dp.qty) as total_qty,
        SUM(dp.subtotal) as total_omzet
      FROM detail_penjualan dp
      JOIN penjualan p ON dp.penjualan_id = p.id
      WHERE p.status = 'selesai' AND p.tanggal >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY dp.produk_id, dp.nama_produk
      ORDER BY total_qty DESC
      LIMIT 5
    `);

    const [stokMenipis] = await pool.query(
      'SELECT id, kode, nama, stok, stok_min, satuan FROM produk WHERE stok <= stok_min AND aktif = 1 ORDER BY stok ASC LIMIT 10'
    );

    res.json({
      hari: {
        totalTransaksi: penjualan.total_transaksi,
        totalPendapatan: Number(penjualan.total_pendapatan),
        totalPengeluaran: Number(pembelian.total_pengeluaran),
        laba: Number(penjualan.total_pendapatan) - Number(pembelian.total_pengeluaran),
      },
      totalProduk: totalProduk.cnt,
      stokRendah: stokRendah.cnt,
      penjualanBulanan: penjualanBulanan.map(r => ({
        bulan: r.label, total: Number(r.total), transaksi: r.transaksi,
      })),
      produkTerlaris: produkTerlaris.map(r => ({
        nama: r.nama, totalQty: r.total_qty, totalOmzet: Number(r.total_omzet),
      })),
      stokMenipis: stokMenipis.map(r => ({
        id: r.id, kode: r.kode, nama: r.nama, stok: r.stok, stokMin: r.stok_min, satuan: r.satuan,
      })),
    });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

app.get('/api/laporan/penjualan', async (req, res) => {
  try {
    const { dari, sampai } = req.query;
    let query = `SELECT * FROM penjualan WHERE status = 'selesai'`;
    const params = [];
    if (dari) { query += ' AND tanggal >= ?'; params.push(dari); }
    if (sampai) { query += ' AND tanggal <= ?'; params.push(sampai); }
    query += ' ORDER BY tanggal DESC';
    const [rows] = await pool.query(query, params);
    res.json(rows.map(r => ({
      id: r.id, noTransaksi: r.no_transaksi, tanggal: r.tanggal,
      namaCustomer: r.nama_customer, total: Number(r.total),
      metodeBayar: r.metode_bayar, kasir: r.kasir,
    })));
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Log Stok
app.get('/api/log-stok', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM log_stok ORDER BY created_at DESC LIMIT 100');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Kategori
app.get('/api/kategori', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM kategori ORDER BY nama');
    res.json(rows);
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ====================================================
// START SERVER
// ====================================================
app.listen(PORT, () => {
  console.log(`✅ POS Backend berjalan di http://localhost:${PORT}`);
  console.log(`📊 Database: MySQL (phpMyAdmin) - Database: pos`);
});
