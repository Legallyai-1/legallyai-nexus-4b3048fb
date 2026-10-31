import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, Clock, MessageSquare, FileText } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";

const EnhancedParolePage = () => {
  return (
    <MainLayout>
      <div className="min-h-screen bg-background p-3 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-teal-500/20 border border-green-500/30">
              <Shield className="h-8 w-8 text-green-400" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Parole & Probation Hub</h1>
              <p className="text-muted-foreground">Legal information about supervision. Not legal advice.</p>
            </div>
            <div className="ml-auto">
              <AnimatedAIHead variant="green" size="sm" />
            </div>
          </div>

          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Coming soon
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>
                Personal supervision tracking is not built yet, so we are not showing it: check-in log, condition
                tracker, rehab plan, location alerts and progress badges.
              </p>
              <p>
                Your supervision conditions come from your court order and your officer. Follow them exactly, and ask
                your officer or a licensed attorney if anything is unclear.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild variant="outline">
                  <Link to="/probation-parole">
                    <FileText className="mr-2 h-4 w-4" />
                    Probation & parole guide
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/chat">
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Ask Lee
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default EnhancedParolePage;
