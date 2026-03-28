import { useState, useCallback } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useAuth } from '../../context/AuthContext';

const KEUANGAN_URL = 'https://gereja.eternity.my.id/api-gkii/keuangan.php';

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const BULAN_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

interface LaporanData {
  bulan: number;
  tahun: number;
  saldo_awal: number;
  total_pemasukan: number;
  total_pengeluaran: number;
  saldo_akhir: number;
  breakdown_pemasukan: Record<string, number>;
  breakdown_pengeluaran: Record<string, number>;
  transaksi: {
    id: number; tanggal: string; tipe: string;
    kategori: string; jumlah: number; keterangan: string | null;
    dicatat_oleh_nama: string;
  }[];
}

export default function LaporanBulanan() {
  const { token } = useAuth();
  const now       = new Date();

  const [bulan, setBulan]     = useState(now.getMonth() + 1);
  const [tahun, setTahun]     = useState(now.getFullYear());
  const [data, setData]       = useState<LaporanData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const fetchLaporan = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${KEUANGAN_URL}?action=laporan&bulan=${bulan}&tahun=${tahun}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.status === 'success') setData(result.data);
      else setError(result.message);
    } catch {
      setError('Gagal memuat laporan.');
    } finally {
      setLoading(false);
    }
  }, [token, bulan, tahun]);

  const handleCetak = () => window.print();

  return (
    <>
      <PageMeta title="Laporan Bulanan | GKII Longloreh" description="Laporan keuangan bulanan gereja" />

      {/* Header — disembunyikan saat print */}
      <div className="print:hidden">
        <PageBreadcrumb pageTitle="Laporan Bulanan" />

        {/* Filter */}
        <div className="flex flex-wrap gap-3 items-end mb-6 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Bulan</label>
            <select value={bulan} onChange={e => setBulan(Number(e.target.value))}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white px-3 py-2 focus:outline-none">
              {BULAN_NAMES.map((b, i) => <option key={i} value={i + 1}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Tahun</label>
            <input type="number" value={tahun} onChange={e => setTahun(Number(e.target.value))}
              className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white px-3 py-2 focus:outline-none" />
          </div>
          <button onClick={fetchLaporan} disabled={loading}
            className="rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 px-5 py-2 text-sm font-semibold text-white transition-colors">
            {loading ? 'Memuat...' : 'Tampilkan'}
          </button>
          {data && (
            <button onClick={handleCetak}
              className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 px-5 py-2 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0 1 10.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0 .229 2.523a1.125 1.125 0 0 1-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0 0 21 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 0 0-1.913-.247M6.34 18H5.25A2.25 2.25 0 0 1 3 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 0 1 1.913-.247m10.5 0a48.536 48.536 0 0 0-10.5 0m10.5 0V3.375c0-.621-.504-1.125-1.125-1.125h-8.25c-.621 0-1.125.504-1.125 1.125v3.659M18 10.5h.008v.008H18V10.5Zm-3 0h.008v.008H15V10.5Z" />
              </svg>
              Cetak
            </button>
          )}
        </div>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
      </div>

      {/* Konten Laporan */}
      {data && (
        <div id="laporan-print">
          {/* Header Print */}
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-xl font-bold">LAPORAN KEUANGAN</h1>
            <h2 className="text-lg font-semibold">GKII Longloreh</h2>
            <p className="text-sm">{BULAN_NAMES[data.bulan - 1]} {data.tahun}</p>
            <hr className="my-3" />
          </div>

          {/* Kartu Ringkasan */}
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 mb-6 print:grid-cols-4 print:gap-2">
            {[
              { label: 'Saldo Awal',      value: data.saldo_awal,          color: 'text-gray-900 dark:text-white'             },
              { label: 'Total Pemasukan', value: data.total_pemasukan,     color: 'text-green-600 dark:text-green-400'        },
              { label: 'Total Pengeluaran', value: data.total_pengeluaran, color: 'text-red-600 dark:text-red-400'            },
              { label: 'Saldo Akhir',     value: data.saldo_akhir,         color: data.saldo_akhir >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600' },
            ].map(card => (
              <div key={card.label} className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-4 shadow-sm print:shadow-none print:border print:border-gray-300">
                <p className="text-xs font-semibold uppercase text-gray-400 mb-1">{card.label}</p>
                <p className={`text-lg font-extrabold ${card.color}`}>{formatRupiah(card.value)}</p>
              </div>
            ))}
          </div>

          {/* Breakdown per Kategori */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6 print:grid-cols-2 print:gap-4">
            {/* Pemasukan */}
            <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm print:shadow-none print:border-gray-300">
              <h4 className="text-sm font-bold text-green-600 uppercase mb-3">Rincian Pemasukan</h4>
              {Object.keys(data.breakdown_pemasukan).length === 0 ? (
                <p className="text-sm text-gray-400">Tidak ada pemasukan.</p>
              ) : Object.entries(data.breakdown_pemasukan).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{k}</span>
                  <span className="text-sm font-semibold text-green-600">{formatRupiah(v)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 mt-1">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Total</span>
                <span className="text-sm font-bold text-green-600">{formatRupiah(data.total_pemasukan)}</span>
              </div>
            </div>

            {/* Pengeluaran */}
            <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 p-5 shadow-sm print:shadow-none print:border-gray-300">
              <h4 className="text-sm font-bold text-red-600 uppercase mb-3">Rincian Pengeluaran</h4>
              {Object.keys(data.breakdown_pengeluaran).length === 0 ? (
                <p className="text-sm text-gray-400">Tidak ada pengeluaran.</p>
              ) : Object.entries(data.breakdown_pengeluaran).map(([k, v]) => (
                <div key={k} className="flex justify-between items-center py-1.5 border-b border-gray-100 dark:border-gray-700 last:border-0">
                  <span className="text-sm text-gray-700 dark:text-gray-300">{k}</span>
                  <span className="text-sm font-semibold text-red-600">{formatRupiah(v)}</span>
                </div>
              ))}
              <div className="flex justify-between items-center pt-2 mt-1">
                <span className="text-sm font-bold text-gray-700 dark:text-gray-300">Total</span>
                <span className="text-sm font-bold text-red-600">{formatRupiah(data.total_pengeluaran)}</span>
              </div>
            </div>
          </div>

          {/* Tabel Detail Transaksi */}
          <div className="rounded-xl border border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm print:shadow-none print:border-gray-300 overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700">
              <h4 className="text-sm font-bold text-gray-900 dark:text-white">Detail Transaksi — {BULAN_NAMES[data.bulan - 1]} {data.tahun}</h4>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500">
                  <tr>
                    <th className="px-5 py-3 text-left">No</th>
                    <th className="px-5 py-3 text-left">Tanggal</th>
                    <th className="px-5 py-3 text-left">Kategori</th>
                    <th className="px-5 py-3 text-left">Keterangan</th>
                    <th className="px-5 py-3 text-right">Pemasukan</th>
                    <th className="px-5 py-3 text-right">Pengeluaran</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {data.transaksi.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-gray-400">Tidak ada transaksi bulan ini.</td></tr>
                  ) : data.transaksi.map((t, i) => (
                    <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 print:hover:bg-white">
                      <td className="px-5 py-3 text-gray-400">{i + 1}</td>
                      <td className="px-5 py-3 whitespace-nowrap text-gray-700 dark:text-gray-300">
                        {new Date(t.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3 font-medium text-gray-900 dark:text-white">{t.kategori}</td>
                      <td className="px-5 py-3 text-gray-500 dark:text-gray-400">{t.keterangan || '-'}</td>
                      <td className="px-5 py-3 text-right font-semibold text-green-600">
                        {t.tipe === 'pemasukan' ? formatRupiah(Number(t.jumlah)) : ''}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-red-600">
                        {t.tipe === 'pengeluaran' ? formatRupiah(Number(t.jumlah)) : ''}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50 dark:bg-gray-700/50 border-t-2 border-gray-200 dark:border-gray-600 font-bold text-sm">
                  <tr>
                    <td colSpan={4} className="px-5 py-3 text-gray-700 dark:text-gray-300">TOTAL</td>
                    <td className="px-5 py-3 text-right text-green-600">{formatRupiah(data.total_pemasukan)}</td>
                    <td className="px-5 py-3 text-right text-red-600">{formatRupiah(data.total_pengeluaran)}</td>
                  </tr>
                  <tr>
                    <td colSpan={4} className="px-5 py-2 text-gray-600 dark:text-gray-400 text-xs">Saldo Akhir = Saldo Awal + Pemasukan - Pengeluaran</td>
                    <td colSpan={2} className={`px-5 py-2 text-right text-base ${data.saldo_akhir >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {formatRupiah(data.saldo_akhir)}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Footer Print */}
          <div className="hidden print:block mt-8 text-sm text-gray-600">
            <p>Dicetak pada: {new Date().toLocaleDateString('id-ID', { dateStyle: 'full' })}</p>
            <div className="mt-8 grid grid-cols-2 gap-8">
              <div className="text-center">
                <p className="mb-12">Mengetahui,</p>
                <p className="font-semibold border-t border-gray-400 pt-1">Pendeta / Majelis</p>
              </div>
              <div className="text-center">
                <p className="mb-12">Dibuat oleh,</p>
                <p className="font-semibold border-t border-gray-400 pt-1">Bendahara Gereja</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
