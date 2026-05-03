import './DashboardPage.css';

/**
 * Placeholder page component for admin modules still under development.
 * Reuses the dashboard page heading styles.
 */
export default function AdminPlaceholderPage({
  title,
  icon,
}: {
  title: string;
  icon: string;
}) {
  return (
    <div className="admin-dashboard">
      <div className="admin-page-heading">
        <h1 className="admin-page-title">
          <span className="admin-page-title-icon">{icon}</span>
          {title}
        </h1>
        <p className="admin-page-subtitle">Administración de {title.toLowerCase()}</p>
      </div>

      <div className="dashboard-construction">
        <div className="dashboard-construction-card" style={{ maxWidth: 420 }}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2dd4a8" strokeWidth="1.5" opacity="0.6">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
          <div className="dashboard-construction-text">
            <h2 className="dashboard-construction-title">Módulo en Construcción</h2>
            <p className="dashboard-construction-desc">
              Esta sección estará disponible próximamente.
            </p>
            <div className="dashboard-construction-dots">
              <span className="construction-dot" />
              <span className="construction-dot" />
              <span className="construction-dot" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
