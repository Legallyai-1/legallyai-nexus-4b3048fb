import { useState } from "react";
import { Link } from "react-router-dom";
import { GlowScales } from "@/components/brand/GlowScales";
import { motion } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Car, Brain, Calendar, Target, Clock, MessageSquare } from "lucide-react";
import { MainLayout } from "@/components/layout/MainLayout";
import { AnimatedAIHead } from "@/components/ui/AnimatedAIHead";

const DUIHubPage = () => {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <MainLayout>
      <div className="min-h-screen bg-background p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-7xl mx-auto space-y-6"
        >
          {/* Header */}
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-gradient-to-br from-red-500/20 to-orange-500/20 border border-red-500/30">
              <Car className="h-8 w-8 text-red-400" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">DUI Defense Hub</h1>
              <p className="text-muted-foreground">DUI case preparation and resource management</p>
            </div>
            <div className="ml-auto">
              <AnimatedAIHead variant="orange" size="sm" />
            </div>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 w-full">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="predictor">Plea Outcomes</TabsTrigger>
              <TabsTrigger value="more">More tools</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-card/50 border-red-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Active Cases</CardTitle>
                    <GlowScales className="h-4 w-4 text-red-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">0</div>
                    <p className="text-xs text-muted-foreground">No cases yet</p>
                  </CardContent>
                </Card>


                <Card className="bg-card/50 border-yellow-500/20">
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Outcome Predictions</CardTitle>
                    <Brain className="h-4 w-4 text-yellow-400" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-sm font-medium">Unavailable</div>
                    <p className="text-xs text-muted-foreground">No validated legal-outcome model is configured.</p>
                  </CardContent>
                </Card>
              </div>

              {/* Case Timeline */}
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    Case Timeline
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">No cases yet</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="predictor">
              <Card className="bg-card/50 border-orange-500/20">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5 text-orange-400" />
                    Plea Outcome Predictions Unavailable
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    No validated legal-outcome model is configured. Speak with a licensed attorney about case-specific outcomes.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="more" className="space-y-6">
              <Card className="bg-card/50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Coming soon
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <p>
                    These DUI tools are not built yet, so we are not showing them: hearing practice, breath-test record
                    review, case tracking and billing.
                  </p>
                  <p>
                    You can ask Lee general questions about DUI procedure in your state now. Lee gives legal information,
                    not legal advice. For your specific case, talk to a licensed criminal-defense attorney.
                  </p>
                  <Button asChild variant="outline">
                    <Link to="/chat">
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Ask Lee
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </MainLayout>
  );
};

export default DUIHubPage;
