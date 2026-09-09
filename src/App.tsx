import React, { useEffect, useState } from 'react';
import { AppRouter } from './app/router/AppRouter';
import { SplashScreen } from './components/ui/SplashScreen';
import { waitForStorageHydration } from './services/storage/hydrationManager';

export const App: React.FC = () => {
  const [isHydrated, setIsHydrated] = useState(false);
  const [splashFinished, setSplashFinished] = useState(false);

  useEffect(() => {
    let mounted = true;
    waitForStorageHydration().then(() => {
      if (mounted) {
        setIsHydrated(true);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <>
      {(!isHydrated || !splashFinished) && (
        <SplashScreen onComplete={() => setSplashFinished(true)} />
      )}
      {isHydrated && <AppRouter />}
    </>
  );
};

export default App;
