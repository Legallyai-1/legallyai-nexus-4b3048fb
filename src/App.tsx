import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { AnimatedRoutes } from '@/components/AnimatedRoutes';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { BugReportButton } from '@/components/testing/BugReportButton';
import { FloatingLeeAssistant } from '@/components/ai/FloatingLeeAssistant';

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Auto-dismiss loading screen after 2 seconds
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading && <LoadingScreen key="loading" />}
      </AnimatePresence>
      <AnimatedRoutes />
      <FloatingLeeAssistant />
      <BugReportButton />
    </>
  );
}

export default App;
