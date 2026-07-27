'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiFetch } from '@/lib/api';

type Dashboard = {
  referralCode: string;
  points: number;
  referredUsers: { name: string; email: string; createdAt: string }[];
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<Dashboard | null>(null);
  const [copied, setCopied] = useState(false);
  const [referralLink, setReferralLink] = useState('');

  useEffect(() => {
    apiFetch('/api/dashboard')
      .then((d) => {
        setData(d);
        setReferralLink(`${window.location.origin}/register?ref=${d.referralCode}`);
      })
      .catch(() => router.push('/login'));
  }, [router]);

  if (!data) {
    return (
      <div className="loading-shell">
        <span className="spinner" />
        <span>Loading your dashboard...</span>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="dashboard-header">
        <span className="eyebrow">Dashboard</span>
        <h1>Your referrals</h1>
        <p style={{ marginTop: 6 }}>Share your link and track everyone who joins with it.</p>
      </div>

      <div className="stat-grid">
        <div className="card stat-card">
          <div className="stat-label">Referral code</div>
          <div className="stat-value badge-code">{data.referralCode}</div>
          <div className="referral-link-row">
            <div className="referral-link-box" title={referralLink}>
              {referralLink}
            </div>
            <button
              className={`btn ${copied ? 'btn-copied' : 'btn-secondary'}`}
              onClick={() => {
                navigator.clipboard.writeText(referralLink);
                setCopied(true);
              }}
            >
              {copied ? 'Copied!' : 'Copy referral link'}
            </button>
          </div>
          {copied && (
            <div className="alert alert-success" style={{ marginTop: 14, marginBottom: 0 }}>
              <svg className="alert-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M16.7 5.3a1 1 0 010 1.4l-8 8a1 1 0 01-1.4 0l-4-4a1 1 0 111.4-1.4L8 12.6l7.3-7.3a1 1 0 011.4 0z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Link copied to your clipboard.</span>
            </div>
          )}
        </div>

        <div className="card stat-card">
          <div className="stat-label">Total points</div>
          <div className="stat-value">{data.points}</div>
          <div className="badge" style={{ marginTop: 16 }}>
            {data.referredUsers.length} friend{data.referredUsers.length === 1 ? '' : 's'} referred
          </div>
        </div>
      </div>

      <div className="card card-padded">
        <div className="section-title-row">
          <h2>Referred users</h2>
        </div>

        {data.referredUsers.length === 0 ? (
          <div className="empty-state">
            <h3>No referrals yet</h3>
            <p>Share your referral link above to start earning points.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {data.referredUsers.map((u, i) => (
                  <tr key={i}>
                    <td data-label="Name">{u.name}</td>
                    <td data-label="Email">{u.email}</td>
                    <td data-label="Joined">{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
