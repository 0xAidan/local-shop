import Link from 'next/link';

const navLinkStyle = { marginRight: '1rem', textDecoration: 'none' };

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <nav
        style={{
          padding: '0.75rem 2rem',
          borderBottom: '1px solid #334155',
          background: '#1e293b',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          flexWrap: 'wrap',
        }}
      >
        <Link href="/dashboard" style={navLinkStyle}>
          Dashboard
        </Link>
        <Link href="/dashboard/users" style={navLinkStyle}>
          Users
        </Link>
        <Link href="/dashboard/shops" style={navLinkStyle}>
          Shops
        </Link>
        <Link href="/dashboard/disputes" style={navLinkStyle}>
          Disputes
        </Link>
      </nav>
      {children}
    </>
  );
}
