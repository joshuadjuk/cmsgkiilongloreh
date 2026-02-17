import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

const TambahJemaat: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State Data sesuai Database Baru
  const [formData, setFormData] = useState({
    no_kk: '',
    nama_lengkap: '',
    hubungan_keluarga: 'Kepala Keluarga', // Default
    tempat_lahir: '',
    tanggal_lahir: '',
    jenis_kelamin: 'Laki-Laki',
    status_pernikahan: 'Belum Menikah',
    tanggal_perkawinan: '',
    status_babtis: 'Belum Babtis',
    anggota_jemaat: 'Tetap',
    seksi: 'Perkaria', // Default
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('http://localhost:8000/jemaat.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.status === 'success') {
        alert('Puji Tuhan! Data Jemaat Berhasil Ditambahkan.');
        navigate('/data-jemaat');
      } else {
        alert('Gagal: ' + result.message);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Terjadi kesalahan koneksi ke server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Tambah Jemaat Baru" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Formulir Data Jemaat
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6.5">
          
          {/* BAGIAN 1: IDENTITAS KELUARGA */}
          <div className="mb-6">
            <h4 className="mb-4 text-title-xs font-semibold text-black dark:text-white border-b pb-2">
              1. Identitas Keluarga
            </h4>
            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">
                  Nomor Kartu Keluarga (KK) <span className="text-meta-1">*</span>
                </label>
                <input
                  type="text"
                  name="no_kk"
                  required
                  placeholder="Contoh: 640201..."
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                  onChange={handleChange}
                />
                <p className="text-xs text-gray-500 mt-1">Gunakan No. KK yang sama untuk satu keluarga.</p>
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">
                  Hubungan Keluarga
                </label>
                <select
                  name="hubungan_keluarga"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  onChange={handleChange}
                >
                  <option value="Kepala Keluarga">Kepala Keluarga</option>
                  <option value="Istri">Istri</option>
                  <option value="Anak">Anak</option>
                  <option value="Famili Lain">Famili Lain</option>
                </select>
              </div>
            </div>
          </div>

          {/* BAGIAN 2: DATA PRIBADI */}
          <div className="mb-6">
            <h4 className="mb-4 text-title-xs font-semibold text-black dark:text-white border-b pb-2">
              2. Data Pribadi
            </h4>
            
            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Nama Lengkap <span className="text-meta-1">*</span>
              </label>
              <input
                type="text"
                name="nama_lengkap"
                required
                placeholder="Nama sesuai KTP"
                className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input"
                onChange={handleChange}
              />
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">
                  Tempat Lahir
                </label>
                <input
                  type="text"
                  name="tempat_lahir"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  onChange={handleChange}
                />
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">
                  Tanggal Lahir
                </label>
                <input
                  type="date"
                  name="tanggal_lahir"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Jenis Kelamin
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="jenis_kelamin" value="Laki-Laki" defaultChecked onChange={handleChange} className="w-4 h-4 text-primary" />
                  <span>Laki-Laki</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="jenis_kelamin" value="Perempuan" onChange={handleChange} className="w-4 h-4 text-primary" />
                  <span>Perempuan</span>
                </label>
              </div>
            </div>
          </div>

          {/* BAGIAN 3: STATUS GEREJAWI & PERNIKAHAN */}
          <div className="mb-6">
            <h4 className="mb-4 text-title-xs font-semibold text-black dark:text-white border-b pb-2">
              3. Status Gerejawi & Pernikahan
            </h4>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">
                  Status Pernikahan
                </label>
                <select name="status_pernikahan" className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input" onChange={handleChange}>
                  <option value="Belum Menikah">Belum Menikah</option>
                  <option value="Sudah Menikah">Sudah Menikah</option>
                  <option value="Janda">Janda</option>
                  <option value="Duda">Duda</option>
                </select>
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">
                  Tanggal Perkawinan (Jika Ada)
                </label>
                <input
                  type="date"
                  name="tanggal_perkawinan"
                  className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 font-medium outline-none transition focus:border-primary dark:border-form-strokedark dark:bg-form-input"
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">
                  Status Baptis
                </label>
                <select name="status_babtis" className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input" onChange={handleChange}>
                  <option value="Belum Babtis">Belum Babtis</option>
                  <option value="Sudah Babtis">Sudah Babtis</option>
                </select>
              </div>

              <div className="w-full xl:w-1/2">
                <label className="mb-2.5 block text-black dark:text-white">
                  Keanggotaan
                </label>
                <select name="anggota_jemaat" className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input" onChange={handleChange}>
                  <option value="Tetap">Tetap</option>
                  <option value="Simpatisan">Simpatisan</option>
                </select>
              </div>
            </div>

            <div className="mb-4.5">
              <label className="mb-2.5 block text-black dark:text-white">
                Seksi / Unsur Pelayanan
              </label>
              <div className="relative z-20 bg-transparent dark:bg-form-input">
                <select
                  name="seksi"
                  className="relative z-20 w-full appearance-none rounded border border-stroke bg-transparent px-5 py-3 outline-none transition focus:border-primary active:border-primary dark:border-form-strokedark dark:bg-form-input dark:focus:border-primary"
                  onChange={handleChange}
                >
                  <option value="Perkaria">Perkaria (Pria)</option>
                  <option value="Perkauan">Perkauan (Wanita)</option>
                  <option value="Remaja & Pemuda">Remaja & Pemuda</option>
                  <option value="Anak & Tunas Remaja">Anak & Tunas Remaja</option>
                  <option value="Lansia">Lansia</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90"
          >
            {loading ? 'Menyimpan...' : 'Simpan Data Jemaat'}
          </button>
        </form>
      </div>
    </>
  );
};

export default TambahJemaat;