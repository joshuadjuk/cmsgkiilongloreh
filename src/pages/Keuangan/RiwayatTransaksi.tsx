import { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useAuth } from '../../context/AuthContext';

const KEUANGAN_URL = 'https://gereja.eternity.my.id/api-gkii/keuangan.php';
const PER_PAGE = 15;

const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

const BULAN_NAMES = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

interface Transaksi {
  id: number;
  tanggal: string;
  tipe: 'pemasukan' | 'pengeluaran';
  kategori: string;
  jumlah: number;
  keterangan: string | null;
  dicatat_oleh_nama: string;
  bukti_url: string | null;
}

export default function RiwayatTransaksi() {
  const { token } = useAuth();
  const navigate  = useNavigate();
  const now       = new Date();

  const [data, setData]               = useState<Transaksi[]>([]);
  const [totalPemasukan, setTotalP]   = useState(0);
  const [totalPengeluaran, setTotalK] = useState(0);
  const [loading, setLoading]         = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const [filterBulan, setFilterBulan] = useState(now.getMonth() + 1);
  const [filterTahun, setFilterTahun] = useState(now.getFullYear());
  const [filterTipe, setFilterTipe]   = useState('');

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        bulan: String(filterBulan),
        tahun: String(filterTahun),
      });
      if (filterTipe) params.append('tipe', filterTipe);

      const res = await fetch(`${KEUANGAN_URL}?${params}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.status === 'success') {
        setData(result.data.transaksi);
        setTotalP(result.data.total_pemasukan);
        setTotalK(result.data.total_pengeluaran);
        setCurrentPage(1);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [token, filterBulan, filterTahun, filterTipe]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleDelete = async (id: number) => {
    if (!confirm('Hapus transaksi ini?')) return;
    try {
      const res = await fetch(`${KEUANGAN_URL}?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.status === 'success') fetchData();
      else alert(result.message);
    } catch { alert('Gagal menghapus.'); }
  };

  // Pagination
  const totalPages = Math.ceil(data.length / PER_PAGE);
  const paged      = data.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  return (
    <>
      <PageMeta title="Riwayat Transaksi | GKII Longloreh" description="Daftar semua transaksi keuangan" />
      <PageBreadcrumb pageTitle="Riwayat Transaksi" />

      {/* Filter Bar */}
      <div className="flex flex-wrap gap-3 items-end mb-5 p-4 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Bulan</label>
          <select
            value={filterBulan}
            onChange={e => setFilterBulan(Number(e.target.value))}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white px-3 py-2 focus:outline-none"
          >
            {BULAN_NAMES.map((b, i) => (
              <option key={i} value={i + 1}>{b}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Tahun</label>
          <input
            type="number"
            value={filterTahun}
            onChange={e => setFilterTahun(Number(e.target.value))}
            className="w-24 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white px-3 py-2 focus:outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 mb-1">Tipe</label>
          <select
            value={filterTipe}
            onChange={e => setFilterTipe(e.target.value)}
            className="rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-800 dark:text-white px-3 py-2 focus:outline-none"
          >
            <option value="">Semua</option>
            <option value="pemasukan">Pemasukan</option>
            <option value="pengeluaran">Pengeluaran</option>
          </select>
        </div>
        <Link
          to="/keuangan/tambah"
          className="ml-auto inline-flex items-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Tambah
        </Link>
      </div>

      {/* Tabel */}
      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Tanggal</th>
                <th className="px-5 py-3 text-left font-semibold">Kategori</th>
                <th className="px-5 py-3 text-left font-semibold">Keterangan</th>
                <th className="px-5 py-3 text-center font-semibold">Tipe</th>
                <th className="px-5 py-3 text-right font-semibold">Jumlah</th>
                <th className="px-5 py-3 text-center font-semibold">Bukti</th>
                <th className="px-5 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={7} className="py-10 text-center text-gray-400">Memuat...</td></tr>
              ) : paged.length === 0 ? (
                <tr><td colSpan={7} className="py-10 text-center text-gray-400">Tidak ada transaksi pada periode ini.</td></tr>
              ) : paged.map(t => (
                <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-5 py-4 whitespace-nowrap text-gray-700 dark:text-gray-300">
                    {new Date(t.tanggal).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-4 font-medium text-gray-900 dark:text-white">{t.kategori}</td>
                  <td className="px-5 py-4 text-gray-500 dark:text-gray-400 max-w-xs">
                    <span className="line-clamp-1">{t.keterangan || '-'}</span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      t.tipe === 'pemasukan'
                        ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400'
                        : 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400'
                    }`}>
                      {t.tipe === 'pemasukan' ? '↑ Masuk' : '↓ Keluar'}
                    </span>
                  </td>
                  <td className={`px-5 py-4 text-right font-bold whitespace-nowrap ${
                    t.tipe === 'pemasukan' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {t.tipe === 'pengeluaran' ? '-' : ''}{formatRupiah(Number(t.jumlah))}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {t.bukti_url ? (
                      <a
                        href={t.bukti_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center w-8 h-8 rounded-lg text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                        title="Lihat bukti"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.8}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z" />
                        </svg>
                      </a>
                    ) : (
                      <span className="text-gray-300 dark:text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => navigate(`/keuangan/edit/${t.id}`)}
                        className="rounded-lg p-1.5 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleDelete(t.id)}
                        className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Hapus"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            {/* Footer total */}
            {!loading && data.length > 0 && (
              <tfoot className="bg-gray-50 dark:bg-gray-700/50 border-t-2 border-gray-200 dark:border-gray-600">
                <tr>
                  <td colSpan={3} className="px-5 py-3 text-xs font-bold uppercase text-gray-500">Total Periode</td>

                  <td className="px-5 py-3 text-center">
                    <span className="text-xs font-semibold text-green-600">{formatRupiah(totalPemasukan)}</span>
                    <span className="text-gray-400 mx-1">/</span>
                    <span className="text-xs font-semibold text-red-600">{formatRupiah(totalPengeluaran)}</span>
                  </td>
                  <td className={`px-5 py-3 text-right font-bold text-sm ${
                    (totalPemasukan - totalPengeluaran) >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {formatRupiah(totalPemasukan - totalPengeluaran)}
                  </td>
                  <td />
                  <td />
                </tr>
              </tfoot>
            )}
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-5 py-4 border-t border-gray-100 dark:border-gray-700">
            <p className="text-sm text-gray-500">{data.length} transaksi</p>
            <div className="flex gap-1">
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`w-8 h-8 rounded text-sm font-medium transition-colors ${
                    currentPage === i + 1
                      ? 'bg-brand-500 text-white'
                      : 'text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
