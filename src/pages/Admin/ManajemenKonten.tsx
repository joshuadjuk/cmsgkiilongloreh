import { useEffect, useRef, useState, FormEvent, ChangeEvent } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useAuth } from '../../context/AuthContext';

const KONTEN_URL = 'https://gereja.eternity.my.id/api-gkii/konten.php';
const PROFIL_URL = 'https://gereja.eternity.my.id/api-gkii/profil.php';
const HARI_LIST  = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

/* ── Types ─────────────────────────────────────────────────── */
interface Jadwal     { id:number; nama:string; hari:string; jam:string; lokasi:string|null; keterangan:string|null; urutan:number; is_active:number; }
interface Pengumuman { id:number; judul:string; isi:string; tanggal_mulai:string; tanggal_selesai:string|null; is_active:number; }
interface BPJ        { id:number; nama:string; jabatan:string|null; foto_url:string|null; foto:string|null; periode:string|null; urutan:number; is_active:number; }
interface Gembala    { id:number; nama:string; foto_url:string|null; foto:string|null; tahun_mulai:string; tahun_selesai:string|null; urutan:number; }

type TabType = 'jadwal' | 'pengumuman' | 'bpj' | 'gembala';

/* ── Reusable small components ─────────────────────────────── */
const IcoPlus   = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" /></svg>;
const IcoEdit   = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" /></svg>;
const IcoTrash  = () => <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" /></svg>;
const IcoClose  = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>;
const IcoCamera = () => <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}><path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" /><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" /></svg>;

function StatusBadge({ active }: { active:number }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
      {active ? 'Aktif' : 'Nonaktif'}
    </span>
  );
}

const AVATAR_COLORS = ['from-blue-400 to-blue-600','from-emerald-400 to-emerald-600','from-violet-400 to-violet-600','from-rose-400 to-rose-600','from-amber-400 to-amber-600','from-teal-400 to-teal-600'];
function avatarGradient(name:string) { return AVATAR_COLORS[(name||'A').charCodeAt(0) % AVATAR_COLORS.length]; }
function initials(name:string)       { return (name||'?').split(' ').slice(0,2).map(n=>n[0]).join('').toUpperCase(); }

/* ── Photo Upload Avatar ──────────────────────────────────── */
function PhotoUploadCircle({
  currentUrl, previewUrl, name, size = 80, onFileChange, onRemove
}: {
  currentUrl?: string|null; previewUrl?: string|null; name: string;
  size?: number; onFileChange: (e: ChangeEvent<HTMLInputElement>) => void; onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const displayUrl = previewUrl || currentUrl;
  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative group cursor-pointer" onClick={() => inputRef.current?.click()}>
        {displayUrl ? (
          <img src={displayUrl} alt={name} style={{ width: size, height: size }}
            className="rounded-full object-cover ring-4 ring-white shadow-md" />
        ) : (
          <div style={{ width: size, height: size, fontSize: size * 0.3 }}
            className={`rounded-full bg-gradient-to-br ${avatarGradient(name || 'A')} ring-4 ring-white shadow-md flex items-center justify-center text-white font-extrabold`}>
            {initials(name)}
          </div>
        )}
        {/* overlay */}
        <div style={{ width: size, height: size }}
          className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white">
          <IcoCamera />
        </div>
      </div>
      <p className="text-xs text-gray-400">Klik untuk ganti foto</p>
      {displayUrl && (
        <button type="button" onClick={onRemove}
          className="text-xs text-red-500 hover:text-red-600 underline transition-colors">
          Hapus foto
        </button>
      )}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={onFileChange} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN PAGE
   ══════════════════════════════════════════════════════════════ */
export default function ManajemenKonten() {
  const { token } = useAuth();
  const [tab, setTab] = useState<TabType>('jadwal');

  const authHeader = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { 'Content-Type': 'application/json', ...authHeader };

  /* ── Jadwal ───────────────────────────────────────────── */
  const [jadwalList,    setJadwalList]    = useState<Jadwal[]>([]);
  const [jadwalLoading, setJadwalLoading] = useState(true);
  const [jadwalModal,   setJadwalModal]   = useState<'add'|'edit'|null>(null);
  const [jadwalForm,    setJadwalForm]    = useState({ nama:'', hari:'Minggu', jam:'', lokasi:'', keterangan:'', urutan:0, is_active:1 });
  const [jadwalEditId,  setJadwalEditId]  = useState<number|null>(null);
  const [jadwalError,   setJadwalError]   = useState('');
  const [jadwalSaving,  setJadwalSaving]  = useState(false);

  /* ── Pengumuman ───────────────────────────────────────── */
  const [pengList,    setPengList]    = useState<Pengumuman[]>([]);
  const [pengLoading, setPengLoading] = useState(true);
  const [pengModal,   setPengModal]   = useState<'add'|'edit'|null>(null);
  const [pengForm,    setPengForm]    = useState({ judul:'', isi:'', tanggal_mulai: new Date().toISOString().split('T')[0], tanggal_selesai:'', is_active:1 });
  const [pengEditId,  setPengEditId]  = useState<number|null>(null);
  const [pengError,   setPengError]   = useState('');
  const [pengSaving,  setPengSaving]  = useState(false);

  /* ── BPJ ──────────────────────────────────────────────── */
  const [bpjList,    setBpjList]    = useState<BPJ[]>([]);
  const [bpjLoading, setBpjLoading] = useState(true);
  const [bpjModal,   setBpjModal]   = useState<'add'|'edit'|null>(null);
  const [bpjForm,    setBpjForm]    = useState({ nama:'', jabatan:'', periode:'', urutan:0, is_active:1 });
  const [bpjEditId,  setBpjEditId]  = useState<number|null>(null);
  const [bpjError,   setBpjError]   = useState('');
  const [bpjSaving,  setBpjSaving]  = useState(false);
  const [bpjCurrentFoto, setBpjCurrentFoto] = useState<string|null>(null);
  const [bpjNewFile,     setBpjNewFile]     = useState<File|null>(null);
  const [bpjPreview,     setBpjPreview]     = useState<string|null>(null);
  const [bpjHapusFoto,   setBpjHapusFoto]   = useState(false);

  /* ── Gembala ──────────────────────────────────────────── */
  const [gemList,    setGemList]    = useState<Gembala[]>([]);
  const [gemLoading, setGemLoading] = useState(true);
  const [gemModal,   setGemModal]   = useState<'add'|'edit'|null>(null);
  const [gemForm,    setGemForm]    = useState({ nama:'', tahun_mulai:'', tahun_selesai:'', urutan:0 });
  const [gemEditId,  setGemEditId]  = useState<number|null>(null);
  const [gemError,   setGemError]   = useState('');
  const [gemSaving,  setGemSaving]  = useState(false);
  const [gemCurrentFoto, setGemCurrentFoto] = useState<string|null>(null);
  const [gemNewFile,     setGemNewFile]     = useState<File|null>(null);
  const [gemPreview,     setGemPreview]     = useState<string|null>(null);
  const [gemHapusFoto,   setGemHapusFoto]   = useState(false);

  /* ── Fetch ──────────────────────────────────────────────── */
  const fetchJadwal = async () => {
    setJadwalLoading(true);
    const res = await fetch(`${KONTEN_URL}?resource=jadwal`, { headers: authHeader });
    const d = await res.json();
    if (d.status === 'success') setJadwalList(d.data);
    setJadwalLoading(false);
  };
  const fetchPeng = async () => {
    setPengLoading(true);
    const res = await fetch(`${KONTEN_URL}?resource=pengumuman`, { headers: authHeader });
    const d = await res.json();
    if (d.status === 'success') setPengList(d.data);
    setPengLoading(false);
  };
  const fetchBpj = async () => {
    setBpjLoading(true);
    const res = await fetch(`${PROFIL_URL}?resource=bpj`, { headers: authHeader });
    const d = await res.json();
    if (d.status === 'success') setBpjList(d.data);
    setBpjLoading(false);
  };
  const fetchGem = async () => {
    setGemLoading(true);
    const res = await fetch(`${PROFIL_URL}?resource=gembala`, { headers: authHeader });
    const d = await res.json();
    if (d.status === 'success') setGemList(d.data);
    setGemLoading(false);
  };

  useEffect(() => { fetchJadwal(); fetchPeng(); fetchBpj(); fetchGem(); }, []);

  /* ── Jadwal CRUD ────────────────────────────────────────── */
  const openJadwalAdd = () => { setJadwalForm({ nama:'', hari:'Minggu', jam:'', lokasi:'', keterangan:'', urutan:0, is_active:1 }); setJadwalEditId(null); setJadwalError(''); setJadwalModal('add'); };
  const openJadwalEdit = (j:Jadwal) => { setJadwalForm({ nama:j.nama, hari:j.hari, jam:j.jam, lokasi:j.lokasi??'', keterangan:j.keterangan??'', urutan:j.urutan, is_active:j.is_active }); setJadwalEditId(j.id); setJadwalError(''); setJadwalModal('edit'); };
  const handleJadwalSubmit = async (e:FormEvent) => {
    e.preventDefault(); setJadwalError(''); setJadwalSaving(true);
    try {
      const body = { ...jadwalForm, lokasi: jadwalForm.lokasi||null, keterangan: jadwalForm.keterangan||null };
      const url  = jadwalModal==='edit' ? `${KONTEN_URL}?resource=jadwal&id=${jadwalEditId}` : `${KONTEN_URL}?resource=jadwal`;
      const res  = await fetch(url, { method: jadwalModal==='edit'?'PUT':'POST', headers: jsonHeaders, body: JSON.stringify(body) });
      const d = await res.json();
      if (!res.ok || d.status!=='success') throw new Error(d.message);
      setJadwalModal(null); fetchJadwal();
    } catch(err) { setJadwalError(err instanceof Error ? err.message : 'Gagal menyimpan.'); }
    finally { setJadwalSaving(false); }
  };
  const handleJadwalDelete = async (id:number) => {
    if (!confirm('Hapus jadwal ini?')) return;
    const res = await fetch(`${KONTEN_URL}?resource=jadwal&id=${id}`, { method:'DELETE', headers: authHeader });
    const d = await res.json();
    if (d.status==='success') fetchJadwal(); else alert(d.message);
  };

  /* ── Pengumuman CRUD ────────────────────────────────────── */
  const openPengAdd = () => { setPengForm({ judul:'', isi:'', tanggal_mulai: new Date().toISOString().split('T')[0], tanggal_selesai:'', is_active:1 }); setPengEditId(null); setPengError(''); setPengModal('add'); };
  const openPengEdit = (p:Pengumuman) => { setPengForm({ judul:p.judul, isi:p.isi, tanggal_mulai:p.tanggal_mulai, tanggal_selesai:p.tanggal_selesai??'', is_active:p.is_active }); setPengEditId(p.id); setPengError(''); setPengModal('edit'); };
  const handlePengSubmit = async (e:FormEvent) => {
    e.preventDefault(); setPengError(''); setPengSaving(true);
    try {
      const body = { ...pengForm, tanggal_selesai: pengForm.tanggal_selesai||null };
      const url  = pengModal==='edit' ? `${KONTEN_URL}?resource=pengumuman&id=${pengEditId}` : `${KONTEN_URL}?resource=pengumuman`;
      const res  = await fetch(url, { method: pengModal==='edit'?'PUT':'POST', headers: jsonHeaders, body: JSON.stringify(body) });
      const d = await res.json();
      if (!res.ok || d.status!=='success') throw new Error(d.message);
      setPengModal(null); fetchPeng();
    } catch(err) { setPengError(err instanceof Error ? err.message : 'Gagal menyimpan.'); }
    finally { setPengSaving(false); }
  };
  const handlePengDelete = async (id:number) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    const res = await fetch(`${KONTEN_URL}?resource=pengumuman&id=${id}`, { method:'DELETE', headers: authHeader });
    const d = await res.json();
    if (d.status==='success') fetchPeng(); else alert(d.message);
  };

  /* ── BPJ CRUD ───────────────────────────────────────────── */
  const openBpjAdd = () => {
    setBpjForm({ nama:'', jabatan:'', periode:'', urutan:0, is_active:1 });
    setBpjEditId(null); setBpjError('');
    setBpjCurrentFoto(null); setBpjNewFile(null); setBpjPreview(null); setBpjHapusFoto(false);
    setBpjModal('add');
  };
  const openBpjEdit = (b:BPJ) => {
    setBpjForm({ nama:b.nama, jabatan:b.jabatan??'', periode:b.periode??'', urutan:b.urutan, is_active:b.is_active });
    setBpjEditId(b.id); setBpjError('');
    setBpjCurrentFoto(b.foto_url); setBpjNewFile(null); setBpjPreview(null); setBpjHapusFoto(false);
    setBpjModal('edit');
  };
  const onBpjFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBpjNewFile(file);
    setBpjPreview(URL.createObjectURL(file));
    setBpjHapusFoto(false);
  };
  const onBpjRemoveFoto = () => {
    setBpjNewFile(null); setBpjPreview(null); setBpjHapusFoto(true); setBpjCurrentFoto(null);
  };
  const handleBpjSubmit = async (e:FormEvent) => {
    e.preventDefault(); setBpjError(''); setBpjSaving(true);
    try {
      const fd = new FormData();
      fd.append('nama',      bpjForm.nama);
      fd.append('jabatan',   bpjForm.jabatan);
      fd.append('periode',   bpjForm.periode);
      fd.append('urutan',    String(bpjForm.urutan));
      fd.append('is_active', String(bpjForm.is_active));
      if (bpjNewFile)   fd.append('foto', bpjNewFile);
      if (bpjHapusFoto) fd.append('hapus_foto', '1');

      const url = bpjModal==='edit'
        ? `${PROFIL_URL}?resource=bpj&id=${bpjEditId}`
        : `${PROFIL_URL}?resource=bpj`;
      const res = await fetch(url, { method:'POST', headers: authHeader, body: fd });
      const d = await res.json();
      if (!res.ok || d.status!=='success') throw new Error(d.message);
      setBpjModal(null); fetchBpj();
    } catch(err) { setBpjError(err instanceof Error ? err.message : 'Gagal menyimpan.'); }
    finally { setBpjSaving(false); }
  };
  const handleBpjDelete = async (id:number) => {
    if (!confirm('Hapus anggota BPJ ini?')) return;
    const res = await fetch(`${PROFIL_URL}?resource=bpj&id=${id}`, { method:'DELETE', headers: authHeader });
    const d = await res.json();
    if (d.status==='success') fetchBpj(); else alert(d.message);
  };

  /* ── Gembala CRUD ───────────────────────────────────────── */
  const openGemAdd = () => {
    setGemForm({ nama:'', tahun_mulai:'', tahun_selesai:'', urutan:0 });
    setGemEditId(null); setGemError('');
    setGemCurrentFoto(null); setGemNewFile(null); setGemPreview(null); setGemHapusFoto(false);
    setGemModal('add');
  };
  const openGemEdit = (g:Gembala) => {
    setGemForm({ nama:g.nama, tahun_mulai:g.tahun_mulai, tahun_selesai:g.tahun_selesai??'', urutan:g.urutan });
    setGemEditId(g.id); setGemError('');
    setGemCurrentFoto(g.foto_url); setGemNewFile(null); setGemPreview(null); setGemHapusFoto(false);
    setGemModal('edit');
  };
  const onGemFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setGemNewFile(file); setGemPreview(URL.createObjectURL(file)); setGemHapusFoto(false);
  };
  const onGemRemoveFoto = () => {
    setGemNewFile(null); setGemPreview(null); setGemHapusFoto(true); setGemCurrentFoto(null);
  };
  const handleGemSubmit = async (e:FormEvent) => {
    e.preventDefault(); setGemError(''); setGemSaving(true);
    try {
      const fd = new FormData();
      fd.append('nama',          gemForm.nama);
      fd.append('tahun_mulai',   gemForm.tahun_mulai);
      fd.append('tahun_selesai', gemForm.tahun_selesai);
      fd.append('urutan',        String(gemForm.urutan));
      if (gemNewFile)   fd.append('foto', gemNewFile);
      if (gemHapusFoto) fd.append('hapus_foto', '1');

      const url = gemModal==='edit'
        ? `${PROFIL_URL}?resource=gembala&id=${gemEditId}`
        : `${PROFIL_URL}?resource=gembala`;
      const res = await fetch(url, { method:'POST', headers: authHeader, body: fd });
      const d = await res.json();
      if (!res.ok || d.status!=='success') throw new Error(d.message);
      setGemModal(null); fetchGem();
    } catch(err) { setGemError(err instanceof Error ? err.message : 'Gagal menyimpan.'); }
    finally { setGemSaving(false); }
  };
  const handleGemDelete = async (id:number) => {
    if (!confirm('Hapus data gembala ini?')) return;
    const res = await fetch(`${PROFIL_URL}?resource=gembala&id=${id}`, { method:'DELETE', headers: authHeader });
    const d = await res.json();
    if (d.status==='success') fetchGem(); else alert(d.message);
  };

  /* ── Reusable style strings ─────────────────────────────── */
  const inputCls = "h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500";
  const btnEdit  = "rounded-lg p-1.5 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors";
  const btnDel   = "rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors";

  const TABS: { key:TabType; label:string }[] = [
    { key:'jadwal',      label:'Jadwal Ibadah'  },
    { key:'pengumuman',  label:'Pengumuman'     },
    { key:'bpj',         label:'BPJ Periode'    },
    { key:'gembala',     label:'Gembala Jemaat' },
  ];

  return (
    <>
      <PageMeta title="Konten Publik | GKII Longloreh" description="Kelola konten dan profil gereja" />
      <PageBreadcrumb pageTitle="Konten Publik" />

      {/* ── Tabs ─────────────────────────────────────────── */}
      <div className="flex flex-wrap gap-1 mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${tab===t.key ? 'bg-brand-500 text-white shadow-sm' : 'bg-white dark:bg-gray-800 text-gray-500 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ════════════════ JADWAL TAB ════════════════ */}
      {tab === 'jadwal' && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Jadwal Ibadah</h4>
            <button onClick={openJadwalAdd} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors">
              <IcoPlus /> Tambah
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Nama Ibadah</th>
                  <th className="px-6 py-3 text-left font-semibold">Hari</th>
                  <th className="px-6 py-3 text-left font-semibold">Jam</th>
                  <th className="px-6 py-3 text-left font-semibold">Lokasi</th>
                  <th className="px-6 py-3 text-center font-semibold">Status</th>
                  <th className="px-6 py-3 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {jadwalLoading ? (
                  <tr><td colSpan={6} className="py-10 text-center text-gray-400">Memuat...</td></tr>
                ) : jadwalList.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-gray-400">Belum ada jadwal.</td></tr>
                ) : jadwalList.map(j => (
                  <tr key={j.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{j.nama}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{j.hari}</td>
                    <td className="px-6 py-4 font-semibold text-blue-600 dark:text-blue-400">{j.jam}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{j.lokasi||'-'}</td>
                    <td className="px-6 py-4 text-center"><StatusBadge active={j.is_active} /></td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openJadwalEdit(j)} className={btnEdit}><IcoEdit /></button>
                        <button onClick={() => handleJadwalDelete(j.id)} className={btnDel}><IcoTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════ PENGUMUMAN TAB ════════════════ */}
      {tab === 'pengumuman' && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Pengumuman</h4>
            <button onClick={openPengAdd} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors">
              <IcoPlus /> Tambah
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Judul</th>
                  <th className="px-6 py-3 text-left font-semibold">Mulai</th>
                  <th className="px-6 py-3 text-left font-semibold">Selesai</th>
                  <th className="px-6 py-3 text-center font-semibold">Status</th>
                  <th className="px-6 py-3 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {pengLoading ? (
                  <tr><td colSpan={5} className="py-10 text-center text-gray-400">Memuat...</td></tr>
                ) : pengList.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-gray-400">Belum ada pengumuman.</td></tr>
                ) : pengList.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white max-w-xs">
                      <p className="truncate">{p.judul}</p>
                      <p className="text-xs text-gray-400 truncate mt-0.5">{p.isi.slice(0,60)}{p.isi.length>60?'...':''}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {new Date(p.tanggal_mulai).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'})}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {p.tanggal_selesai ? new Date(p.tanggal_selesai).toLocaleDateString('id-ID',{day:'2-digit',month:'short',year:'numeric'}) : <span className="text-gray-300">Tanpa batas</span>}
                    </td>
                    <td className="px-6 py-4 text-center"><StatusBadge active={p.is_active} /></td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openPengEdit(p)} className={btnEdit}><IcoEdit /></button>
                        <button onClick={() => handlePengDelete(p.id)} className={btnDel}><IcoTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════ BPJ TAB ════════════════ */}
      {tab === 'bpj' && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">BPJ Periode</h4>
              <p className="text-xs text-gray-400 mt-0.5">Foto bulat · nama · jabatan</p>
            </div>
            <button onClick={openBpjAdd} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors">
              <IcoPlus /> Tambah
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Foto</th>
                  <th className="px-6 py-3 text-left font-semibold">Nama</th>
                  <th className="px-6 py-3 text-left font-semibold">Jabatan</th>
                  <th className="px-6 py-3 text-left font-semibold">Periode</th>
                  <th className="px-6 py-3 text-center font-semibold">Status</th>
                  <th className="px-6 py-3 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {bpjLoading ? (
                  <tr><td colSpan={6} className="py-10 text-center text-gray-400">Memuat...</td></tr>
                ) : bpjList.length === 0 ? (
                  <tr><td colSpan={6} className="py-10 text-center text-gray-400">Belum ada data BPJ.</td></tr>
                ) : bpjList.map(b => (
                  <tr key={b.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-3">
                      {b.foto_url ? (
                        <img src={b.foto_url} alt={b.nama} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(b.nama)} flex items-center justify-center text-white text-xs font-bold`}>
                          {initials(b.nama)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{b.nama}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{b.jabatan||'-'}</td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{b.periode||'-'}</td>
                    <td className="px-6 py-4 text-center"><StatusBadge active={b.is_active} /></td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openBpjEdit(b)} className={btnEdit}><IcoEdit /></button>
                        <button onClick={() => handleBpjDelete(b.id)} className={btnDel}><IcoTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════ GEMBALA TAB ════════════════ */}
      {tab === 'gembala' && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Gembala Jemaat</h4>
              <p className="text-xs text-gray-400 mt-0.5">Foto bulat · nama · tahun pelayanan</p>
            </div>
            <button onClick={openGemAdd} className="inline-flex items-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors">
              <IcoPlus /> Tambah
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
                <tr>
                  <th className="px-6 py-3 text-left font-semibold">Foto</th>
                  <th className="px-6 py-3 text-left font-semibold">Nama</th>
                  <th className="px-6 py-3 text-left font-semibold">Tahun Mulai</th>
                  <th className="px-6 py-3 text-left font-semibold">Tahun Selesai</th>
                  <th className="px-6 py-3 text-center font-semibold">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {gemLoading ? (
                  <tr><td colSpan={5} className="py-10 text-center text-gray-400">Memuat...</td></tr>
                ) : gemList.length === 0 ? (
                  <tr><td colSpan={5} className="py-10 text-center text-gray-400">Belum ada data gembala.</td></tr>
                ) : gemList.map(g => (
                  <tr key={g.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-3">
                      {g.foto_url ? (
                        <img src={g.foto_url} alt={g.nama} className="w-10 h-10 rounded-full object-cover" />
                      ) : (
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarGradient(g.nama)} flex items-center justify-center text-white text-xs font-bold`}>
                          {initials(g.nama)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{g.nama}</td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300">{g.tahun_mulai}</td>
                    <td className="px-6 py-4">
                      {g.tahun_selesai ? (
                        <span className="text-gray-600 dark:text-gray-300">{g.tahun_selesai}</span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-0.5 rounded-full">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Aktif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openGemEdit(g)} className={btnEdit}><IcoEdit /></button>
                        <button onClick={() => handleGemDelete(g.id)} className={btnDel}><IcoTrash /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          MODAL — Jadwal
      ════════════════════════════════════════════ */}
      {jadwalModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{jadwalModal==='add'?'Tambah Jadwal':'Edit Jadwal'}</h3>
              <button onClick={() => setJadwalModal(null)} className="text-gray-400 hover:text-gray-600"><IcoClose /></button>
            </div>
            {jadwalError && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">{jadwalError}</div>}
            <form onSubmit={handleJadwalSubmit} className="flex flex-col gap-3">
              {[['Nama Ibadah *','nama'],['Jam *','jam'],['Lokasi','lokasi']].map(([label, key]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                  <input type="text" value={(jadwalForm as Record<string,unknown>)[key] as string}
                    onChange={e => setJadwalForm(f => ({...f,[key]:e.target.value}))}
                    required={key==='nama'||key==='jam'}
                    placeholder={key==='jam'?'09:00':undefined}
                    className={inputCls} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Hari *</label>
                <select value={jadwalForm.hari} onChange={e => setJadwalForm(f=>({...f,hari:e.target.value}))} className={inputCls}>
                  {HARI_LIST.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Keterangan</label>
                <textarea value={jadwalForm.keterangan} onChange={e => setJadwalForm(f=>({...f,keterangan:e.target.value}))} rows={2}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="j-aktif" checked={jadwalForm.is_active===1} onChange={e=>setJadwalForm(f=>({...f,is_active:e.target.checked?1:0}))} className="w-4 h-4 accent-brand-500" />
                <label htmlFor="j-aktif" className="text-sm text-gray-700 dark:text-gray-300">Tampilkan di halaman publik</label>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setJadwalModal(null)} className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Batal</button>
                <button type="submit" disabled={jadwalSaving} className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-sm font-semibold text-white">{jadwalSaving?'Menyimpan...':'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          MODAL — Pengumuman
      ════════════════════════════════════════════ */}
      {pengModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{pengModal==='add'?'Tambah Pengumuman':'Edit Pengumuman'}</h3>
              <button onClick={() => setPengModal(null)} className="text-gray-400 hover:text-gray-600"><IcoClose /></button>
            </div>
            {pengError && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">{pengError}</div>}
            <form onSubmit={handlePengSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Judul *</label>
                <input type="text" value={pengForm.judul} onChange={e=>setPengForm(f=>({...f,judul:e.target.value}))} required className={inputCls} />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Isi Pengumuman *</label>
                <textarea value={pengForm.isi} onChange={e=>setPengForm(f=>({...f,isi:e.target.value}))} required rows={5}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tanggal Mulai *</label>
                  <input type="date" value={pengForm.tanggal_mulai} onChange={e=>setPengForm(f=>({...f,tanggal_mulai:e.target.value}))} required className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tanggal Selesai</label>
                  <input type="date" value={pengForm.tanggal_selesai} onChange={e=>setPengForm(f=>({...f,tanggal_selesai:e.target.value}))} className={inputCls} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="p-aktif" checked={pengForm.is_active===1} onChange={e=>setPengForm(f=>({...f,is_active:e.target.checked?1:0}))} className="w-4 h-4 accent-brand-500" />
                <label htmlFor="p-aktif" className="text-sm text-gray-700 dark:text-gray-300">Tampilkan di halaman publik</label>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setPengModal(null)} className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Batal</button>
                <button type="submit" disabled={pengSaving} className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-sm font-semibold text-white">{pengSaving?'Menyimpan...':'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          MODAL — BPJ
      ════════════════════════════════════════════ */}
      {bpjModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{bpjModal==='add'?'Tambah Anggota BPJ':'Edit Anggota BPJ'}</h3>
              <button onClick={() => setBpjModal(null)} className="text-gray-400 hover:text-gray-600"><IcoClose /></button>
            </div>
            {bpjError && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">{bpjError}</div>}
            <form onSubmit={handleBpjSubmit} className="flex flex-col gap-4">
              {/* Photo upload */}
              <div className="flex justify-center pt-1 pb-2">
                <PhotoUploadCircle
                  currentUrl={bpjCurrentFoto}
                  previewUrl={bpjPreview}
                  name={bpjForm.nama||'?'}
                  size={88}
                  onFileChange={onBpjFileChange}
                  onRemove={onBpjRemoveFoto}
                />
              </div>
              {[['Nama *','nama'],['Jabatan','jabatan'],['Periode','periode']].map(([label,key]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                  <input type="text" value={(bpjForm as Record<string,unknown>)[key] as string}
                    onChange={e => setBpjForm(f=>({...f,[key]:e.target.value}))}
                    required={key==='nama'}
                    placeholder={key==='periode'?'misal: 2021-2025':undefined}
                    className={inputCls} />
                </div>
              ))}
              <div className="flex items-center gap-2">
                <input type="checkbox" id="bpj-aktif" checked={bpjForm.is_active===1} onChange={e=>setBpjForm(f=>({...f,is_active:e.target.checked?1:0}))} className="w-4 h-4 accent-brand-500" />
                <label htmlFor="bpj-aktif" className="text-sm text-gray-700 dark:text-gray-300">Tampilkan di halaman publik</label>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setBpjModal(null)} className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Batal</button>
                <button type="submit" disabled={bpjSaving} className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-sm font-semibold text-white">{bpjSaving?'Menyimpan...':'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════
          MODAL — Gembala
      ════════════════════════════════════════════ */}
      {gemModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{gemModal==='add'?'Tambah Gembala':'Edit Gembala'}</h3>
              <button onClick={() => setGemModal(null)} className="text-gray-400 hover:text-gray-600"><IcoClose /></button>
            </div>
            {gemError && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">{gemError}</div>}
            <form onSubmit={handleGemSubmit} className="flex flex-col gap-4">
              {/* Photo upload */}
              <div className="flex justify-center pt-1 pb-2">
                <PhotoUploadCircle
                  currentUrl={gemCurrentFoto}
                  previewUrl={gemPreview}
                  name={gemForm.nama||'?'}
                  size={88}
                  onFileChange={onGemFileChange}
                  onRemove={onGemRemoveFoto}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Nama *</label>
                <input type="text" value={gemForm.nama} onChange={e=>setGemForm(f=>({...f,nama:e.target.value}))} required className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tahun Mulai *</label>
                  <input type="text" value={gemForm.tahun_mulai} onChange={e=>setGemForm(f=>({...f,tahun_mulai:e.target.value}))} required
                    placeholder="misal: 2013" maxLength={4} className={inputCls} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tahun Selesai</label>
                  <input type="text" value={gemForm.tahun_selesai} onChange={e=>setGemForm(f=>({...f,tahun_selesai:e.target.value}))}
                    placeholder="kosong = masih aktif" maxLength={4} className={inputCls} />
                </div>
              </div>
              <p className="text-xs text-gray-400 -mt-2">Kosongkan "Tahun Selesai" jika gembala masih aktif melayani.</p>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setGemModal(null)} className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Batal</button>
                <button type="submit" disabled={gemSaving} className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-sm font-semibold text-white">{gemSaving?'Menyimpan...':'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
