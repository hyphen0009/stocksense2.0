"use client";

import { useKiranaStore } from '@/lib/store';
import { predictiveStockAlerts, PredictiveStockAlertsOutput } from '@/ai/flows/predictive-stock-alerts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Sparkles, Loader2, AlertCircle, Calendar, RefreshCcw, PackageCheck } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export default function PredictionsPage() {
  const { products, sales, isInitialized } = useKiranaStore();
  const [predictions, setPredictions] = useState<PredictiveStockAlertsOutput | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const runAnalysis = async () => {
    setLoading(true);
    setError(null);
    try {
      // Check if there are products
      if (products.length === 0) {
        throw new Error("No products found in inventory to analyze.");
      }

      // Prepare data for the GenAI flow
      const productsData = products.map(p => ({
        productId: p.id,
        productName: p.name,
        currentStock: p.quantity,
        salesHistory: sales
          .filter(s => s.productId === p.id)
          .map(s => ({
            date: s.timestamp.split('T')[0],
            quantitySold: s.quantity
          }))
          .sort((a, b) => a.date.localeCompare(b.date))
      }));

      const result = await predictiveStockAlerts({
        products: productsData,
        predictionHorizonDays: 30
      });

      if (!result || !result.predictions) {
        throw new Error("AI failed to generate predictions. Please check your data.");
      }

      setPredictions(result);
      toast({
        title: "Analysis Complete",
        description: "Your stock predictions have been updated.",
      });
    } catch (err: any) {
      console.error("Prediction error:", err);
      setError(err.message || "Failed to connect to AI engine. Ensure your API key is active.");
      toast({
        variant: "destructive",
        title: "Prediction Failed",
        description: err.message || "Check connection and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isInitialized && !predictions) {
      runAnalysis();
    }
  }, [isInitialized]);

  if (!isInitialized) return null;

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-primary text-white p-8 rounded-2xl shadow-xl overflow-hidden relative">
        <div className="space-y-2 relative z-10">
          <h1 className="text-3xl font-black font-headline flex items-center gap-3">
            <Sparkles className="w-8 h-8 text-accent" /> KiranaLink Smart Predictor
          </h1>
          <p className="text-white/80 max-w-xl">
            We use advanced analytics to study your sales history and tell you exactly when items will run out. No more stockouts!
          </p>
        </div>
        <Button
          onClick={runAnalysis}
          disabled={loading}
          className="bg-accent text-primary font-bold h-12 px-8 rounded-xl hover:opacity-90 relative z-10"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <RefreshCcw className="w-5 h-5 mr-2" />}
          Refresh Insights
        </Button>
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-lg font-bold text-primary animate-pulse">Analyzing sales trends...</p>
        </div>
      ) : predictions ? (
        <div className="grid gap-6 md:grid-cols-12">
          <Card className="md:col-span-4 h-fit border-none shadow-lg bg-white sticky top-20">
            <CardHeader>
              <CardTitle className="font-headline text-primary">Reorder Strategy</CardTitle>
              <CardDescription>Based on AI analysis</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="p-4 bg-muted/50 rounded-xl border-l-4 border-accent">
                <p className="text-sm italic leading-relaxed text-foreground/80">"{predictions.summary}"</p>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Quick Stats</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">High Risk Items</span>
                    <Badge variant="destructive">{predictions.predictions.filter(p => p.daysUntilRunOut !== null && p.daysUntilRunOut < 7).length}</Badge>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Avg. Daily Demand</span>
                    <span className="font-bold">High Across Oils</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="md:col-span-8 space-y-4">
            {predictions.predictions.map((p) => {
              const isUrgent = p.daysUntilRunOut !== null && p.daysUntilRunOut <= 7;
              const isSafe = p.daysUntilRunOut === null || p.daysUntilRunOut > 20;

              return (
                <Card key={p.productId} className={`border-none shadow-md overflow-hidden transition-all ${isUrgent ? 'ring-2 ring-red-200' : ''}`}>
                  <div className="flex flex-col md:flex-row">
                    <div className="p-6 flex-1 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-bold font-headline">{p.productName}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={`${isUrgent ? 'bg-red-100 text-red-700' : isSafe ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'} border-none`}>
                              {p.daysUntilRunOut === null ? 'Stock Healthy' : `Run-out in ${p.daysUntilRunOut} days`}
                            </Badge>
                            <span className="text-xs text-muted-foreground">Stock: {p.currentStock}</span>
                          </div>
                        </div>
                        {isUrgent && <AlertCircle className="w-6 h-6 text-red-500" />}
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold text-muted-foreground">
                          <span>Usage Rate</span>
                          <span>{p.averageDailySales?.toFixed(1) || 0} units/day</span>
                        </div>
                        <Progress
                          value={p.daysUntilRunOut !== null ? Math.max(10, 100 - (p.daysUntilRunOut * 3)) : 100}
                          className={`h-2 ${isUrgent ? 'bg-red-100 [&>div]:bg-red-500' : 'bg-muted [&>div]:bg-primary'}`}
                        />
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed italic bg-muted/30 p-3 rounded-lg">
                        {p.predictionReasoning}
                      </p>
                    </div>

                    <div className={`p-6 w-full md:w-48 flex flex-col justify-center items-center text-center gap-2 ${isUrgent ? 'bg-red-50' : 'bg-muted/30'}`}>
                      <Calendar className={`w-5 h-5 ${isUrgent ? 'text-red-500' : 'text-primary'}`} />
                      <div className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Expected Date</div>
                      <div className={`text-sm font-black ${isUrgent ? 'text-red-600' : 'text-foreground'}`}>
                        {p.predictedRunOutDate ? new Date(p.predictedRunOutDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Safe for now'}
                      </div>
                      <Button size="sm" variant={isUrgent ? 'destructive' : 'outline'} className="w-full mt-2 h-8 text-[10px] font-black uppercase">
                        REORDER
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        <Card className="p-20 flex flex-col items-center justify-center text-center space-y-4 border-dashed border-2">
          <PackageCheck className="w-16 h-16 text-muted-foreground opacity-20" />
          <h2 className="text-2xl font-bold">Ready to analyze your stock?</h2>
          <p className="text-muted-foreground max-w-sm">
            Click the button above to generate your first set of predictions based on current inventory and sales history.
          </p>
          <Button onClick={runAnalysis} className="bg-primary text-white h-12 px-8">Run Initial Analysis</Button>
        </Card>
      )}
    </div>
  );
}