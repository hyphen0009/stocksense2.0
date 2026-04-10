"use client";

import { useKiranaStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Package, IndianRupee, Clock, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function OverviewPage() {
  const { products, sales, isInitialized } = useKiranaStore();

  if (!isInitialized) return null;

  const lowStockItems = products.filter((p) => p.quantity <= 10);
  const outOfStockItems = products.filter((p) => p.quantity === 0);
  const totalSalesToday = sales
    .filter((s) => new Date(s.timestamp).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + s.total, 0);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Daily Revenue</CardTitle>
            <IndianRupee className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalSalesToday.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Today's collection so far</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Active Items</CardTitle>
            <Package className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{sales.length}</div>
            <p className="text-xs text-muted-foreground">All time sales records</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-md bg-white">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Stock Health</CardTitle>
            <AlertTriangle className={`w-4 h-4 ${lowStockItems.length > 0 ? 'text-orange-500' : 'text-green-500'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{lowStockItems.length}</div>
            <p className="text-xs text-muted-foreground">Items needing attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-12">
        <div className="md:col-span-8 space-y-6">
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-primary font-headline flex items-center gap-2">
              <Clock className="w-5 h-5" /> Recent Activity
            </h3>
            <div className="grid gap-3">
              {sales.slice(0, 5).map((sale) => (
                <div key={sale.id} className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm border border-border/40 transition-hover hover:shadow-md">
                  <div className="flex flex-col">
                    <span className="font-semibold text-foreground">{sale.productName}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="font-bold text-primary">₹{sale.total}</span>
                    <span className="text-xs text-muted-foreground">Qty: {sale.quantity}</span>
                  </div>
                </div>
              ))}
              {sales.length === 0 && (
                <div className="p-8 text-center bg-white rounded-xl border-dashed border-2 border-border/50 text-muted-foreground">
                  No sales recorded yet today.
                </div>
              )}
            </div>
          </section>
        </div>

        <div className="md:col-span-4 space-y-6">
          <section className="space-y-4">
            <h3 className="text-xl font-bold text-primary font-headline flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Critical Alerts
            </h3>
            <div className="space-y-3">
              {outOfStockItems.map((item) => (
                <Alert variant="destructive" key={item.id} className="bg-red-50 border-red-200">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle className="font-bold">Out of Stock</AlertTitle>
                  <AlertDescription className="text-xs">
                    {item.name} is completely sold out. Reorder immediately.
                  </AlertDescription>
                </Alert>
              ))}
              {lowStockItems.filter(i => i.quantity > 0).map((item) => (
                <Alert key={item.id} className="bg-orange-50 border-orange-200 text-orange-800">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertTitle className="font-bold">Low Stock Warning</AlertTitle>
                  <AlertDescription className="text-xs">
                    {item.name} has only {item.quantity} units left.
                  </AlertDescription>
                </Alert>
              ))}
              {lowStockItems.length === 0 && (
                <div className="p-6 bg-green-50 text-green-700 rounded-xl border border-green-200 text-sm font-medium text-center">
                  All inventory is currently healthy.
                </div>
              )}
            </div>
            
            <Card className="bg-primary text-white overflow-hidden relative">
              <CardHeader>
                <CardTitle className="text-lg font-headline">Smart Prediction</CardTitle>
                <CardDescription className="text-white/80">AI tool to prevent stockouts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm">Let our AI analyze your sales patterns to predict when you'll run out of key items.</p>
                <Link href="/dashboard/predictions" className="inline-flex items-center gap-2 bg-accent text-primary font-bold px-4 py-2 rounded-lg hover:opacity-90 transition-opacity">
                  Try Now <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
              <div className="absolute top-0 right-0 w-24 h-24 -mr-8 -mt-8 bg-white/10 rounded-full blur-2xl" />
            </Card>
          </section>
        </div>
      </div>
    </div>
  );
}