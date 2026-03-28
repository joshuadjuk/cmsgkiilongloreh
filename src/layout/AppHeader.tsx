import { useEffect, useRef, useState, FormEvent } from "react";
import { Link, useNavigate } from "react-router";
import { useSidebar } from "../context/SidebarContext";
import { useAuth } from "../context/AuthContext";

const AUTH_URL = 'https://gereja.eternity.my.id/api-gkii/auth.php';

const roleLabel: Record<string, string> = {
  admin:       'Admin',
  sekretaris:  'Sekretaris',
  bendahara:   'Bendahara',
};

const roleBadgeClass: Record<string, string> = {
  admin:      'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  sekretaris: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  bendahara:  'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
};

const AppHeader: React.FC = () => {
  const [isApplicationMenuOpen, setApplicationMenuOpen] = useState(false);
  const [isUserMenuOpen, setUserMenuOpen]               = useState(false);
  const [showPwModal, setShowPwModal]                   = useState(false);
  const [oldPw, setOldPw]         = useState('');
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwError, setPwError]     = useState('');
  const [pwSuccess, setPwSuccess] = useState('');
  const [pwLoading, setPwLoading] = useState(false);

  const { isMobileOpen, toggleSidebar, toggleMobileSidebar } = useSidebar();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userMenuRef = useRef<HTMLDivElement>(null);
  const inputRef    = useRef<HTMLInputElement>(null);

  const handleToggle = () => {
    if (window.innerWidth >= 1024) {
      toggleSidebar();
    } else {
      toggleMobileSidebar();
    }
  };

  const toggleApplicationMenu = () => {
    setApplicationMenuOpen(!isApplicationMenuOpen);
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const openPwModal = () => {
    setOldPw(''); setNewPw(''); setConfirmPw('');
    setPwError(''); setPwSuccess('');
    setUserMenuOpen(false);
    setShowPwModal(true);
  };

  const handleGantiPassword = async (e: FormEvent) => {
    e.preventDefault();
    setPwError(''); setPwSuccess('');
    if (newPw !== confirmPw) { setPwError('Password baru dan konfirmasi tidak sama.'); return; }
    if (newPw.length < 6)    { setPwError('Password baru minimal 6 karakter.'); return; }
    setPwLoading(true);
    try {
      const res  = await fetch(AUTH_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ old_password: oldPw, new_password: newPw }),
      });
      const data = await res.json();
      if (!res.ok || data.status !== 'success') throw new Error(data.message);
      setPwSuccess('Password berhasil diubah!');
      setOldPw(''); setNewPw(''); setConfirmPw('');
    } catch (err) {
      setPwError(err instanceof Error ? err.message : 'Gagal mengubah password.');
    } finally {
      setPwLoading(false);
    }
  };

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key === "k") {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
    <header className="sticky top-0 flex w-full bg-white border-gray-200 z-99999 dark:border-gray-800 dark:bg-gray-900 lg:border-b">
      <div className="flex flex-col items-center justify-between grow lg:flex-row lg:px-6">
        <div className="flex items-center justify-between w-full gap-2 px-3 py-3 border-b border-gray-200 dark:border-gray-800 sm:gap-4 lg:justify-normal lg:border-b-0 lg:px-0 lg:py-4">
          {/* Sidebar toggle */}
          <button
            className="items-center justify-center w-10 h-10 text-gray-500 border-gray-200 rounded-lg z-99999 dark:border-gray-800 lg:flex dark:text-gray-400 lg:h-11 lg:w-11 lg:border"
            onClick={handleToggle}
            aria-label="Toggle Sidebar"
          >
            {isMobileOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z" fill="currentColor" />
              </svg>
            ) : (
              <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" clipRule="evenodd" d="M0.583252 1C0.583252 0.585788 0.919038 0.25 1.33325 0.25H14.6666C15.0808 0.25 15.4166 0.585786 15.4166 1C15.4166 1.41421 15.0808 1.75 14.6666 1.75L1.33325 1.75C0.919038 1.75 0.583252 1.41422 0.583252 1ZM0.583252 11C0.583252 10.5858 0.919038 10.25 1.33325 10.25L14.6666 10.25C15.0808 10.25 15.4166 10.5858 15.4166 11C15.4166 11.4142 15.0808 11.75 14.6666 11.75L1.33325 11.75C0.919038 11.75 0.583252 11.4142 0.583252 11ZM1.33325 5.25C0.919038 5.25 0.583252 5.58579 0.583252 6C0.583252 6.41421 0.919038 6.75 1.33325 6.75L7.99992 6.75C8.41413 6.75 8.74992 6.41421 8.74992 6C8.74992 5.58579 8.41413 5.25 7.99992 5.25L1.33325 5.25Z" fill="currentColor" />
              </svg>
            )}
          </button>

          {/* Mobile logo */}
          <Link to="/" className="lg:hidden">
            <img className="dark:hidden" src="./images/logo/logo.svg" alt="Logo" />
            <img className="hidden dark:block" src="./images/logo/logo-dark.svg" alt="Logo" />
          </Link>

          {/* Mobile 3-dots menu */}
          <button
            onClick={toggleApplicationMenu}
            className="flex items-center justify-center w-10 h-10 text-gray-700 rounded-lg z-99999 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 lg:hidden"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M5.99902 10.4951C6.82745 10.4951 7.49902 11.1667 7.49902 11.9951V12.0051C7.49902 12.8335 6.82745 13.5051 5.99902 13.5051C5.1706 13.5051 4.49902 12.8335 4.49902 12.0051V11.9951C4.49902 11.1667 5.1706 10.4951 5.99902 10.4951ZM17.999 10.4951C18.8275 10.4951 19.499 11.1667 19.499 11.9951V12.0051C19.499 12.8335 18.8275 13.5051 17.999 13.5051C17.1706 13.5051 16.499 12.8335 16.499 12.0051V11.9951C16.499 11.1667 17.1706 10.4951 17.999 10.4951ZM13.499 11.9951C13.499 11.1667 12.8275 10.4951 11.999 10.4951C11.1706 10.4951 10.499 11.1667 10.499 11.9951V12.0051C10.499 12.8335 11.1706 13.5051 11.999 13.5051C12.8275 13.5051 13.499 12.8335 13.499 12.0051V11.9951Z" fill="currentColor" />
            </svg>
          </button>
        </div>

        {/* Right section: user info + logout */}
        <div
          className={`${
            isApplicationMenuOpen ? "flex" : "hidden"
          } items-center justify-between w-full gap-4 px-5 py-4 lg:flex shadow-theme-md lg:justify-end lg:px-0 lg:shadow-none`}
        >
          <div className="flex items-center gap-3">
            {user && (
              <div className="relative" ref={userMenuRef}>
                {/* User trigger button */}
                <button
                  onClick={() => setUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  {/* Avatar */}
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-brand-500 text-white text-sm font-semibold shrink-0">
                    {user.nama_lengkap.charAt(0).toUpperCase()}
                  </div>
                  {/* Name & role — visible on desktop */}
                  <div className="hidden lg:flex flex-col items-start">
                    <span className="text-sm font-medium text-gray-800 dark:text-white/90 leading-tight">
                      {user.nama_lengkap}
                    </span>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium leading-tight ${roleBadgeClass[user.role] ?? ''}`}>
                      {roleLabel[user.role] ?? user.role}
                    </span>
                  </div>
                  {/* Chevron */}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform hidden lg:block ${isUserMenuOpen ? 'rotate-180' : ''}`}
                    viewBox="0 0 20 20" fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Dropdown menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-1 w-52 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
                    {/* User info header */}
                    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-700">
                      <p className="text-sm font-medium text-gray-800 dark:text-white/90 truncate">
                        {user.nama_lengkap}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        @{user.username}
                      </p>
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${roleBadgeClass[user.role] ?? ''}`}>
                        {roleLabel[user.role] ?? user.role}
                      </span>
                    </div>
                    {/* Ganti Password */}
                    <button
                      onClick={openPwModal}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                      Ganti Password
                    </button>
                    {/* Logout */}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-error-600 dark:text-error-400 hover:bg-error-50 dark:hover:bg-error-500/10 transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Keluar
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>

    {/* Modal Ganti Password */}
    {showPwModal && (
      <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/50 px-4">
        <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-gray-800 shadow-xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Ganti Password</h3>
            <button onClick={() => setShowPwModal(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {pwError && (
            <div className="mb-4 rounded-lg bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/30 px-3 py-2.5 text-sm text-red-600 dark:text-red-400">
              {pwError}
            </div>
          )}
          {pwSuccess && (
            <div className="mb-4 rounded-lg bg-green-50 dark:bg-green-500/10 border border-green-200 dark:border-green-500/30 px-3 py-2.5 text-sm text-green-600 dark:text-green-400">
              {pwSuccess}
            </div>
          )}

          <form onSubmit={handleGantiPassword} className="flex flex-col gap-4">
            {(['Password Lama', 'Password Baru', 'Konfirmasi Password Baru'] as const).map((label, i) => {
              const val   = [oldPw, newPw, confirmPw][i];
              const setFn = [setOldPw, setNewPw, setConfirmPw][i];
              return (
                <div key={label}>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">{label}</label>
                  <input
                    type="password"
                    value={val}
                    onChange={e => setFn(e.target.value)}
                    required
                    className="h-10 w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
                  />
                </div>
              );
            })}
            <div className="flex gap-3 pt-1">
              <button type="button" onClick={() => setShowPwModal(false)}
                className="flex-1 py-2.5 rounded-lg border border-gray-300 dark:border-gray-600 text-sm font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Batal
              </button>
              <button type="submit" disabled={pwLoading}
                className="flex-1 py-2.5 rounded-lg bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-sm font-semibold text-white">
                {pwLoading ? 'Menyimpan...' : 'Simpan'}
              </button>
            </div>
          </form>
        </div>
      </div>
    )}
    </>
  );
};

export default AppHeader;
