import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import DomeGallery from '../components/DomeGallery';

const LANDING_URL = 'https://gereja.eternity.my.id/api-gkii/landing.php';
const PROFIL_URL  = 'https://gereja.eternity.my.id/api-gkii/profil.php';
const GALERI_URL  = 'https://gereja.eternity.my.id/api-gkii/galeri.php';
const HARI_ORDER  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

interface Jadwal    { id:number; nama:string; hari:string; jam:string; lokasi:string|null; keterangan:string|null; }
interface Pengumuman{ id:number; judul:string; isi:string; tanggal_mulai:string; tanggal_selesai:string|null; }
interface Stats     { total:number; sekolah_minggu:number; remaja:number; pemuda:number; perkauan:number; perkaria:number; lansia:number; }
interface GaleriItem{ id:number; judul:string|null; foto_url:string; }
interface BPJ       { id:number; nama:string; jabatan:string|null; foto_url:string|null; periode:string|null; }
interface Gembala   { id:number; nama:string; foto_url:string|null; tahun_mulai:string; tahun_selesai:string|null; }

const HARI_ACCENT: Record<string,string> = {
  Minggu:'border-blue-500 bg-blue-50 text-blue-700', Senin:'border-emerald-500 bg-emerald-50 text-emerald-700',
  Selasa:'border-violet-500 bg-violet-50 text-violet-700', Rabu:'border-orange-500 bg-orange-50 text-orange-700',
  Kamis:'border-teal-500 bg-teal-50 text-teal-700', Jumat:'border-rose-500 bg-rose-50 text-rose-700',
  Sabtu:'border-amber-500 bg-amber-50 text-amber-700',
};
const HARI_LEFT: Record<string,string> = {
  Minggu:'bg-blue-500', Senin:'bg-emerald-500', Selasa:'bg-violet-500',
  Rabu:'bg-orange-500', Kamis:'bg-teal-500', Jumat:'bg-rose-500', Sabtu:'bg-amber-500',
};
const AVATAR_COLORS = [
  'from-blue-400 to-blue-600','from-emerald-400 to-emerald-600','from-violet-400 to-violet-600',
  'from-rose-400 to-rose-600','from-amber-400 to-amber-600','from-teal-400 to-teal-600',
];
function avatarColor(name:string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }
function initials(name:string)    { return name.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase(); }
function formatTgl(d:string)      { return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}); }

/* ── Avatar component ─────────────────────────────────────────── */
function Avatar({ fotoUrl, nama, size }: { fotoUrl:string|null; nama:string; size:number }) {
  if (fotoUrl) return (
    <img src={fotoUrl} alt={nama} style={{ width: size, height: size }}
      className="rounded-full object-cover ring-4 ring-white shadow-xl" />
  );
  return (
    <div style={{ width: size, height: size, fontSize: size * 0.32 }}
      className={`rounded-full bg-gradient-to-br ${avatarColor(nama)} ring-4 ring-white shadow-xl flex items-center justify-center text-white font-extrabold`}>
      {initials(nama)}
    </div>
  );
}

/* ── Mini icons ────────────────────────────────────────────────── */
const IcoCalendar   = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>;
const IcoMegaphone  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 1 8.835-2.535m0 0A23.74 23.74 0 0 1 18.795 3c1.167 0 2.315.09 3.438.266m-3.438-.266 2.912 16.494M12 12h.008v.008H12V12Z" /></svg>;
const IcoLocation   = () => <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>;
const IcoClock      = () => <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;
const IcoLogin      = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>;
const IcoChevDown   = ({ open }:{ open?:boolean }) => <svg className={`w-4 h-4 transition-transform duration-200 ${open?'rotate-180':''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;
const IcoScrollDown = () => <svg className="w-5 h-5 animate-bounce" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;
const IcoUsers      = () => <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>;

const PROFIL_MENU = [
  { href: '#sejarah',  label: 'Sejarah Gereja' },
  { href: '#visi-misi', label: 'Visi & Misi'   },
  { href: '#bpj',      label: 'BPJ Periode'    },
  { href: '#gembala',  label: 'Gembala Jemaat' },
];

/* ════════════════════════════════════════════════════════════════
   SECTION LABEL helper
   ════════════════════════════════════════════════════════════════ */
function SectionLabel({ tag, title, sub }: { tag:string; title:string; sub?:string }) {
  return (
    <div className="text-center mb-14">
      <span className="text-xs font-bold uppercase tracking-widest text-blue-600 bg-blue-50 px-4 py-1.5 rounded-full">{tag}</span>
      <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-gray-900">{title}</h2>
      {sub && <p className="mt-3 text-gray-500 text-sm max-w-xl mx-auto">{sub}</p>}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   MAIN PAGE
   ════════════════════════════════════════════════════════════════ */
export default function LandingPage() {
  const [stats, setStats]           = useState<Stats|null>(null);
  const [jadwal, setJadwal]         = useState<Jadwal[]>([]);
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [bpj, setBpj]               = useState<BPJ[]>([]);
  const [gembala, setGembala]       = useState<Gembala[]>([]);
  const [galeri, setGaleri]         = useState<GaleriItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [profilLoading, setProfilLoading] = useState(true);

  const [menuOpen, setMenuOpen]           = useState(false);
  const [profileDrop, setProfileDrop]     = useState(false);
  const [mobileProfile, setMobileProfile] = useState(false);
  const [scrolled, setScrolled]           = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(LANDING_URL).then(r=>r.json()).then(res => {
      if (res.status === 'success') {
        setStats(res.data.stats);
        setJadwal(res.data.jadwal);
        setPengumuman(res.data.pengumuman);
        setGaleri(res.data.galeri ?? []);
      }
    }).catch(console.error).finally(() => setLoading(false));

    fetch(PROFIL_URL).then(r=>r.json()).then(res => {
      if (res.status === 'success') {
        setBpj(res.data.bpj);
        setGembala(res.data.gembala);
      }
    }).catch(console.error).finally(() => setProfilLoading(false));

    fetch(GALERI_URL).then(r=>r.json()).then(res => {
      if (res.status === 'success') setGaleri(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sortedJadwal = [...jadwal].sort((a,b) => HARI_ORDER.indexOf(a.hari)-HARI_ORDER.indexOf(b.hari));
  const navText = scrolled ? 'text-gray-700 hover:text-blue-600' : 'text-white/90 hover:text-white';

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily:"'Inter','Segoe UI',sans-serif" }}>

      {/* ══════════════════════════════════════════════
          NAVBAR
      ══════════════════════════════════════════════ */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-md border-b border-gray-100' : 'bg-transparent'}`}>
        <div className="max-w-6xl mx-auto px-5 sm:px-8 flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/images/logo/logo-icon.svg" alt="Logo" className="w-9 h-9 drop-shadow" />
            <div>
              <p className={`text-sm font-extrabold leading-tight transition-colors ${scrolled?'text-gray-900':'text-white'}`}>GKII Longloreh</p>
              <p className={`text-xs leading-tight hidden sm:block transition-colors ${scrolled?'text-gray-400':'text-white/70'}`}>Gereja Kemah Injil Indonesia</p>
            </div>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {/* Profile Gereja dropdown */}
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileDrop(o=>!o)}
                className={`flex items-center gap-1.5 text-sm font-semibold transition-colors ${navText}`}>
                Profile Gereja <IcoChevDown open={profileDrop} />
              </button>
              {profileDrop && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-50">
                  {PROFIL_MENU.map(({ href, label }) => (
                    <a key={href} href={href} onClick={() => setProfileDrop(false)}
                      className="flex items-center gap-2.5 px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400 shrink-0" />{label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <a href="#jadwal"      className={`text-sm font-semibold transition-colors ${navText}`}>Jadwal Ibadah</a>
            <a href="#pengumuman"  className={`text-sm font-semibold transition-colors ${navText}`}>Pengumuman</a>
            <a href="#galeri"      className={`text-sm font-semibold transition-colors ${navText}`}>Galeri</a>
            <Link to="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-95 px-5 py-2 text-sm font-bold text-white transition-all shadow-lg shadow-blue-600/30">
              <IcoLogin /> Masuk
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden p-2 rounded-lg transition-colors ${scrolled?'text-gray-700 hover:bg-gray-100':'text-white hover:bg-white/20'}`}
            onClick={() => setMenuOpen(o=>!o)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                        : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
            </svg>
          </button>
        </div>

        {/* Mobile drawer */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen?'max-h-screen':'max-h-0'}`}>
          <div className="bg-white border-t border-gray-100 px-5 py-4 flex flex-col gap-1 shadow-lg">
            {/* Profile Gereja accordion */}
            <button onClick={() => setMobileProfile(o=>!o)}
              className="flex items-center justify-between py-2.5 text-sm font-semibold text-gray-700">
              Profile Gereja <IcoChevDown open={mobileProfile} />
            </button>
            {mobileProfile && (
              <div className="pl-4 flex flex-col gap-1 mb-1">
                {PROFIL_MENU.map(({ href, label }) => (
                  <a key={href} href={href} onClick={() => { setMenuOpen(false); setMobileProfile(false); }}
                    className="py-2 text-sm text-gray-500 hover:text-blue-600 transition-colors flex items-center gap-2">
                    <span className="w-1 h-1 rounded-full bg-blue-400" />{label}
                  </a>
                ))}
              </div>
            )}
            <a href="#jadwal" onClick={()=>setMenuOpen(false)} className="py-2.5 text-sm font-semibold text-gray-700 hover:text-blue-600">Jadwal Ibadah</a>
            <a href="#pengumuman" onClick={()=>setMenuOpen(false)} className="py-2.5 text-sm font-semibold text-gray-700 hover:text-blue-600">Pengumuman</a>
            <a href="#galeri" onClick={()=>setMenuOpen(false)} className="py-2.5 text-sm font-semibold text-gray-700 hover:text-blue-600">Galeri</a>
            <Link to="/login" onClick={()=>setMenuOpen(false)}
              className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white shadow-md">
              <IcoLogin /> Masuk ke Sistem
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════
          HERO — full viewport
      ══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage:`url('/aset-landingpage/gkii.webp')` }} />
        <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/20 to-black/80" />
        <div className="relative max-w-6xl mx-auto w-full px-5 sm:px-8 pb-16 pt-32">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 mb-5 rounded-full bg-white/15 backdrop-blur-sm border border-white/20 px-4 py-1.5 text-xs font-bold tracking-widest uppercase text-white">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              Gereja Kemah Injil Indonesia
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-[1.1] mb-5 drop-shadow-lg">
              Selamat Datang<br /><span className="text-blue-300">GKII Longloreh</span>
            </h1>
            <p className="text-white/85 text-lg md:text-xl mb-8 leading-relaxed max-w-xl">
              Bersama bertumbuh dalam iman, melayani dengan kasih,<br className="hidden md:block" />
              dan bersaksi bagi kemuliaan Tuhan.
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="#jadwal" className="inline-flex items-center gap-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 active:scale-95 px-6 py-3 text-sm font-bold transition-all shadow-xl">
                <IcoCalendar /> Jadwal Ibadah
              </a>
              <a href="#sejarah" className="inline-flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 active:scale-95 backdrop-blur-sm border border-white/30 px-6 py-3 text-sm font-bold text-white transition-all">
                Profile Gereja
              </a>
            </div>
          </div>
        </div>
        <div className="relative flex justify-center pb-6 text-white/60"><IcoScrollDown /></div>
      </section>

      {/* ══════════════════════════════════════════════
          STATS — floating cards
      ══════════════════════════════════════════════ */}
      <div className="relative z-10 max-w-5xl mx-auto px-5 sm:px-8 -mt-6">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Total row */}
          <div className="flex flex-col items-center justify-center gap-1.5 py-6 border-b border-gray-100 bg-blue-50/50">
            <span className="text-blue-600 opacity-80"><IcoUsers /></span>
            <p className="text-4xl md:text-5xl font-extrabold text-blue-600">
              {loading ? <span className="inline-block w-14 h-10 bg-blue-100 rounded animate-pulse" /> : (stats?.total ?? 0)}
            </p>
            <p className="text-xs font-bold uppercase tracking-widest text-blue-400">Total Jemaat Keseluruhan</p>
          </div>
          {/* 6 seksi grid */}
          <div className="grid grid-cols-3 sm:grid-cols-6 divide-x divide-gray-100">
            {[
              { label:'Sekolah Minggu', val:stats?.sekolah_minggu, color:'text-emerald-600',  bg:'hover:bg-emerald-50' },
              { label:'Remaja',         val:stats?.remaja,         color:'text-violet-600',   bg:'hover:bg-violet-50'  },
              { label:'Pemuda',         val:stats?.pemuda,         color:'text-orange-600',   bg:'hover:bg-orange-50'  },
              { label:'Perkauan',       val:stats?.perkauan,       color:'text-rose-600',     bg:'hover:bg-rose-50'    },
              { label:'Perkaria',       val:stats?.perkaria,       color:'text-teal-600',     bg:'hover:bg-teal-50'    },
              { label:'Lansia',         val:stats?.lansia,         color:'text-amber-600',    bg:'hover:bg-amber-50'   },
            ].map(({ label, val, color, bg }) => (
              <div key={label} className={`flex flex-col items-center justify-center gap-1 py-5 px-2 transition-colors ${bg} group`}>
                <p className={`text-2xl md:text-3xl font-extrabold ${color}`}>
                  {loading ? <span className="inline-block w-8 h-7 bg-gray-100 rounded animate-pulse" /> : (val ?? 0)}
                </p>
                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider text-center leading-tight">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════
          SEJARAH GEREJA  #sejarah
      ══════════════════════════════════════════════ */}
      <section id="sejarah" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionLabel tag="Tentang Kami" title="Sejarah Gereja" sub="Perjalanan panjang iman yang telah membentuk komunitas GKII Longloreh hingga hari ini." />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="space-y-5 text-gray-600 leading-relaxed">
              <p>
                GKII Longloreh berdiri sebagai salah satu bagian dari gerakan Gereja Kemah Injil Indonesia yang telah lama
                melayani masyarakat dengan penuh dedikasi. Sejak pertama kali berdiri, gereja ini menjadi tempat
                berkumpulnya jemaat yang rindu untuk mengenal Tuhan lebih dalam.
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et
                dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip
                ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore
                eu fugiat nulla pariatur.
              </p>
              <p>
                Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est
                laborum. Gereja ini terus bertumbuh dan berkembang melayani jemaat dengan sepenuh hati, membawa
                terang Injil bagi setiap jiwa yang datang.
              </p>
            </div>
            {/* Timeline visual */}
            <div className="relative pl-6 border-l-2 border-blue-100 space-y-8">
              {[
                { year:'Awal Berdiri',   desc:'Gereja didirikan oleh para misionaris yang membawa Injil ke wilayah Longloreh.' },
                { year:'Perkembangan',   desc:'Jemaat terus bertambah dan gereja membangun fasilitas pelayanan yang lebih baik.' },
                { year:'Saat Ini',       desc:'GKII Longloreh kini hadir sebagai komunitas iman yang aktif melayani dan bersaksi.' },
              ].map(({ year, desc }, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-8 top-0 w-4 h-4 rounded-full bg-blue-500 border-4 border-white shadow" />
                  <h4 className="font-bold text-gray-900 mb-1">{year}</h4>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          VISI & MISI  #visi-misi
      ══════════════════════════════════════════════ */}
      <section id="visi-misi" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionLabel tag="Arah & Tujuan" title="Visi & Misi" sub="Landasan yang memandu setiap langkah pelayanan GKII Longloreh." />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Visi */}
            <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 text-white overflow-hidden">
              <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3" />
              <div className="absolute bottom-0 left-0 w-24 h-24 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/3" />
              <div className="relative">
                <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-200 mb-4">Visi</span>
                <h3 className="text-2xl font-extrabold mb-4 leading-snug">
                  Menjadi Gereja yang Hidup, Bertumbuh, dan Memberkati
                </h3>
                <p className="text-blue-100 text-sm leading-relaxed">
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore
                  et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
                </p>
              </div>
            </div>
            {/* Misi */}
            <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
              <span className="inline-block text-xs font-bold uppercase tracking-widest text-blue-600 mb-4">Misi</span>
              <h3 className="text-xl font-extrabold text-gray-900 mb-5">Wujud Nyata Pelayanan Kami</h3>
              <ul className="space-y-4">
                {[
                  'Memberitakan Injil Yesus Kristus kepada setiap jiwa di seluruh pelosok wilayah.',
                  'Membangun jemaat yang dewasa dalam iman melalui Firman, doa, dan persekutuan.',
                  'Melayani masyarakat sekitar dengan kasih yang nyata dan tindakan yang konkret.',
                  'Mendidik generasi muda untuk menjadi penerus pelayanan yang takut akan Tuhan.',
                ].map((m, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="shrink-0 w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center mt-0.5">{i+1}</span>
                    <p className="text-sm text-gray-600 leading-relaxed">{m}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          NILAI KAMI (Iman / Kasih / Pelayanan)
      ══════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionLabel tag="Identitas Kami" title="Dipanggil, Dibentuk, Diutus"
            sub="Tiga pilar yang menjadi nafas kehidupan jemaat GKII Longloreh setiap hari." />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { color:'from-blue-500 to-blue-600', bg:'bg-blue-50', accent:'text-blue-600', border:'border-blue-100',
                title:'Iman yang Teguh', desc:'Berpusat pada Firman Tuhan dan doa, kami membangun fondasi iman yang kokoh dalam kehidupan sehari-hari.',
                icon:<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25" /></svg> },
              { color:'from-rose-500 to-rose-600', bg:'bg-rose-50', accent:'text-rose-600', border:'border-rose-100',
                title:'Kasih yang Nyata', desc:'Kami percaya kasih bukan hanya kata-kata, tetapi tindakan nyata yang menyentuh jiwa dan menjangkau yang terluka.',
                icon:<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg> },
              { color:'from-emerald-500 to-emerald-600', bg:'bg-emerald-50', accent:'text-emerald-600', border:'border-emerald-100',
                title:'Pelayanan Bersama', desc:'Setiap jemaat adalah pelayan. Bersama kami membangun gereja yang hidup, aktif, dan memberkati komunitas.',
                icon:<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.59 14.37a6 6 0 0 1-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 0 0 6.16-12.12A14.98 14.98 0 0 0 9.631 8.41m5.96 5.96a14.926 14.926 0 0 1-5.841 2.58m-.119-8.54a6 6 0 0 0-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 0 0-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 0 1-2.448-2.448 14.9 14.9 0 0 1 .06-.312m-2.24 2.39a4.493 4.493 0 0 0-1.757 4.306 4.493 4.493 0 0 0 4.306-1.758M16.5 9a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg> },
            ].map(({ color, bg, accent, border, title, desc, icon }) => (
              <div key={title} className={`relative rounded-2xl border ${border} ${bg} p-8 overflow-hidden group hover:-translate-y-1 hover:shadow-lg transition-all duration-300`}>
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${color} text-white mb-5 shadow-lg`}>{icon}</div>
                <h3 className={`text-lg font-extrabold ${accent} mb-2`}>{title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
                <div className={`absolute -bottom-6 -right-6 w-24 h-24 rounded-full bg-gradient-to-br ${color} opacity-10 group-hover:opacity-20 transition-opacity`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          BPJ PERIODE  #bpj
      ══════════════════════════════════════════════ */}
      <section id="bpj" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionLabel tag="Kepengurusan" title="BPJ Periode" sub="Badan Pengurus Jemaat yang melayani dengan sepenuh hati." />
          {profilLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {[...Array(5)].map((_,i) => (
                <div key={i} className="flex flex-col items-center gap-3">
                  <div className="w-24 h-24 rounded-full bg-gray-200 animate-pulse" />
                  <div className="w-20 h-3 bg-gray-200 rounded animate-pulse" />
                  <div className="w-16 h-2.5 bg-gray-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : bpj.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">Belum ada data BPJ.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {bpj.map(b => (
                <div key={b.id} className="flex flex-col items-center text-center group">
                  <div className="mb-3 transition-transform duration-300 group-hover:-translate-y-1">
                    <Avatar fotoUrl={b.foto_url} nama={b.nama} size={96} />
                  </div>
                  <p className="font-bold text-gray-900 text-sm leading-snug">{b.nama}</p>
                  {b.jabatan && <p className="text-xs text-blue-600 font-semibold mt-0.5">{b.jabatan}</p>}
                  {b.periode && <p className="text-xs text-gray-400 mt-0.5">{b.periode}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          GEMBALA JEMAAT  #gembala
      ══════════════════════════════════════════════ */}
      <section id="gembala" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionLabel tag="Pemimpin" title="Gembala Jemaat" sub="Para gembala yang telah dan sedang melayani jemaat GKII Longloreh." />
          {profilLoading ? (
            <div className="flex flex-col gap-6 max-w-2xl mx-auto">
              {[...Array(2)].map((_,i) => (
                <div key={i} className="flex items-center gap-6 bg-gray-50 rounded-2xl p-6 animate-pulse">
                  <div className="w-20 h-20 rounded-full bg-gray-200 shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-100 rounded w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : gembala.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">Belum ada data gembala.</p>
          ) : (
            <div className="max-w-2xl mx-auto flex flex-col gap-5">
              {gembala.map((g, i) => {
                const isCurrent = !g.tahun_selesai;
                return (
                  <div key={g.id} className={`flex items-center gap-6 rounded-2xl p-5 border transition-all duration-300 hover:shadow-md ${
                    isCurrent ? 'bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-100' : 'bg-white border-gray-100'}`}>
                    <div className="shrink-0">
                      <Avatar fotoUrl={g.foto_url} nama={g.nama} size={80} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <p className="font-extrabold text-gray-900 text-base">{g.nama}</p>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-green-700 bg-green-100 px-2.5 py-0.5 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Aktif
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5" /></svg>
                        Masa pelayanan: <strong className="text-gray-700">{g.tahun_mulai} – {g.tahun_selesai ?? 'Sekarang'}</strong>
                      </p>
                    </div>
                    <div className="shrink-0 text-right hidden sm:block">
                      <p className="text-3xl font-extrabold text-gray-100 select-none">#{gembala.length - i}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          JADWAL IBADAH  #jadwal
      ══════════════════════════════════════════════ */}
      <section id="jadwal" className="py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionLabel tag="Ibadah" title="Jadwal Ibadah" sub="Bergabunglah bersama kami dalam beribadah kepada Tuhan" />
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {[...Array(4)].map((_,i) => <div key={i} className="bg-white rounded-2xl h-36 animate-pulse border border-gray-100" />)}
            </div>
          ) : sortedJadwal.length === 0 ? (
            <div className="text-center py-16 text-gray-400 flex flex-col items-center gap-2">
              <IcoCalendar /><p className="text-sm">Belum ada jadwal ibadah.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {sortedJadwal.map(j => (
                <div key={j.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex">
                  <div className={`w-1 shrink-0 ${HARI_LEFT[j.hari] ?? 'bg-gray-400'}`} />
                  <div className="p-5 flex-1">
                    <div className="flex items-center justify-between mb-3">
                      <span className={`inline-block rounded-full border px-3 py-0.5 text-xs font-bold ${HARI_ACCENT[j.hari] ?? 'border-gray-300 bg-gray-50 text-gray-600'}`}>{j.hari}</span>
                      <div className="flex items-center gap-1 text-gray-500"><IcoClock /><span className="text-sm font-extrabold text-gray-800">{j.jam}</span></div>
                    </div>
                    <h3 className="font-bold text-gray-900 text-[15px] leading-snug mb-2">{j.nama}</h3>
                    {j.lokasi && <div className="flex items-center gap-1.5 text-xs text-gray-400"><IcoLocation /><span>{j.lokasi}</span></div>}
                    {j.keterangan && <p className="text-xs text-gray-400 mt-1 italic">{j.keterangan}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          PENGUMUMAN  #pengumuman
      ══════════════════════════════════════════════ */}
      <section id="pengumuman" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <SectionLabel tag="Info Terkini" title="Pengumuman" sub="Informasi dan kegiatan terkini jemaat" />
          {loading ? (
            <div className="max-w-3xl mx-auto flex flex-col gap-5">
              {[...Array(2)].map((_,i) => <div key={i} className="bg-gray-50 rounded-2xl h-28 animate-pulse" />)}
            </div>
          ) : pengumuman.length === 0 ? (
            <div className="text-center py-16 text-gray-400 flex flex-col items-center gap-2">
              <IcoMegaphone /><p className="text-sm">Belum ada pengumuman.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto flex flex-col gap-5">
              {pengumuman.map((p, idx) => (
                <div key={p.id} className="group relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-100 transition-all duration-300 p-6 pl-7 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-400 to-indigo-500 rounded-l-2xl" />
                  <div className="absolute top-5 right-5 w-7 h-7 rounded-full bg-gray-100 group-hover:bg-blue-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-gray-400 group-hover:text-blue-600">{idx+1}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-full">{formatTgl(p.tanggal_mulai)}</span>
                    {p.tanggal_selesai && <span className="text-xs text-gray-400">s.d. {formatTgl(p.tanggal_selesai)}</span>}
                  </div>
                  <h3 className="font-bold text-gray-900 text-base leading-snug mb-2 pr-8">{p.judul}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{p.isi}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          GALERI  #galeri
      ══════════════════════════════════════════════ */}
      <section id="galeri" className="py-24 bg-[#060010]">
        <div className="max-w-6xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-blue-400 bg-blue-950/60 px-4 py-1.5 rounded-full">Momen Bersama</span>
            <h2 className="mt-4 text-3xl md:text-4xl font-extrabold text-white">Galeri Foto</h2>
            <p className="mt-3 text-gray-400 text-sm max-w-xl mx-auto">Kenangan indah perjalanan iman bersama jemaat GKII Longloreh.</p>
          </div>
          {galeri.length > 0 ? (
            <DomeGallery
              images={galeri.map(g => ({ src: g.foto_url, alt: g.judul ?? '' }))}
              overlayBlurColor="#060010"
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-20 text-gray-600">
              <svg className="w-16 h-16 mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
              </svg>
              <p className="text-sm opacity-40">Belum ada foto di galeri</p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          CTA BAND
      ══════════════════════════════════════════════ */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage:`url('/aset-landingpage/gkii.webp')` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/90 to-indigo-900/85" />
        <div className="relative max-w-6xl mx-auto px-5 sm:px-8 py-20 text-center">
          <p className="text-blue-300 text-xs font-bold uppercase tracking-widest mb-3">Bergabunglah</p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">Kami Menantikan Kehadiranmu</h2>
          <p className="text-white/75 text-lg mb-8 max-w-lg mx-auto leading-relaxed">
            Temukan keluarga rohani di GKII Longloreh. Setiap jiwa berharga bagi Tuhan dan bagi kami.
          </p>
          <a href="#jadwal" className="inline-flex items-center gap-2 rounded-xl bg-white text-blue-700 hover:bg-blue-50 active:scale-95 px-8 py-3.5 text-sm font-bold transition-all shadow-2xl">
            <IcoCalendar /> Lihat Jadwal Ibadah
          </a>
        </div>
      </section>

      {/* ══════════════════════════════════════════════
          FOOTER
      ══════════════════════════════════════════════ */}
      <footer className="bg-gray-950 text-gray-400">
        <div className="max-w-6xl mx-auto px-5 sm:px-8 py-14">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-10">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <img src="/images/logo/logo-icon.svg" alt="Logo" className="w-9 h-9 opacity-80" />
                <div>
                  <p className="text-white font-extrabold text-sm">GKII Longloreh</p>
                  <p className="text-xs text-gray-500">Gereja Kemah Injil Indonesia</p>
                </div>
              </div>
              <p className="text-sm text-gray-500 leading-relaxed">Bersama bertumbuh dalam iman, melayani dengan kasih, dan bersaksi bagi kemuliaan Tuhan.</p>
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-4">Navigasi</p>
              <ul className="flex flex-col gap-2.5">
                {[['#sejarah','Sejarah Gereja'],['#visi-misi','Visi & Misi'],['#bpj','BPJ Periode'],['#gembala','Gembala Jemaat'],['#jadwal','Jadwal Ibadah'],['#pengumuman','Pengumuman'],['#galeri','Galeri']].map(([href,label]) => (
                  <li key={href}>
                    <a href={href} className="text-sm text-gray-500 hover:text-blue-400 transition-colors flex items-center gap-2">
                      <span className="w-1 h-1 rounded-full bg-blue-600" />{label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-white font-bold text-sm mb-4">Sistem Informasi</p>
              <p className="text-sm text-gray-500 mb-4 leading-relaxed">Kelola data jemaat, keuangan, dan konten gereja melalui sistem informasi kami.</p>
              <Link to="/login" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 hover:bg-blue-700 px-5 py-2.5 text-sm font-bold text-white transition-colors shadow-lg shadow-blue-900/40">
                <IcoLogin /> Masuk ke Sistem
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
            <p>&copy; {new Date().getFullYear()} GKII Longloreh. Semua hak dilindungi.</p>
            <p>Dibangun dengan ❤️ untuk jemaat</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
