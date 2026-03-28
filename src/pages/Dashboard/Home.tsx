import { useEffect, useState } from "react";
import { Link } from "react-router";
import PageMeta from "../../components/common/PageMeta";
import ReactApexChart from "react-apexcharts";
import { useAuth } from "../../context/AuthContext";

const KEUANGAN_URL = 'https://gereja.eternity.my.id/api-gkii/keuangan.php';
const formatRupiah = (n: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

interface Jemaat {
  id: number;
  no_kk: string;
  nama_lengkap: string;
  hubungan_keluarga: string;
  jenis_kelamin: string;
  status_pernikahan: string;
  status_babtis: string;
  anggota_jemaat: string;
  seksi: string;
  kelompok_doa: string;
  tanggal_lahir: string;
  tanggal_perkawinan?: string;
  created_at?: string;
  nama_istri?: string; 
}

interface TrendData {
  key: string;
  label: string;
  jumlah: number;
}

// Interface baru untuk menyimpan detail Pria & Wanita
interface GenderStats {
  total: number;
  pria: number;
  wanita: number;
}

interface KeuanganSummary {
  saldo_total: number;
  pemasukan_bulan_ini: number;
  pengeluaran_bulan_ini: number;
  bulan_label: string;
}

export default function Home() {
  const { user, token } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [keuangan, setKeuangan] = useState<KeuanganSummary | null>(null);
  
  const [stats, setStats] = useState({
    totalJiwa: 0,
    totalKeluarga: 0,
    totalPria: 0,
    totalWanita: 0,
    totalBaptis: 0,
    anggotaTetap: 0,
    simpatisan: 0,
    baruBulanIni: 0,
  });

  // State yang diupdate untuk menampung data Pria & Wanita
  const [seksiData, setSeksiData] = useState<Record<string, GenderStats>>({});
  const [kelompokDoaData, setKelompokDoaData] = useState<Record<string, GenderStats>>({});
  
  const [statusNikahData, setStatusNikahData] = useState<Record<string, number>>({});
  const [komposisiKeluarga, setKomposisiKeluarga] = useState<Record<string, number>>({});
  const [ultahBulanIni, setUltahBulanIni] = useState<Jemaat[]>([]);
  const [annivBulanIni, setAnnivBulanIni] = useState<Jemaat[]>([]);
  const [trendPertumbuhan, setTrendPertumbuhan] = useState<TrendData[]>([]);
  
  const [demografiUmur, setDemografiUmur] = useState({
    pria: [0, 0, 0, 0, 0], 
    wanita: [0, 0, 0, 0, 0]
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Fetch keuangan summary hanya untuk admin
  useEffect(() => {
    if (!isAdmin || !token) return;
    fetch(`${KEUANGAN_URL}?action=dashboard`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(res => { if (res.status === 'success') setKeuangan(res.data); })
      .catch(console.error);
  }, [isAdmin, token]);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch("https://gereja.eternity.my.id/api-gkii/jemaat.php");
      const result = await response.json();

      if (result.status === "success") {
        const data: Jemaat[] = result.data;
        const now = new Date();
        const currentMonth = now.getMonth();
        const currentYear = now.getFullYear();
        
        let pria = 0, wanita = 0, baptis = 0, tetap = 0, simpat = 0, baruBulanIni = 0;
        const kkSet = new Set();
        
        // Objek untuk menampung data yang lebih detail
        const seksiCount: Record<string, GenderStats> = {};
        const kdCount: Record<string, GenderStats> = {};
        
        const nikahCount: Record<string, number> = {};
        const hkCount: Record<string, number> = {}; 
        const ultahList: Jemaat[] = [];
        const annivList: Jemaat[] = [];

        const dPria = [0, 0, 0, 0, 0];
        const dWanita = [0, 0, 0, 0, 0];

        const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Ags", "Sep", "Okt", "Nov", "Des"];
        const trendData: TrendData[] = [];
        const trendMap: Record<string, number> = {}; 

        for (let i = 5; i >= 0; i--) {
          const d = new Date(currentYear, currentMonth - i, 1);
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          trendData.push({ key: key, label: `${monthNames[d.getMonth()]} ${d.getFullYear()}`, jumlah: 0 });
          trendMap[key] = trendData.length - 1;
        }

        data.forEach((member) => {
          if (member.no_kk) kkSet.add(member.no_kk);
          if (member.jenis_kelamin === "Laki-Laki") pria++;
          if (member.jenis_kelamin === "Perempuan") wanita++;
          if (member.status_babtis === "Sudah Babtis") baptis++;
          if (member.anggota_jemaat === "Tetap") tetap++;
          if (member.anggota_jemaat === "Simpatisan") simpat++;

          // KALKULASI SEKSI (Dipecah Laki-laki & Perempuan)
          const seksi = member.seksi || "Lainnya";
          if (!seksiCount[seksi]) seksiCount[seksi] = { total: 0, pria: 0, wanita: 0 };
          seksiCount[seksi].total++;
          if (member.jenis_kelamin === "Laki-Laki") seksiCount[seksi].pria++;
          if (member.jenis_kelamin === "Perempuan") seksiCount[seksi].wanita++;
          
          // KALKULASI KELOMPOK DOA (Dipecah Laki-laki & Perempuan)
          const kd = member.kelompok_doa || "Lainnya";
          if (!kdCount[kd]) kdCount[kd] = { total: 0, pria: 0, wanita: 0 };
          kdCount[kd].total++;
          if (member.jenis_kelamin === "Laki-Laki") kdCount[kd].pria++;
          if (member.jenis_kelamin === "Perempuan") kdCount[kd].wanita++;

          const statusN = member.status_pernikahan || "Lainnya";
          nikahCount[statusN] = (nikahCount[statusN] || 0) + 1;

          const hk = member.hubungan_keluarga || "Lainnya";
          hkCount[hk] = (hkCount[hk] || 0) + 1;

          if (member.tanggal_lahir && member.tanggal_lahir !== "0000-00-00") {
            const tglArr = member.tanggal_lahir.split("-");
            const birthYear = parseInt(tglArr[0], 10);
            const birthMonth = parseInt(tglArr[1], 10);
            const age = currentYear - birthYear;

            if (birthMonth === currentMonth + 1) ultahList.push(member);

            let ageIndex = 0;
            if (age <= 12) ageIndex = 0;
            else if (age <= 25) ageIndex = 1;
            else if (age <= 40) ageIndex = 2;
            else if (age <= 60) ageIndex = 3;
            else ageIndex = 4;

            if (member.jenis_kelamin === "Laki-Laki") dPria[ageIndex]++;
            else if (member.jenis_kelamin === "Perempuan") dWanita[ageIndex]++;
          }

          if (member.tanggal_perkawinan && member.tanggal_perkawinan !== "0000-00-00" && member.hubungan_keluarga === "Kepala Keluarga" && member.status_pernikahan === "Sudah Menikah") {
            const annivMonth = parseInt(member.tanggal_perkawinan.split("-")[1], 10);
            if (annivMonth === currentMonth + 1) {
              const istri = data.find((w) => w.no_kk === member.no_kk && w.hubungan_keluarga === "Istri");
              annivList.push({
                ...member,
                nama_istri: istri ? istri.nama_lengkap : "Istri"
              });
            }
          }

          if (member.created_at && member.created_at !== "0000-00-00 00:00:00" && member.created_at !== null) {
            const datePart = member.created_at.split(" ")[0]; 
            const [yearStr, monthStr] = datePart.split("-"); 
            const cYear = parseInt(yearStr, 10);
            const cMonth = parseInt(monthStr, 10) - 1; 

            if (cYear === currentYear && cMonth === currentMonth) baruBulanIni++;
            const key = `${cYear}-${String(cMonth + 1).padStart(2, '0')}`;
            if (trendMap[key] !== undefined) trendData[trendMap[key]].jumlah += 1;
          }
        });

        ultahList.sort((a, b) => parseInt(a.tanggal_lahir.split("-")[2], 10) - parseInt(b.tanggal_lahir.split("-")[2], 10));
        annivList.sort((a, b) => parseInt((a.tanggal_perkawinan || "").split("-")[2], 10) - parseInt((b.tanggal_perkawinan || "").split("-")[2], 10));

        setStats({
          totalJiwa: data.length, totalKeluarga: kkSet.size, totalPria: pria, totalWanita: wanita,
          totalBaptis: baptis, anggotaTetap: tetap, simpatisan: simpat, baruBulanIni: baruBulanIni, 
        });

        setSeksiData(seksiCount);
        setKelompokDoaData(kdCount);
        setStatusNikahData(nikahCount);
        setKomposisiKeluarga(hkCount);
        setUltahBulanIni(ultahList);
        setAnnivBulanIni(annivList);
        setTrendPertumbuhan(trendData);
        setDemografiUmur({ pria: dPria, wanita: dWanita });
      }
    } catch (error) {
      console.error("Gagal mengambil data dashboard", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-16 w-16 animate-spin rounded-full border-4 border-solid border-primary border-t-transparent"></div>
      </div>
    );
  }

  // Cari angka tertinggi di Seksi untuk mengatur skala panjang Bar
  const maxSeksi = Math.max(1, ...Object.values(seksiData).map(s => s.total));

  const chartTextColors = '#9CA3AF';
  const gridColors = 'rgba(156, 163, 175, 0.1)';

  // ================= KONFIGURASI APEXCHARTS =================
  const trendOptions: any = {
    chart: { type: "area", fontFamily: "Inter, sans-serif", toolbar: { show: false }, zoom: { enabled: false }, foreColor: chartTextColors },
    colors: ["#3B82F6"], dataLabels: { enabled: false }, stroke: { curve: "smooth", width: 3 },
    xaxis: { categories: trendPertumbuhan.map((t) => t.label), axisBorder: { show: false }, axisTicks: { show: false } },
    fill: { type: "gradient", gradient: { shadeIntensity: 1, opacityFrom: 0.4, opacityTo: 0.05, stops: [0, 90, 100] } },
    grid: { borderColor: gridColors, strokeDashArray: 4 },
    tooltip: { theme: "dark", y: { formatter: (val: number) => val + " Jiwa" } }
  };

  const demografiOptions: any = {
    chart: { type: 'bar', stacked: true, fontFamily: "Inter, sans-serif", toolbar: { show: false }, foreColor: chartTextColors },
    colors: ['#3B82F6', '#EC4899'], 
    plotOptions: { bar: { horizontal: true, barHeight: '80%', borderRadius: 2 } },
    dataLabels: { enabled: false }, stroke: { width: 0 },
    grid: { borderColor: gridColors, strokeDashArray: 4 },
    xaxis: { categories: ['Balita/Anak', 'Remaja/Pemuda', 'Dewasa Awal', 'Dewasa Akhir', 'Lansia (>60)'], labels: { formatter: (val: number) => Math.abs(Math.round(val)) } },
    tooltip: { theme: "dark", y: { formatter: (val: number) => Math.abs(val) + " Jiwa" } },
    legend: { position: "top" }
  };

  const nikahOptions: any = {
    chart: { type: "donut", fontFamily: "Inter, sans-serif", foreColor: chartTextColors },
    labels: Object.keys(statusNikahData), colors: ["#3B82F6", "#22C55E", "#F59E0B", "#EF4444"], 
    plotOptions: { pie: { donut: { size: '75%' } } }, dataLabels: { enabled: false }, stroke: { show: false },
    legend: { position: "bottom" }, tooltip: { theme: "dark" }
  };

  const komposisiOptions: any = {
    chart: { type: "pie", fontFamily: "Inter, sans-serif", foreColor: chartTextColors },
    labels: Object.keys(komposisiKeluarga), colors: ["#8B5CF6", "#EC4899", "#14B8A6", "#F97316"], 
    dataLabels: { enabled: false }, stroke: { show: false },
    legend: { position: "bottom" }, tooltip: { theme: "dark" }
  };

  const baptisOptions: any = {
    chart: { type: 'radialBar', fontFamily: "Inter, sans-serif", foreColor: chartTextColors },
    colors: ['#0EA5E9'],
    plotOptions: { radialBar: { hollow: { size: '65%', background: 'transparent' }, track: { background: gridColors }, dataLabels: { name: { show: false }, value: { fontSize: '28px', fontWeight: 'bold', color: '#0EA5E9' } } } },
    labels: ['Sudah Baptis'],
  };

  // Jemaat yang ultah hari ini
  const todayDay = new Date().getDate();
  const ultahHariIni = ultahBulanIni.filter(m =>
    parseInt(m.tanggal_lahir.split('-')[2], 10) === todayDay
  );

  return (
    <>
      <PageMeta title="Dashboard Jemaat | CMS GKII" description="Ringkasan Statistik Data Jemaat Gereja" />

      {/* BANNER ULANG TAHUN HARI INI */}
      {ultahHariIni.length > 0 && (
        <div className="mb-6 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-400 p-4 shadow-md">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-3xl">🎂</span>
            <div>
              <p className="font-bold text-white text-sm">Ulang Tahun Hari Ini!</p>
              <p className="text-yellow-100 text-sm">
                {ultahHariIni.map(m => m.nama_lengkap).join(', ')}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* RINGKASAN KEUANGAN — Admin Only */}
      {isAdmin && keuangan && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">Ringkasan Keuangan — {keuangan.bulan_label}</h3>
            <Link to="/keuangan" className="text-xs text-brand-500 hover:text-brand-600 font-semibold">
              Dashboard Keuangan →
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-green-100 bg-green-50 dark:bg-green-500/10 dark:border-green-500/20 p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500 text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-green-700 dark:text-green-400 uppercase tracking-wide">Saldo Kas</p>
                <p className="text-lg font-extrabold text-green-700 dark:text-green-300">{formatRupiah(keuangan.saldo_total)}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-blue-100 bg-blue-50 dark:bg-blue-500/10 dark:border-blue-500/20 p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-500 text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wide">Pemasukan</p>
                <p className="text-lg font-extrabold text-blue-700 dark:text-blue-300">{formatRupiah(keuangan.pemasukan_bulan_ini)}</p>
              </div>
            </div>
            <div className="rounded-2xl border border-red-100 bg-red-50 dark:bg-red-500/10 dark:border-red-500/20 p-5 flex items-center gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500 text-white">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-semibold text-red-700 dark:text-red-400 uppercase tracking-wide">Pengeluaran</p>
                <p className="text-lg font-extrabold text-red-700 dark:text-red-300">{formatRupiah(keuangan.pengeluaran_bulan_ini)}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 1. KUMPULAN KARTU METRIK UTAMA */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-6 xl:grid-cols-4 mb-6">
        
        {/* Total Jiwa */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md dark:border-strokedark dark:bg-boxdark hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z" /></svg>
            </div>
            {stats.baruBulanIni > 0 && (
              <span className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-700 dark:bg-green-500/20 dark:text-green-400">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3 h-3"><path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" /></svg>
                {stats.baruBulanIni} Baru
              </span>
            )}
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.totalJiwa}</h4>
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Jiwa</span>
          </div>
        </div>

        {/* Total Keluarga */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md dark:border-strokedark dark:bg-boxdark hover:-translate-y-1 transition-transform duration-300">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>
          </div>
          <div>
            <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white">{stats.totalKeluarga}</h4>
            <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Kepala Keluarga</span>
          </div>
        </div>

        {/* Pria & Wanita */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md dark:border-strokedark dark:bg-boxdark hover:-translate-y-1 transition-transform duration-300">
          <div className="flex justify-between items-start mb-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7"><path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" /></svg>
            </div>
          </div>
          <div>
            <div className="flex gap-4">
              <div>
                <h4 className="text-2xl font-extrabold text-blue-600 dark:text-blue-400">{stats.totalPria}</h4>
                <span className="text-xs font-bold text-gray-500 uppercase">Pria</span>
              </div>
              <div className="w-px bg-gray-200 dark:bg-gray-700"></div>
              <div>
                <h4 className="text-2xl font-extrabold text-pink-500 dark:text-pink-400">{stats.totalWanita}</h4>
                <span className="text-xs font-bold text-gray-500 uppercase">Wanita</span>
              </div>
            </div>
          </div>
        </div>

        {/* Status Keanggotaan */}
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-md dark:border-strokedark dark:bg-boxdark flex flex-col justify-center hover:-translate-y-1 transition-transform duration-300">
          <h4 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-4">Status Keanggotaan</h4>
          <div className="mb-3">
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Tetap</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.anggotaTetap}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 dark:bg-gray-800 overflow-hidden">
              <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${stats.totalJiwa > 0 ? (stats.anggotaTetap / stats.totalJiwa) * 100 : 0}%` }}></div>
            </div>
          </div>
          <div>
            <div className="flex justify-between items-end mb-1">
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">Simpatisan</span>
              <span className="text-lg font-bold text-gray-900 dark:text-white">{stats.simpatisan}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-2 dark:bg-gray-800 overflow-hidden">
              <div className="bg-orange-500 h-2 rounded-full" style={{ width: `${stats.totalJiwa > 0 ? (stats.simpatisan / stats.totalJiwa) * 100 : 0}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. CHART BARIS PERTAMA (Tren & Piramida Umur) */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 mb-6">
        <div className="col-span-12 xl:col-span-7 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <h4 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">Tren Pertumbuhan Jemaat</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Pendaftaran jemaat baru dalam 6 bulan terakhir</p>
          <div className="-ml-4 -mr-2">
            <ReactApexChart options={trendOptions} series={[{ name: "Jemaat Baru", data: trendPertumbuhan.map((t) => t.jumlah) }]} type="area" height={280} />
          </div>
        </div>

        <div className="col-span-12 xl:col-span-5 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <h4 className="mb-1 text-xl font-bold text-gray-900 dark:text-white">Demografi Umur</h4>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Sebaran usia jemaat Pria & Wanita</p>
          <ReactApexChart options={demografiOptions} series={[{ name: 'Pria', data: demografiUmur.pria.map(v => -v) }, { name: 'Wanita', data: demografiUmur.wanita }]} type="bar" height={280} />
        </div>
      </div>

      {/* 3. CHART BARIS KEDUA (Seksi, Nikah, Komposisi Keluarga) */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 mb-6">
        
        {/* ==================================================== */}
        {/* DISTRIBUSI SEKSI (2 GARIS: PRIA & WANITA) */}
        {/* ==================================================== */}
        <div className="col-span-12 xl:col-span-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <h4 className="mb-6 text-lg font-bold text-gray-900 dark:text-white">Unsur / Kategorial</h4>
          <div className="flex flex-col gap-6">
            {Object.entries(seksiData).sort((a,b) => b[1].total - a[1].total).map(([nama, data], index) => {
              const lebarPria   = maxSeksi > 0 ? (data.pria   / maxSeksi) * 100 : 0;
              const lebarWanita = maxSeksi > 0 ? (data.wanita / maxSeksi) * 100 : 0;

              // Perkaria = khusus Laki-laki, Perkauan = khusus Perempuan
              const hanyaPria   = nama === 'Perkaria';
              const hanyaWanita = nama === 'Perkauan';
              const jumlahTampil = hanyaPria ? data.pria : hanyaWanita ? data.wanita : data.total;

              return (
                <div key={index}>
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{nama}</span>
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{jumlahTampil} Jiwa</span>
                  </div>

                  {/* Perkaria: hanya bar Laki-laki */}
                  {hanyaPria && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-blue-500 w-3">L</span>
                      <div className="w-full bg-blue-50 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${lebarPria}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-6 text-right">{data.pria}</span>
                    </div>
                  )}

                  {/* Perkauan: hanya bar Perempuan */}
                  {hanyaWanita && (
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold text-pink-500 w-3">P</span>
                      <div className="w-full bg-pink-50 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                        <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${lebarWanita}%` }}></div>
                      </div>
                      <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-6 text-right">{data.wanita}</span>
                    </div>
                  )}

                  {/* Seksi lain: tampilkan keduanya */}
                  {!hanyaPria && !hanyaWanita && (
                    <>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-bold text-blue-500 w-3">L</span>
                        <div className="w-full bg-blue-50 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${lebarPria}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-6 text-right">{data.pria}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-pink-500 w-3">P</span>
                        <div className="w-full bg-pink-50 dark:bg-gray-800 rounded-full h-1.5 overflow-hidden">
                          <div className="bg-pink-500 h-1.5 rounded-full" style={{ width: `${lebarWanita}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400 w-6 text-right">{data.wanita}</span>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* STATUS PERNIKAHAN */}
        <div className="col-span-12 md:col-span-6 xl:col-span-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark flex flex-col items-center">
          <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white self-start">Status Pernikahan</h4>
          <div className="flex-grow flex items-center justify-center w-full mt-4">
            <ReactApexChart options={nikahOptions} series={Object.values(statusNikahData)} type="donut" height={280} />
          </div>
        </div>

        {/* KOMPOSISI KELUARGA */}
        <div className="col-span-12 md:col-span-6 xl:col-span-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark flex flex-col items-center">
          <h4 className="mb-2 text-lg font-bold text-gray-900 dark:text-white self-start">Komposisi Keluarga</h4>
          <div className="flex-grow flex items-center justify-center w-full mt-4">
            <ReactApexChart options={komposisiOptions} series={Object.values(komposisiKeluarga)} type="pie" height={280} />
          </div>
        </div>

      </div>

      {/* 4. BARIS KETIGA (Kelompok Doa & Status Baptis) */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 mb-8">
         {/* ==================================================== */}
         {/* KELOMPOK DOA (DIPISAHKAN L & P) */}
         {/* ==================================================== */}
         <div className="col-span-12 md:col-span-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
            <h4 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Sebaran Kelompok Doa</h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {Object.entries(kelompokDoaData).sort((a,b) => b[1].total - a[1].total).slice(0, 4).map(([nama, data], index) => (
                <div key={index} className="rounded-xl border border-gray-100 p-4 bg-gray-50 dark:bg-gray-800/50 dark:border-gray-700 text-center flex flex-col justify-between">
                  <p className="text-xs text-gray-500 dark:text-gray-400 uppercase font-bold tracking-wider mb-1">{nama}</p>
                  <p className="text-3xl font-extrabold text-gray-800 dark:text-white mb-2">{data.total}</p>
                  
                  {/* Pemisah Pria & Wanita */}
                  <div className="flex justify-center items-center gap-3 mt-2 border-t border-gray-200 dark:border-gray-700 pt-2">
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-blue-500 leading-none">{data.pria}</span>
                      <span className="text-[9px] text-gray-400 font-semibold uppercase mt-1">Pria</span>
                    </div>
                    <div className="h-6 w-px bg-gray-300 dark:bg-gray-600"></div>
                    <div className="flex flex-col items-center">
                      <span className="text-lg font-bold text-pink-500 leading-none">{data.wanita}</span>
                      <span className="text-[9px] text-gray-400 font-semibold uppercase mt-1">Wanita</span>
                    </div>
                  </div>

                </div>
              ))}
            </div>
         </div>
         
         <div className="col-span-12 md:col-span-4 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark flex items-center justify-between">
            <div>
              <h4 className="text-lg font-bold text-gray-900 dark:text-white">Sudah Baptis</h4>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1"><span className="font-bold text-gray-800 dark:text-gray-200">{stats.totalBaptis}</span> dari {stats.totalJiwa} Jiwa</p>
            </div>
            <div className="w-24 h-24 -mr-4">
              <ReactApexChart options={baptisOptions} series={[Math.round((stats.totalBaptis / stats.totalJiwa) * 100) || 0]} type="radialBar" height={150} />
            </div>
          </div>
      </div>

      {/* 5. BAGIAN TABEL: ULANG TAHUN & HARI JADI PERNIKAHAN */}
      <div className="grid grid-cols-12 gap-4 md:gap-6 mb-10">
        
        {/* Tabel Ulang Tahun */}
        <div className="col-span-12 xl:col-span-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="mb-6">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>🎂</span> Ulang Tahun Bulan Ini
            </h4>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-4 font-bold">Nama Jemaat</th>
                  <th className="px-5 py-4 font-bold">Tanggal</th>
                  <th className="px-5 py-4 font-bold text-center">Usia Baru</th>
                </tr>
              </thead>
              <tbody>
                {ultahBulanIni.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-gray-500">Tidak ada yang berulang tahun bulan ini.</td></tr>
                ) : (
                  ultahBulanIni.map((member, idx) => {
                    const tglArr = member.tanggal_lahir.split("-");
                    return (
                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-900 dark:text-white">{member.nama_lengkap}</p>
                          <span className="text-xs text-gray-500">{member.seksi}</span>
                        </td>
                        <td className="px-5 py-4 font-medium">{`${tglArr[2]}/${tglArr[1]}`}</td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-500/20 dark:text-blue-400">
                            {new Date().getFullYear() - parseInt(tglArr[0], 10)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tabel Pernikahan */}
        <div className="col-span-12 xl:col-span-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm dark:border-strokedark dark:bg-boxdark">
          <div className="mb-6">
            <h4 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
              <span>💍</span> Hari Jadi Pernikahan Bulan Ini
            </h4>
          </div>
          <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-700">
            <table className="w-full text-left text-sm text-gray-600 dark:text-gray-400">
              <thead className="bg-gray-50 text-xs uppercase text-gray-700 dark:bg-gray-800 dark:text-gray-300 border-b border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="px-5 py-4 font-bold">Keluarga</th>
                  <th className="px-5 py-4 font-bold">Tgl Nikah</th>
                  <th className="px-5 py-4 font-bold text-center">Usia Nikah</th>
                </tr>
              </thead>
              <tbody>
                {annivBulanIni.length === 0 ? (
                  <tr><td colSpan={3} className="text-center py-8 text-gray-500">Tidak ada hari jadi pernikahan bulan ini.</td></tr>
                ) : (
                  annivBulanIni.map((member, idx) => {
                    const tglArr = (member.tanggal_perkawinan || "").split("-");
                    return (
                      <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition">
                        <td className="px-5 py-4">
                          <p className="font-bold text-gray-900 dark:text-white">Bpk. {member.nama_lengkap}</p>
                          <span className="text-xs text-gray-500">& Ibu {member.nama_istri}</span>
                        </td>
                        <td className="px-5 py-4 font-medium">{`${tglArr[2]}/${tglArr[1]}`}</td>
                        <td className="px-5 py-4 text-center">
                          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-pink-100 text-sm font-bold text-pink-700 dark:bg-pink-500/20 dark:text-pink-400">
                            {new Date().getFullYear() - parseInt(tglArr[0], 10)}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </>
  );
}