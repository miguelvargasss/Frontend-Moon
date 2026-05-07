import { Card, CardBody } from '@nextui-org/react';
import underConstructionImg from '../../../../assets/under-construction.png';

/**
 * Dashboard del panel admin — módulo en construcción.
 */
export default function DashboardPage() {
  return (
    <div id="admin-dashboard">
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
          <span className="text-primary">🌙</span>
          Dashboard
        </h1>
        <p className="text-sm text-default-400 mt-1">Resumen general de MoonPhases</p>
      </div>

      <div className="flex items-center justify-center py-12">
        <Card shadow="none" className="border border-default-200 max-w-lg w-full">
          <CardBody className="items-center gap-4 py-8">
            <img
              src={underConstructionImg}
              alt="Módulo en construcción"
              className="w-full max-w-[320px] h-auto rounded-lg"
            />
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">Módulo en Construcción</h2>
              <p className="text-sm text-default-500 mt-2 leading-relaxed">
                Estamos trabajando en este módulo para brindarte la mejor experiencia.
                <br />
                Pronto tendrás acceso a métricas, reportes y mucho más.
              </p>
              <div className="flex items-center justify-center gap-2 mt-4">
                <span className="construction-dot" />
                <span className="construction-dot" />
                <span className="construction-dot" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
