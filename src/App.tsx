import { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
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
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingScreen key="loading" />
        ) : (
          <motion.div
            key="app-content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <AnimatedRoutes />
            <FloatingLeeAssistant />
            <BugReportButton />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

export default App;
