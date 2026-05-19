'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogout, apiRequest } from '@/lib/api';

type ShopRow = {
  _id: string;
  name: string;
  isActive?: boolean;
  isVerified?: boolean;
  owner?: { email?: string; firstName?: string; lastName?: string };
};

export default function AdminShopsPage() {
  const router = useRouter();
  const [shops, setShops] = useState<ShopRow[]>([]);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const res = await apiRequest<{ data: ShopRow[] }>('/admin/shops');
      setShops(res.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shops');
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

  const handlePatchShop = async (shopId: string, body: { isActive?: boolean; isVerified?: boolean }) => {
    setBusyId(shopId);
    setError('');
    try {
      await apiRequest(`/admin/shops/${shopId}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Shops</h1>
        <button className="btn btn-secondary" type="button" onClick={handleLogout}>
          Log out
        </button>
      </header>

      {error ? <p style={{ color: '#f87171' }}>{error}</p> : null}

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '0.5rem' }}>Name</th>
              <th style={{ padding: '0.5rem' }}>Owner</th>
              <th style={{ padding: '0.5rem' }}>Verified</th>
              <th style={{ padding: '0.5rem' }}>Active</th>
              <th style={{ padding: '0.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {shops.map((s) => (
              <tr key={s._id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '0.5rem' }}>{s.name}</td>
                <td style={{ padding: '0.5rem' }}>{s.owner?.email || '—'}</td>
                <td style={{ padding: '0.5rem' }}>{s.isVerified ? 'yes' : 'no'}</td>
                <td style={{ padding: '0.5rem' }}>{s.isActive === false ? 'no' : 'yes'}</td>
                <td style={{ padding: '0.5rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    <button
                      type="button"
                      className="btn"
                      disabled={busyId === s._id || s.isVerified}
                      onClick={() => handlePatchShop(s._id, { isVerified: true })}
                    >
                      Verify
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={busyId === s._id || !s.isVerified}
                      onClick={() => handlePatchShop(s._id, { isVerified: false })}
                    >
                      Unverify
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={busyId === s._id || s.isActive === false}
                      onClick={() => handlePatchShop(s._id, { isActive: false })}
                    >
                      Deactivate
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={busyId === s._id || s.isActive !== false}
                      onClick={() => handlePatchShop(s._id, { isActive: true })}
                    >
                      Activate
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
