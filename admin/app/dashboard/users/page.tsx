'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogout, apiRequest } from '@/lib/api';

type AdminUser = {
  _id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  role: string;
  isActive?: boolean;
};

export default function AdminUsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      const res = await apiRequest<{
        data: { users: AdminUser[]; total: number; page: number };
      }>(`/admin/users?${params.toString()}`);
      setUsers(res.data.users);
      setTotal(res.data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
      router.push('/');
    }
  }, [page, search, roleFilter, router]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleLogout = () => {
    adminLogout();
    router.push('/');
  };

  const handlePatchUser = async (userId: string, body: { role?: string; isActive?: boolean }) => {
    setBusyId(userId);
    setError('');
    try {
      await apiRequest(`/admin/users/${userId}`, {
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
        <h1 style={{ margin: 0 }}>Users</h1>
        <button className="btn btn-secondary" type="button" onClick={handleLogout}>
          Log out
        </button>
      </header>

      <form className="card" onSubmit={handleSearchSubmit} style={{ marginBottom: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div style={{ flex: '1 1 200px' }}>
          <label htmlFor="search" style={{ display: 'block', marginBottom: '0.25rem', color: '#94a3b8' }}>
            Search
          </label>
          <input
            id="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Email, username, name"
          />
        </div>
        <div style={{ minWidth: 140 }}>
          <label htmlFor="role" style={{ display: 'block', marginBottom: '0.25rem', color: '#94a3b8' }}>
            Role
          </label>
          <select
            id="role"
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            style={{ width: '100%', padding: '0.75rem', borderRadius: 8, border: '1px solid #334155', background: '#1e293b', color: '#f8fafc' }}
          >
            <option value="">All</option>
            <option value="customer">customer</option>
            <option value="shop_owner">shop_owner</option>
            <option value="admin">admin</option>
          </select>
        </div>
        <button className="btn" type="submit">
          Search
        </button>
      </form>

      {error ? <p style={{ color: '#f87171' }}>{error}</p> : null}

      <p style={{ color: '#94a3b8' }}>
        Showing {users.length} of {total} users (page {page})
      </p>

      <div className="card" style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
          <thead>
            <tr style={{ textAlign: 'left', borderBottom: '1px solid #334155' }}>
              <th style={{ padding: '0.5rem' }}>Email</th>
              <th style={{ padding: '0.5rem' }}>Role</th>
              <th style={{ padding: '0.5rem' }}>Active</th>
              <th style={{ padding: '0.5rem' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} style={{ borderBottom: '1px solid #334155' }}>
                <td style={{ padding: '0.5rem' }}>{u.email}</td>
                <td style={{ padding: '0.5rem' }}>{u.role}</td>
                <td style={{ padding: '0.5rem' }}>{u.isActive === false ? 'no' : 'yes'}</td>
                <td style={{ padding: '0.5rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={busyId === u._id || u.isActive !== false}
                      onClick={() => handlePatchUser(u._id, { isActive: true })}
                    >
                      Enable
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={busyId === u._id || u.isActive === false}
                      onClick={() => handlePatchUser(u._id, { isActive: false })}
                    >
                      Disable
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={busyId === u._id || u.role === 'customer'}
                      onClick={() => handlePatchUser(u._id, { role: 'customer' })}
                    >
                      → customer
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      disabled={busyId === u._id || u.role === 'shop_owner'}
                      onClick={() => handlePatchUser(u._id, { role: 'shop_owner' })}
                    >
                      → shop_owner
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        <button type="button" className="btn btn-secondary" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
          Previous
        </button>
        <button
          type="button"
          className="btn btn-secondary"
          disabled={page * 25 >= total}
          onClick={() => setPage((p) => p + 1)}
        >
          Next
        </button>
      </div>
    </main>
  );
}
