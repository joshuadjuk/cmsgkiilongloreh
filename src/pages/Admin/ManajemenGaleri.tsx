import { useEffect, useRef, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

const GALERI_URL = 'https://gereja.eternity.my.id/api-gkii/galeri.php';

interface GaleriItem {
  id: number;
  judul: string | null;
  foto: string;
  urutan: number;
  foto_url: string;
}

interface FilePreview {
  file: File;
  preview: string;
}

function IcoPlus() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
function IcoTrash() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
    </svg>
  );
}
function IcoUpload() {
  return (
    <svg className="w-10 h-10 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
    </svg>
  );
}
function IcoX() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
    </svg>
  );
}

export default function ManajemenGaleri() {
  const { token } = useAuth();
  const [items, setItems]           = useState<GaleriItem[]>([]);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [previews, setPreviews]     = useState<FilePreview[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress]     = useState('');
  const [deleteId, setDeleteId]     = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const authHeader = { Authorization: `Bearer ${token}` };

  function load() {
    setLoading(true);
    fetch(GALERI_URL, { headers: authHeader })
      .then(r => r.json())
      .then(res => { if (res.status === 'success') setItems(res.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }

  useEffect(() => { load(); }, []);

  function openModal() {
    setPreviews([]);
    setProgress('');
    setShowModal(true);
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;

    const newPreviews: FilePreview[] = [];
    let loaded = 0;

    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => {
        newPreviews.push({ file, preview: ev.target?.result as string });
        loaded++;
        if (loaded === files.length) {
          setPreviews(prev => [...prev, ...newPreviews]);
        }
      };
      reader.readAsDataURL(file);
    });

    // Reset input so same files can be re-selected
    e.target.value = '';
  }

  function removePreview(idx: number) {
    setPreviews(prev => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!previews.length) { alert('Pilih minimal satu foto.'); return; }
    setSubmitting(true);

    let done = 0;
    let failed = 0;

    for (const { file } of previews) {
      setProgress(`Mengupload ${done + 1} / ${previews.length}...`);
      try {
        const fd = new FormData();
        fd.append('foto', file);
        const res  = await fetch(GALERI_URL, { method: 'POST', headers: authHeader, body: fd });
        const data = await res.json();
        if (data.status === 'success') done++;
        else failed++;
      } catch {
        failed++;
      }
    }

    setSubmitting(false);
    setProgress('');
    setShowModal(false);
    load();

    if (failed > 0) alert(`${done} foto berhasil, ${failed} gagal diupload.`);
  }

  async function handleDelete(id: number) {
    if (!confirm('Hapus foto ini dari galeri?')) return;
    setDeleteId(id);
    try {
      const res  = await fetch(`${GALERI_URL}?id=${id}`, { method: 'DELETE', headers: authHeader });
      const data = await res.json();
      if (data.status === 'success') load();
      else alert(data.message ?? 'Gagal menghapus.');
    } catch { alert('Terjadi kesalahan.'); }
    finally { setDeleteId(null); }
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Galeri Foto</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola foto-foto yang ditampilkan di galeri publik</p>
        </div>
        <button onClick={openModal}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-md">
          <IcoPlus /> Tambah Foto
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {Array.from({ length: 10 }).map((_, i) => (
            <div key={i} className="aspect-video bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20 text-gray-400">
          <IcoUpload />
          <p className="mt-3 font-medium">Belum ada foto di galeri</p>
          <p className="text-sm mt-1">Klik "Tambah Foto" untuk mengunggah foto pertama.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {items.map(item => (
            <div key={item.id} className="group relative aspect-video rounded-xl overflow-hidden bg-gray-100 shadow">
              <img src={item.foto_url} alt={item.judul ?? ''} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-2">
                {item.judul && (
                  <p className="text-white text-xs font-semibold text-center leading-tight line-clamp-2">{item.judul}</p>
                )}
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={deleteId === item.id}
                  className="inline-flex items-center gap-1.5 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-60">
                  <IcoTrash />
                  {deleteId === item.id ? 'Menghapus...' : 'Hapus'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal upload multi-foto */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl p-6 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-gray-900">Tambah Foto Galeri</h2>
              {previews.length > 0 && (
                <span className="text-sm text-gray-500">{previews.length} foto dipilih</span>
              )}
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4 min-h-0">
              {/* Drop zone */}
              <div
                className="border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50/30 transition-colors text-center py-8 text-gray-400"
                onClick={() => fileRef.current?.click()}>
                <IcoUpload />
                <p className="mt-2 text-sm font-medium text-gray-500">Klik untuk pilih foto</p>
                <p className="text-xs mt-1 text-gray-400">Bisa pilih banyak sekaligus · JPG, PNG, WebP · maks 5 MB/foto</p>
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={onFileChange}
              />

              {/* Preview grid */}
              {previews.length > 0 && (
                <div className="overflow-y-auto flex-1 min-h-0">
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {previews.map((p, idx) => (
                      <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-gray-100 group">
                        <img src={p.preview} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removePreview(idx)}
                          className="absolute top-1 right-1 bg-black/60 hover:bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-all">
                          <IcoX />
                        </button>
                      </div>
                    ))}
                    {/* Tombol tambah lagi */}
                    <div
                      className="aspect-video rounded-lg border-2 border-dashed border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 flex flex-col items-center justify-center cursor-pointer transition-colors text-gray-400 gap-1"
                      onClick={() => fileRef.current?.click()}>
                      <IcoPlus />
                      <span className="text-xs">Tambah</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress */}
              {progress && (
                <p className="text-sm text-blue-600 font-medium text-center animate-pulse">{progress}</p>
              )}

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setShowModal(false)} disabled={submitting}
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors">
                  Batal
                </button>
                <button type="submit" disabled={submitting || previews.length === 0}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors">
                  {submitting ? progress || 'Mengupload...' : `Upload ${previews.length > 0 ? previews.length + ' Foto' : ''}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
