import React, { useEffect, useState } from 'react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
// Kita pakai icon bawaan template jika ada, atau SVG inline

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

  // Ganti URL ini sesuai folder API PHP kamu di XAMPP
  // Pastikan XAMPP (Apache & MySQL) sudah Start
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
        console.error("Error dari API:", result.message);
      }
    } catch (error) {
      console.error("Gagal koneksi ke server:", error);
    } finally {
      setLoading(false);
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
            <button className="inline-flex items-center justify-center gap-2.5 rounded-full bg-blue-600 px-10 py-4 text-center font-medium text-white hover:bg-blue-700 lg:px-8 xl:px-10">
              <span>+ Tambah Jemaat</span>
            </button>
          </div>

          <div className="flex flex-col">
            {/* Header Tabel */}
            <div className="grid grid-cols-3 rounded-sm bg-gray-100 dark:bg-gray-800 sm:grid-cols-5">
              <div className="p-2.5 xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-900 dark:text-gray-200">
                  Nama Lengkap
                </h5>
              </div>
              <div className="p-2.5 text-center xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-900 dark:text-gray-200">
                  Kategori
                </h5>
              </div>
              <div className="p-2.5 text-center xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-900 dark:text-gray-200">
                  Gender
                </h5>
              </div>
              <div className="hidden p-2.5 text-center sm:block xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-900 dark:text-gray-200">
                  No HP
                </h5>
              </div>
              <div className="hidden p-2.5 text-center sm:block xl:p-5">
                <h5 className="text-sm font-medium uppercase xsm:text-base text-gray-900 dark:text-gray-200">
                  Status
                </h5>
              </div>
            </div>

            {/* Isi Tabel (Looping Data dari Database) */}
            {loading ? (
              <div className="p-5 text-center text-gray-500">Mengambil data dari database...</div>
            ) : members.length === 0 ? (
              <div className="p-5 text-center text-gray-500">Belum ada data jemaat.</div>
            ) : (
              members.map((member, key) => (
                <div
                  className={`grid grid-cols-3 sm:grid-cols-5 ${
                    key === members.length - 1
                      ? ''
                      : 'border-b border-gray-200 dark:border-gray-800'
                  }`}
                  key={member.id}
                >
                  <div className="flex items-center gap-3 p-2.5 xl:p-5">
                    <div className="flex-shrink-0">
                      {/* Placeholder Avatar */}
                      <div className="h-9 w-9 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold">
                         {member.nama_lengkap.charAt(0)}
                      </div>
                    </div>
                    <p className="hidden text-black dark:text-white sm:block font-medium">
                      {member.nama_lengkap}
                    </p>
                  </div>

                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                    <span className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium 
                       ${member.kategori_jemaat === 'Sekolah Minggu' ? 'bg-success text-success' : 
                         member.kategori_jemaat === 'Lansia' ? 'bg-warning text-warning' : 'bg-primary text-primary'}`}>
                      {member.kategori_jemaat}
                    </span>
                  </div>

                  <div className="flex items-center justify-center p-2.5 xl:p-5">
                    <p className="text-black dark:text-white">
                      {member.jenis_kelamin === 'L' ? 'Pria' : 'Wanita'}
                    </p>
                  </div>

                  <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                    <p className="text-meta-3">{member.no_hp || '-'}</p>
                  </div>

                  <div className="hidden items-center justify-center p-2.5 sm:flex xl:p-5">
                    <p className={`inline-flex rounded-full bg-opacity-10 px-3 py-1 text-sm font-medium ${
                        member.status_keaktifan === 'Aktif' ? 'bg-success text-success' : 'bg-danger text-danger'
                    }`}>
                      {member.status_keaktifan}
                    </p>
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