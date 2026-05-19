'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogout, apiRequest } from '@/lib/api';

type DisputeReview = {
  _id: string;
  rating?: number;
  comment?: string;
  dispute?: { status?: string; reason?: string };
  shop?: { name?: string };
  user?: { email?: string };
  updatedAt?: string;
};

export default function AdminDisputesPage() {
  const router = useRouter();
  const [reviews, setReviews] = useState<DisputeReview[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await apiRequest<{ data: DisputeReview[] }>('/admin/reviews/disputes');
      setReviews(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load disputes');
      router.push('/');
    }
  }, [router]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleLogout = () => {
    adminLogout();
    router.push('/');
  };

  return (
    <main style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Open review disputes</h1>
        <button className="btn btn-secondary" type="button" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <p style={{ color: '#94a3b8' }}>Read-only list. Resolve disputes in a future release.</p>

      {error ? <p style={{ color: '#f87171' }}>{error}</p> : null}

      <ul className="card" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
        {reviews.length === 0 ? (
          <li style={{ padding: '1rem', color: '#94a3b8' }}>No open disputes.</li>
        ) : (
          reviews.map((r) => (
            <li
              key={r._id}
              style={{
                padding: '1rem',
                borderBottom: '1px solid #334155',
              }}
            >
              <strong>Review {String(r._id).slice(-8)}</strong>
              {r.rating != null ? ` — ${r.rating}★` : ''}
              <div style={{ color: '#94a3b8', fontSize: '0.85rem', marginTop: '0.25rem' }}>
                Shop: {r.shop?.name || '—'} · User: {r.user?.email || '—'}
              </div>
              {r.dispute?.reason ? (
                <p style={{ margin: '0.5rem 0 0' }}>Reason: {r.dispute.reason}</p>
              ) : null}
              {r.comment ? (
                <p style={{ margin: '0.35rem 0 0', fontStyle: 'italic' }}>&ldquo;{r.comment}&rdquo;</p>
              ) : null}
            </li>
          ))
        )}
      </ul>
    </main>
  );
}
