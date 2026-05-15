import * as React from "react";

const BREAKPOINT_MOVIL = 768;

export function useEsMovil() {
  const [esMovil, setEsMovil] = React.useState<boolean | undefined>(undefined);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${BREAKPOINT_MOVIL - 1}px)`);
    const onChange = () => {
      setEsMovil(window.innerWidth < BREAKPOINT_MOVIL);
    };
    mql.addEventListener("change", onChange);
    setEsMovil(window.innerWidth < BREAKPOINT_MOVIL);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return !!esMovil;
}

// Alias en inglés para la biblioteca de UI
export const useIsMobile = useEsMovil;
