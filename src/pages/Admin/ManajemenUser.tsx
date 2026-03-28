import { useEffect, useState, FormEvent } from 'react';
import PageMeta from '../../components/common/PageMeta';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import { useAuth } from '../../context/AuthContext';

const USERS_URL = 'https://gereja.eternity.my.id/api-gkii/users.php';

type UserRole = 'admin' | 'sekretaris' | 'bendahara';

interface AppUser {
  id: number;
  username: string;
  nama_lengkap: string;
  role: UserRole;
  is_active: number;
}

const roleBadge: Record<UserRole, string> = {
  admin:      'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400',
  sekretaris: 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400',
  bendahara:  'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-400',
};

const emptyForm = { username: '', nama_lengkap: '', role: 'sekretaris' as UserRole, password: '', new_password: '', is_active: 1 };

export default function ManajemenUser() {
  const { token, user: me } = useAuth();
  const [users, setUsers]   = useState<AppUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal]   = useState<'add' | 'edit' | null>(null);
  const [editTarget, setEditTarget] = useState<AppUser | null>(null);
  const [form, setForm]     = useState(emptyForm);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch(USERS_URL, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.status === 'success') setUsers(data.data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchUsers(); }, []);

  const openAdd = () => {
    setForm(emptyForm);
    setFormError('');
    setEditTarget(null);
    setModal('add');
  };

  const openEdit = (u: AppUser) => {
    setForm({ username: u.username, nama_lengkap: u.nama_lengkap, role: u.role, password: '', new_password: '', is_active: u.is_active });
    setFormError('');
    setEditTarget(u);
    setModal('edit');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (modal === 'add') {
        const res = await fetch(USERS_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ username: form.username, nama_lengkap: form.nama_lengkap, role: form.role, password: form.password }),
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') throw new Error(data.message);
      } else if (modal === 'edit' && editTarget) {
        const body: Record<string, unknown> = { nama_lengkap: form.nama_lengkap, role: form.role, is_active: form.is_active };
        if (form.new_password) body.new_password = form.new_password;
        const res = await fetch(`${USERS_URL}?id=${editTarget.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok || data.status !== 'success') throw new Error(data.message);
      }
      setModal(null);
      fetchUsers();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Terjadi kesalahan.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (u: AppUser) => {
    if (!confirm(`Hapus user "${u.nama_lengkap}"? Tindakan ini tidak bisa dibatalkan.`)) return;
    try {
      const res = await fetch(`${USERS_URL}?id=${u.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.status === 'success') fetchUsers();
      else alert(data.message);
    } catch { alert('Gagal menghapus user.'); }
  };

  return (
    <>
      <PageMeta title="Manajemen User | GKII Longloreh" description="Kelola akun pengguna" />
      <PageBreadcrumb pageTitle="Manajemen User" />

      <div className="rounded-2xl border border-gray-100 bg-white shadow-sm dark:border-gray-700 dark:bg-gray-800">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-gray-100 dark:border-gray-700">
          <h4 className="text-lg font-bold text-gray-900 dark:text-white">Daftar User</h4>
          <button onClick={openAdd}
            className="inline-flex items-center gap-2 rounded-lg bg-brand-500 hover:bg-brand-600 px-4 py-2 text-sm font-semibold text-white transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Tambah User
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs uppercase text-gray-500 dark:text-gray-400">
              <tr>
                <th className="px-6 py-3 text-left font-semibold">Nama</th>
                <th className="px-6 py-3 text-left font-semibold">Username</th>
                <th className="px-6 py-3 text-left font-semibold">Role</th>
                <th className="px-6 py-3 text-center font-semibold">Status</th>
                <th className="px-6 py-3 text-center font-semibold">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
              {loading ? (
                <tr><td colSpan={5} className="py-10 text-center text-gray-400">Memuat...</td></tr>
              ) : users.map(u => (
                <tr key={u.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    {u.nama_lengkap}
                    {u.id === me?.id && <span className="ml-2 text-xs text-gray-400">(Anda)</span>}
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">@{u.username}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${roleBadge[u.role]}`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                      u.is_active ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400' : 'bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400'
                    }`}>
                      {u.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button onClick={() => openEdit(u)}
                        className="rounded-lg p-1.5 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-500/10 transition-colors" title="Edit">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z" />
                        </svg>
                      </button>
                      {u.id !== me?.id && (
                        <button onClick={() => handleDelete(u)}
                          className="rounded-lg p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors" title="Hapus">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                          </svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add / Edit */}
      {modal && (
        <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                {modal === 'add' ? 'Tambah User' : 'Edit User'}
              </h3>
              <button onClick={() => setModal(null)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Nama Lengkap *</label>
                <input type="text" value={form.nama_lengkap} onChange={e => setForm(f => ({ ...f, nama_lengkap: e.target.value }))} required
                  className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              {modal === 'add' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Username *</label>
                  <input type="text" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required
                    className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Role *</label>
                <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value as UserRole }))}
                  className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                  <option value="sekretaris">Sekretaris</option>
                  <option value="bendahara">Bendahara</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              {modal === 'edit' && (
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">Status</label>
                  <select value={form.is_active} onChange={e => setForm(f => ({ ...f, is_active: Number(e.target.value) }))}
                    className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500">
                    <option value={1}>Aktif</option>
                    <option value={0}>Nonaktif</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                  {modal === 'add' ? 'Password *' : 'Password Baru (kosongkan jika tidak diubah)'}
                </label>
                <input type="password"
                  value={modal === 'add' ? form.password : form.new_password}
                  onChange={e => setForm(f => modal === 'add' ? { ...f, password: e.target.value } : { ...f, new_password: e.target.value })}
                  required={modal === 'add'}
                  className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500" />
              </div>

              <div className="flex gap-3 pt-1">
                <button type="button" onClick={() => setModal(null)}
                  className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                  Batal
                </button>
                <button type="submit" disabled={saving}
                  className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-sm font-semibold text-white">
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
