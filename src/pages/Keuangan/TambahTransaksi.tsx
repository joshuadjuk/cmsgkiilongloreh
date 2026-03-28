import { useState, useEffect, useRef, FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import Label from '../../components/form/Label';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import { useAuth } from '../../context/AuthContext';

const KEUANGAN_URL = 'https://gereja.eternity.my.id/api-gkii/keuangan.php';

const KATEGORI_PEMASUKAN = [
  'Persembahan Umum',
  'Perpuluhan',
  'Persembahan Pembangunan',
  'Persembahan Diakonia',
  'Lain-lain',
];

const KATEGORI_PENGELUARAN = [
  'Operasional Gereja',
  'Honorarium/Gaji',
  'Sosial/Diakonia',
  'Pembangunan & Inventaris',
  'Lain-lain',
];

export default function TambahTransaksi() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const [searchParams] = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const defaultTipe = (searchParams.get('tipe') === 'pengeluaran' ? 'pengeluaran' : 'pemasukan') as 'pemasukan' | 'pengeluaran';

  const [tipe, setTipe]             = useState<'pemasukan' | 'pengeluaran'>(defaultTipe);
  const [tanggal, setTanggal]       = useState(new Date().toISOString().split('T')[0]);
  const [kategori, setKategori]     = useState('');
  const [jumlahStr, setJumlahStr]   = useState('');
  const [keterangan, setKeterangan] = useState('');
  const [buktiFile, setBuktiFile]   = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading]   = useState(false);
  const [error, setError]           = useState('');

  // Reset kategori saat tipe berubah
  useEffect(() => { setKategori(''); }, [tipe]);

  // Cleanup preview URL on unmount
  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const kategoriList = tipe === 'pemasukan' ? KATEGORI_PEMASUKAN : KATEGORI_PENGELUARAN;

  const handleJumlahChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setJumlahStr(raw);
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
    setBuktiFile(file);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleRemoveFile = () => {
    setBuktiFile(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
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
      if (buktiFile) fd.append('bukti_file', buktiFile);

      const res = await fetch(KEUANGAN_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message);

      navigate('/keuangan/transaksi');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan transaksi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <PageMeta title="Tambah Transaksi | GKII Longloreh" description="Catat pemasukan atau pengeluaran" />
      <PageBreadcrumb pageTitle="Tambah Transaksi" />

      <div className="max-w-xl mx-auto">
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6 md:p-8">

          {/* Toggle Tipe */}
          <div className="flex rounded-xl overflow-hidden border border-gray-200 dark:border-gray-600 mb-6">
            <button
              type="button"
              onClick={() => setTipe('pemasukan')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tipe === 'pemasukan'
                  ? 'bg-green-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              ↑ Pemasukan
            </button>
            <button
              type="button"
              onClick={() => setTipe('pengeluaran')}
              className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                tipe === 'pengeluaran'
                  ? 'bg-red-500 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              ↓ Pengeluaran
            </button>
          </div>

          {error && (
            <div className="mb-5 rounded-lg bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/30 px-4 py-3 text-sm text-error-600 dark:text-error-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">

            {/* Tanggal */}
            <div>
              <Label htmlFor="tanggal">Tanggal <span className="text-error-500">*</span></Label>
              <Input
                id="tanggal"
                type="date"
                value={tanggal}
                onChange={e => setTanggal(e.target.value)}
              />
            </div>

            {/* Kategori */}
            <div>
              <Label htmlFor="kategori">
                {tipe === 'pemasukan' ? 'Jenis Persembahan' : 'Kategori Pengeluaran'}
                <span className="text-error-500"> *</span>
              </Label>
              <select
                id="kategori"
                value={kategori}
                onChange={e => setKategori(e.target.value)}
                required
                className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20"
              >
                <option value="">-- Pilih --</option>
                {kategoriList.map(k => (
                  <option key={k} value={k}>{k}</option>
                ))}
              </select>
            </div>

            {/* Jumlah */}
            <div>
              <Label htmlFor="jumlah">Jumlah (Rp) <span className="text-error-500">*</span></Label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm text-gray-400 font-medium">Rp</span>
                <input
                  id="jumlah"
                  type="text"
                  inputMode="numeric"
                  value={jumlahFormatted}
                  onChange={handleJumlahChange}
                  placeholder="0"
                  required
                  className="h-11 w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 pl-10 pr-4 py-2.5 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20"
                />
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <Label htmlFor="keterangan">
                Keterangan {tipe === 'pengeluaran' && <span className="text-error-500">*</span>}
              </Label>
              <textarea
                id="keterangan"
                value={keterangan}
                onChange={e => setKeterangan(e.target.value)}
                required={tipe === 'pengeluaran'}
                rows={3}
                placeholder={
                  tipe === 'pemasukan'
                    ? 'Contoh: Ibadah Minggu 30 Maret 2026'
                    : 'Contoh: Pembayaran tagihan listrik bulan Maret'
                }
                className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-transparent dark:bg-gray-900 px-4 py-2.5 text-sm text-gray-800 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-3 focus:border-brand-300 focus:ring-brand-500/20 resize-none"
              />
            </div>

            {/* Bukti / Nota */}
            <div>
              <Label>Bukti / Nota <span className="text-gray-400 font-normal text-xs">(opsional, maks 5 MB)</span></Label>
              {previewUrl ? (
                <div className="mt-1 relative inline-block">
                  <img
                    src={previewUrl}
                    alt="Preview bukti"
                    className="h-36 w-auto rounded-lg border border-gray-200 dark:border-gray-600 object-contain bg-gray-50 dark:bg-gray-900"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center shadow hover:bg-red-600 transition-colors"
                    title="Hapus gambar"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <p className="mt-1 text-xs text-gray-500">{buktiFile?.name}</p>
                </div>
              ) : (
                <label className="mt-1 flex flex-col items-center justify-center w-full h-28 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 cursor-pointer hover:border-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/5 transition-colors">
                  <svg className="w-7 h-7 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                  <span className="text-sm text-gray-500">Klik untuk unggah foto bukti</span>
                  <span className="text-xs text-gray-400 mt-0.5">JPG, PNG, WebP</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 justify-center"
                onClick={() => navigate('/keuangan')}
              >
                Batal
              </Button>
              <button
                type="submit"
                disabled={isLoading}
                className={`flex-1 py-3 px-4 rounded-lg text-sm font-semibold text-white transition-colors ${
                  tipe === 'pemasukan'
                    ? 'bg-green-500 hover:bg-green-600 disabled:bg-green-300'
                    : 'bg-red-500 hover:bg-red-600 disabled:bg-red-300'
                }`}
              >
                {isLoading ? 'Menyimpan...' : `Simpan ${tipe === 'pemasukan' ? 'Pemasukan' : 'Pengeluaran'}`}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
