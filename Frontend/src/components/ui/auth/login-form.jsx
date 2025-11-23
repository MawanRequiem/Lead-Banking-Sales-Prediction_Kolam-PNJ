import React, { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'; // Untuk redirect
import axios from '@/lib/axios';

export default function LoginForm({ onSignIn }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Panggil API Login Backend
      const response = await axios.post('/auth/login', {
        email: email,
        password: password
      });

      // Ambil token dari response backend
      const { accessToken, refreshToken } = response.data.data;

      // PENTING: Simpan token agar bisa dipakai request selanjutnya
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);

      // Redirect ke halaman Assignments
      navigate('/assignments');

    } catch (error) {
      console.error("Login failed:", error);
      alert(error.response?.data?.message || "Login Gagal");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto my-6 p-6 bg-transparent">
      <h2 className="text-2xl font-semibold mb-4">Selamat Datang!</h2>

      <div className="mb-4">
        <label className="block text-sm mb-1">Email</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Masukkan Email Milikmu di Sini"
        />
      </div>

      <div className="mb-4 relative">
        <label className="block text-sm mb-1">Password</label>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Masukkan Password Milikmu di Sini"
          />
          <button
            type="button"
            aria-label={showPassword ? 'Hide password' : 'Show password'}
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <Button type="submit" variant="default" className="flex-1" disabled={loading}>
          {loading ? 'Signing...' : 'Sign In'}
        </Button>
      </div>
    </form>
  )
}
