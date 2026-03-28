import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useAuth } from '../../context/AuthContext';
import ReactApexChart from 'react-apexcharts';

const KEUANGAN_URL = 'https://gereja.eternity.my.id/api-gkii/keuangan.php';

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

interface Transaksi {
  id: number;
  tanggal: string;
  tipe: 'pemasukan' | 'pengeluaran';
  kategori: string;
  jumlah: number;
  keterangan: string | null;
  dicatat_oleh_nama: string;
}

interface DashboardData {
  saldo_total: number;
  pemasukan_bulan_ini: number;
  pengeluaran_bulan_ini: number;
  jumlah_transaksi_bulan_ini: number;
  bulan_label: string;
  transaksi_terakhir: Transaksi[];
}

interface TrendItem {
  bulan_key: string;
  label: string;
  pemasukan: number;
  pengeluaran: number;
}

interface SaldoAwal {
  jumlah: number;
  keterangan: string | null;
  bulan: number;
  tahun: number;
}

export default function DashboardKeuangan() {
  const { token } = useAuth();
  const now = new Date();

  const [data, setData]           = useState<DashboardData | null>(null);
  const [trend, setTrend]         = useState<TrendItem[]>([]);
  const [loading, setLoading]     = useState(true);

  // Saldo awal state
  const [saldoAwal, setSaldoAwal]         = useState<SaldoAwal | null>(null);
  const [showSaldoForm, setShowSaldoForm] = useState(false);
  const [saldoInput, setSaldoInput]       = useState('');
  const [saldoKet, setSaldoKet]           = useState('');
  const [saldoTahun, setSaldoTahun]       = useState(now.getFullYear());
  const [saldoLoading, setSaldoLoading]   = useState(false);
  const [saldoError, setSaldoError]       = useState('');
  const [saldoSuccess, setSaldoSuccess]   = useState('');

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [dashRes, trendRes, saldoRes] = await Promise.all([
        fetch(`${KEUANGAN_URL}?action=dashboard`, { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${KEUANGAN_URL}?action=trend`,     { headers: { Authorization: `Bearer ${token}` } }),
        fetch(`${KEUANGAN_URL}?action=saldo_awal&tahun=${now.getFullYear()}`, { headers: { Authorization: `Bearer ${token}` } }),
      ]);
      const [dashData, trendData, saldoData] = await Promise.all([dashRes.json(), trendRes.json(), saldoRes.json()]);
      if (dashData.status  === 'success') setData(dashData.data);
      if (trendData.status === 'success') setTrend(trendData.data);
      if (saldoData.status === 'success') setSaldoAwal(saldoData.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchAll(); }, [token]);

  const handleSimpanSaldo = async (e: FormEvent) => {
    e.preventDefault();
    setSaldoError(''); setSaldoSuccess('');
    const jumlah = Number(saldoInput.replace(/\D/g, ''));
    if (isNaN(jumlah) || jumlah < 0) { setSaldoError('Jumlah tidak valid.'); return; }
    setSaldoLoading(true);
    try {
      const fd = new FormData();
      fd.append('action', 'saldo_awal');
      fd.append('bulan', '1');
      fd.append('tahun', String(saldoTahun));
      fd.append('jumlah', String(jumlah));
      fd.append('keterangan', saldoKet);
      const res = await fetch(KEUANGAN_URL, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const result = await res.json();
      if (!res.ok || result.status !== 'success') throw new Error(result.message);
      setSaldoSuccess('Saldo awal berhasil disimpan.');
      setShowSaldoForm(false);
      fetchAll();
    } catch (err) {
      setSaldoError(err instanceof Error ? err.message : 'Gagal menyimpan.');
    } finally {
      setSaldoLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-brand-500 border-t-transparent" />
      </div>
    );
  }

  const saldo          = data?.saldo_total ?? 0;
  const pemasukanBulan = data?.pemasukan_bulan_ini ?? 0;
  const pengeluaranBulan = data?.pengeluaran_bulan_ini ?? 0;
  const jmlTransaksi   = data?.jumlah_transaksi_bulan_ini ?? 0;
  const transaksiList  = data?.transaksi_terakhir ?? [];

  // Chart config
  const chartOptions: ApexCharts.ApexOptions = {
    chart: { type: 'bar', fontFamily: 'Inter, sans-serif', toolbar: { show: false }, foreColor: '#9CA3AF' },
    colors: ['#22C55E', '#EF4444'],
    plotOptions: { bar: { columnWidth: '55%', borderRadius: 4 } },
    dataLabels: { enabled: false },
    xaxis: { categories: trend.map(t => t.label), axisBorder: { show: false }, axisTicks: { show: false } },
    yaxis: { labels: { formatter: (v) => formatRupiah(v) } },
    grid: { borderColor: 'rgba(156,163,175,0.1)', strokeDashArray: 4 },
    legend: { position: 'top' },
    tooltip: { theme: 'dark', y: { formatter: (v) => formatRupiah(v) } },
  };
  const chartSeries = [
    { name: 'Pemasukan',   data: trend.map(t => t.pemasukan) },
    { name: 'Pengeluaran', data: trend.map(t => t.pengeluaran) },
  ];

  const saldoFormatted = saldoInput ? new Intl.NumberFormat('id-ID').format(Number(saldoInput.replace(/\D/g, ''))) : '';

  return (
    <>
      <PageMeta title="Dashboard Keuangan | GKII Longloreh" description="Ringkasan keuangan gereja" />
      <PageBreadcrumb pageTitle="Dashboard Keuangan" />

      {/* Kartu Ringkasan */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4 mb-6">

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
            </svg>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Saldo Kas</p>
          <p className={`text-2xl font-extrabold ${saldo >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
            {formatRupiah(saldo)}
          </p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
            </svg>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Pemasukan Bulan Ini</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{formatRupiah(pemasukanBulan)}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
            </svg>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Pengeluaran Bulan Ini</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{formatRupiah(pengeluaranBulan)}</p>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400 mb-4">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 12h16.5m-16.5 3.75h16.5M3.75 19.5h16.5M5.625 4.5h12.75a1.875 1.875 0 0 1 0 3.75H5.625a1.875 1.875 0 0 1 0-3.75Z" />
            </svg>
          </div>
          <p className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-1">Transaksi Bulan Ini</p>
          <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{jmlTransaksi}</p>
        </div>
      </div>

      {/* Tombol Aksi Cepat */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Link to="/keuangan/tambah?tipe=pemasukan"
          className="inline-flex items-center gap-2 rounded-lg bg-green-500 hover:bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Catat Persembahan
        </Link>
        <Link to="/keuangan/tambah?tipe=pengeluaran"
          className="inline-flex items-center gap-2 rounded-lg bg-red-500 hover:bg-red-600 px-4 py-2.5 text-sm font-semibold text-white transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Catat Pengeluaran
        </Link>
        <Link to="/keuangan/laporan"
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
          </svg>
          Laporan Bulanan
        </Link>
      </div>

      {/* Grafik Trend + Saldo Awal */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mb-6">

        {/* Trend Chart */}
        <div className="xl:col-span-2 rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6">
          <h4 className="text-base font-bold text-gray-900 dark:text-white mb-4">Trend Keuangan 6 Bulan</h4>
          {trend.length > 0 ? (
            <ReactApexChart options={chartOptions} series={chartSeries} type="bar" height={240} />
          ) : (
            <div className="flex h-48 items-center justify-center text-gray-400 text-sm">Belum ada data transaksi.</div>
          )}
        </div>

        {/* Saldo Awal */}
        <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="text-base font-bold text-gray-900 dark:text-white">Saldo Awal Kas</h4>
            <button onClick={() => {
              setSaldoInput(saldoAwal ? String(Math.round(saldoAwal.jumlah)) : '');
              setSaldoKet(saldoAwal?.keterangan ?? '');
              setSaldoTahun(now.getFullYear());
              setSaldoError(''); setSaldoSuccess('');
              setShowSaldoForm(!showSaldoForm);
            }}
              className="text-xs text-brand-500 hover:text-brand-600 font-semibold">
              {showSaldoForm ? 'Tutup' : (saldoAwal ? 'Ubah' : 'Set')}
            </button>
          </div>

          {!showSaldoForm ? (
            <div>
              {saldoAwal ? (
                <>
                  <p className="text-2xl font-extrabold text-gray-900 dark:text-white">{formatRupiah(saldoAwal.jumlah)}</p>
                  <p className="text-xs text-gray-400 mt-1">Tahun {saldoAwal.tahun}</p>
                  {saldoAwal.keterangan && <p className="text-xs text-gray-500 mt-1">{saldoAwal.keterangan}</p>}
                </>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-gray-400 mb-2">Saldo awal belum diset.</p>
                  <p className="text-xs text-gray-400">Klik "Set" untuk mengisi saldo awal kas gereja.</p>
                </div>
              )}
              {saldoSuccess && <p className="mt-3 text-xs text-green-600 dark:text-green-400">{saldoSuccess}</p>}
            </div>
          ) : (
            <form onSubmit={handleSimpanSaldo} className="flex flex-col gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Tahun</label>
                <input type="number" value={saldoTahun} onChange={e => setSaldoTahun(Number(e.target.value))} min={2000} max={2099}
                  className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Jumlah (Rp)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-400">Rp</span>
                  <input type="text" inputMode="numeric" value={saldoFormatted}
                    onChange={e => setSaldoInput(e.target.value.replace(/\D/g, ''))}
                    placeholder="0"
                    className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 pl-8 pr-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Keterangan</label>
                <input type="text" value={saldoKet} onChange={e => setSaldoKet(e.target.value)} placeholder="Opsional"
                  className="h-9 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>
              {saldoError && <p className="text-xs text-red-500">{saldoError}</p>}
              <button type="submit" disabled={saldoLoading}
                className="w-full py-2 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-sm font-semibold text-white">
                {saldoLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Tabel 5 Transaksi Terakhir */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Transaksi Terakhir</h4>
          <Link to="/keuangan/transaksi" className="text-sm text-brand-500 hover:text-brand-600 font-medium">
            Lihat Semua →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Tanggal</th>
                <th className="px-6 py-3 text-left font-semibold">Kategori</th>
                <th className="px-6 py-3 text-left font-semibold">Keterangan</th>
                <th className="px-6 py-3 text-left font-semibold">Tipe</th>
                <th className="px-6 py-3 text-right font-semibold">Jumlah</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {transaksiList.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-10 text-center text-gray-400">Belum ada transaksi.</td></tr>
              ) : transaksiList.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                    {new Date(t.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{t.kategori}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">{t.keterangan || '-'}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      t.tipe === 'pemasukan'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      {t.tipe === 'pemasukan' ? '↑ Masuk' : '↓ Keluar'}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-right font-bold ${
                    t.tipe === 'pemasukan' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {t.tipe === 'pengeluaran' ? '-' : ''}{formatRupiah(Number(t.jumlah))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
