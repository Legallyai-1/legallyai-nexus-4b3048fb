import { AnimatedRoutes } from '@/components/AnimatedRoutes';
import { LoadingScreen } from '@/components/ui/LoadingScreen';
import { BugReportButton } from '@/components/testing/BugReportButton';
import { FloatingLeeAssistant } from '@/components/ai/FloatingLeeAssistant';

function App() {
  return (
    <>
      <LoadingScreen />
      <AnimatedRoutes />
      <FloatingLeeAssistant />
      <BugReportButton />
    </>
  );
}

export default App;
