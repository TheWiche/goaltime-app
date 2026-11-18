import { ArrowRight } from "lucide-react";
import { useAuth } from "shared/context/AuthContext";
import { getHomePathForRole } from "shared/utils/url";
import { CtaLink, PitchLines, reveal } from "features/public/components/landing/primitives";

function FinalCta() {
  const { currentUser, userProfile } = useAuth();

  return (
    <section aria-labelledby="cta-title" className="relative overflow-hidden border-t border-zinc-800 bg-zinc-950 text-white">
      <PitchLines className="pointer-events-none absolute left-1/2 top-1/2 w-[1100px] max-w-none -translate-x-1/2 -translate-y-1/2 text-white/[0.07] sm:w-[1400px]" />
      <div className="relative mx-auto w-full max-w-7xl px-4 py-20 sm:border-x sm:border-zinc-800 sm:px-8 md:py-28 lg:px-12">
        <div className="max-w-4xl" {...reveal()}>
          <p className="font-mono text-xs text-zinc-400">Riohacha, La Guajira</p>
          <h2
            id="cta-title"
            className="mt-5 text-[2.25rem] font-bold leading-[1.03] tracking-[-0.04em] sm:text-6xl lg:text-[4.25rem]"
          >
            Tu próximo partido empieza <span className="text-zinc-400">con una reserva.</span>
          </h2>
          <p className="mt-6 max-w-xl text-base leading-7 text-zinc-300 sm:text-lg">
            Crea tu cuenta para ver las canchas publicadas y sus franjas libres, o para empezar a publicar la tuya.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            {currentUser ? (
              <CtaLink
                to={getHomePathForRole(userProfile?.role)}
                variant="light"
                rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
              >
                Ir a mi panel
              </CtaLink>
            ) : (
              <>
                <CtaLink
                  to="/authentication/sign-up"
                  variant="light"
                  rightIcon={<ArrowRight className="h-4 w-4" aria-hidden="true" />}
                >
                  Crear mi cuenta
                </CtaLink>
                <CtaLink to="/authentication/sign-in" variant="outlineDark">
                  Ya tengo cuenta
                </CtaLink>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default FinalCta;
