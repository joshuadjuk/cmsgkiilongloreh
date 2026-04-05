import { BrowserRouter as Router, Routes, Route } from "react-router";
import NotFound from "./pages/OtherPage/NotFound";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import DataJemaat from './pages/Jemaat/DataJemaat';
import EditJemaat from './pages/Jemaat/EditJemaat';
import TambahJemaat from "./pages/Jemaat/TambahJemaat";
import DataKeluarga from './pages/Jemaat/DataKeluarga';
import DataKelompokDoa from './pages/Jemaat/DataKelompokDoa';
import DataSeksi from './pages/Jemaat/DataSeksi';
import LoginPage from "./pages/Auth/LoginPage";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import DashboardKeuangan from "./pages/Keuangan/DashboardKeuangan";
import TambahTransaksi from "./pages/Keuangan/TambahTransaksi";
import EditTransaksi from "./pages/Keuangan/EditTransaksi";
import RiwayatTransaksi from "./pages/Keuangan/RiwayatTransaksi";
import LaporanBulanan from "./pages/Keuangan/LaporanBulanan";
import ManajemenUser from "./pages/Admin/ManajemenUser";
import ManajemenKonten from "./pages/Admin/ManajemenKonten";
import ManajemenGaleri from "./pages/Admin/ManajemenGaleri";
import LandingPage from "./pages/LandingPage";

export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Sekretaris & Admin: Manajemen Jemaat */}
          <Route element={<ProtectedRoute allowedRoles={['sekretaris', 'admin']} />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Home />} />
              <Route path="/calendar" element={<Calendar />} />
              <Route path="/blank" element={<Blank />} />
              <Route path="/data-jemaat" element={<DataJemaat />} />
              <Route path="/data-jemaat/tambah" element={<TambahJemaat />} />
              <Route path="/data-jemaat/edit/:id" element={<EditJemaat />} />
              <Route path="/data-keluarga" element={<DataKeluarga />} />
              <Route path="/kelompok-doa/:kelompok" element={<DataKelompokDoa />} />
              <Route path="/seksi/:seksiParam" element={<DataSeksi />} />
              <Route path="/form-elements" element={<FormElements />} />
              <Route path="/basic-tables" element={<BasicTables />} />
            </Route>
          </Route>

          {/* Admin Only */}
          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin/users" element={<ManajemenUser />} />
            </Route>
          </Route>

          {/* Sekretaris & Admin: Konten Publik */}
          <Route element={<ProtectedRoute allowedRoles={['sekretaris', 'admin']} />}>
            <Route element={<AppLayout />}>
              <Route path="/konten" element={<ManajemenKonten />} />
              <Route path="/galeri" element={<ManajemenGaleri />} />
            </Route>
          </Route>

          {/* Bendahara & Admin: Keuangan */}
          <Route element={<ProtectedRoute allowedRoles={['bendahara', 'admin']} />}>
            <Route element={<AppLayout />}>
              <Route path="/keuangan" element={<DashboardKeuangan />} />
              <Route path="/keuangan/transaksi" element={<RiwayatTransaksi />} />
              <Route path="/keuangan/tambah" element={<TambahTransaksi />} />
              <Route path="/keuangan/edit/:id" element={<EditTransaksi />} />
              <Route path="/keuangan/laporan" element={<LaporanBulanan />} />
            </Route>
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
