import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Navbar as NextUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  Button,
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSection,
  Avatar,
} from '@nextui-org/react';
import { useAuthStore } from '../../modules/auth/application/auth.store';

/**
 * Barra de navegación global — glassmorphism sticky top.
 * Usa Dropdown de NextUI para eliminar toda la lógica manual de click-outside.
 * IMPORTANTE: Navegación via useNavigate (no href) para evitar full-page reloads.
 */
export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  /** Maneja la navegación desde los items del dropdown */
  const handleDropdownAction = (key: React.Key) => {
    switch (key) {
      case 'orders':
        navigate('/mis-pedidos');
        break;
      case 'account':
        navigate('/mi-cuenta');
        break;
      case 'admin':
        navigate('/admin');
        break;
      case 'logout':
        handleLogout();
        break;
    }
  };

  return (
    <NextUINavbar
      maxWidth="xl"
      isBordered
      id="main-navbar"
      classNames={{
        base: "bg-moon-bg/85 backdrop-blur-xl backdrop-saturate-150 border-b border-[--glass-border]",
        wrapper: "px-6",
      }}
    >
      {/* Logo */}
      <NavbarBrand as={Link} to="/" className="gap-2 no-underline">
        <svg className="drop-shadow-[0_0_8px_rgba(45,212,168,0.3)]" width="32" height="32" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="16" stroke="#2dd4a8" strokeWidth="1.5" opacity="0.6" />
          <circle cx="18" cy="18" r="12" fill="#2dd4a8" opacity="0.15" />
          <path d="M24 18c0-3.314-2.686-6-6-6-1.5 0-2.87.553-3.92 1.464C15.68 11.308 18.5 10 21.6 10c4.862 0 8.4 3.538 8.4 8.4 0 3.1-1.308 5.92-3.464 7.52A5.974 5.974 0 0 0 24 18z" fill="#2dd4a8" opacity="0.8" />
        </svg>
        <div className="flex flex-col leading-none">
          <span className="font-display text-[1.15rem] font-semibold text-foreground tracking-[-0.02em]">moon</span>
          <span className="font-display text-[0.7rem] font-normal text-primary tracking-[0.18em]">phases</span>
        </div>
      </NavbarBrand>

      {/* Center — Navigation Links */}
      <NavbarContent className="hidden sm:flex gap-1" justify="center">
        <NavbarItem>
          <Link
            to="/"
            className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg no-underline transition-colors ${
              isActive('/') ? 'text-primary bg-primary/10 font-semibold' : 'text-default-500 hover:text-foreground hover:bg-primary/[0.06]'
            }`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className={isActive('/') ? 'opacity-100' : 'opacity-70'}>
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            Tienda
          </Link>
        </NavbarItem>
      </NavbarContent>

      {/* Right Section */}
      <NavbarContent justify="end" className="gap-3">
        {/* Cart */}
        <NavbarItem>
          <Button
            as={Link}
            to="/carrito"
            isIconOnly
            variant="light"
            radius="lg"
            className="text-default-500 hover:text-foreground"
            id="navbar-cart-btn"
            aria-label="Carrito de compras"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="21" r="1" /><circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </Button>
        </NavbarItem>

        {isAuthenticated && user ? (
          <NavbarItem>
            <Dropdown placement="bottom-end" classNames={{
              content: "bg-moon-bg-secondary/95 backdrop-blur-xl border border-[--glass-border] shadow-[0_12px_40px_rgba(0,0,0,0.5),0_0_60px_rgba(45,212,168,0.04)]",
            }}>
              <DropdownTrigger>
                <button className="flex items-center gap-2 px-2 py-1 rounded-xl hover:bg-primary/[0.06] transition-colors cursor-pointer" id="navbar-user-menu-btn">
                  <Avatar
                    name={user.name?.charAt(0).toUpperCase()}
                    size="sm"
                    classNames={{
                      base: "bg-gradient-to-br from-primary to-green-400 text-background text-sm font-bold",
                    }}
                  />
                  <span className="hidden sm:block text-sm font-medium text-foreground max-w-[120px] truncate">{user.name}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-default-400 hidden sm:block">
                    <polyline points="6,9 12,15 18,9" />
                  </svg>
                </button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Menú de usuario"
                variant="flat"
                id="navbar-user-dropdown"
                onAction={handleDropdownAction}
              >
                <DropdownSection showDivider>
                  <DropdownItem key="profile-info" isReadOnly className="opacity-100 cursor-default">
                    <p className="text-sm font-semibold text-foreground">{user.name} {user.lastName}</p>
                    <p className="text-xs text-default-400">{user.email}</p>
                  </DropdownItem>
                </DropdownSection>
                <DropdownSection showDivider>
                  <DropdownItem key="orders" startContent={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 3H8a2 2 0 0 0-2 2v16l6-3 6 3V5a2 2 0 0 0-2-2z" /></svg>
                  }>
                    Mis Pedidos
                  </DropdownItem>
                  <DropdownItem key="account" startContent={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  }>
                    Mi Cuenta
                  </DropdownItem>
                </DropdownSection>
                {user.role === 'admin' ? (
                  <DropdownSection showDivider>
                    <DropdownItem key="admin" className="text-primary" startContent={
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
                    }>
                      Panel Admin
                    </DropdownItem>
                  </DropdownSection>
                ) : null!}
                <DropdownSection>
                  <DropdownItem key="logout" color="danger" id="navbar-logout-btn" startContent={
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16,17 21,12 16,7" /><line x1="21" y1="12" x2="9" y2="12" /></svg>
                  }>
                    Cerrar sesi&oacute;n
                  </DropdownItem>
                </DropdownSection>
              </DropdownMenu>
            </Dropdown>
          </NavbarItem>
        ) : (
          <NavbarItem>
            <Button
              as={Link}
              to="/login"
              color="primary"
              variant="solid"
              size="sm"
              className="font-semibold"
              id="navbar-login-btn"
              startContent={
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" /><polyline points="10,17 15,12 10,7" /><line x1="15" y1="12" x2="3" y2="12" />
                </svg>
              }
            >
              Ingresar
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>
    </NextUINavbar>
  );
}
