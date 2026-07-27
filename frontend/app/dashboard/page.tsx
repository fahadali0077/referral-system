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

  if (!data) return <p>Loading...</p>;

  return (
    <div>
      <h1>Dashboard</h1>
      <p>
        Referral code: <strong>{data.referralCode}</strong>
      </p>
      <button
        onClick={() => {
          navigator.clipboard.writeText(referralLink);
          setCopied(true);
        }}
      >
        {copied ? 'Copied!' : 'Copy referral link'}
      </button>
      <p>
        Total points: <strong>{data.points}</strong>
      </p>
      <h2>Referred Users</h2>
      <table>
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
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
