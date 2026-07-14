import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import DomeGallery from '../components/DomeGallery';

// ── Inline SVG icon components ──────────────────────────────────────────────
const Calendar     = ({ className='w-4 h-4' }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" /></svg>;
const CalendarDays = ({ className='w-10 h-10' }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5" /></svg>;
const MapPin       = ({ className='w-4 h-4' }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0ZM19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" /></svg>;
const LogIn        = ({ className='w-4 h-4' }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0 0 13.5 3h-6a2.25 2.25 0 0 0-2.25 2.25v13.5A2.25 2.25 0 0 0 7.5 21h6a2.25 2.25 0 0 0 2.25-2.25V15M12 9l-3 3m0 0 3 3m-3-3h12.75" /></svg>;
const ChevronDown  = ({ className='w-4 h-4' }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>;
const ChevronUp    = ({ className='w-4 h-4' }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 15.75l7.5-7.5 7.5 7.5" /></svg>;
const ChevronLeft  = ({ className='w-4 h-4' }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" /></svg>;
const ChevronRight = ({ className='w-4 h-4' }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" /></svg>;
const Megaphone    = ({ className='w-8 h-8' }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M10.34 15.84c-.688-.06-1.386-.09-2.09-.09H7.5a4.5 4.5 0 1 1 0-9h.75c.704 0 1.402-.03 2.09-.09m0 9.18c.253.962.584 1.892.985 2.783.247.55.06 1.21-.463 1.511l-.657.38c-.551.318-1.26.117-1.527-.461a20.845 20.845 0 0 1-1.44-4.282m3.102.069a18.03 18.03 0 0 1-.59-4.59c0-1.586.205-3.124.59-4.59m0 9.18a23.848 23.848 0 0 1 8.835 2.535M10.34 6.66a23.847 23.847 0 0 1 8.835-2.535m0 0A23.74 23.74 0 0 1 18.795 3c1.167 0 2.315.09 3.438.266m-3.438-.266 2.912 16.494" /></svg>;
const ImageIcon    = ({ className='w-16 h-16' }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" /></svg>;
const Star         = ({ className='w-6 h-6' }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" /></svg>;
const Heart        = ({ className='w-6 h-6' }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z" /></svg>;
const Users        = ({ className='w-6 h-6' }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>;
const Eye          = ({ className='w-4 h-4' }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.964-7.178Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" /></svg>;
const Clock        = ({ className='w-3.5 h-3.5' }: { className?: string }) => <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>;

const LANDING_URL  = 'https://gkiilongloreh.com/api-gkii/landing.php';
const PROFIL_URL   = 'https://gkiilongloreh.com/api-gkii/profil.php';
const GALERI_URL   = 'https://gkiilongloreh.com/api-gkii/galeri.php';
const PROGRAM_URL  = 'https://gkiilongloreh.com/api-gkii/program.php';
const HARI_ORDER  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

interface Jadwal    { id:number; nama:string; hari:string; jam:string; lokasi:string|null; keterangan:string|null; }
interface Pengumuman{ id:number; judul:string; isi:string; tanggal_mulai:string; tanggal_selesai:string|null; }
interface Stats     {
  total:number; total_laki:number; total_perempuan:number;
  sekolah_minggu:number; sm_laki:number; sm_perempuan:number;
  remaja:number; remaja_laki:number; remaja_perempuan:number;
  pemuda:number; pemuda_laki:number; pemuda_perempuan:number;
  perkauan:number; perkaria:number;
  lansia:number; lansia_laki:number; lansia_perempuan:number;
}
interface Program   { id:number; judul:string; deskripsi:string|null; tanggal_mulai:string; tanggal_selesai:string|null; lokasi:string|null; kategori:string|null; }
interface GaleriItem{ id:number; judul:string|null; foto_url:string; }
interface BPJ       { id:number; parent_id:number|null; nama:string; jabatan:string|null; foto_url:string|null; periode:string|null; }
interface Gembala   { id:number; nama:string; tipe:'aktif'|'senior'|'mantan'; foto_url:string|null; tahun_mulai:string; tahun_selesai:string|null; }

const HARI_ACCENT: Record<string,string> = {
  Minggu:'border-[#C9A84C]/30 bg-[#C9A84C]/10 text-[#D4AF37]',
  Senin:'border-emerald-400/30 bg-emerald-500/10 text-emerald-300',
  Selasa:'border-violet-400/30 bg-violet-500/10 text-violet-300',
  Rabu:'border-orange-400/30 bg-orange-500/10 text-orange-300',
  Kamis:'border-teal-400/30 bg-teal-500/10 text-teal-300',
  Jumat:'border-rose-400/30 bg-rose-500/10 text-rose-300',
  Sabtu:'border-amber-400/30 bg-amber-500/10 text-amber-300',
};
const HARI_COLOR: Record<string,string> = {
  Minggu:'text-[#D4AF37]', Senin:'text-emerald-400', Selasa:'text-violet-400',
  Rabu:'text-orange-400', Kamis:'text-teal-400', Jumat:'text-rose-400', Sabtu:'text-amber-400',
};
const AVATAR_COLORS = [
  'from-[#C9A84C] to-[#92400e]','from-emerald-500 to-emerald-700','from-violet-500 to-violet-700',
  'from-rose-500 to-rose-700','from-amber-500 to-amber-700','from-teal-500 to-teal-700',
];
function avatarColor(name:string) { return AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length]; }
function buildTree(items: BPJ[]): BPJ[] { return items.filter(i => !i.parent_id); }
function childrenOf(items: BPJ[], parentId: number): BPJ[] { return items.filter(i => i.parent_id === parentId); }

function BpjCard({ b, large, small }: { b: BPJ; large?: boolean; small?: boolean }) {
  const size = large ? 96 : small ? 60 : 76;
  return (
    <div className={`group relative flex flex-col items-center text-center transition-all duration-300 hover:-translate-y-2 ${large ? 'p-8 w-48' : small ? 'p-4 w-28' : 'p-6 w-36'}`}
      style={{
        background:'linear-gradient(145deg, rgba(201,168,76,0.08) 0%, rgba(11,16,38,0.6) 100%)',
        border:'1px solid rgba(201,168,76,0.18)',
        borderRadius:'1.5rem',
        backdropFilter:'blur(16px)',
        boxShadow:'0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(201,168,76,0.15)',
      }}>
      {/* Top shimmer */}
      <div className="absolute top-0 left-6 right-6 h-px rounded-full pointer-events-none"
        style={{background:'linear-gradient(90deg, transparent, rgba(201,168,76,0.5), transparent)'}} />
      {/* Hover glow */}
      <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{background:'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.12), transparent 70%)'}} />
      <div className="relative mb-3 group-hover:scale-105 transition-transform duration-300">
        <Avatar fotoUrl={b.foto_url} nama={b.nama} size={size} gold />
      </div>
      <p className={`font-bold text-[#FFF8E7] leading-snug ${large ? 'text-sm' : 'text-xs'}`}>{b.nama}</p>
      {b.jabatan && (
        <span className={`mt-1.5 inline-block font-bold rounded-full tracking-wide ${large ? 'text-[11px] px-3 py-1' : 'text-[9px] px-2 py-0.5'}`}
          style={{color:'#D4AF37', background:'rgba(201,168,76,0.12)', border:'1px solid rgba(201,168,76,0.25)'}}>
          {b.jabatan}
        </span>
      )}
      {b.periode && <p className="text-[9px] mt-1" style={{color:'rgba(255,248,231,0.3)'}}>{b.periode}</p>}
    </div>
  );
}

function initials(name:string)    { return name.split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase(); }
function formatTgl(d:string)      { return new Date(d).toLocaleDateString('id-ID',{day:'numeric',month:'long',year:'numeric'}); }

function Avatar({ fotoUrl, nama, size, gold }: { fotoUrl:string|null; nama:string; size:number; gold?: boolean }) {
  if (fotoUrl) return (
    <img src={fotoUrl} alt={nama} style={{
      width: size, height: size,
      boxShadow: gold ? '0 0 0 3px rgba(201,168,76,0.5), 0 0 0 6px rgba(201,168,76,0.12)' : undefined
    }} className="rounded-full object-cover" />
  );
  return (
    <div style={{ width: size, height: size, fontSize: size * 0.32,
      boxShadow: gold ? '0 0 0 3px rgba(201,168,76,0.4), 0 0 16px rgba(201,168,76,0.2)' : undefined }}
      className={`rounded-full bg-gradient-to-br ${avatarColor(nama)} flex items-center justify-center text-white font-extrabold`}>
      {initials(nama)}
    </div>
  );
}

// Gold divider between sections
function GoldDivider() {
  return (
    <div className="relative h-px overflow-visible" style={{background:'linear-gradient(90deg, transparent 0%, rgba(201,168,76,0.4) 30%, rgba(212,175,55,0.7) 50%, rgba(201,168,76,0.4) 70%, transparent 100%)'}}>
      <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rotate-45"
        style={{background:'#080613', border:'1px solid rgba(201,168,76,0.5)', boxShadow:'0 0 12px rgba(201,168,76,0.3)'}} />
    </div>
  );
}

const PROFIL_MENU = [
  { href: '#sejarah',  label: 'Sejarah Gereja' },
  { href: '#visi-misi', label: 'Visi & Misi'   },
  { href: '#bpj',      label: 'BPJ Periode'    },
  { href: '#gembala',  label: 'Gembala Jemaat' },
];

export default function LandingPage() {
  const [stats, setStats]           = useState<Stats|null>(null);
  const [jadwal, setJadwal]         = useState<Jadwal[]>([]);
  const [pengumuman, setPengumuman] = useState<Pengumuman[]>([]);
  const [program, setProgram]       = useState<Program[]>([]);
  const [bpj, setBpj]               = useState<BPJ[]>([]);
  const [gembala, setGembala]       = useState<Gembala[]>([]);
  const [galeri, setGaleri]         = useState<GaleriItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [profilLoading, setProfilLoading] = useState(true);

  const [kegiatanTab, setKegiatanTab] = useState<'jadwal'|'info'|'program'|'galeri'>('jadwal');
  const [menuOpen, setMenuOpen]           = useState(false);
  const [profileDrop, setProfileDrop]     = useState(false);
  const [mobileProfile, setMobileProfile] = useState(false);
  const [scrolled, setScrolled]           = useState(false);
  const [seniorIdx, setSeniorIdx]         = useState(0);

  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(LANDING_URL).then(r=>r.json()).then(res => {
      if (res.status === 'success') {
        setStats(res.data.stats);
        setJadwal(res.data.jadwal);
        setPengumuman(res.data.pengumuman);
        setProgram(res.data.program ?? []);
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

    fetch(PROGRAM_URL).then(r=>r.json()).then(res => {
      if (res.status === 'success') setProgram(res.data);
    }).catch(console.error);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileDrop(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const sortedJadwal = [...jadwal].sort((a,b) => HARI_ORDER.indexOf(a.hari)-HARI_ORDER.indexOf(b.hari));

  return (
    <div className="min-h-screen" style={{ fontFamily:"'Georgia','Times New Roman',serif", backgroundColor:'#080613' }}>

      {/* ── CSS Keyframes ─────────────────────────────────────────── */}
      <style>{`
        @keyframes float-slow { 0%,100%{transform:translateY(0) translateX(0)} 33%{transform:translateY(-18px) translateX(8px)} 66%{transform:translateY(-8px) translateX(-6px)} }
        @keyframes float-medium { 0%,100%{transform:translateY(0) scale(1)} 50%{transform:translateY(-24px) scale(1.04)} }
        @keyframes shimmer-gold { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes glow-pulse { 0%,100%{opacity:0.4; transform:scale(1)} 50%{opacity:0.7; transform:scale(1.08)} }
        @keyframes particle-rise { 0%{transform:translateY(0) translateX(0) scale(1);opacity:0.6} 50%{opacity:0.9} 100%{transform:translateY(-120px) translateX(20px) scale(0.3);opacity:0} }
        @keyframes fade-in-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cross-spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }

        .float-1 { animation: float-slow 9s ease-in-out infinite; }
        .float-2 { animation: float-medium 7s ease-in-out infinite; }
        .float-3 { animation: float-slow 11s ease-in-out infinite 2s; }
        .glow-orb { animation: glow-pulse 4s ease-in-out infinite; }
        .shimmer-text {
          background: linear-gradient(90deg, #C9A84C 0%, #FFF8E7 40%, #D4AF37 60%, #C9A84C 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer-gold 4s linear infinite;
        }
        .particle {
          position: absolute;
          width: 3px; height: 3px;
          border-radius: 50%;
          background: rgba(201,168,76,0.7);
          animation: particle-rise 6s ease-in infinite;
        }
        .section-fade { animation: fade-in-up 0.7s ease both; }
        .glass-card {
          background: linear-gradient(145deg, rgba(201,168,76,0.07) 0%, rgba(8,6,19,0.7) 100%);
          border: 1px solid rgba(201,168,76,0.15);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          box-shadow: 0 8px 32px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,168,76,0.12);
        }
        .glass-card:hover {
          border-color: rgba(201,168,76,0.3);
          box-shadow: 0 16px 48px rgba(0,0,0,0.6), 0 0 20px rgba(201,168,76,0.08), inset 0 1px 0 rgba(201,168,76,0.2);
        }
        .gold-btn {
          background: linear-gradient(135deg, #C9A84C 0%, #D4AF37 50%, #C9A84C 100%);
          background-size: 200% auto;
          transition: background-position 0.4s ease, transform 0.15s ease, box-shadow 0.3s ease;
          box-shadow: 0 4px 24px rgba(201,168,76,0.35);
        }
        .gold-btn:hover { background-position: right center; box-shadow: 0 8px 32px rgba(201,168,76,0.5); }
        .gold-btn:active { transform: scale(0.97); }
        .sacred-cross {
          position: relative;
          display: inline-flex; align-items: center; justify-content: center;
        }
        .sacred-cross::before, .sacred-cross::after {
          content: '';
          position: absolute;
          background: rgba(201,168,76,0.3);
        }
        .sacred-cross::before { width: 1px; height: 28px; }
        .sacred-cross::after  { width: 20px; height: 1px; top: 40%; }
      `}</style>

      {/* ══ NAVBAR ══════════════════════════════════════════════════ */}
      <nav className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'backdrop-blur-2xl border-b'
          : 'bg-transparent'
      }`}
        style={scrolled ? {
          background:'rgba(8,6,19,0.92)',
          borderBottomColor:'rgba(201,168,76,0.18)',
        } : {}}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 flex items-center justify-between h-[68px]">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src="/images/logo/logo-icon.svg" alt="Logo" className="w-9 h-9 drop-shadow-lg" />
            </div>
            <div>
              <p className={`text-sm font-bold leading-tight tracking-wide transition-colors ${scrolled ? '' : 'text-white'}`}
                style={scrolled ? {color:'#FFF8E7'} : {}}>
                GKII Longloreh
              </p>
              <p className="text-[10px] leading-tight hidden sm:block tracking-widest uppercase" style={{color:'#C9A84C', opacity: scrolled ? 1 : 0.8}}>
                Gereja Kemah Injil Indonesia
              </p>
            </div>
          </div>

          {/* Desktop */}
          <div className="hidden md:flex items-center gap-7">
            <div className="relative" ref={profileRef}>
              <button onClick={() => setProfileDrop(o=>!o)}
                className="flex items-center gap-1.5 text-sm font-semibold transition-colors"
                style={{color: scrolled ? '#FFF8E7' : 'rgba(255,248,231,0.85)'}}>
                Profile Gereja
                {profileDrop
                  ? <ChevronUp className="w-4 h-4 transition-transform" />
                  : <ChevronDown className="w-4 h-4 transition-transform" />}
              </button>
              {profileDrop && (
                <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 rounded-2xl overflow-hidden z-50"
                  style={{
                    background:'rgba(8,6,19,0.96)',
                    border:'1px solid rgba(201,168,76,0.2)',
                    backdropFilter:'blur(24px)',
                    boxShadow:'0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.05)',
                  }}>
                  {PROFIL_MENU.map(({ href, label }) => (
                    <a key={href} href={href} onClick={() => setProfileDrop(false)}
                      className="flex items-center gap-3 px-4 py-3.5 text-sm transition-colors border-b last:border-0"
                      style={{color:'rgba(255,248,231,0.7)', borderBottomColor:'rgba(201,168,76,0.08)'}}
                      onMouseEnter={e=>{(e.currentTarget as HTMLElement).style.color='#D4AF37';(e.currentTarget as HTMLElement).style.background='rgba(201,168,76,0.06)'}}
                      onMouseLeave={e=>{(e.currentTarget as HTMLElement).style.color='rgba(255,248,231,0.7)';(e.currentTarget as HTMLElement).style.background='transparent'}}>
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{background:'#C9A84C'}} />
                      {label}
                    </a>
                  ))}
                </div>
              )}
            </div>
            <a href="#jadwal"
              className="text-sm font-semibold transition-colors hover:opacity-100"
              style={{color:'rgba(255,248,231,0.8)'}}>
              Kegiatan Gereja
            </a>
            <Link to="/login"
              className="inline-flex items-center gap-2 rounded-full px-5 py-2 text-sm font-bold text-[#080613] gold-btn">
              <LogIn className="w-4 h-4" /> Masuk
            </Link>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-xl transition-colors"
            style={{color:'rgba(255,248,231,0.8)'}}
            onClick={() => setMenuOpen(o=>!o)}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              {menuOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />}
            </svg>
          </button>
        </div>

        {/* Mobile drawer */}
        <div className={`md:hidden overflow-hidden transition-all duration-300 ${menuOpen ? 'max-h-screen' : 'max-h-0'}`}>
          <div className="px-5 py-4 flex flex-col gap-0.5"
            style={{background:'rgba(8,6,19,0.97)', borderTop:'1px solid rgba(201,168,76,0.15)'}}>
            <button onClick={() => setMobileProfile(o=>!o)}
              className="flex items-center justify-between py-3 text-sm font-semibold"
              style={{color:'#FFF8E7'}}>
              Profile Gereja
              {mobileProfile ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {mobileProfile && (
              <div className="pl-4 mb-2 flex flex-col">
                {PROFIL_MENU.map(({ href, label }) => (
                  <a key={href} href={href} onClick={() => { setMenuOpen(false); setMobileProfile(false); }}
                    className="py-2.5 text-sm transition-colors flex items-center gap-2.5"
                    style={{color:'rgba(255,248,231,0.5)'}}>
                    <span className="w-1 h-1 rounded-full" style={{background:'#C9A84C'}} />{label}
                  </a>
                ))}
              </div>
            )}
            <a href="#jadwal" onClick={()=>setMenuOpen(false)}
              className="py-3 text-sm font-semibold border-t"
              style={{color:'rgba(255,248,231,0.8)', borderTopColor:'rgba(201,168,76,0.1)'}}>
              Kegiatan Gereja
            </a>
            <Link to="/login" onClick={()=>setMenuOpen(false)}
              className="mt-3 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold text-[#080613] gold-btn">
              <LogIn className="w-4 h-4" /> Masuk ke Sistem
            </Link>
          </div>
        </div>
      </nav>

      {/* ══ HERO ════════════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex flex-col overflow-hidden" style={{background:'#080613'}}>
        {/* Background image */}
        <div className="absolute inset-0">
          <img src="/aset-landingpage/gkii.webp" alt="Jemaat GKII Longloreh"
            className="w-full h-full object-cover object-center opacity-30" />
          <div className="absolute inset-0" style={{background:'linear-gradient(to bottom, rgba(8,6,19,0.4) 0%, rgba(8,6,19,0.55) 50%, rgba(8,6,19,0.95) 100%)'}} />
          {/* Radial gold spotlight */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[900px] h-[900px] rounded-full glow-orb pointer-events-none"
            style={{background:'radial-gradient(circle, rgba(201,168,76,0.12) 0%, rgba(201,168,76,0.04) 40%, transparent 70%)'}} />
        </div>

        {/* Floating particles */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(14)].map((_,i) => (
            <div key={i} className="particle" style={{
              left:`${8 + (i * 6.7) % 84}%`,
              bottom:`${10 + (i * 11) % 40}%`,
              animationDelay:`${i * 0.8}s`,
              animationDuration:`${5 + (i % 4)}s`,
              opacity: 0.3 + (i % 3) * 0.15,
              width: i % 3 === 0 ? '2px' : '3px',
              height: i % 3 === 0 ? '2px' : '3px',
            }} />
          ))}
          {/* Floating cross / sacred geometry */}
          <div className="absolute top-1/4 right-16 opacity-[0.06] float-1">
            <div style={{width:'80px',height:'80px',position:'relative'}}>
              <div style={{position:'absolute',left:'50%',top:0,width:'2px',height:'100%',background:'#C9A84C',transform:'translateX(-50%)'}} />
              <div style={{position:'absolute',top:'35%',left:0,width:'100%',height:'2px',background:'#C9A84C'}} />
            </div>
          </div>
          <div className="absolute bottom-1/3 left-12 opacity-[0.04] float-3">
            <div style={{width:'60px',height:'60px',position:'relative'}}>
              <div style={{position:'absolute',left:'50%',top:0,width:'1px',height:'100%',background:'#D4AF37',transform:'translateX(-50%)'}} />
              <div style={{position:'absolute',top:'35%',left:0,width:'100%',height:'1px',background:'#D4AF37'}} />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="relative flex-1 flex flex-col items-center justify-center text-center px-5 pt-28 pb-20">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 mb-7 px-5 py-2 rounded-full section-fade"
            style={{border:'1px solid rgba(201,168,76,0.3)', background:'rgba(201,168,76,0.08)', backdropFilter:'blur(12px)'}}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:'#C9A84C'}} />
            <span className="text-[11px] font-bold tracking-[0.18em] uppercase" style={{color:'rgba(255,248,231,0.85)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Gereja Kemah Injil Indonesia</span>
          </div>

          {/* Main heading */}
          <h1 className="leading-none mb-6 section-fade" style={{animationDelay:'0.1s'}}>
            <span className="block text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight" style={{color:'rgba(255,248,231,0.9)', fontFamily:"Georgia,'Times New Roman',serif"}}>Selamat Datang di</span>
            <span className="block text-6xl sm:text-8xl md:text-9xl font-black italic shimmer-text mt-1"
              style={{fontFamily:"Georgia,'Times New Roman',serif"}}>
              GKII
            </span>
            <span className="block text-3xl sm:text-5xl md:text-6xl font-bold tracking-wide mt-2" style={{color:'rgba(255,248,231,0.85)', fontFamily:"Georgia,'Times New Roman',serif"}}>Long Loreh</span>
          </h1>

          <p className="text-base md:text-lg max-w-md leading-relaxed mb-10 section-fade" style={{color:'rgba(255,248,231,0.55)', animationDelay:'0.2s', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
            Bersama bertumbuh dalam iman, melayani dengan kasih,
            dan bersaksi bagi kemuliaan Tuhan.
          </p>

          <div className="flex flex-wrap gap-4 justify-center section-fade" style={{animationDelay:'0.3s'}}>
            <a href="#jadwal"
              className="inline-flex items-center gap-2.5 font-bold px-8 py-3.5 rounded-full text-sm gold-btn"
              style={{color:'#080613', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
              <Calendar className="w-4 h-4" /> Jadwal Ibadah
            </a>
            <a href="#sejarah"
              className="inline-flex items-center gap-2.5 font-semibold px-8 py-3.5 rounded-full text-sm transition-all active:scale-95"
              style={{background:'rgba(255,248,231,0.07)', border:'1px solid rgba(255,248,231,0.18)', backdropFilter:'blur(8px)', color:'rgba(255,248,231,0.85)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
              Kenali Kami
            </a>
          </div>
        </div>

        <div className="relative flex justify-center pb-8" style={{color:'rgba(201,168,76,0.5)'}}>
          <ChevronDown className="w-5 h-5 animate-bounce" />
        </div>
      </section>

      {/* ══ STATS ════════════════════════════════════════════════════ */}
      <div style={{background:'linear-gradient(180deg, #080613 0%, #0B1026 100%)'}}>
        <GoldDivider />
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-12 md:py-16">
          {/* Total + L/P */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-10 pb-10"
            style={{borderBottom:'1px solid rgba(201,168,76,0.1)'}}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.25em] mb-2" style={{color:'rgba(201,168,76,0.7)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Total Jemaat Keseluruhan</p>
              <div className="flex items-end gap-6">
                <p className="font-black leading-none shimmer-text" style={{fontSize:'clamp(3.5rem,9vw,6rem)', fontFamily:"Georgia,'Times New Roman',serif"}}>
                  {loading ? <span className="inline-block w-28 h-16 rounded-xl animate-pulse align-middle" style={{background:'rgba(201,168,76,0.1)'}} /> : (stats?.total ?? 0)}
                </p>
                {!loading && stats && (
                  <div className="flex gap-3 mb-2">
                    <div className="text-center">
                      <p className="text-xl font-black leading-none" style={{color:'#60a5fa', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{stats.total_laki}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{color:'rgba(96,165,250,0.5)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Laki-Laki</p>
                    </div>
                    <div className="w-px h-8 self-end mb-1" style={{background:'rgba(201,168,76,0.15)'}} />
                    <div className="text-center">
                      <p className="text-xl font-black leading-none" style={{color:'#f472b6', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{stats.total_perempuan}</p>
                      <p className="text-[9px] font-bold uppercase tracking-wider mt-0.5" style={{color:'rgba(244,114,182,0.5)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Perempuan</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <p className="text-sm leading-relaxed max-w-xs" style={{color:'rgba(255,248,231,0.2)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
              Jiwa yang terdaftar dalam komunitas GKII Jemaat Long Loreh dan menjadi bagian dari keluarga rohani kami.
            </p>
          </div>
          {/* 6 seksi */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label:'Sekolah Minggu', key:'sekolah_minggu', lKey:'sm_laki',      pKey:'sm_perempuan',     color:'#34d399', hasLP:true  },
              { label:'Remaja',         key:'remaja',         lKey:'remaja_laki',  pKey:'remaja_perempuan', color:'#a78bfa', hasLP:true  },
              { label:'Pemuda',         key:'pemuda',         lKey:'pemuda_laki',  pKey:'pemuda_perempuan', color:'#60a5fa', hasLP:true  },
              { label:'Perkauan',       key:'perkauan',       lKey:'',             pKey:'',                 color:'#f87171', hasLP:false },
              { label:'Perkaria',       key:'perkaria',       lKey:'',             pKey:'',                 color:'#2dd4bf', hasLP:false },
              { label:'Lansia',         key:'lansia',         lKey:'lansia_laki',  pKey:'lansia_perempuan', color:'#D4AF37', hasLP:true  },
            ].map(({ label, key, lKey, pKey, color, hasLP }) => (
              <div key={key} className="rounded-2xl p-4 group transition-all duration-300 cursor-default"
                style={{
                  background:`rgba(${color.startsWith('#') ? hexToRgb(color) : '201,168,76'}, 0.05)`,
                  border:`1px solid rgba(${color.startsWith('#') ? hexToRgb(color) : '201,168,76'}, 0.18)`,
                }}>
                <p className="text-3xl md:text-4xl font-black leading-none mb-1" style={{color, fontFamily:"Georgia,'Times New Roman',serif"}}>
                  {loading ? <span className="inline-block w-10 h-8 rounded animate-pulse" style={{background:'rgba(255,255,255,0.07)'}} /> : (stats?.[key as keyof Stats] ?? 0)}
                </p>
                <p className="text-[9px] font-bold uppercase tracking-wider leading-tight mb-2" style={{color:'rgba(255,248,231,0.3)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{label}</p>
                {hasLP && !loading && stats && (
                  <div className="flex gap-2 mt-1">
                    <span className="text-[10px] font-semibold" style={{color:'rgba(96,165,250,0.7)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>L {(stats as unknown as Record<string,number>)[lKey] ?? 0}</span>
                    <span className="text-[10px]" style={{color:'rgba(255,255,255,0.12)'}}>/ </span>
                    <span className="text-[10px] font-semibold" style={{color:'rgba(244,114,182,0.7)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>P {(stats as unknown as Record<string,number>)[pKey] ?? 0}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ SEJARAH ════════════════════════════════════════════════ */}
      <GoldDivider />
      <section id="sejarah" className="py-28 overflow-hidden" style={{background:'linear-gradient(160deg, #0B1026 0%, #080613 60%, #0B1026 100%)'}}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Kiri */}
            <div>
              <div className="inline-flex items-center gap-2 mb-6">
                <span className="w-8 h-px" style={{background:'#C9A84C'}} />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{color:'#C9A84C', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Tentang Kami</span>
              </div>
              <h2 className="font-black leading-tight mb-8" style={{fontFamily:"Georgia,'Times New Roman',serif", fontSize:'clamp(2.8rem,6vw,4rem)', color:'#FFF8E7'}}>
                Sejarah<br /><em className="not-italic" style={{color:'#D4AF37'}}>Gereja</em>
              </h2>
              <div className="space-y-4 leading-relaxed text-[15px]" style={{color:'rgba(255,248,231,0.55)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
                <p>
                  GKII Jemaat Long Loreh berdiri sebagai bagian dari gerakan misi Gereja Kemah Injil Indonesia
                  di wilayah Kalimantan. Sejak pertama berdiri, gereja ini menjadi rumah rohani bagi jemaat
                  yang rindu bertumbuh dalam iman dan memperdalam hubungan dengan Tuhan.
                </p>
                <p>
                  Melalui perjalanan panjang yang diwarnai dedikasi para hamba Tuhan, pelayanan gereja
                  terus berkembang — menjangkau keluarga-keluarga, membina generasi muda, dan membangun
                  komunitas yang saling mengasihi di atas dasar Firman Tuhan.
                </p>
              </div>
              {/* Stats kecil */}
              <div className="flex flex-wrap gap-4 mt-10">
                {[
                  { val:'5', label:'Kelompok Doa' },
                  { val:'6', label:'Seksi Pelayanan' },
                  { val:'3+', label:'Ibadah / Minggu' },
                ].map(({ val, label }) => (
                  <div key={label} className="rounded-2xl px-6 py-4 text-center transition-all hover:-translate-y-1 duration-300"
                    style={{border:'1px solid rgba(201,168,76,0.2)', background:'rgba(201,168,76,0.06)'}}>
                    <p className="text-3xl font-black" style={{color:'#D4AF37', fontFamily:"Georgia,'Times New Roman',serif"}}>{val}</p>
                    <p className="text-xs font-semibold mt-0.5" style={{color:'rgba(201,168,76,0.6)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Kanan */}
            <div className="relative pt-6 pb-8 lg:pb-0">
              <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]"
                style={{border:'1px solid rgba(201,168,76,0.15)', boxShadow:'0 32px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(201,168,76,0.08)'}}>
                <img src="/aset-landingpage/gkii.webp" alt="Jemaat GKII Longloreh"
                  className="w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0" style={{background:'linear-gradient(to top, rgba(8,6,19,0.85) 0%, rgba(8,6,19,0.2) 50%, transparent 100%)'}} />
                <div className="absolute bottom-0 left-0 right-0 p-7">
                  <p className="font-bold italic leading-snug" style={{color:'#FFF8E7', fontFamily:"Georgia,'Times New Roman',serif", fontSize:'1.2rem'}}>
                    "Bersama bertumbuh,<br />bersama melayani."
                  </p>
                  <p className="text-xs mt-2 tracking-wider uppercase" style={{color:'rgba(201,168,76,0.6)'}}>— GKII Long Loreh</p>
                </div>
              </div>
              {/* Floating timeline */}
              <div className="absolute -bottom-4 sm:-bottom-4 right-2 sm:right-6 rounded-2xl p-5 w-48"
                style={{
                  background:'rgba(8,6,19,0.95)',
                  border:'1px solid rgba(201,168,76,0.2)',
                  backdropFilter:'blur(20px)',
                  boxShadow:'0 24px 48px rgba(0,0,0,0.6), 0 0 16px rgba(201,168,76,0.06)',
                }}>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{color:'#C9A84C', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Perjalanan Iman</p>
                <div className="relative pl-4 space-y-4" style={{borderLeft:'2px solid rgba(201,168,76,0.3)'}}>
                  {[
                    { label:'Berdiri', sub:'Injil masuk Long Loreh' },
                    { label:'Berkembang', sub:'Jemaat terus bertambah' },
                    { label:'Kini', sub:'Aktif melayani & bersaksi' },
                  ].map(({ label, sub }, i) => (
                    <div key={i} className="relative">
                      <div className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full border-2"
                        style={{background:'#C9A84C', borderColor:'#080613', boxShadow:'0 0 8px rgba(201,168,76,0.5)'}} />
                      <p className="text-xs font-bold" style={{color:'#FFF8E7', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{label}</p>
                      <p className="text-[10px] leading-snug" style={{color:'rgba(255,248,231,0.35)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{sub}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ VISI & MISI ══════════════════════════════════════════════ */}
      <GoldDivider />
      <section id="visi-misi" className="py-28 overflow-hidden" style={{background:'#080613'}}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-8 h-px" style={{background:'rgba(201,168,76,0.5)'}} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{color:'#C9A84C', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Arah & Tujuan</span>
              <span className="w-8 h-px" style={{background:'rgba(201,168,76,0.5)'}} />
            </div>
            <h2 className="font-black" style={{fontFamily:"Georgia,'Times New Roman',serif", fontSize:'clamp(2.5rem,7vw,4.5rem)', color:'#FFF8E7'}}>
              Visi <em className="not-italic" style={{color:'#D4AF37'}}>&</em> Misi
            </h2>
            <p className="mt-3 text-xs font-bold uppercase tracking-[0.2em]" style={{color:'rgba(201,168,76,0.5)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>GKII Long Loreh — 2026</p>
          </div>

          {/* Visi */}
          <div className="relative rounded-3xl overflow-hidden mb-8"
            style={{
              background:'linear-gradient(135deg, rgba(11,16,38,0.95) 0%, rgba(8,6,19,0.98) 100%)',
              border:'1px solid rgba(201,168,76,0.25)',
              boxShadow:'0 32px 80px rgba(0,0,0,0.5), inset 0 1px 0 rgba(201,168,76,0.2), 0 0 60px rgba(201,168,76,0.04)',
            }}>
            <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full pointer-events-none"
              style={{background:'radial-gradient(circle, rgba(201,168,76,0.06) 0%, transparent 70%)'}} />
            <div className="absolute top-0 left-0 right-0 h-px"
              style={{background:'linear-gradient(90deg, transparent, rgba(201,168,76,0.4), transparent)'}} />
            <div className="relative p-8 md:p-14">
              <div className="inline-flex items-center gap-3 mb-7 px-4 py-2 rounded-full"
                style={{background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)'}}>
                <Eye className="w-4 h-4 text-[#D4AF37]" />
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{color:'#D4AF37', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Visi</span>
              </div>
              <blockquote className="font-bold leading-snug max-w-4xl" style={{fontFamily:"Georgia,'Times New Roman',serif", fontSize:'clamp(1.1rem,2.5vw,1.6rem)', color:'#FFF8E7'}}>
                "Menjadi jemaat GKII Long Loreh yang{' '}
                <span className="shimmer-text">BERTUMBUH</span> dewasa di dalam Kristus,{' '}
                <span className="shimmer-text">BERTAMBAH</span> dalam kualitas dan kuantitas pelayanan, serta{' '}
                <span className="shimmer-text">BERDAMPAK</span> nyata bagi keluarga, gereja, dan masyarakat."
              </blockquote>
            </div>
          </div>

          {/* Misi — 3 pilar */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                no:'01', iconColor:'#60a5fa',
                judul:'Bertumbuh', sub:'Spiritualitas & Kedewasaan Iman',
                poin:['Menumbuhkan kerinduan jemaat terhadap ibadah, Firman Tuhan, dan persekutuan.','Membina jemaat agar memiliki iman yang dewasa, setia, dan berakar dalam Kristus.','Menguatkan disiplin rohani: ibadah, doa, pembacaan Firman, dan persekutuan.'],
              },
              {
                no:'02', iconColor:'#a78bfa',
                judul:'Bertambah', sub:'Komitmen & Pelayanan',
                poin:['Menumbuhkan kesadaran jemaat sebagai anggota tubuh Kristus yang bertanggung jawab.','Mendorong keterlibatan aktif jemaat dalam pelayanan sesuai karunia.','Membangun loyalitas jemaat kepada GKII Long Loreh sebagai rumah rohani.'],
              },
              {
                no:'03', iconColor:'#34d399',
                judul:'Berdampak', sub:'Kesaksian & Kehidupan Sosial',
                poin:['Menghadirkan kesaksian hidup Kristen yang nyata di tengah masyarakat.','Menjadi gereja yang peduli, melayani, dan membawa damai sejahtera.'],
              },
            ].map(({ no, iconColor, judul, sub, poin }) => (
              <div key={no} className="group relative rounded-3xl p-7 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 glass-card">
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{background:`rgba(${hexToRgb(iconColor)}, 0.15)`, border:`1px solid rgba(${hexToRgb(iconColor)}, 0.3)`}}>
                    <span className="text-xs font-black tracking-wider" style={{color: iconColor, fontFamily:"'Inter','Segoe UI',sans-serif"}}>{no}</span>
                  </div>
                  <span className="text-6xl font-black opacity-[0.04] leading-none select-none" style={{color:'#FFF8E7', fontFamily:"Georgia,'Times New Roman',serif"}}>{no}</span>
                </div>
                <h3 className="text-xl font-extrabold mb-1" style={{color: iconColor, fontFamily:"Georgia,'Times New Roman',serif"}}>{judul}</h3>
                <p className="text-[11px] font-bold uppercase tracking-wider mb-5" style={{color:'rgba(255,248,231,0.3)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{sub}</p>
                <ul className="space-y-3">
                  {poin.map((p, i) => (
                    <li key={i} className="flex gap-3 text-sm leading-relaxed" style={{color:'rgba(255,248,231,0.5)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
                      <span className="shrink-0 mt-2 w-1.5 h-1.5 rounded-full" style={{background: iconColor}} />
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ NILAI KAMI ════════════════════════════════════════════════ */}
      <GoldDivider />
      <section className="py-24" style={{background:'linear-gradient(180deg, #0B1026 0%, #080613 100%)'}}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-14">
            <div className="inline-flex items-center gap-2 mb-4">
              <span className="w-6 h-px" style={{background:'rgba(201,168,76,0.5)'}} />
              <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{color:'#C9A84C', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Identitas Kami</span>
              <span className="w-6 h-px" style={{background:'rgba(201,168,76,0.5)'}} />
            </div>
            <h2 className="font-black" style={{fontFamily:"Georgia,'Times New Roman',serif", fontSize:'clamp(2rem,5vw,3.5rem)', color:'#FFF8E7'}}>
              Dipanggil, Dibentuk, <em className="not-italic" style={{color:'#D4AF37'}}>Diutus</em>
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title:'Iman yang Teguh',    desc:'Berpusat pada Firman Tuhan dan doa, kami membangun fondasi iman yang kokoh dalam kehidupan sehari-hari.', icon:<Star className="w-6 h-6" />, color:'#D4AF37' },
              { title:'Kasih yang Nyata',   desc:'Kami percaya kasih bukan hanya kata-kata, tetapi tindakan nyata yang menyentuh jiwa dan menjangkau yang terluka.', icon:<Heart className="w-6 h-6" />, color:'#f87171' },
              { title:'Pelayanan Bersama',  desc:'Setiap jemaat adalah pelayan. Bersama kami membangun gereja yang hidup, aktif, dan memberkati komunitas.', icon:<Users className="w-6 h-6" />, color:'#60a5fa' },
            ].map(({ title, desc, icon, color }, i) => (
              <div key={i} className="group relative rounded-3xl p-8 transition-all duration-300 hover:-translate-y-1 glass-card overflow-hidden">
                <div className="absolute bottom-0 left-0 right-0 h-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{background:`linear-gradient(90deg, transparent, ${color}, transparent)`}} />
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
                  style={{background:`rgba(${hexToRgb(color)}, 0.12)`, border:`1px solid rgba(${hexToRgb(color)}, 0.25)`, color}}>
                  {icon}
                </div>
                <h3 className="text-lg font-extrabold mb-3" style={{color:'#FFF8E7', fontFamily:"Georgia,'Times New Roman',serif"}}>{title}</h3>
                <p className="text-sm leading-relaxed" style={{color:'rgba(255,248,231,0.45)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ BPJ ══════════════════════════════════════════════════════ */}
      <GoldDivider />
      <section id="bpj" className="py-28" style={{background:'#080613'}}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-14">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-8 h-px" style={{background:'#C9A84C'}} />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{color:'#C9A84C', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Kepengurusan</span>
              </div>
              <h2 className="font-black leading-tight" style={{fontFamily:"Georgia,'Times New Roman',serif", fontSize:'clamp(2.5rem,6vw,4rem)', color:'#FFF8E7'}}>
                BPJ <em className="not-italic" style={{color:'#D4AF37'}}>Periode</em>
              </h2>
            </div>
            <p className="text-sm max-w-xs leading-relaxed" style={{color:'rgba(255,248,231,0.25)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Badan Pengurus Jemaat yang melayani dengan sepenuh hati dan dedikasi.</p>
          </div>

          {profilLoading ? (
            <div className="flex flex-wrap justify-center gap-5">
              {[...Array(5)].map((_,i) => (
                <div key={i} className="rounded-3xl p-6 flex flex-col items-center gap-3 animate-pulse w-36"
                  style={{background:'rgba(201,168,76,0.04)', border:'1px solid rgba(201,168,76,0.08)'}}>
                  <div className="w-20 h-20 rounded-full" style={{background:'rgba(201,168,76,0.08)'}} />
                  <div className="w-24 h-3 rounded" style={{background:'rgba(201,168,76,0.08)'}} />
                </div>
              ))}
            </div>
          ) : bpj.length === 0 ? (
            <p className="text-center py-16 text-sm" style={{color:'rgba(255,248,231,0.2)'}}>Belum ada data BPJ.</p>
          ) : (() => {
            const roots = buildTree(bpj);
            const hasTree = bpj.some(b => b.parent_id);
            if (!hasTree) {
              return (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5">
                  {bpj.map(b => <BpjCard key={b.id} b={b} />)}
                </div>
              );
            }
            return (
              <div className="space-y-10">
                <div className="flex flex-wrap justify-center gap-5">
                  {roots.map(root => <BpjCard key={root.id} b={root} large />)}
                </div>
                {roots.map(root => {
                  const kids = childrenOf(bpj, root.id);
                  if (!kids.length) return null;
                  return (
                    <div key={root.id} className="relative">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-5" style={{background:'rgba(201,168,76,0.3)'}} />
                      <p className="text-center text-[10px] font-bold uppercase tracking-widest mb-5 pt-6" style={{color:'rgba(201,168,76,0.4)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Di bawah {root.nama.split(' ')[0]}</p>
                      <div className="flex flex-wrap justify-center gap-5">
                        {kids.map(k => <BpjCard key={k.id} b={k} />)}
                      </div>
                      {kids.some(k => childrenOf(bpj, k.id).length > 0) && (
                        <div className="mt-6 flex flex-wrap justify-center gap-4">
                          {kids.flatMap(k => childrenOf(bpj, k.id)).map(gk => <BpjCard key={gk.id} b={gk} small />)}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ══ GEMBALA ══════════════════════════════════════════════════ */}
      <GoldDivider />
      <section id="gembala" className="relative py-28 overflow-hidden" style={{background:'linear-gradient(160deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)'}}>
        {/* Atmospheric orbs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{background:'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)'}} />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 rounded-full"
            style={{background:'radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 70%)'}} />
          <div className="absolute top-1/3 right-0 w-72 h-72 rounded-full"
            style={{background:'radial-gradient(circle, rgba(245,158,11,0.05) 0%, transparent 70%)'}} />
          <div className="absolute top-0 left-0 right-0 h-px" style={{background:'linear-gradient(90deg, transparent, rgba(245,158,11,0.4), transparent)'}} />
        </div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8">
          <div className="text-center mb-20">
            <div className="inline-flex items-center gap-3 mb-5">
              <div className="h-px w-12" style={{background:'linear-gradient(90deg, transparent, rgba(245,158,11,0.6))'}} />
              <span className="text-[10px] font-bold uppercase tracking-[0.35em]" style={{color:'rgba(245,158,11,0.7)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Pemimpin Rohani</span>
              <div className="h-px w-12" style={{background:'linear-gradient(90deg, rgba(245,158,11,0.6), transparent)'}} />
            </div>
            <h2 className="font-black leading-none mb-4" style={{fontFamily:"Georgia,'Times New Roman',serif", fontSize:'clamp(2.5rem,6vw,4rem)', color:'#FFF8E7'}}>
              Gembala <span style={{color:'#f59e0b', fontStyle:'italic'}}>Jemaat</span>
            </h2>
            <p className="text-sm max-w-sm mx-auto leading-relaxed" style={{color:'rgba(148,163,184,0.7)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
              Para gembala yang dipercaya memimpin dan menggembalakan jemaat GKII Long Loreh.
            </p>
          </div>

          {profilLoading ? (
            <div className="space-y-16">
              <div className="flex gap-8 justify-center">
                {[...Array(2)].map((_,i) => (
                  <div key={i} className="rounded-3xl p-10 flex flex-col items-center gap-4 animate-pulse w-64"
                    style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)'}}>
                    <div className="w-36 h-36 rounded-full" style={{background:'rgba(255,255,255,0.1)'}} />
                    <div className="w-36 h-4 rounded" style={{background:'rgba(255,255,255,0.1)'}} />
                  </div>
                ))}
              </div>
            </div>
          ) : gembala.length === 0 ? (
            <p className="text-center py-16 text-sm" style={{color:'rgba(148,163,184,0.4)'}}>Belum ada data gembala.</p>
          ) : (() => {
            const aktif   = gembala.filter(g => g.tipe === 'aktif');
            const senior  = gembala.filter(g => g.tipe === 'senior');
            const mantan  = gembala.filter(g => g.tipe === 'mantan');
            const VISIBLE = 5;
            const maxIdx  = Math.max(0, senior.length - VISIBLE);
            const visibleSenior = senior.slice(seniorIdx, seniorIdx + VISIBLE);
            return (
              <div>
                {aktif.length > 0 && (
                  <div className="mb-20">
                    <div className="flex items-center gap-4 justify-center mb-10">
                      <div className="h-px flex-1 max-w-24" style={{background:'linear-gradient(90deg, transparent, rgba(245,158,11,0.3))'}} />
                      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{border:'1px solid rgba(245,158,11,0.2)', background:'rgba(245,158,11,0.06)'}}>
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{color:'rgba(245,158,11,0.9)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Gembala Aktif</span>
                      </div>
                      <div className="h-px flex-1 max-w-24" style={{background:'linear-gradient(90deg, rgba(245,158,11,0.3), transparent)'}} />
                    </div>
                    <div className="flex flex-wrap justify-center gap-8">
                      {aktif.map(g => (
                        <div key={g.id} className="group relative flex-shrink-0 w-48"
                          style={{filter:'drop-shadow(0 25px 50px rgba(245,158,11,0.12))'}}>
                          <div className="absolute inset-0 rounded-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-0 pointer-events-none"
                            style={{background:'radial-gradient(ellipse at 50% 0%, rgba(245,158,11,0.15), transparent 70%)'}} />
                          <div className="relative rounded-3xl overflow-hidden transition-transform duration-500 group-hover:-translate-y-2"
                            style={{background:'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)', border:'1px solid rgba(255,255,255,0.1)', backdropFilter:'blur(12px)'}}>
                            <div className="absolute top-0 left-6 right-6 h-px rounded-full" style={{background:'linear-gradient(90deg, transparent, rgba(245,158,11,0.5), transparent)'}} />
                            <div className="absolute top-0 left-0 right-0 h-32 pointer-events-none" style={{background:'radial-gradient(ellipse at 50% -20%, rgba(245,158,11,0.1), transparent 70%)'}} />
                            <div className="relative p-6 flex flex-col items-center text-center">
                              <div className="relative mb-7">
                                <div className="absolute inset-0 rounded-full scale-110 blur-md" style={{background:'radial-gradient(circle, rgba(245,158,11,0.35), transparent 70%)'}} />
                                <div className="relative rounded-full" style={{background:'linear-gradient(135deg, #f59e0b, #92400e, #f59e0b)', padding:'3px'}}>
                                  <div className="rounded-full overflow-hidden" style={{background:'#0f172a'}}>
                                    <Avatar fotoUrl={g.foto_url} nama={g.nama} size={96} gold />
                                  </div>
                                </div>
                              </div>
                              <p className="font-bold text-xl leading-snug mb-3" style={{color:'#FFF8E7', fontFamily:"Georgia,'Times New Roman',serif"}}>{g.nama}</p>
                              <div className="flex items-center gap-2 mb-4">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                                <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider" style={{fontFamily:"'Inter','Segoe UI',sans-serif"}}>Aktif Melayani</span>
                              </div>
                              <div className="w-full h-px mb-4" style={{background:'rgba(255,255,255,0.06)'}} />
                              <p className="text-xs tracking-wide" style={{color:'rgba(148,163,184,0.5)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{g.tahun_mulai} — Sekarang</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {senior.length > 0 && (
                  <div className="mb-16">
                    <div className="flex items-center gap-4 justify-center mb-10">
                      <div className="h-px flex-1 max-w-24" style={{background:'linear-gradient(90deg, transparent, rgba(148,163,184,0.2))'}} />
                      <div className="flex items-center gap-2 px-4 py-1.5 rounded-full" style={{border:'1px solid rgba(148,163,184,0.15)', background:'rgba(148,163,184,0.05)'}}>
                        <span className="text-[10px] font-bold uppercase tracking-[0.25em]" style={{color:'rgba(148,163,184,0.8)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Senior Pastor</span>
                      </div>
                      <div className="h-px flex-1 max-w-24" style={{background:'linear-gradient(90deg, rgba(148,163,184,0.2), transparent)'}} />
                    </div>
                    <div className="flex items-center gap-4 justify-center">
                      <button disabled={seniorIdx === 0} onClick={() => setSeniorIdx(i => Math.max(0, i - 1))}
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed"
                        style={{border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)'}}>
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <div className="flex gap-5 overflow-hidden">
                        {visibleSenior.map(g => (
                          <div key={g.id} className="group flex flex-col items-center text-center flex-shrink-0 w-28 hover:-translate-y-1 transition-transform duration-200">
                            <div className="relative mb-4">
                              <div className="rounded-full overflow-hidden" style={{padding:'2px', background:'linear-gradient(135deg, rgba(148,163,184,0.4), rgba(100,116,139,0.15), rgba(148,163,184,0.4))'}}>
                                <div className="rounded-full overflow-hidden" style={{background:'#1e293b'}}>
                                  <Avatar fotoUrl={g.foto_url} nama={g.nama} size={76} />
                                </div>
                              </div>
                            </div>
                            <p className="text-xs font-semibold leading-snug mb-1" style={{color:'rgba(203,213,225,0.8)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{g.nama}</p>
                            <p className="text-[10px]" style={{color:'rgba(148,163,184,0.45)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{g.tahun_mulai}{g.tahun_selesai ? `–${g.tahun_selesai}` : ''}</p>
                          </div>
                        ))}
                      </div>
                      <button disabled={seniorIdx >= maxIdx} onClick={() => setSeniorIdx(i => Math.min(maxIdx, i + 1))}
                        className="flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-20 disabled:cursor-not-allowed"
                        style={{border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.5)'}}>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                    {senior.length > VISIBLE && (
                      <div className="flex justify-center gap-1.5 mt-6">
                        {Array.from({ length: maxIdx + 1 }).map((_, i) => (
                          <button key={i} onClick={() => setSeniorIdx(i)}
                            className="h-1.5 rounded-full transition-all duration-300"
                            style={{width: i === seniorIdx ? '24px' : '6px', background: i === seniorIdx ? '#f59e0b' : 'rgba(255,255,255,0.15)'}} />
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {mantan.length > 0 && (
                  <div className="pt-10" style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                    <p className="text-center text-[10px] font-bold uppercase tracking-[0.3em] mb-8" style={{color:'rgba(100,116,139,0.6)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
                      Gembala Terdahulu
                    </p>
                    <div className="flex flex-wrap justify-center gap-6">
                      {mantan.map(g => (
                        <div key={g.id} className="flex flex-col items-center text-center w-28 opacity-60 hover:opacity-90 transition-opacity duration-200">
                          <div className="mb-3 rounded-full overflow-hidden grayscale" style={{border:'1px solid rgba(255,255,255,0.1)'}}>
                            <Avatar fotoUrl={g.foto_url} nama={g.nama} size={72} />
                          </div>
                          <p className="text-xs font-semibold leading-snug" style={{color:'rgba(203,213,225,0.7)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{g.nama}</p>
                          <p className="text-[10px] mt-0.5" style={{color:'rgba(148,163,184,0.4)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{g.tahun_mulai}–{g.tahun_selesai}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </section>

      {/* ══ KEGIATAN GEREJA ══════════════════════════════════════════ */}
      <GoldDivider />
      <section id="jadwal" className="py-28" style={{background:'linear-gradient(180deg, #0B1026 0%, #080613 100%)'}}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
            <div>
              <div className="inline-flex items-center gap-2 mb-4">
                <span className="w-8 h-px" style={{background:'#C9A84C'}} />
                <span className="text-[11px] font-bold uppercase tracking-[0.2em]" style={{color:'#C9A84C', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Gereja</span>
              </div>
              <h2 className="font-black leading-tight" style={{fontFamily:"Georgia,'Times New Roman',serif", fontSize:'clamp(2.5rem,6vw,4rem)', color:'#FFF8E7'}}>
                Kegiatan <em className="not-italic" style={{color:'#D4AF37'}}>Gereja</em>
              </h2>
            </div>
            <p className="text-sm max-w-xs leading-relaxed" style={{color:'rgba(255,248,231,0.25)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Jadwal, informasi, program, dan galeri kegiatan jemaat GKII Long Loreh.</p>
          </div>

          {/* Tab bar */}
          <div className="flex gap-1 rounded-2xl p-1.5 mb-10 w-full max-w-lg" style={{background:'rgba(201,168,76,0.06)', border:'1px solid rgba(201,168,76,0.12)'}}>
            {([
              { key:'jadwal',  label:'Jadwal Ibadah' },
              { key:'info',    label:'Info' },
              { key:'program', label:'Program' },
              { key:'galeri',  label:'Galeri' },
            ] as const).map(({ key, label }) => (
              <button key={key} onClick={() => setKegiatanTab(key)}
                className="flex-1 rounded-xl py-2.5 text-xs font-bold transition-all duration-200"
                style={{
                  fontFamily:"'Inter','Segoe UI',sans-serif",
                  background: kegiatanTab === key ? 'linear-gradient(135deg, #C9A84C, #D4AF37)' : 'transparent',
                  color: kegiatanTab === key ? '#080613' : 'rgba(255,248,231,0.35)',
                  boxShadow: kegiatanTab === key ? '0 4px 16px rgba(201,168,76,0.3)' : 'none',
                }}>
                {label}
              </button>
            ))}
          </div>

          {/* ── Tab: Jadwal Ibadah ──────────────────────────────────── */}
          {kegiatanTab === 'jadwal' && (
            loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_,i) => <div key={i} className="rounded-2xl h-40 animate-pulse" style={{background:'rgba(201,168,76,0.05)'}} />)}
              </div>
            ) : sortedJadwal.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center gap-3" style={{color:'rgba(255,248,231,0.2)'}}>
                <Calendar className="w-8 h-8" />
                <p className="text-sm" style={{fontFamily:"'Inter','Segoe UI',sans-serif"}}>Belum ada jadwal ibadah.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedJadwal.map(j => (
                  <div key={j.id} className="group rounded-2xl p-6 transition-all duration-300 overflow-hidden relative glass-card hover:-translate-y-1">
                    <div className="absolute top-0 left-0 right-0 h-px" style={{background:'linear-gradient(90deg, transparent, rgba(201,168,76,0.15), transparent)'}} />
                    <div className="flex items-center justify-between mb-5">
                      <span className={`inline-block border rounded-full px-3 py-1 text-xs font-bold ${HARI_ACCENT[j.hari] ?? 'border-white/10 bg-white/5 text-white/50'}`}
                        style={{fontFamily:"'Inter','Segoe UI',sans-serif"}}>{j.hari}</span>
                      <span className={`text-2xl font-black ${HARI_COLOR[j.hari] ?? ''}`}
                        style={{fontFamily:"Georgia,'Times New Roman',serif"}}>{j.jam}</span>
                    </div>
                    <h3 className="font-bold text-base leading-snug mb-3" style={{color:'#FFF8E7', fontFamily:"Georgia,'Times New Roman',serif"}}>{j.nama}</h3>
                    {j.lokasi && (
                      <div className="flex items-center gap-2 text-xs" style={{color:'rgba(255,248,231,0.3)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
                        <MapPin className="w-4 h-4 shrink-0" /><span>{j.lokasi}</span>
                      </div>
                    )}
                    {j.keterangan && <p className="text-xs mt-1.5 italic" style={{color:'rgba(255,248,231,0.2)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{j.keterangan}</p>}
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Tab: Info (Pengumuman) ──────────────────────────────── */}
          {kegiatanTab === 'info' && (
            loading ? (
              <div className="space-y-4 max-w-3xl">
                {[...Array(2)].map((_,i) => <div key={i} className="rounded-2xl h-28 animate-pulse" style={{background:'rgba(201,168,76,0.05)'}} />)}
              </div>
            ) : pengumuman.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center gap-3" style={{color:'rgba(255,248,231,0.2)'}}>
                <Megaphone className="w-8 h-8" />
                <p className="text-sm" style={{fontFamily:"'Inter','Segoe UI',sans-serif"}}>Belum ada pengumuman.</p>
              </div>
            ) : (
              <div className="space-y-4 max-w-3xl">
                {pengumuman.map((p, idx) => (
                  <div key={p.id}
                    className="group relative rounded-2xl p-7 transition-all duration-300 overflow-hidden glass-card hover:border-[rgba(201,168,76,0.25)]">
                    <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-2xl" style={{background:'linear-gradient(180deg, #C9A84C, #D4AF37)'}} />
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <span className="text-xs font-bold px-3 py-1 rounded-full" style={{color:'#D4AF37', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.2)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{formatTgl(p.tanggal_mulai)}</span>
                      {p.tanggal_selesai && <span className="text-xs" style={{color:'rgba(255,248,231,0.25)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>s.d. {formatTgl(p.tanggal_selesai)}</span>}
                      <span className="ml-auto text-xs font-black select-none" style={{color:'rgba(255,248,231,0.1)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>#{idx+1}</span>
                    </div>
                    <h3 className="font-bold text-base leading-snug mb-2" style={{color:'#FFF8E7', fontFamily:"Georgia,'Times New Roman',serif"}}>{p.judul}</h3>
                    <p className="text-sm leading-relaxed whitespace-pre-line" style={{color:'rgba(255,248,231,0.45)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{p.isi}</p>
                  </div>
                ))}
              </div>
            )
          )}

          {/* ── Tab: Program ───────────────────────────────────────── */}
          {kegiatanTab === 'program' && (
            loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(3)].map((_,i) => <div key={i} className="rounded-2xl h-36 animate-pulse" style={{background:'rgba(201,168,76,0.05)'}} />)}
              </div>
            ) : program.length === 0 ? (
              <div className="text-center py-16 flex flex-col items-center gap-3" style={{color:'rgba(255,248,231,0.2)'}}>
                <CalendarDays className="w-10 h-10" />
                <p className="text-sm" style={{fontFamily:"'Inter','Segoe UI',sans-serif"}}>Belum ada program kegiatan.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {program.map(pg => {
                  const sudahSelesai = pg.tanggal_selesai && new Date(pg.tanggal_selesai) < new Date();
                  return (
                    <div key={pg.id} className={`group relative rounded-2xl p-6 transition-all duration-300 overflow-hidden ${sudahSelesai ? '' : 'glass-card hover:-translate-y-1'}`}
                      style={sudahSelesai ? {background:'rgba(201,168,76,0.02)', border:'1px solid rgba(201,168,76,0.06)', opacity:0.6, borderRadius:'1rem'} : {}}>
                      <div className="absolute top-0 left-0 right-0 h-px" style={{background:'linear-gradient(90deg, transparent, rgba(201,168,76,0.2), transparent)'}} />
                      {pg.kategori && (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full mb-3" style={{color:'rgba(201,168,76,0.8)', background:'rgba(201,168,76,0.1)', border:'1px solid rgba(201,168,76,0.15)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
                          {pg.kategori}
                        </span>
                      )}
                      <h3 className="font-bold text-base leading-snug mb-3" style={{color:'#FFF8E7', fontFamily:"Georgia,'Times New Roman',serif"}}>{pg.judul}</h3>
                      {pg.deskripsi && <p className="text-sm leading-relaxed mb-4 line-clamp-2" style={{color:'rgba(255,248,231,0.35)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>{pg.deskripsi}</p>}
                      <div className="flex flex-col gap-1.5 mt-auto">
                        <div className="flex items-center gap-2 text-xs" style={{color:'rgba(255,248,231,0.35)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>{formatTgl(pg.tanggal_mulai)}{pg.tanggal_selesai ? ` — ${formatTgl(pg.tanggal_selesai)}` : ''}</span>
                        </div>
                        {pg.lokasi && (
                          <div className="flex items-center gap-2 text-xs" style={{color:'rgba(255,248,231,0.35)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
                            <MapPin className="w-3.5 h-3.5 shrink-0" /><span>{pg.lokasi}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* ── Tab: Galeri ────────────────────────────────────────── */}
          {kegiatanTab === 'galeri' && (
            galeri.length > 0 ? (
              <DomeGallery
                images={galeri.map(g => ({ src: g.foto_url, alt: g.judul ?? '' }))}
                overlayBlurColor="#080613"
              />
            ) : (
              <div className="flex flex-col items-center justify-center py-24" style={{color:'rgba(255,248,231,0.1)'}}>
                <ImageIcon className="w-16 h-16 mb-4" />
                <p className="text-sm" style={{fontFamily:"'Inter','Segoe UI',sans-serif"}}>Belum ada foto di galeri</p>
              </div>
            )
          )}
        </div>
      </section>

      {/* ══ CTA ══════════════════════════════════════════════════════ */}
      <GoldDivider />
      <section className="relative overflow-hidden py-32" style={{background:'#080613'}}>
        <div className="absolute inset-0">
          <img src="/aset-landingpage/gkii.webp" alt="" className="w-full h-full object-cover object-top opacity-20" />
          <div className="absolute inset-0" style={{background:'linear-gradient(135deg, rgba(8,6,19,0.95) 0%, rgba(11,16,38,0.9) 50%, rgba(8,6,19,0.95) 100%)'}} />
          {/* Gold spotlight center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full pointer-events-none"
            style={{background:'radial-gradient(circle, rgba(201,168,76,0.08) 0%, transparent 65%)'}} />
        </div>
        <div className="absolute top-0 left-0 right-0 h-px" style={{background:'linear-gradient(90deg, transparent, rgba(201,168,76,0.3), transparent)'}} />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 mb-8 px-4 py-2 rounded-full" style={{border:'1px solid rgba(201,168,76,0.2)', background:'rgba(201,168,76,0.07)', backdropFilter:'blur(12px)'}}>
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{background:'#C9A84C'}} />
            <span className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{color:'rgba(201,168,76,0.8)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Bergabunglah Bersama Kami</span>
          </div>
          <h2 className="font-black leading-tight mb-8 drop-shadow-2xl" style={{fontFamily:"Georgia,'Times New Roman',serif", fontSize:'clamp(2.5rem,7vw,5rem)', color:'#FFF8E7'}}>
            Kami Menantikan<br /><em className="not-italic shimmer-text">Kehadiranmu</em>
          </h2>
          <p className="text-lg mb-12 max-w-lg mx-auto leading-relaxed" style={{color:'rgba(255,248,231,0.45)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
            Temukan keluarga rohani di GKII Longloreh. Setiap jiwa berharga bagi Tuhan dan bagi kami.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-5">
            <a href="#jadwal"
              className="inline-flex items-center gap-3 font-bold px-9 py-4 rounded-full text-sm gold-btn"
              style={{color:'#080613', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
              <Calendar className="w-4 h-4" /> Lihat Jadwal Ibadah
            </a>
            <Link to="/login"
              className="inline-flex items-center gap-3 font-semibold px-9 py-4 rounded-full text-sm transition-all active:scale-95"
              style={{background:'rgba(255,248,231,0.07)', border:'1px solid rgba(255,248,231,0.15)', backdropFilter:'blur(8px)', color:'rgba(255,248,231,0.8)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
              <LogIn className="w-4 h-4" /> Masuk ke Sistem
            </Link>
          </div>
        </div>
      </section>

      {/* ══ FOOTER ════════════════════════════════════════════════════ */}
      <footer style={{background:'#04030d', borderTop:'1px solid rgba(201,168,76,0.1)'}}>
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-3 mb-5">
                <img src="/images/logo/logo-icon.svg" alt="Logo" className="w-9 h-9 opacity-60" />
                <div>
                  <p className="font-bold text-sm tracking-wide" style={{color:'#FFF8E7'}}>GKII Longloreh</p>
                  <p className="text-[10px] uppercase tracking-widest" style={{color:'rgba(201,168,76,0.5)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Gereja Kemah Injil Indonesia</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed" style={{color:'rgba(255,248,231,0.2)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
                Bersama bertumbuh dalam iman, melayani dengan kasih, dan bersaksi bagi kemuliaan Tuhan.
              </p>
            </div>
            {/* Navigasi */}
            <div>
              <p className="font-bold text-xs uppercase tracking-widest mb-5" style={{color:'rgba(255,248,231,0.4)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Navigasi</p>
              <ul className="grid grid-cols-2 gap-2">
                {[['#sejarah','Sejarah'],['#visi-misi','Visi & Misi'],['#bpj','BPJ Periode'],['#gembala','Gembala'],['#jadwal','Jadwal Ibadah'],['#pengumuman','Pengumuman'],['#galeri','Galeri']].map(([href,label])=>(
                  <li key={href}>
                    <a href={href} className="text-sm transition-colors flex items-center gap-2"
                      style={{color:'rgba(255,248,231,0.25)', fontFamily:"'Inter','Segoe UI',sans-serif"}}
                      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color='#D4AF37'}
                      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color='rgba(255,248,231,0.25)'}>
                      <span className="w-1 h-1 rounded-full" style={{background:'rgba(201,168,76,0.4)'}} />{label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            {/* Sistem */}
            <div>
              <p className="font-bold text-xs uppercase tracking-widest mb-5" style={{color:'rgba(255,248,231,0.4)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>Sistem Informasi</p>
              <p className="text-sm leading-relaxed mb-5" style={{color:'rgba(255,248,231,0.2)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
                Kelola data jemaat, keuangan, dan konten gereja melalui sistem informasi kami.
              </p>
              <Link to="/login"
                className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition-colors"
                style={{background:'rgba(201,168,76,0.08)', border:'1px solid rgba(201,168,76,0.2)', color:'#C9A84C', fontFamily:"'Inter','Segoe UI',sans-serif"}}>
                <LogIn className="w-4 h-4" /> Masuk ke Sistem
              </Link>
            </div>
          </div>
          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-3" style={{borderTop:'1px solid rgba(201,168,76,0.06)'}}>
            <p className="text-xs" style={{color:'rgba(255,248,231,0.15)', fontFamily:"'Inter','Segoe UI',sans-serif"}}>© {new Date().getFullYear()} GKII Jemaat Long Loreh. Sistem Informasi Jemaat.</p>
            <p className="text-xs" style={{color:'rgba(201,168,76,0.25)', fontFamily:"Georgia,'Times New Roman',serif", fontStyle:'italic'}}>Soli Deo Gloria</p>
          </div>
        </div>
      </footer>

    </div>
  );
}

// Utility: convert hex color to "r,g,b" string for rgba()
function hexToRgb(hex: string): string {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `${r},${g},${b}`;
}
