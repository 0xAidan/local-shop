'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogin } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError('');

    try {
      await adminLogin(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '2rem' }}>
      <form className="card" style={{ width: '100%', maxWidth: 420 }} onSubmit={handleSubmit}>
        <h1 style={{ marginTop: 0 }}>LocalShop Admin</h1>
        <p style={{ color: '#94a3b8' }}>Platform operator sign-in</p>

        <label htmlFor="email" style={{ display: 'block', marginBottom: '0.5rem' }}>Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ marginBottom: '1rem' }}
        />

        <label htmlFor="password" style={{ display: 'block', marginBottom: '0.5rem' }}>Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ marginBottom: '1rem' }}
        />

        {error ? <p style={{ color: '#f87171' }}>{error}</p> : null}

        <button className="btn" type="submit" disabled={loading} style={{ width: '100%' }}>
          {loading ? 'Signing in…' : 'Sign in'}
        </button>
      </form>
    </main>
  );
}
