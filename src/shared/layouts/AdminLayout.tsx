import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Avatar,
  Chip,
} from '@nextui-org/react';
import { useAuthStore } from '../../modules/auth/application/auth.store';
import { useLanguage } from '../../core/i18n/i18n';

/**
 * Layout del panel de administración.
 * Sidebar lateral con navegación + área de contenido principal.
 * Header con dropdown de usuario (NextUI Dropdown elimina lógica manual).
 */
export default function AdminLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const { t } = useLanguage();

  /** Sidebar navigation items for the admin panel */
  const sidebarItems = [
    {
      to: '/admin', label: t('admin.dashboard'), end: true,
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="9" rx="1" /><rect x="14" y="3" width="7" height="5" rx="1" /><rect x="14" y="12" width="7" height="9" rx="1" /><rect x="3" y="16" width="7" height="5" rx="1" /></svg>,
    },
    {
      to: '/admin/productos', label: t('admin.products'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>,
    },
    {
      to: '/admin/categorias', label: t('admin.categories'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 20h16a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2h-7.93a2 2 0 0 1-1.66-.9l-.82-1.2A2 2 0 0 0 7.93 3H4a2 2 0 0 0-2 2v13c0 1.1.9 2 2 2z" /></svg>,
    },
    {
      to: '/admin/pedidos', label: t('admin.orders'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" /><rect x="9" y="3" width="6" height="4" rx="1" /><path d="M9 14l2 2 4-4" /></svg>,
    },
    {
      to: '/admin/usuarios', label: t('admin.users'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
    },
    {
      to: '/admin/cupones', label: t('admin.coupons'),
      icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" /><path d="M13 5v2" /><path d="M13 17v2" /><path d="M13 11v2" /></svg>,
    },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  /** Handle dropdown navigation via onAction (not href) */
  const handleDropdownAction = (key: React.Key) => {
    switch (key) {
      case 'home':
        navigate('/');
        break;
      case 'orders':
        navigate('/mis-pedidos');
        break;
      case 'account':
        navigate('/mi-cuenta');
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  return (
    <div className="flex h-screen bg-background" id="admin-layout">
      {/* Sidebar */}
      <aside className="flex flex-col w-[260px] border-r border-[--glass-border] bg-moon-bg-secondary flex-shrink-0" id="admin-sidebar">
        <div className="flex flex-col flex-1 p-5 gap-6">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <svg aria-hidden="true" focusable="false" width="28" height="28" viewBox="0 0 36 36" fill="none" className="drop-shadow-[0_0_8px_rgba(45,212,168,0.3)]">
              <circle cx="18" cy="18" r="16" stroke="#99f6e4" strokeWidth="1.5" opacity="0.6" />
              <circle cx="18" cy="18" r="12" fill="#99f6e4" opacity="0.15" />
              <path d="M24 18c0-3.314-2.686-6-6-6-1.5 0-2.87.553-3.92 1.464C15.68 11.308 18.5 10 21.6 10c4.862 0 8.4 3.538 8.4 8.4 0 3.1-1.308 5.92-3.464 7.52A5.974 5.974 0 0 0 24 18z" fill="#99f6e4" opacity="0.8" />
            </svg>
            <div className="flex flex-col leading-none">
              <span className="font-display text-base font-semibold text-foreground">moon</span>
              <span className="font-display text-[0.6rem] text-primary tracking-[0.18em]">phases</span>
            </div>
            <Chip size="sm" variant="flat" color="primary" className="ml-auto text-xs">Admin</Chip>
          </div>

          {/* Nav */}
          <nav className="flex flex-col gap-1">
            {sidebarItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline ${
                    isActive
                      ? 'text-primary bg-primary/10'
                      : 'text-default-500 hover:text-foreground hover:bg-default-100/50'
                  }`
                }
              >
                <span className="flex-shrink-0 opacity-70">{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <header className="flex items-center justify-between h-16 px-6 border-b border-[--glass-border] bg-moon-bg/80 backdrop-blur-lg flex-shrink-0">
          <span className="text-sm font-medium text-default-500">{t('admin.panel')}</span>

          <Dropdown placement="bottom-end" classNames={{
            content: "bg-moon-bg-secondary/95 backdrop-blur-xl border border-[--glass-border] shadow-[0_12px_40px_rgba(0,0,0,0.5)]",
          }}>
            <DropdownTrigger>
              <button
                className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-primary/[0.06] transition-colors cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                id="admin-user-menu-btn"
                aria-label={`${t('nav.userMenu')} — ${user?.name}`}
                aria-haspopup="true"
              >
                <Avatar
                  name={user?.name?.charAt(0).toUpperCase()}
                  size="sm"
                  classNames={{ base: "bg-gradient-to-br from-primary to-green-400 text-background text-sm font-bold" }}
                />
                <span className="text-sm font-medium text-foreground">{user?.name}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-default-400"><polyline points="6,9 12,15 18,9" /></svg>
              </button>
            </DropdownTrigger>
            <DropdownMenu aria-label={t('nav.userMenu')} variant="flat" id="admin-user-dropdown" onAction={handleDropdownAction}>
              <DropdownSection showDivider>
                <DropdownItem key="info" isReadOnly className="opacity-100 cursor-default">
                  <p className="text-sm font-semibold text-foreground">{user?.name} {user?.lastName}</p>
                  <p className="text-xs text-default-400">{user?.email}</p>
                </DropdownItem>
              </DropdownSection>
              <DropdownSection showDivider>
                <DropdownItem key="home" startContent={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9,22 9,12 15,12 15,22" /></svg>
                }>{t('nav.home')}</DropdownItem>
                <DropdownItem key="orders" startContent={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8a2 2 0 0 0-2 2v16l6-3 6 3V5a2 2 0 0 0-2-2z" /></svg>
                }>{t('nav.orders')}</DropdownItem>
                <DropdownItem key="account" startContent={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                }>{t('nav.account')}</DropdownItem>
              </DropdownSection>
              <DropdownSection>
                <DropdownItem key="logout" color="danger" id="admin-logout-btn" startContent={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                }>{t('nav.logout')}</DropdownItem>
              </DropdownSection>
            </DropdownMenu>
          </Dropdown>
        </header>

        <main id="main-content" className="flex-1 overflow-y-auto p-6" tabIndex={-1}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
