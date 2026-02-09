import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

const EditJemaat: React.FC = () => {
  const { id } = useParams(); // Ambil ID dari URL
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // State awal kosong
  const [formData, setFormData] = useState({
    id: '', // ID wajib dikirim balik untuk update
    nama_lengkap: '',
    nik: '',
    jenis_kelamin: 'L',
    tempat_lahir: '',
    tanggal_lahir: '',
    golongan_darah: '',
    no_hp: '',
    kategori_jemaat: 'Sekolah Minggu',
    status_baptis: 'Belum',
    status_nikah: 'Belum Menikah',
    pekerjaan: '',
    status_keaktifan: 'Aktif',
  });

  // Ambil Data Lama saat Halaman Dibuka
  useEffect(() => {
    const fetchOldData = async () => {
      try {
        const response = await fetch(`http://localhost:8000/jemaat.php?id=${id}`);
        const json = await response.json();
        
        if (json.status === 'success' && json.data) {
          // Isi form dengan data dari database
          setFormData(json.data);
        } else {
          alert("Data tidak ditemukan");
          navigate('/data-jemaat');
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchOldData();
  }, [id, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Perhatikan method-nya PUT
      const response = await fetch('http://localhost:8000/jemaat.php', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (result.status === 'success') {
        alert('Data Berhasil Diperbarui!');
        navigate('/data-jemaat');
      } else {
        alert('Gagal update: ' + result.message);
      }
    } catch (error) {
      alert('Error koneksi server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="Edit Data Jemaat" />
      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">Form Edit Data</h3>
        </div>
        <form onSubmit={handleSubmit} className="p-6.5">
          {/* Reuse form fields yang sama dengan TambahJemaat, value diambil dari formData */}
          
          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">Nama Lengkap</label>
              <input type="text" name="nama_lengkap" value={formData.nama_lengkap} onChange={handleChange} required className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input" />
            </div>
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">NIK</label>
              <input type="text" name="nik" value={formData.nik || ''} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input" />
            </div>
          </div>

          <div className="mb-4.5 flex flex-col gap-6 xl:flex-row">
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">Kategori</label>
              <select name="kategori_jemaat" value={formData.kategori_jemaat} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input">
                <option value="Sekolah Minggu">Sekolah Minggu</option>
                <option value="Pemuda-Remaja">Pemuda-Remaja</option>
                <option value="Perkaria">Perkaria</option>
                <option value="Perkawan">Perkawan</option>
                <option value="Lansia">Lansia</option>
              </select>
            </div>
            <div className="w-full xl:w-1/2">
              <label className="mb-2.5 block text-black dark:text-white">Status Keaktifan</label>
              <select name="status_keaktifan" value={formData.status_keaktifan} onChange={handleChange} className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 outline-none focus:border-primary dark:border-form-strokedark dark:bg-form-input">
                <option value="Aktif">Aktif</option>
                <option value="Pindah">Pindah</option>
                <option value="Meninggal">Meninggal</option>
                <option value="Disiplin">Disiplin</option>
              </select>
            </div>
          </div>

          <button type="submit" disabled={loading} className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90">
            {loading ? 'Menyimpan...' : 'Update Data'}
          </button>
        </form>
      </div>
    </>
  );
};

export default EditJemaat;