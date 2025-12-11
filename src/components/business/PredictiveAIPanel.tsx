import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Brain, TrendingUp, AlertTriangle, Target, ChevronRight, 
  Lightbulb, Scale, DollarSign, Clock, Info
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface PredictionResult {
  prediction: any;
  confidence: number;
  factors: Array<{
    factor: string;
    weight: number;
    impact: string;
    description?: string;
  }>;
  explainability: {
    model_type: string;
    data_sources: string[];
    accuracy_metrics: { precision: number; recall: number; f1_score: number };
  };
}

interface PredictiveAIPanelProps {
  caseId?: string;
  matterId?: string;
  organizationId?: string;
}

export function PredictiveAIPanel({ caseId, matterId, organizationId = 'default-org' }: PredictiveAIPanelProps) {
  const [loading, setLoading] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Record<string, PredictionResult>>({});
  const [showExplain, setShowExplain] = useState<string | null>(null);

  const runPrediction = async (type: string) => {
    setLoading(type);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/predictive-ai`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: JSON.stringify({
          type,
          case_id: caseId,
          matter_id: matterId,
          organization_id: organizationId
        })
      });

      const result = await response.json();
      if (result.error) throw new Error(result.error);

      setPredictions(prev => ({ ...prev, [type]: result }));
      toast.success('Prediction complete');
    } catch (error: any) {
      toast.error(error.message || 'Prediction failed');
    } finally {
      setLoading(null);
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive': return 'text-green-500';
      case 'negative': return 'text-red-500';
      case 'warning': return 'text-yellow-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <Card className="bg-card/50 backdrop-blur border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          Predictive AI Engine
        </CardTitle>
        <CardDescription>
          AI-powered predictions with explainable insights
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="outcome" className="space-y-4">
          <TabsList className="grid grid-cols-5 gap-2">
            <TabsTrigger value="outcome">Outcome</TabsTrigger>
            <TabsTrigger value="settlement">Settlement</TabsTrigger>
            <TabsTrigger value="risk">Risk</TabsTrigger>
            <TabsTrigger value="billing">Billing</TabsTrigger>
            <TabsTrigger value="next_steps">Next Steps</TabsTrigger>
          </TabsList>

          <TabsContent value="outcome" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Case Outcome Prediction</h4>
                <p className="text-sm text-muted-foreground">Predict win probability based on case factors</p>
              </div>
              <Button 
                onClick={() => runPrediction('case_outcome')} 
                disabled={loading === 'case_outcome'}
              >
                {loading === 'case_outcome' ? 'Analyzing...' : 'Predict Outcome'}
              </Button>
            </div>
            
            {predictions.case_outcome && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardContent className="pt-4">
                      <div className="text-3xl font-bold text-green-500">
                        {(predictions.case_outcome.prediction.win_probability * 100).toFixed(0)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Win Probability</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/10 border-primary/30">
                    <CardContent className="pt-4">
                      <div className="text-3xl font-bold text-primary">
                        {(predictions.case_outcome.confidence * 100).toFixed(0)}%
                      </div>
                      <p className="text-sm text-muted-foreground">Confidence Score</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Contributing Factors</CardTitle>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setShowExplain(showExplain === 'outcome' ? null : 'outcome')}
                      >
                        <Info className="h-4 w-4 mr-1" />
                        Why this prediction?
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {predictions.case_outcome.factors.map((factor, i) => (
                      <div key={i} className="space-y-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{factor.factor}</span>
                          <Badge variant="outline" className={getImpactColor(factor.impact)}>
                            {factor.impact}
                          </Badge>
                        </div>
                        <Progress value={factor.weight * 100} className="h-1" />
                        {factor.description && (
                          <p className="text-xs text-muted-foreground">{factor.description}</p>
                        )}
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {showExplain === 'outcome' && (
                  <Card className="bg-muted/50">
                    <CardContent className="pt-4 space-y-2">
                      <h5 className="font-medium flex items-center gap-2">
                        <Lightbulb className="h-4 w-4" />
                        Explainability
                      </h5>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Model</p>
                          <p>{predictions.case_outcome.explainability.model_type}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Accuracy</p>
                          <p>F1: {predictions.case_outcome.explainability.accuracy_metrics.f1_score}</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Data Sources</p>
                          <p>{predictions.case_outcome.explainability.data_sources.join(', ')}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <div className="p-4 bg-primary/5 rounded-lg">
                  <h5 className="font-medium mb-2">Recommended Strategy</h5>
                  <p className="text-sm text-muted-foreground">
                    {predictions.case_outcome.prediction.recommended_strategy}
                  </p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="settlement" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Settlement Value Forecast</h4>
                <p className="text-sm text-muted-foreground">Estimate settlement range and optimal timing</p>
              </div>
              <Button 
                onClick={() => runPrediction('settlement')} 
                disabled={loading === 'settlement'}
              >
                {loading === 'settlement' ? 'Analyzing...' : 'Forecast Settlement'}
              </Button>
            </div>

            {predictions.settlement && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-3 gap-4">
                  <Card className="bg-primary/10 border-primary/30">
                    <CardContent className="pt-4 text-center">
                      <DollarSign className="h-6 w-6 mx-auto text-primary mb-1" />
                      <div className="text-2xl font-bold">
                        ${predictions.settlement.prediction.settlement_range[0].toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Low Range</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-green-500/10 border-green-500/30">
                    <CardContent className="pt-4 text-center">
                      <Target className="h-6 w-6 mx-auto text-green-500 mb-1" />
                      <div className="text-2xl font-bold text-green-500">
                        ${predictions.settlement.prediction.median_settlement.toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">Median</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-primary/10 border-primary/30">
                    <CardContent className="pt-4 text-center">
                      <TrendingUp className="h-6 w-6 mx-auto text-primary mb-1" />
                      <div className="text-2xl font-bold">
                        ${predictions.settlement.prediction.settlement_range[1].toLocaleString()}
                      </div>
                      <p className="text-xs text-muted-foreground">High Range</p>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardContent className="pt-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-4 w-4 text-primary" />
                      <span className="font-medium">Optimal Timing</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {predictions.settlement.prediction.optimal_timing}
                    </p>
                    <div className="mt-3">
                      <p className="text-sm font-medium mb-2">Negotiation Factors:</p>
                      <ul className="space-y-1">
                        {predictions.settlement.prediction.negotiation_factors.map((factor: string, i: number) => (
                          <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                            <ChevronRight className="h-4 w-4 mt-0.5 flex-shrink-0" />
                            {factor}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="risk" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Risk Assessment</h4>
                <p className="text-sm text-muted-foreground">Identify and mitigate case risks</p>
              </div>
              <Button 
                onClick={() => runPrediction('risk')} 
                disabled={loading === 'risk'}
              >
                {loading === 'risk' ? 'Analyzing...' : 'Assess Risks'}
              </Button>
            </div>

            {predictions.risk && (
              <div className="space-y-4 animate-in fade-in">
                <Card className={`border-2 ${
                  predictions.risk.prediction.risk_level === 'low' ? 'border-green-500/50 bg-green-500/5' :
                  predictions.risk.prediction.risk_level === 'moderate' ? 'border-yellow-500/50 bg-yellow-500/5' :
                  'border-red-500/50 bg-red-500/5'
                }`}>
                  <CardContent className="pt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className={`h-8 w-8 ${
                          predictions.risk.prediction.risk_level === 'low' ? 'text-green-500' :
                          predictions.risk.prediction.risk_level === 'moderate' ? 'text-yellow-500' :
                          'text-red-500'
                        }`} />
                        <div>
                          <div className="text-2xl font-bold capitalize">
                            {predictions.risk.prediction.risk_level} Risk
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Score: {(predictions.risk.prediction.overall_risk_score * 100).toFixed(0)}%
                          </p>
                        </div>
                      </div>
                      <Badge variant={
                        predictions.risk.prediction.risk_level === 'low' ? 'default' :
                        predictions.risk.prediction.risk_level === 'moderate' ? 'secondary' :
                        'destructive'
                      }>
                        {predictions.risk.confidence * 100}% Confidence
                      </Badge>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-3">
                  <h5 className="font-medium">Identified Risks</h5>
                  {predictions.risk.prediction.top_risks.map((risk: any, i: number) => (
                    <Card key={i} className="bg-muted/50">
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{risk.risk}</span>
                              <Badge variant={
                                risk.severity === 'high' ? 'destructive' :
                                risk.severity === 'medium' ? 'secondary' :
                                'default'
                              }>
                                {risk.severity}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              <strong>Mitigation:</strong> {risk.mitigation}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="billing" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Billing & Cash Flow Forecast</h4>
                <p className="text-sm text-muted-foreground">Predict revenue and identify opportunities</p>
              </div>
              <Button 
                onClick={() => runPrediction('billing')} 
                disabled={loading === 'billing'}
              >
                {loading === 'billing' ? 'Analyzing...' : 'Forecast Billing'}
              </Button>
            </div>

            {predictions.billing && (
              <div className="space-y-4 animate-in fade-in">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">30-Day Revenue</p>
                      <div className="text-2xl font-bold text-primary">
                        ${predictions.billing.prediction.projected_revenue_30_days.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">90-Day Revenue</p>
                      <div className="text-2xl font-bold">
                        ${predictions.billing.prediction.projected_revenue_90_days.toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Collection Rate</p>
                      <div className="text-2xl font-bold text-green-500">
                        {(predictions.billing.prediction.collection_rate_forecast * 100).toFixed(0)}%
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="pt-4">
                      <p className="text-sm text-muted-foreground">Efficiency Score</p>
                      <div className="text-2xl font-bold">
                        {(predictions.billing.prediction.billing_efficiency_score * 100).toFixed(0)}%
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {predictions.billing.prediction.unbilled_time_alerts > 0 && (
                  <Card className="border-yellow-500/50 bg-yellow-500/10">
                    <CardContent className="pt-4">
                      <div className="flex items-center gap-2 text-yellow-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">
                          {predictions.billing.prediction.unbilled_time_alerts} unbilled entries detected
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">AI Insights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {predictions.billing.prediction.cash_flow_insights.map((insight: string, i: number) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <Lightbulb className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                          {insight}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>

          <TabsContent value="next_steps" className="space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h4 className="font-medium">Predict Next Steps</h4>
                <p className="text-sm text-muted-foreground">AI-recommended actions and timeline</p>
              </div>
              <Button 
                onClick={() => runPrediction('next_steps')} 
                disabled={loading === 'next_steps'}
              >
                {loading === 'next_steps' ? 'Analyzing...' : 'Get Recommendations'}
              </Button>
            </div>

            {predictions.next_steps && (
              <div className="space-y-4 animate-in fade-in">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Recommended Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {predictions.next_steps.prediction.recommended_actions.map((action: any, i: number) => (
                      <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                        <Badge variant={
                          action.priority === 'high' ? 'destructive' :
                          action.priority === 'medium' ? 'secondary' :
                          'default'
                        }>
                          {action.priority}
                        </Badge>
                        <div className="flex-1">
                          <p className="font-medium">{action.action}</p>
                          <p className="text-sm text-muted-foreground">{action.reason}</p>
                          <p className="text-xs text-primary mt-1">Due: {action.deadline}</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Projected Timeline</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {predictions.next_steps.prediction.timeline_forecast.map((phase: any, i: number) => (
                        <div key={i} className="flex items-center gap-4">
                          <div className={`w-3 h-3 rounded-full ${
                            phase.status === 'in_progress' ? 'bg-primary animate-pulse' :
                            phase.status === 'upcoming' ? 'bg-yellow-500' :
                            'bg-muted-foreground'
                          }`} />
                          <div className="flex-1">
                            <p className="font-medium">{phase.phase}</p>
                            <p className="text-sm text-muted-foreground">{phase.duration}</p>
                          </div>
                          <Badge variant="outline">{phase.status}</Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
