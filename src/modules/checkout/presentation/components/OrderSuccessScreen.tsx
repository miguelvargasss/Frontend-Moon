import { Button } from '@nextui-org/react';
import { Link } from 'react-router-dom';

interface OrderSuccessScreenProps {
  orderCode: string;
  whatsappUrl: string;
  pointsEarned?: number;
  totalPoints?: number;
}

export default function OrderSuccessScreen({ orderCode, whatsappUrl, pointsEarned = 0, totalPoints }: OrderSuccessScreenProps) {

  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center max-w-2xl mx-auto text-center px-4">
      {/* Icono de Check Animado */}
      <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mb-6 animate-appearance-in">
        <div className="w-16 h-16 bg-success rounded-full flex items-center justify-center shadow-lg shadow-success/30">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" className="animate-[scale-in_0.5s_ease-out]">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
      </div>

      <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3 font-serif tracking-tight flex items-center gap-2">
        ¡Pedido realizado! <span className="text-4xl">🌙</span>
      </h1>
      
      <p className="text-default-500 text-lg mb-4">
        Tu pedido ha sido registrado con éxito. Te notificaremos cuando esté en camino.
      </p>

      <div className="bg-content1/50 backdrop-blur-sm border border-default-200 px-6 py-3 rounded-xl mb-6">
        <p className="text-sm text-default-500">
          Código de seguimiento: <span className="font-bold text-foreground text-base tracking-wide ml-1">{orderCode}</span>
        </p>
      </div>

      {/* MoonPoints ganados */}
      {pointsEarned > 0 && (
        <div className="relative w-full max-w-md mb-8 overflow-hidden rounded-2xl border border-primary/30 bg-gradient-to-br from-primary/15 via-primary/5 to-transparent p-5 animate-appearance-in">
          <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-primary/20 blur-2xl" />
          <div className="relative flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center text-2xl shrink-0">
              ✨
            </div>
            <div className="text-left flex-1">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-primary mb-0.5">
                MoonPoints ganados
              </p>
              <p className="text-xl font-bold text-foreground">
                +{pointsEarned} <span className="text-sm font-medium text-default-500">puntos</span>
              </p>
              {typeof totalPoints === 'number' && (
                <p className="text-xs text-default-500 mt-1">
                  Saldo total: <span className="font-semibold text-foreground tabular-nums">{totalPoints}</span> ⭐
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Alerta de WhatsApp */}
      <div className="w-full mb-8">
        <div className="bg-[#25D366]/10 border border-[#25D366]/30 rounded-2xl p-5 md:p-6 text-left relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#25D366]/5 rounded-bl-full -z-10" />
          
          <div className="flex gap-4 items-start">
            <div className="w-10 h-10 bg-[#25D366]/20 rounded-full flex flex-shrink-0 items-center justify-center mt-1">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.5"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
            </div>
            <div>
              <h3 className="font-bold text-foreground mb-1 text-[#25D366]">Acelera tu compra</h3>
              <p className="text-sm text-default-600 mb-3 leading-relaxed">
                Su pedido se ha registrado correctamente. Si desea acelerar el proceso de su compra o coordinar la entrega más rápido, contáctese con nosotros directamente por WhatsApp.
              </p>
              <Button
                as="a"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-[#25D366] text-white font-semibold shadow-lg shadow-[#25D366]/30"
                startContent={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
                }
              >
                Coordinar por WhatsApp
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-2">
        <Button
          as={Link}
          to="/mis-pedidos"
          variant="flat"
          className="font-medium bg-default-100 hover:bg-default-200"
        >
          Ver mis pedidos
        </Button>
        <Button
          as={Link}
          to="/"
          variant="bordered"
          className="font-medium border-default-200 hover:border-default-400"
        >
          Seguir comprando
        </Button>
      </div>

      <style>{`
        @keyframes scale-in {
          0% { transform: scale(0); opacity: 0; }
          50% { transform: scale(1.2); }
          100% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
