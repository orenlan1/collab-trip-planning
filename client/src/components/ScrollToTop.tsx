import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface ScrollToTopProps {
  excludePaths?: string[];
}

export function ScrollToTop({ excludePaths = [] }: ScrollToTopProps) {
  const { pathname } = useLocation();

  useEffect(() => {
    const shouldExclude = excludePaths.some(path => pathname.includes(path));
    
    if (!shouldExclude) {
      window.scrollTo(0, 0);
    }
  }, [pathname, excludePaths]);

  return null;
}
