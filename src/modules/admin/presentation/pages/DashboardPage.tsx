import underConstructionImg from '../../../../assets/under-construction.png';
import './DashboardPage.css';

/**
 * Dashboard del panel admin — módulo en construcción.
 * Muestra una imagen llamativa y un mensaje informativo.
 */
export default function DashboardPage() {
  return (
    <div className="admin-dashboard" id="admin-dashboard">
      <div className="admin-page-heading">
        <h1 className="admin-page-title">
          <span className="admin-page-title-icon">🌙</span>
          Dashboard
        </h1>
        <p className="admin-page-subtitle">Resumen general de MoonPhases</p>
      </div>

      <div className="dashboard-construction">
        <div className="dashboard-construction-card">
          <img
            src={underConstructionImg}
            alt="Módulo en construcción"
            className="dashboard-construction-img"
          />
          <div className="dashboard-construction-text">
            <h2 className="dashboard-construction-title">Módulo en Construcción</h2>
            <p className="dashboard-construction-desc">
              Estamos trabajando en este módulo para brindarte la mejor experiencia.
              <br />
              Pronto tendrás acceso a métricas, reportes y mucho más.
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
