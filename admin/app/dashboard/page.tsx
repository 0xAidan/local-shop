'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminLogout, apiRequest } from '@/lib/api';

type Stats = {
  users: number;
  shops: number;
  orders: number;
  totalRevenue: number;
};

const StatCard = ({ label, value }: { label: string; value: string }) => (
  <div className="card">
    <p style={{ margin: 0, color: '#94a3b8' }}>{label}</p>
    <p style={{ margin: '0.25rem 0 0', fontSize: '1.5rem', fontWeight: 700 }}>{value}</p>
  </div>
);


export default function DashboardPage() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsRes, shopsRes, ordersRes] = await Promise.all([
          apiRequest<{ data: Stats }>('/admin/stats'),
          apiRequest<{ data: any[] }>('/admin/shops'),
          apiRequest<{ data: any[] }>('/admin/orders'),
        ]);
        setStats(statsRes.data);
        setShops(shopsRes.data);
        setOrders(ordersRes.data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load admin data');
        router.push('/');
      }
    };

    load();
  }, [router]);

  const handleLogout = () => {
    adminLogout();
    router.push('/');
  };

  return (
    <main style={{ padding: '2rem', maxWidth: 1200, margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h1 style={{ margin: 0 }}>Platform dashboard</h1>
        <button className="btn btn-secondary" type="button" onClick={handleLogout}>Log out</button>
      </header>

      {error ? <p style={{ color: '#f87171' }}>{error}</p> : null}

      {stats ? (
        <section className="grid" style={{ marginBottom: '1.5rem' }}>
          <StatCard label="Users" value={String(stats.users)} />
          <StatCard label="Shops" value={String(stats.shops)} />
          <StatCard label="Orders" value={String(stats.orders)} />
          <StatCard label="Revenue (paid)" value={`$${stats.totalRevenue.toFixed(2)}`} />
        </section>
      ) : null}

      <section className="card" style={{ marginBottom: '1.5rem' }}>
        <h2>Recent shops</h2>
        <ul>
          {shops.slice(0, 10).map((shop) => (
            <li key={shop._id}>
              {shop.name} — {shop.isVerified ? 'verified' : 'unverified'} — {shop.isActive ? 'active' : 'inactive'}
            </li>
          ))}
        </ul>
      </section>

      <section className="card">
        <h2>Recent orders</h2>
        <ul>
          {orders.slice(0, 10).map((order) => (
            <li key={order._id}>
              #{String(order._id).slice(-6)} — {order.shop?.name} — ${order.total} — {order.status} — {order.payment?.status}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
