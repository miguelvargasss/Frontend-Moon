import { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../modules/auth/application/auth.store';
import './Navbar.css';

/**
 * Barra de navegación global — glassmorphism sticky top.
 *
 * - Muestra siempre: logo, link Tienda, carrito
 * - Si autenticado: avatar clickeable → dropdown con Mis Pedidos, Mi Cuenta,
 *   Panel Admin (solo admin) y Cerrar sesión
 * - Si no autenticado: botón "Ingresar"
 */
export default function Navbar() {
  const location = useLocation();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const isActive = (path: string) => location.pathname === path;

  // Close dropdown on route change
  useEffect(() => {
    setDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [dropdownOpen]);

  const handleLogout = async () => {
    setDropdownOpen(false);
    await logout();
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-inner">
        {/* Logo */}
        <Link to="/" className="navbar-logo">
          <svg className="navbar-logo-icon" width="32" height="32" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="16" stroke="#2dd4a8" strokeWidth="1.5" opacity="0.6" />
            <circle cx="18" cy="18" r="12" fill="#2dd4a8" opacity="0.15" />
            <path
              d="M24 18c0-3.314-2.686-6-6-6-1.5 0-2.87.553-3.92 1.464C15.68 11.308 18.5 10 21.6 10c4.862 0 8.4 3.538 8.4 8.4 0 3.1-1.308 5.92-3.464 7.52A5.974 5.974 0 0 0 24 18z"
              fill="#2dd4a8"
              opacity="0.8"
            />
          </svg>
          <div className="navbar-logo-text">
            <span className="navbar-logo-moon">moon</span>
            <span className="navbar-logo-phases">phases</span>
          </div>
        </Link>

        {/* Navigation Links — solo Tienda queda inline */}
        <div className="navbar-links">
          <Link
            to="/"
            className={`navbar-link ${isActive('/') ? 'navbar-link-active' : ''}`}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            </svg>
            Tienda
          </Link>
        </div>

        {/* Right Section */}
        <div className="navbar-actions">
          {/* Carrito — siempre visible */}
          <button className="navbar-cart" id="navbar-cart-btn" aria-label="Carrito de compras">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="8" cy="21" r="1" />
              <circle cx="19" cy="21" r="1" />
              <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
            </svg>
          </button>

          {isAuthenticated && user ? (
            <div className="navbar-user-wrapper" ref={dropdownRef}>
              {/* Avatar — clickeable, abre dropdown */}
              <button
                className="navbar-user-trigger"
                onClick={() => setDropdownOpen((prev) => !prev)}
                id="navbar-user-menu-btn"
                aria-expanded={dropdownOpen}
                aria-haspopup="true"
              >
                <div className="navbar-avatar">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <span className="navbar-username">{user.name}</span>
                <svg
                  className={`navbar-chevron ${dropdownOpen ? 'navbar-chevron-open' : ''}`}
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <polyline points="6,9 12,15 18,9" />
                </svg>
              </button>

              {/* Dropdown */}
              {dropdownOpen && (
                <div className="navbar-dropdown" id="navbar-user-dropdown">
                  <div className="navbar-dropdown-header">
                    <span className="navbar-dropdown-name">{user.name} {user.lastName}</span>
                    <span className="navbar-dropdown-email">{user.email}</span>
                  </div>

                  <div className="navbar-dropdown-divider" />

                  <Link to="/mis-pedidos" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M16 3H8a2 2 0 0 0-2 2v16l6-3 6 3V5a2 2 0 0 0-2-2z" />
                    </svg>
                    Mis Pedidos
                  </Link>

                  <Link to="/mi-cuenta" className="navbar-dropdown-item" onClick={() => setDropdownOpen(false)}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    Mi Cuenta
                  </Link>

                  {/* Panel Admin — solo si el usuario es admin */}
                  {user.role === 'admin' && (
                    <>
                      <div className="navbar-dropdown-divider" />
                      <Link to="/admin" className="navbar-dropdown-item navbar-dropdown-item-admin" onClick={() => setDropdownOpen(false)}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="3" width="7" height="7" rx="1" />
                          <rect x="14" y="3" width="7" height="7" rx="1" />
                          <rect x="3" y="14" width="7" height="7" rx="1" />
                          <rect x="14" y="14" width="7" height="7" rx="1" />
                        </svg>
                        Panel Admin
                      </Link>
                    </>
                  )}

                  <div className="navbar-dropdown-divider" />

                  <button className="navbar-dropdown-item navbar-dropdown-logout" onClick={handleLogout} id="navbar-logout-btn">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                      <polyline points="16,17 21,12 16,7" />
                      <line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link to="/login" className="navbar-login-btn" id="navbar-login-btn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
                <polyline points="10,17 15,12 10,7" />
                <line x1="15" y1="12" x2="3" y2="12" />
              </svg>
              Ingresar
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
