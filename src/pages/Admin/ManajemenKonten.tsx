import { useEffect, useState, FormEvent } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useAuth } from '../../context/AuthContext';

const KONTEN_URL = 'https://gereja.eternity.my.id/api-gkii/konten.php';

const HARI_LIST = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];

interface Jadwal {
  id: number;
  nama: string;
  hari: string;
  jam: string;
  lokasi: string | null;
  keterangan: string | null;
  urutan: number;
  is_active: number;
}

interface Pengumuman {
  id: number;
  judul: string;
  isi: string;
  tanggal_mulai: string;
  tanggal_selesai: string | null;
  is_active: number;
  dibuat_oleh_nama: string;
}

const emptyJadwal = { nama: '', hari: 'Minggu', jam: '', lokasi: '', keterangan: '', urutan: 0, is_active: 1 };
const emptyPengumuman = { judul: '', isi: '', tanggal_mulai: new Date().toISOString().split('T')[0], tanggal_selesai: '', is_active: 1 };

export default function ManajemenKonten() {
  const { token } = useAuth();
  const [tab, setTab] = useState<'jadwal' | 'pengumuman'>('jadwal');

  // Jadwal state
  const [jadwalList, setJadwalList]     = useState<Jadwal[]>([]);
  const [jadwalLoading, setJadwalLoading] = useState(true);
  const [jadwalModal, setJadwalModal]   = useState<'add' | 'edit' | null>(null);
  const [jadwalForm, setJadwalForm]     = useState(emptyJadwal);
  const [jadwalEditId, setJadwalEditId] = useState<number | null>(null);
  const [jadwalError, setJadwalError]   = useState('');
  const [jadwalSaving, setJadwalSaving] = useState(false);

  // Pengumuman state
  const [pengList, setPengList]         = useState<Pengumuman[]>([]);
  const [pengLoading, setPengLoading]   = useState(true);
  const [pengModal, setPengModal]       = useState<'add' | 'edit' | null>(null);
  const [pengForm, setPengForm]         = useState(emptyPengumuman);
  const [pengEditId, setPengEditId]     = useState<number | null>(null);
  const [pengError, setPengError]       = useState('');
  const [pengSaving, setPengSaving]     = useState(false);

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  // ---- Fetch ----
  const fetchJadwal = async () => {
    setJadwalLoading(true);
    const res = await fetch(`${KONTEN_URL}?resource=jadwal`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.status === 'success') setJadwalList(data.data);
    setJadwalLoading(false);
  };

  const fetchPengumuman = async () => {
    setPengLoading(true);
    const res = await fetch(`${KONTEN_URL}?resource=pengumuman`, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.status === 'success') setPengList(data.data);
    setPengLoading(false);
  };

  useEffect(() => { fetchJadwal(); fetchPengumuman(); }, []);

  // ---- Jadwal CRUD ----
  const openJadwalAdd = () => { setJadwalForm(emptyJadwal); setJadwalEditId(null); setJadwalError(''); setJadwalModal('add'); };
  const openJadwalEdit = (j: Jadwal) => {
    setJadwalForm({ nama: j.nama, hari: j.hari, jam: j.jam, lokasi: j.lokasi ?? '', keterangan: j.keterangan ?? '', urutan: j.urutan, is_active: j.is_active });
    setJadwalEditId(j.id);
    setJadwalError('');
    setJadwalModal('edit');
  };

  const handleJadwalSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setJadwalError('');
    setJadwalSaving(true);
    try {
      const body = { ...jadwalForm, lokasi: jadwalForm.lokasi || null, keterangan: jadwalForm.keterangan || null };
      const url  = jadwalModal === 'edit' ? `${KONTEN_URL}?resource=jadwal&id=${jadwalEditId}` : `${KONTEN_URL}?resource=jadwal`;
      const res  = await fetch(url, { method: jadwalModal === 'edit' ? 'PUT' : 'POST', headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message);
      setJadwalModal(null);
      fetchJadwal();
    } catch (err) { setJadwalError(err instanceof Error ? err.message : 'Gagal menyimpan.'); }
    finally { setJadwalSaving(false); }
  };

  const handleJadwalDelete = async (id: number) => {
    if (!confirm('Hapus jadwal ini?')) return;
    const res = await fetch(`${KONTEN_URL}?resource=jadwal&id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.status === 'success') fetchJadwal();
    else alert(data.message);
  };

  // ---- Pengumuman CRUD ----
  const openPengAdd = () => { setPengForm({ ...emptyPengumuman, tanggal_mulai: new Date().toISOString().split('T')[0] }); setPengEditId(null); setPengError(''); setPengModal('add'); };
  const openPengEdit = (p: Pengumuman) => {
    setPengForm({ judul: p.judul, isi: p.isi, tanggal_mulai: p.tanggal_mulai, tanggal_selesai: p.tanggal_selesai ?? '', is_active: p.is_active });
    setPengEditId(p.id);
    setPengError('');
    setPengModal('edit');
  };

  const handlePengSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setPengError('');
    setPengSaving(true);
    try {
      const body = { ...pengForm, tanggal_selesai: pengForm.tanggal_selesai || null };
      const url  = pengModal === 'edit' ? `${KONTEN_URL}?resource=pengumuman&id=${pengEditId}` : `${KONTEN_URL}?resource=pengumuman`;
      const res  = await fetch(url, { method: pengModal === 'edit' ? 'PUT' : 'POST', headers, body: JSON.stringify(body) });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message);
      setPengModal(null);
      fetchPengumuman();
    } catch (err) { setPengError(err instanceof Error ? err.message : 'Gagal menyimpan.'); }
    finally { setPengSaving(false); }
  };

  const handlePengDelete = async (id: number) => {
    if (!confirm('Hapus pengumuman ini?')) return;
    const res = await fetch(`${KONTEN_URL}?resource=pengumuman&id=${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (data.status === 'success') fetchPengumuman();
    else alert(data.message);
  };

  const btnClass = "rounded-lg p-1.5 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors";
  const btnDelClass = "rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors";

  return (
    <>
      <PageMeta title="Konten Landing Page | GKII Longloreh" description="Kelola jadwal ibadah dan pengumuman" />
      <PageBreadcrumb pageTitle="Konten Publik" />

      {/* Tabs */}
      <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 mb-6 w-fit">
        {(['jadwal', 'pengumuman'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`px-5 py-2.5 text-sm font-semibold transition-colors ${tab === t ? 'bg-brand-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}>
            {t === 'jadwal' ? 'Jadwal Ibadah' : 'Pengumuman'}
          </button>
        ))}
      </div>

      {/* ===== JADWAL TAB ===== */}
      {tab === 'jadwal' && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Jadwal Ibadah</h4>
            <button onClick={openJadwalAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tambah
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
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{j.lokasi || '-'}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${j.is_active ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-gray-100 text-gray-500'}`}>
                        {j.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openJadwalEdit(j)} className={btnClass} title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                          </svg>
                        </button>
                        <button onClick={() => handleJadwalDelete(j.id)} className={btnDelClass} title="Hapus">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ===== PENGUMUMAN TAB ===== */}
      {tab === 'pengumuman' && (
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
            <h4 className="text-lg font-bold text-gray-900 dark:text-white">Pengumuman</h4>
            <button onClick={openPengAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
              Tambah
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
                      <p className="text-xs text-gray-400 truncate mt-0.5">{p.isi.slice(0, 60)}{p.isi.length > 60 ? '...' : ''}</p>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                      {new Date(p.tanggal_mulai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {p.tanggal_selesai
                        ? new Date(p.tanggal_selesai).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
                        : <span className="text-gray-300">Tanpa batas</span>}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${p.is_active ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-gray-100 text-gray-500'}`}>
                        {p.is_active ? 'Aktif' : 'Nonaktif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button onClick={() => openPengEdit(p)} className={btnClass} title="Edit">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                          </svg>
                        </button>
                        <button onClick={() => handlePengDelete(p.id)} className={btnDelClass} title="Hapus">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal Jadwal */}
      {jadwalModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{jadwalModal === 'add' ? 'Tambah Jadwal' : 'Edit Jadwal'}</h3>
              <button onClick={() => setJadwalModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {jadwalError && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">{jadwalError}</div>}
            <form onSubmit={handleJadwalSubmit} className="flex flex-col gap-3">
              {[['Nama Ibadah *', 'nama', 'text'], ['Jam *', 'jam', 'text'], ['Lokasi', 'lokasi', 'text']].map(([label, key, type]) => (
                <div key={key}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                  <input type={type} value={(jadwalForm as Record<string, unknown>)[key] as string}
                    onChange={e => setJadwalForm(f => ({ ...f, [key]: e.target.value }))}
                    required={key === 'nama' || key === 'jam'}
                    placeholder={key === 'jam' ? '09:00' : undefined}
                    className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              ))}
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Hari *</label>
                <select value={jadwalForm.hari} onChange={e => setJadwalForm(f => ({ ...f, hari: e.target.value }))}
                  className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                  {HARI_LIST.map(h => <option key={h} value={h}>{h}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Keterangan</label>
                <textarea value={jadwalForm.keterangan} onChange={e => setJadwalForm(f => ({ ...f, keterangan: e.target.value }))} rows={2}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="jadwal-aktif" checked={jadwalForm.is_active === 1} onChange={e => setJadwalForm(f => ({ ...f, is_active: e.target.checked ? 1 : 0 }))} className="w-4 h-4 accent-brand-500" />
                <label htmlFor="jadwal-aktif" className="text-sm text-gray-700 dark:text-gray-300">Tampilkan di halaman publik</label>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setJadwalModal(null)} className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Batal</button>
                <button type="submit" disabled={jadwalSaving} className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-sm font-semibold text-white">{jadwalSaving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Pengumuman */}
      {pengModal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{pengModal === 'add' ? 'Tambah Pengumuman' : 'Edit Pengumuman'}</h3>
              <button onClick={() => setPengModal(null)} className="text-gray-400 hover:text-gray-600">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>
              </button>
            </div>
            {pengError && <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-3 py-2.5 text-sm text-red-600">{pengError}</div>}
            <form onSubmit={handlePengSubmit} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Judul *</label>
                <input type="text" value={pengForm.judul} onChange={e => setPengForm(f => ({ ...f, judul: e.target.value }))} required
                  className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Isi Pengumuman *</label>
                <textarea value={pengForm.isi} onChange={e => setPengForm(f => ({ ...f, isi: e.target.value }))} required rows={5}
                  className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500 resize-none" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tanggal Mulai *</label>
                  <input type="date" value={pengForm.tanggal_mulai} onChange={e => setPengForm(f => ({ ...f, tanggal_mulai: e.target.value }))} required
                    className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Tanggal Selesai</label>
                  <input type="date" value={pengForm.tanggal_selesai} onChange={e => setPengForm(f => ({ ...f, tanggal_selesai: e.target.value }))}
                    className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="peng-aktif" checked={pengForm.is_active === 1} onChange={e => setPengForm(f => ({ ...f, is_active: e.target.checked ? 1 : 0 }))} className="w-4 h-4 accent-brand-500" />
                <label htmlFor="peng-aktif" className="text-sm text-gray-700 dark:text-gray-300">Tampilkan di halaman publik</label>
              </div>
              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setPengModal(null)} className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">Batal</button>
                <button type="submit" disabled={pengSaving} className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-sm font-semibold text-white">{pengSaving ? 'Menyimpan...' : 'Simpan'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
