import { Card, CardBody } from '@nextui-org/react';

/**
 * Placeholder page component for admin modules still under development.
 */
export default function AdminPlaceholderPage({
  title,
  icon,
}: {
  title: string;
  icon: string;
}) {
  return (
    <div>
      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-semibold text-foreground">
          <span>{icon}</span>
          {title}
        </h1>
        <p className="text-sm text-default-400 mt-1">Administración de {title.toLowerCase()}</p>
      </div>

      <div className="flex items-center justify-center py-12">
        <Card shadow="none" className="border border-default-200 max-w-md w-full">
          <CardBody className="items-center gap-4 py-8">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2dd4a8" strokeWidth="1.5" opacity="0.6">
              <rect x="3" y="3" width="7" height="9" rx="1" />
              <rect x="14" y="3" width="7" height="5" rx="1" />
              <rect x="14" y="12" width="7" height="9" rx="1" />
              <rect x="3" y="16" width="7" height="5" rx="1" />
            </svg>
            <div className="text-center">
              <h2 className="text-lg font-semibold text-foreground">Módulo en Construcción</h2>
              <p className="text-sm text-default-500 mt-2">Esta sección estará disponible próximamente.</p>
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
