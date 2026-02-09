import React, { useEffect, useState } from 'react';
import { Link } from 'react-router'; 
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

interface Member {
  id: number;
  nama_lengkap: string;
  jenis_kelamin: string;
  kategori_jemaat: string;
  no_hp: string;
  status_keaktifan: string;
}

const DataJemaat: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Pastikan URL mengarah ke server PHP 8000
  const API_URL = 'http://localhost:8000/jemaat.php';

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch(API_URL);
      const result = await response.json();
      if (result.status === 'success') {
        setMembers(result.data);
      } else {
        console.error("Error API:", result.message);
      }
    } catch (error) {
      console.error("Koneksi gagal:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- FUNGSI HAPUS DATA ---
  const handleDelete = async (id: number) => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus data jemaat ini?")) return;

    try {
      // Mengirim request DELETE ke PHP
      const response = await fetch(`${API_URL}?id=${id}`, {
        method: 'DELETE',
      });
      const result = await response.json();

      if (result.status === 'success') {
        alert("Data berhasil dihapus!");
        fetchMembers(); // Refresh tabel otomatis
      } else {
        alert("Gagal menghapus: " + result.message);
      }
    } catch (error) {
      alert("Terjadi kesalahan koneksi.");
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Data Jemaat" />

      <div className="flex flex-col gap-10">
        <div className="rounded-2xl border border-gray-200 bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-gray-800 dark:bg-gray-900 sm:px-7.5 xl:pb-1">
          <div className="flex justify-between items-center mb-6">
            <h4 className="text-xl font-semibold text-gray-900 dark:text-white">
              Daftar Anggota Jemaat
            </h4>
            <Link 
              to="/data-jemaat/tambah"
              className="inline-flex items-center justify-center gap-2.5 rounded-lg bg-blue-600 px-6 py-2 text-center font-medium text-white hover:bg-blue-700"
            >
              <span>+ Tambah Jemaat</span>
            </Link>
          </div>

          <div className="flex flex-col">
            {/* Table Header */}
            <div className="grid grid-cols-3 rounded-sm bg-gray-100 dark:bg-gray-800 sm:grid-cols-6">
              <div className="p-2.5 xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-900 dark:text-gray-200">Nama Lengkap</h5>
              </div>
              <div className="p-2.5 text-center xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-900 dark:text-gray-200">Kategori</h5>
              </div>
              <div className="p-2.5 text-center xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-900 dark:text-gray-200">Gender</h5>
              </div>
              <div className="hidden p-2.5 text-center sm:block xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-900 dark:text-gray-200">No HP</h5>
              </div>
              <div className="hidden p-2.5 text-center sm:block xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-900 dark:text-gray-200">Status</h5>
              </div>
              {/* Kolom Baru untuk Aksi */}
              <div className="hidden p-2.5 text-center sm:block xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-900 dark:text-gray-200">Aksi</h5>
              </div>
            </div>

            {/* Table Rows */}
            {loading ? (
              <div className="p-5 text-center text-gray-500">Memuat data...</div>
            ) : members.length === 0 ? (
              <div className="p-5 text-center text-gray-500">Belum ada data jemaat.</div>
            ) : (
              members.map((member, key) => (
                <div
                  className={`grid grid-cols-3 sm:grid-cols-6 ${
                    key === members.length - 1 ? '' : 'border-b border-gray-200 dark:border-gray-800'
                  }`}
                  key={member.id}
                >
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <p className="text-black dark:text-white sm:block font-medium">{member.nama_lengkap}</p>
                  </div>

                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                    <span className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-xs font-medium 
                       ${member.kategori_jemaat === 'Sekolah Minggu' ? 'bg-green-500 text-green-500' : 'bg-blue-500 text-blue-500'}`}>
                      {member.kategori_jemaat}
                    </span>
                  </div>

                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                    <p className="text-gray-600 dark:text-gray-400">{member.jenis_kelamin === 'L' ? 'L' : 'P'}</p>
                  </div>

                  <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                    <p className="text-gray-600 dark:text-gray-400">{member.no_hp || '-'}</p>
                  </div>

                  <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                    <p className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${
                        member.status_keaktifan === 'Aktif' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                    }`}>
                      {member.status_keaktifan}
                    </p>
                  </div>

                  {/* Tombol Aksi Edit & Hapus */}
                  <div className="hidden items-center justify-center gap-2 p-2.5 sm:flex xl:p-5">
                    <Link 
                      to={`/data-jemaat/edit/${member.id}`}
                      className="hover:text-blue-600 text-gray-500"
                      title="Edit"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                      </svg>
                    </Link>
                    
                    <button 
                      onClick={() => handleDelete(member.id)}
                      className="hover:text-red-600 text-gray-500"
                      title="Hapus"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default DataJemaat;