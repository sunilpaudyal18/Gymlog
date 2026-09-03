import React, { useState } from 'react';
import { AppRouter } from './app/router/AppRouter';
import { SplashScreen } from './components/ui/SplashScreen';

export const App: React.FC = () => {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <>
      {showSplash && (
        <SplashScreen onComplete={() => setShowSplash(false)} />
      )}
      <AppRouter />
    </>
  );
};

export default App;
