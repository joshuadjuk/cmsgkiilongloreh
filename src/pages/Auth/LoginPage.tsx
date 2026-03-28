import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/form/input/InputField';
import Button from '../../components/ui/button/Button';
import Label from '../../components/form/Label';
import { EyeCloseIcon, EyeIcon } from '../../icons';

export default function LoginPage() {
  const [username, setUsername]         = useState('');
  const [password, setPassword]         = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');
  const [isLoading, setIsLoading]       = useState(false);

  const { login } = useAuth();
  const navigate  = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      const loggedUser = await login(username, password);
      // Redirect sesuai role
      if (loggedUser.role === 'bendahara') {
        navigate('/keuangan', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login gagal. Coba lagi.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img
            className="dark:hidden h-10"
            src="/images/logo/logo.svg"
            alt="Logo GKII Longloreh"
          />
          <img
            className="hidden dark:block h-10"
            src="/images/logo/logo-dark.svg"
            alt="Logo GKII Longloreh"
          />
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-theme-md p-8 border border-gray-200 dark:border-gray-700">
          <div className="mb-6">
            <h1 className="text-title-sm font-semibold text-gray-800 dark:text-white/90 mb-1">
              Masuk ke Sistem
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Sistem Informasi Jemaat GKII Longloreh
            </p>
          </div>

          {/* Error alert */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-error-50 dark:bg-error-500/10 border border-error-200 dark:border-error-500/30 text-sm text-error-600 dark:text-error-400">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Username */}
            <div>
              <Label htmlFor="username">
                Username <span className="text-error-500">*</span>
              </Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Masukkan username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
              />
            </div>

            {/* Password */}
            <div>
              <Label htmlFor="password">
                Password <span className="text-error-500">*</span>
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Masukkan password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <span
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute z-30 -translate-y-1/2 cursor-pointer right-4 top-1/2"
                >
                  {showPassword ? (
                    <EyeIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  ) : (
                    <EyeCloseIcon className="fill-gray-500 dark:fill-gray-400 size-5" />
                  )}
                </span>
              </div>
            </div>

            {/* Submit */}
            <Button
              className="w-full justify-center"
              size="sm"
              disabled={isLoading || username === '' || password === ''}
            >
              {isLoading ? 'Memproses...' : 'Masuk'}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          &copy; {new Date().getFullYear()} GKII Longloreh. Semua hak dilindungi.
        </p>
      </div>
    </div>
  );
}
