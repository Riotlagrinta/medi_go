'use client';

import { useEffect } from 'react';
import NProgress from 'nprogress';
import { usePathname, useSearchParams } from 'next/navigation';

export default function NavigationProgressBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.configure({ showSpinner: false, speed: 400, minimum: 0.2 });
  }, []);

  useEffect(() => {
    // Terminer la barre quand le chemin change
    NProgress.done();

    // S'assurer que les liens déclenchent la barre (hack propre pour Next.js App Router)
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.href && anchor.href !== window.location.href && !anchor.target) {
        NProgress.start();
      }
    };

    window.addEventListener('click', handleClick);
    return () => {
      window.removeEventListener('click', handleClick);
      NProgress.done();
    };
  }, [pathname, searchParams]);

  return null;
}
