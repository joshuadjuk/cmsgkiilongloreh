import { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Label from '../../components/form/Label';
import { useAuth } from '../../context/AuthContext';

const KEUANGAN_URL = 'https://gereja.eternity.my.id/api-gkii/keuangan.php';

const KATEGORI_PEMASUKAN  = ['Persembahan Umum','Perpuluhan','Persembahan Pembangunan','Persembahan Diakonia','Lain-lain'];
const KATEGORI_PENGELUARAN = ['Operasional Gereja','Honorarium/Gaji','Sosial/Diakonia','Pembangunan & Inventaris','Lain-lain'];

export default function EditTransaksi() {
  const { token }  = useAuth();
  const navigate   = useNavigate();
  const { id }     = useParams<{ id: string }>();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tipe, setTipe]                 = useState<'pemasukan' | 'pengeluaran'>('pemasukan');
  const [tanggal, setTanggal]           = useState('');
  const [kategori, setKategori]         = useState('');
  const [jumlahStr, setJumlahStr]       = useState('');
  const [keterangan, setKeterangan]     = useState('');
  const [existingBukti, setExistingBukti] = useState<string | null>(null); // URL dari server
  const [newFile, setNewFile]           = useState<File | null>(null);
  const [newPreview, setNewPreview]     = useState<string | null>(null);
  const [hapusBukti, setHapusBukti]     = useState(false);
  const [isLoading, setIsLoading]       = useState(false);
  const [isFetching, setIsFetching]     = useState(true);
  const [error, setError]               = useState('');

  useEffect(() => {
    if (!id) return;
    fetch(`${KEUANGAN_URL}?id=${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          const d = res.data;
          setTipe(d.tipe);
          setTanggal(d.tanggal);
          setKategori(d.kategori);
          setJumlahStr(String(Math.round(Number(d.jumlah))));
          setKeterangan(d.keterangan ?? '');
          setExistingBukti(d.bukti_url ?? null);
        }
      })
      .catch(console.error)
      .finally(() => setIsFetching(false));
  }, [id, token]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => { if (newPreview) URL.revokeObjectURL(newPreview); };
  }, [newPreview]);

  const handleJumlahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setJumlahStr(e.target.value.replace(/\D/g, ''));
  };

  const jumlahFormatted = jumlahStr
    ? new Intl.NumberFormat('id-ID').format(Number(jumlahStr))
    : '';

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setError('Ukuran file maksimal 5 MB.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Format file harus JPG, PNG, atau WebP.');
      return;
    }
    setError('');
    setNewFile(file);
    setHapusBukti(false);
    if (newPreview) URL.revokeObjectURL(newPreview);
    setNewPreview(URL.createObjectURL(file));
  };

  const handleRemoveNewFile = () => {
    setNewFile(null);
    if (newPreview) URL.revokeObjectURL(newPreview);
    setNewPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleHapusBuktiLama = () => {
    setHapusBukti(true);
    setExistingBukti(null);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    const jumlah = Number(jumlahStr);
    if (!tanggal || !kategori || jumlah <= 0) {
      setError('Tanggal, kategori, dan jumlah wajib diisi.');
      return;
    }

    setIsLoading(true);
    try {
      const fd = new FormData();
      fd.append('tanggal', tanggal);
      fd.append('tipe', tipe);
      fd.append('kategori', kategori);
      fd.append('jumlah', String(jumlah));
      fd.append('keterangan', keterangan);
      if (newFile) {
        fd.append('bukti_file', newFile);
      } else if (hapusBukti) {
        fd.append('hapus_bukti', '1');
      }

      const res = await fetch(`${KEUANGAN_URL}?id=${id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message);
      navigate('/keuangan/transaksi');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengupdate transaksi.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return <div className="flex h-64 items-center justify-center text-gray-400">Memuat data...</div>;
  }

  const kategoriList = tipe === 'pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN;

  return (
    <>
      <PageMeta title="Edit Transaksi | GKII Longloreh" description="Edit transaksi keuangan" />
      <PageBreadcrumb pageTitle="Edit Transaksi" />

      <div className="max-w-xl mx-auto">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6 md:p-8">

          {/* Toggle Tipe */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 mb-6">
            <button type="button" onClick={() => setTipe('pemasukan')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${tipe === 'pemasukan' ? 'bg-green-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'}`}>
              ↑ Pemasukan
            </button>
            <button type="button" onClick={() => setTipe('pengeluaran')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${tipe === 'pengeluaran' ? 'bg-red-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-500'}`}>
              ↓ Pengeluaran
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/30 px-4 py-3 text-sm text-error-600 dark:text-error-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <Label htmlFor="tanggal">Tanggal <span className="text-error-500">*</span></Label>
              <input id="tanggal" type="date" value={tanggal} onChange={e => setTanggal(e.target.value)}
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-3 focus:border-brand-300" />
            </div>

            <div>
              <Label htmlFor="kategori">{tipe === 'pemasukan' ? 'Jenis Persembahan' : 'Kategori Pengeluaran'} <span className="text-error-500">*</span></Label>
              <select id="kategori" value={kategori} onChange={e => setKategori(e.target.value)} required
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-3">
                <option value="">-- Pilih --</option>
                {kategoriList.map(k => <option key={k} value={k}>{k}</option>)}
              </select>
            </div>

            <div>
              <Label htmlFor="jumlah">Jumlah (Rp) <span className="text-error-500">*</span></Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">Rp</span>
                <input id="jumlah" type="text" inputMode="numeric" value={jumlahFormatted} onChange={handleJumlahChange}
                  placeholder="0" required
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-3 focus:border-brand-300" />
              </div>
            </div>

            <div>
              <Label htmlFor="keterangan">Keterangan</Label>
              <textarea id="keterangan" value={keterangan} onChange={e => setKeterangan(e.target.value)} rows={3}
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-3 focus:border-brand-300 resize-none" />
            </div>

            {/* Bukti / Nota */}
            <div>
              <Label>Bukti / Nota <span className="text-gray-400 font-normal text-xs">(opsional, maks 5 MB)</span></Label>

              {/* Tampilkan bukti yang sudah ada */}
              {existingBukti && !newFile && (
                <div className="mt-1 mb-3">
                  <p className="text-xs text-gray-500 mb-1">Bukti saat ini:</p>
                  <div className="relative inline-block">
                    <a href={existingBukti} target="_blank" rel="noopener noreferrer">
                      <img
                        src={existingBukti}
                        alt="Bukti transaksi"
                        className="h-36 w-auto rounded-lg border border-gray-200 dark:border-gray-600 object-contain bg-gray-50 dark:bg-gray-900 hover:opacity-90 transition-opacity"
                      />
                    </a>
                    <button
                      type="button"
                      onClick={handleHapusBuktiLama}
                      className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600 transition-colors"
                      title="Hapus bukti"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Preview file baru */}
              {newFile && newPreview && (
                <div className="mt-1 mb-3 relative inline-block">
                  <p className="text-xs text-gray-500 mb-1">Bukti baru:</p>
                  <img
                    src={newPreview}
                    alt="Preview bukti baru"
                    className="h-36 w-auto rounded-lg border border-gray-200 dark:border-gray-600 object-contain bg-gray-50 dark:bg-gray-900"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveNewFile}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600 transition-colors"
                    title="Hapus gambar"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <p className="mt-1 text-xs text-gray-500">{newFile.name}</p>
                </div>
              )}

              {/* Upload area */}
              <label className="flex flex-col items-center justify-center w-full h-24 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 cursor-pointer hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/5 transition-colors">
                <svg className="w-6 h-6 text-gray-400 mb-1" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                </svg>
                <span className="text-xs text-gray-500">
                  {existingBukti || newFile ? 'Ganti dengan foto baru' : 'Klik untuk unggah foto bukti'}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleFileChange}
                />
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button type="button" className="flex-1 justify-center border border-gray-300 rounded-lg px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors" onClick={() => navigate('/keuangan/transaksi')}>
                Batal
              </button>
              <button type="submit" disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold text-white transition-colors ${tipe === 'pemasukan' ? 'bg-green-500 hover:bg-green-600 disabled:bg-green-300' : 'bg-red-500 hover:bg-red-600 disabled:bg-red-300'}`}>
                {isLoading ? 'Menyimpan...' : 'Update Transaksi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
