-- ============================================================
--  DATABASE POS - Point of Sale System
--  Jalankan di phpMyAdmin atau MySQL CLI
--  Database: pos
-- ============================================================

CREATE DATABASE IF NOT EXISTS pos CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE pos;

-- ============================================================
-- 1. TABEL PRODUK
-- ============================================================
CREATE TABLE IF NOT EXISTS produk (
  id          VARCHAR(36)   NOT NULL PRIMARY KEY,
  kode        VARCHAR(20)   NOT NULL UNIQUE,
  nama        VARCHAR(200)  NOT NULL,
  kategori    VARCHAR(100)  NOT NULL DEFAULT '',
  satuan      VARCHAR(50)   NOT NULL DEFAULT 'pcs',
  harga_beli  DECIMAL(15,2) NOT NULL DEFAULT 0,
  harga_jual  DECIMAL(15,2) NOT NULL DEFAULT 0,
  stok        INT           NOT NULL DEFAULT 0,
  stok_min    INT           NOT NULL DEFAULT 5,
  deskripsi   TEXT,
  gambar      VARCHAR(255),
  aktif       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 2. TABEL SUPPLIER
-- ============================================================
CREATE TABLE IF NOT EXISTS supplier (
  id          VARCHAR(36)   NOT NULL PRIMARY KEY,
  kode        VARCHAR(20)   NOT NULL UNIQUE,
  nama        VARCHAR(200)  NOT NULL,
  alamat      TEXT,
  telepon     VARCHAR(30),
  email       VARCHAR(100),
  kontak_person VARCHAR(100),
  aktif       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 3. TABEL CUSTOMER
-- ============================================================
CREATE TABLE IF NOT EXISTS customer (
  id          VARCHAR(36)   NOT NULL PRIMARY KEY,
  kode        VARCHAR(20)   NOT NULL UNIQUE,
  nama        VARCHAR(200)  NOT NULL,
  alamat      TEXT,
  telepon     VARCHAR(30),
  email       VARCHAR(100),
  poin        INT           NOT NULL DEFAULT 0,
  total_belanja DECIMAL(15,2) NOT NULL DEFAULT 0,
  aktif       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- 4. TABEL PEMBELIAN (Header)
-- ============================================================
CREATE TABLE IF NOT EXISTS pembelian (
  id            VARCHAR(36)   NOT NULL PRIMARY KEY,
  no_pembelian  VARCHAR(50)   NOT NULL UNIQUE,
  tanggal       DATE          NOT NULL,
  supplier_id   VARCHAR(36)   NOT NULL,
  nama_supplier VARCHAR(200)  NOT NULL,
  subtotal      DECIMAL(15,2) NOT NULL DEFAULT 0,
  diskon        DECIMAL(15,2) NOT NULL DEFAULT 0,
  pajak         DECIMAL(15,2) NOT NULL DEFAULT 0,
  total         DECIMAL(15,2) NOT NULL DEFAULT 0,
  status        ENUM('pending','selesai','batal') NOT NULL DEFAULT 'pending',
  catatan       TEXT,
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (supplier_id) REFERENCES supplier(id) ON DELETE RESTRICT
);

-- ============================================================
-- 5. TABEL DETAIL PEMBELIAN
-- ============================================================
CREATE TABLE IF NOT EXISTS detail_pembelian (
  id            INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  pembelian_id  VARCHAR(36)   NOT NULL,
  produk_id     VARCHAR(36)   NOT NULL,
  kode_produk   VARCHAR(20)   NOT NULL,
  nama_produk   VARCHAR(200)  NOT NULL,
  satuan        VARCHAR(50)   NOT NULL,
  qty           INT           NOT NULL DEFAULT 1,
  harga_beli    DECIMAL(15,2) NOT NULL DEFAULT 0,
  subtotal      DECIMAL(15,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (pembelian_id) REFERENCES pembelian(id) ON DELETE CASCADE,
  FOREIGN KEY (produk_id)    REFERENCES produk(id)    ON DELETE RESTRICT
);

-- ============================================================
-- 6. TABEL PENJUALAN (Header)
-- ============================================================
CREATE TABLE IF NOT EXISTS penjualan (
  id            VARCHAR(36)   NOT NULL PRIMARY KEY,
  no_transaksi  VARCHAR(50)   NOT NULL UNIQUE,
  tanggal       DATE          NOT NULL,
  customer_id   VARCHAR(36)   NOT NULL,
  nama_customer VARCHAR(200)  NOT NULL,
  subtotal      DECIMAL(15,2) NOT NULL DEFAULT 0,
  diskon        DECIMAL(15,2) NOT NULL DEFAULT 0,
  pajak         DECIMAL(15,2) NOT NULL DEFAULT 0,
  total         DECIMAL(15,2) NOT NULL DEFAULT 0,
  bayar         DECIMAL(15,2) NOT NULL DEFAULT 0,
  kembalian     DECIMAL(15,2) NOT NULL DEFAULT 0,
  metode_bayar  ENUM('tunai','transfer','kartu','qris','lainnya') NOT NULL DEFAULT 'tunai',
  status        ENUM('pending','selesai','batal') NOT NULL DEFAULT 'selesai',
  catatan       TEXT,
  kasir         VARCHAR(100)  DEFAULT 'Admin',
  created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (customer_id) REFERENCES customer(id) ON DELETE RESTRICT
);

-- ============================================================
-- 7. TABEL DETAIL PENJUALAN
-- ============================================================
CREATE TABLE IF NOT EXISTS detail_penjualan (
  id            INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  penjualan_id  VARCHAR(36)   NOT NULL,
  produk_id     VARCHAR(36)   NOT NULL,
  kode_produk   VARCHAR(20)   NOT NULL,
  nama_produk   VARCHAR(200)  NOT NULL,
  satuan        VARCHAR(50)   NOT NULL,
  qty           INT           NOT NULL DEFAULT 1,
  harga_jual    DECIMAL(15,2) NOT NULL DEFAULT 0,
  subtotal      DECIMAL(15,2) NOT NULL DEFAULT 0,
  FOREIGN KEY (penjualan_id) REFERENCES penjualan(id) ON DELETE CASCADE,
  FOREIGN KEY (produk_id)    REFERENCES produk(id)    ON DELETE RESTRICT
);

-- ============================================================
-- 8. TABEL KASIR / USER (untuk login sederhana)
-- ============================================================
CREATE TABLE IF NOT EXISTS kasir (
  id          VARCHAR(36)   NOT NULL PRIMARY KEY,
  username    VARCHAR(50)   NOT NULL UNIQUE,
  nama        VARCHAR(100)  NOT NULL,
  password    VARCHAR(255)  NOT NULL,
  role        ENUM('admin','kasir') NOT NULL DEFAULT 'kasir',
  aktif       TINYINT(1)    NOT NULL DEFAULT 1,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 9. TABEL KATEGORI PRODUK
-- ============================================================
CREATE TABLE IF NOT EXISTS kategori (
  id          INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  nama        VARCHAR(100)  NOT NULL UNIQUE,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- 10. TABEL LOG STOK (Mutasi Stok)
-- ============================================================
CREATE TABLE IF NOT EXISTS log_stok (
  id          INT           NOT NULL AUTO_INCREMENT PRIMARY KEY,
  produk_id   VARCHAR(36)   NOT NULL,
  nama_produk VARCHAR(200)  NOT NULL,
  tipe        ENUM('masuk','keluar','koreksi') NOT NULL,
  qty         INT           NOT NULL,
  stok_sebelum INT          NOT NULL,
  stok_sesudah INT          NOT NULL,
  referensi   VARCHAR(100),
  keterangan  TEXT,
  created_at  DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (produk_id) REFERENCES produk(id) ON DELETE CASCADE
);

-- ============================================================
-- SEED DATA AWAL
-- ============================================================

-- Kategori
INSERT IGNORE INTO kategori (nama) VALUES
  ('Bahan Pokok'), ('Mie Instan'), ('Minuman'), ('Kebersihan'),
  ('Snack'), ('Elektronik'), ('Pakaian'), ('Lainnya');

-- Supplier
INSERT IGNORE INTO supplier (id, kode, nama, alamat, telepon, email) VALUES
  ('sup-001', 'SUP001', 'PT. Indofood Sukses Makmur', 'Jl. Gatot Subroto No.1, Jakarta', '021-12345678', 'indofood@supplier.com'),
  ('sup-002', 'SUP002', 'CV. Sumber Makmur', 'Jl. Pahlawan No.45, Surabaya', '031-87654321', 'makmur@supplier.com'),
  ('sup-003', 'SUP003', 'UD. Bintang Jaya', 'Jl. Pemuda No.12, Bandung', '022-11223344', 'bintang@supplier.com');

-- Customer
INSERT IGNORE INTO customer (id, kode, nama, alamat, telepon, email) VALUES
  ('cus-001', 'CUS001', 'Umum / Tunai', '-', '-', '-'),
  ('cus-002', 'CUS002', 'Budi Santoso', 'Jl. Mawar No.5, Jakarta', '08123456789', 'budi@email.com'),
  ('cus-003', 'CUS003', 'Siti Rahayu', 'Jl. Melati No.10, Bandung', '08234567890', 'siti@email.com');

-- Produk
INSERT IGNORE INTO produk (id, kode, nama, kategori, satuan, harga_beli, harga_jual, stok, stok_min) VALUES
  ('prd-001', 'PRD001', 'Beras Premium 5kg',  'Bahan Pokok', 'Karung', 65000, 75000, 100, 10),
  ('prd-002', 'PRD002', 'Minyak Goreng 1L',   'Bahan Pokok', 'Botol',  14000, 18000, 200, 20),
  ('prd-003', 'PRD003', 'Gula Pasir 1kg',     'Bahan Pokok', 'Kg',     13000, 16000, 150, 15),
  ('prd-004', 'PRD004', 'Indomie Goreng',     'Mie Instan',  'Bungkus', 2500,  3500, 500, 50),
  ('prd-005', 'PRD005', 'Kopi Kapal Api',     'Minuman',     'Sachet',  1000,  1500, 300, 30),
  ('prd-006', 'PRD006', 'Sabun Lifebuoy',     'Kebersihan',  'Buah',   5000,  7500,  80,  8),
  ('prd-007', 'PRD007', 'Shampo Pantene 170ml','Kebersihan', 'Botol',  22000, 28000,  60,  6),
  ('prd-008', 'PRD008', 'Teh Botol Sosro',    'Minuman',     'Botol',   4000,  5500, 120, 12);

-- Kasir default (password: admin123)
INSERT IGNORE INTO kasir (id, username, nama, password, role) VALUES
  ('kas-001', 'admin', 'Administrator', 'admin123', 'admin');
