import { useState, useEffect } from 'react';
import {
  Store,
  BarChart3,
  Package,
  Users,
  Truck,
  ShoppingCart,
  ArrowRight,
  CheckCircle,
  TrendingUp,
  Shield,
  Zap,
  Star,
  ChevronRight,
  Leaf,
  Globe,
  Clock,
} from 'lucide-react';

interface LandingPageProps {
  onEnter: () => void;
}

const features = [
  {
    icon: <Package size={24} />,
    title: 'Manajemen Stok Produk',
    desc: 'Pantau inventaris sayur, buah, dan kebutuhan pokok secara real-time dengan notifikasi stok menipis.',
    color: 'from-green-500 to-emerald-600',
    bg: 'bg-green-50',
    iconColor: 'text-green-600',
  },
  {
    icon: <ShoppingCart size={24} />,
    title: 'Kasir Cepat & Mudah',
    desc: 'Proses transaksi pelanggan dengan kilat, hitung otomatis, dan kelola berbagai metode pembayaran.',
    color: 'from-emerald-500 to-teal-600',
    bg: 'bg-emerald-50',
    iconColor: 'text-emerald-600',
  },
  {
    icon: <Users size={24} />,
    title: 'Loyalti Pelanggan',
    desc: 'Simpan data pelanggan tetap, kelola sistem poin belanja, dan berikan pelayanan terbaik.',
    color: 'from-lime-500 to-green-600',
    bg: 'bg-lime-50',
    iconColor: 'text-lime-600',
  },
];

export default function LandingPage({ onEnter }: LandingPageProps) {
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setHeroVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans overflow-x-hidden selection:bg-green-100 selection:text-green-900">
      
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 lg:px-16 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-green-600 flex items-center justify-center shadow-lg shadow-green-200">
            <Leaf size={20} className="text-white fill-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-base leading-tight">FreshCart</p>
            <p className="text-[10px] text-green-600 font-semibold tracking-wider uppercase leading-tight">POS System</p>
          </div>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#fitur" className="hover:text-green-600 transition-colors">Fitur</a>
          <a href="#manfaat" className="hover:text-green-600 transition-colors">Manfaat</a>
          <a href="#tentang" className="hover:text-green-600 transition-colors">Tentang</a>
        </div>

        <button
          onClick={onEnter}
          className="flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold px-5 py-2.5 rounded-full transition-all duration-200 hover:shadow-lg"
        >
          Masuk Dashboard
        </button>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center">
          <div className={`transition-all duration-1000 ${heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-10'}`}>
            <div className="inline-flex items-center gap-2 bg-green-50 border border-green-100 text-green-700 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
              </span>
              Sistem Kasir UMKM Modern
            </div>
            
            <h1 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] mb-6">
              Kelola Toko <br />
              <span className="text-green-600">Lebih Segar</span> <br />
              & Efisien.
            </h1>
            
            <p className="text-slate-500 text-lg max-w-lg mb-10 leading-relaxed">
              FreshCart membantu toko kelontong dan ritel mengelola stok, transaksi, dan pelanggan dalam satu platform lokal yang cepat dan aman.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <button
                onClick={onEnter}
                className="w-full sm:w-auto group flex items-center justify-center gap-3 bg-green-600 hover:bg-green-700 text-white font-black px-10 py-5 rounded-2xl shadow-xl shadow-green-100 transition-all duration-300 hover:scale-105"
              >
                Coba FreshCart Sekarang
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-200" />
              </button>
              <div className="flex -space-x-3 items-center">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="w-10 h-10 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 overflow-hidden">
                    <img src={`https://i.pravatar.cc/100?img=${i+10}`} alt="User" />
                  </div>
                ))}
                <p className="pl-6 text-sm text-slate-400 font-medium">+500 Toko Menggunakan</p>
              </div>
            </div>
          </div>

          <div className={`relative transition-all duration-1000 delay-300 ${heroVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10'}`}>
            <div className="absolute -inset-4 bg-green-100/50 rounded-[40px] blur-2xl rotate-3"></div>
            <div className="relative rounded-[32px] overflow-hidden shadow-2xl border-8 border-white">
              <img 
                src="/landing-hero.png" 
                alt="FreshCart Hero" 
                className="w-full h-auto object-cover transform hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute top-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-lg border border-white flex items-center gap-4 animate-bounce-slow">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Penjualan Hari Ini</p>
                  <p className="text-lg font-black text-slate-900">+ Rp 2.450.000</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="fitur" className="py-24 bg-slate-50 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-slate-900 mb-4">Fitur Utama FreshCart</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">Dirancang untuk memudahkan operasional harian toko Anda tanpa kerumitan teknis.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-8 rounded-[32px] border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-300 group">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${f.color} flex items-center justify-center text-white mb-6 group-hover:rotate-6 transition-transform`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section id="manfaat" className="py-24 px-6 lg:px-16">
        <div className="max-w-7xl mx-auto bg-slate-900 rounded-[48px] p-10 lg:p-20 overflow-hidden relative">
          <div className="absolute top-0 right-0 w-96 h-96 bg-green-600/20 blur-[100px] rounded-full -translate-y-1/2 translate-x-1/2"></div>
          
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="relative z-10">
              <h2 className="text-4xl lg:text-5xl font-black text-white leading-tight mb-8">
                Kenapa Ribet Jika Bisa <br />
                <span className="text-green-500">Pake yang Simpel?</span>
              </h2>
              
              <div className="space-y-6">
                {[
                  { icon: <Globe size={18}/>, title: '100% Offline / Lokal', desc: 'Bisa jalan tanpa internet, data aman di komputer Anda.' },
                  { icon: <Clock size={18}/>, title: 'Hemat Waktu', desc: 'Input produk dan transaksi hanya butuh beberapa detik.' },
                  { icon: <Shield size={18}/>, title: 'Gratis Selamanya', desc: 'Dibuat khusus untuk mendukung kemajuan UMKM Indonesia.' },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-green-400 flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <h4 className="text-white font-bold mb-1">{item.title}</h4>
                      <p className="text-slate-400 text-sm">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="relative">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
                  <h3 className="text-white font-bold">Ringkasan Bisnis</h3>
                  <div className="px-3 py-1 bg-green-500/20 text-green-400 text-[10px] font-bold rounded-full uppercase tracking-widest">Live Update</div>
                </div>
                <div className="space-y-4">
                  {[
                    { label: 'Stok Terjual', value: '1.240 pcs', color: 'bg-blue-500' },
                    { label: 'Kepuasan Pelanggan', value: '99.4%', color: 'bg-emerald-500' },
                    { label: 'Efisiensi Waktu', value: '+45%', color: 'bg-green-500' },
                  ].map((stat, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-2">
                        <span className="text-slate-400">{stat.label}</span>
                        <span className="text-white font-bold">{stat.value}</span>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div className={`h-full ${stat.color} rounded-full`} style={{ width: stat.value === '99.4%' ? '99%' : stat.value === '+45%' ? '45%' : '75%' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 lg:px-16 text-center">
        <div className="max-w-4xl mx-auto">
          <div className="w-20 h-20 rounded-3xl bg-green-600 flex items-center justify-center text-white mx-auto mb-8 shadow-2xl shadow-green-200">
            <Store size={40} />
          </div>
          <h2 className="text-4xl lg:text-5xl font-black text-slate-900 mb-6">Siap Menuju Digital?</h2>
          <p className="text-slate-500 text-lg mb-10">Buka toko Anda sekarang, catat setiap transaksi dengan rapi, dan lihat bisnis Anda tumbuh.</p>
          <button
            onClick={onEnter}
            className="inline-flex items-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-black px-12 py-6 rounded-3xl shadow-2xl transition-all duration-300 hover:scale-105 text-xl"
          >
            Buka Aplikasi Kasir
            <ArrowRight size={24} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 text-center">
        <div className="flex items-center justify-center gap-2 mb-4 opacity-50">
          <Leaf size={16} className="text-green-600 fill-green-600" />
          <span className="font-bold text-slate-900 text-sm">FreshCart</span>
        </div>
        <p className="text-slate-400 text-xs">© 2025 FreshCart POS · Memberdayakan UMKM Indonesia</p>
      </footer>
    </div>
  );
}
