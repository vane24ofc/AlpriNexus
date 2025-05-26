
import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  // Initialize to a default value (e.g., false for desktop-first rendering)
  // This value will be used on the server and the initial client render.
  const [isMobile, setIsMobile] = React.useState(false);
  const [hasMounted, setHasMounted] = React.useState(false);

  React.useEffect(() => {
    setHasMounted(true); // Indicate that the component has mounted on the client

    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => {
      setIsMobile(mql.matches);
    };

    // Set the initial value based on the media query on the client
    setIsMobile(mql.matches);

    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []); // Empty dependency array ensures this runs once on mount

  // On the server (or before hasMounted is true on client), return the default.
  // After mounting on the client, return the actual dynamically determined value.
  // This ensures server and initial client render are consistent.
  return hasMounted ? isMobile : false; 
}
