'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await apiFetch('/api/login', { method: 'POST', body: JSON.stringify(form) });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-viewport">
      <div className="card auth-card">
        <h1>Welcome back</h1>
        <p style={{ marginTop: 6, marginBottom: 28 }}>Log in to view your referrals and rewards.</p>

        {error && (
          <div className="alert alert-error" role="alert">
            <svg className="alert-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm.75-11a.75.75 0 00-1.5 0v4a.75.75 0 001.5 0V7zm-.75 7.25a.9.9 0 100-1.8.9.9 0 000 1.8z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              className="input"
              placeholder="you@example.com"
              type="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              className="input"
              placeholder="Your password"
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} />
                Logging in…
              </>
            ) : (
              'Log in'
            )}
          </button>
        </form>

        <p className="helper-text">
          Don&apos;t have an account? <a href="/register">Create one</a>
        </p>
      </div>
    </div>
  );
}
