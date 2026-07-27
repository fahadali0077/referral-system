'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function RegisterPage() {
  return (
    <Suspense fallback={<p>Loading...</p>}>
      <RegisterForm />
    </Suspense>
  );
}

function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    referralCode: params.get('ref') || '',
  });
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await apiFetch('/api/register', { method: 'POST', body: JSON.stringify(form) });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <h1>Register</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <input
        placeholder="Name"
        value={form.name}
        onChange={(e) => setForm({ ...form, name: e.target.value })}
        required
      />
      <input
        placeholder="Email"
        type="email"
        value={form.email}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        required
      />
      <input
        placeholder="Password"
        type="password"
        value={form.password}
        onChange={(e) => setForm({ ...form, password: e.target.value })}
        required
        minLength={8}
      />
      <input
        placeholder="Referral code (optional)"
        value={form.referralCode}
        onChange={(e) => setForm({ ...form, referralCode: e.target.value })}
      />
      <button type="submit">Register</button>
    </form>
  );
}
