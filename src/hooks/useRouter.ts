import { useState, useEffect, useCallback } from 'react';
import { RoutePath } from '../types';

export function useRouter() {
  const getPath = (): RoutePath => {
    const path = window.location.pathname as RoutePath;
    const validPaths: RoutePath[] = [
      '/',
      '/dashboard',
      '/candidate',
      '/interview',
      '/report',
      '/history',
      '/settings',
    ];
    return validPaths.includes(path) ? path : '/';
  };

  const [currentPath, setCurrentPath] = useState<RoutePath>(getPath);

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(getPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = useCallback((path: RoutePath) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
      setCurrentPath(path);
      window.scrollTo(0, 0);
    }
  }, []);

  return { currentPath, navigate };
}
