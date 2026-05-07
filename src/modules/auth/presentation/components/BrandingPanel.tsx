import { Chip } from '@nextui-org/react';
import type { ReactNode } from 'react';
import MoonScene from './MoonScene';

interface BrandingPanelProps {
  children?: ReactNode;
}

/**
 * Panel de branding con la luna 3D, logo, slogan y categorías.
 * Se muestra a la izquierda en login, a la derecha en register.
 */
export default function BrandingPanel({ children }: BrandingPanelProps) {
  return (
    <div className="relative flex h-full min-h-[500px] flex-col items-center justify-center p-8">
      {/* Luna 3D + campo de estrellas como fondo del panel */}
      <div className="moon-scene-container">
        <MoonScene />
      </div>

      {/* Contenido de branding sobre la escena */}
      <div className="relative z-10 flex flex-col items-center gap-6 text-center">
        <div className="flex items-center gap-2">
          <svg width="40" height="40" viewBox="0 0 36 36" fill="none">
            <circle cx="18" cy="18" r="16" stroke="#2dd4a8" strokeWidth="1.5" opacity="0.6" />
            <circle cx="18" cy="18" r="12" fill="#2dd4a8" opacity="0.15" />
            <path
              d="M24 18c0-3.314-2.686-6-6-6-1.5 0-2.87.553-3.92 1.464C15.68 11.308 18.5 10 21.6 10c4.862 0 8.4 3.538 8.4 8.4 0 3.1-1.308 5.92-3.464 7.52A5.974 5.974 0 0 0 24 18z"
              fill="#2dd4a8"
              opacity="0.8"
            />
          </svg>
          <div className="flex flex-col leading-none">
            <span className="font-display text-lg font-semibold text-foreground tracking-tight">moon</span>
            <span className="font-display text-[0.7rem] font-normal text-primary tracking-[0.18em]">phases</span>
          </div>
        </div>

        <h2 className="font-display text-xl italic text-primary/80">
          &quot;Diseñamos lo que imaginas&quot;
        </h2>

        <p className="max-w-[260px] text-sm text-default-500 leading-relaxed">
          Productos personalizados únicos que cuentan tu historia bajo la luz de la luna.
        </p>

        <div className="flex flex-wrap justify-center gap-2">
          <Chip variant="bordered" size="sm" classNames={{ base: "border-primary/30", content: "text-default-400 text-xs" }}
            startContent={
              <svg className="text-primary/60" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.38 3.46 16 2 12 5.5 8 2 3.62 3.46 2 8l3.5 4L2 16l1.62 4.54L8 22l4-3.5 4 3.5 4.38-1.46L22 16l-3.5-4L22 8l-1.62-4.54z" />
              </svg>
            }
          >
            Polos &amp; Hoodies
          </Chip>
          <Chip variant="bordered" size="sm" classNames={{ base: "border-primary/30", content: "text-default-400 text-xs" }}
            startContent={
              <svg className="text-primary/60" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 8h1a4 4 0 1 1 0 8h-1" />
                <path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z" />
                <line x1="6" y1="2" x2="6" y2="4" />
                <line x1="10" y1="2" x2="10" y2="4" />
                <line x1="14" y1="2" x2="14" y2="4" />
              </svg>
            }
          >
            Tazas &amp; Vasos
          </Chip>
          <Chip variant="bordered" size="sm" classNames={{ base: "border-primary/30", content: "text-default-400 text-xs" }}
            startContent={
              <svg className="text-primary/60" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            }
          >
            Accesorios
          </Chip>
        </div>

        {children}
      </div>

      {/* Fases lunares decorativas */}
      <div className="relative z-10 mt-6 flex items-center gap-1.5">
        {[0, 0.15, 0.3, 0.5, 1, 0.5, 0.3, 0.15, 0].map((fill, i) => (
          <span key={i} className="branding-phase-dot" style={{ animationDelay: `${i * 0.12}s` }}>
            <svg width="12" height="12" viewBox="0 0 12 12">
              <circle cx="6" cy="6" r="5" stroke="rgba(45,212,168,0.3)" strokeWidth="0.5" fill="none" />
              <circle cx="6" cy="6" r="5" fill={`rgba(45,212,168,${fill * 0.6})`} />
            </svg>
          </span>
        ))}
      </div>
    </div>
  );
}
