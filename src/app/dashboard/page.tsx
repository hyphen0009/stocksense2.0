"use client";

import { useKiranaStore } from '@/lib/store';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Package, IndianRupee, Clock, ArrowRight, ShoppingCart, ShieldCheck, BrainCircuit } from 'lucide-react';
import Link from 'next/link';

export default function OverviewPage() {
  const { products, sales, isInitialized } = useKiranaStore();

  if (!isInitialized) return null;

  const lowStockItems = products.filter((p) => p.quantity <= 10);
  const outOfStockItems = products.filter((p) => p.quantity === 0);
  const totalSalesToday = sales
    .filter((s) => new Date(s.timestamp).toDateString() === new Date().toDateString())
    .reduce((acc, s) => acc + s.total, 0);

  const stats = [
    { title: 'Daily Revenue', value: `₹${totalSalesToday.toLocaleString()}`, description: "Today's collection", icon: IndianRupee, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Active Items', value: products.length, description: 'Across all categories', icon: Package, color: 'text-blue-600', bg: 'bg-blue-50' },
    { title: 'Total Orders', value: sales.length, description: 'All time records', icon: TrendingUp, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Stock Health', value: lowStockItems.length, description: 'Items needing attention', icon: AlertTriangle, color: lowStockItems.length > 0 ? 'text-orange-600' : 'text-emerald-600', bg: lowStockItems.length > 0 ? 'bg-orange-50' : 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-10 max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 font-headline tracking-tight">Store Overview</h1>
          <p className="text-slate-500 font-medium">Monitoring your business pulse in real-time.</p>
        </div>
        <div className="flex items-center gap-3 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm self-start">
          <div className="px-4 py-2 bg-slate-50 rounded-xl text-sm font-bold text-slate-700">
            {new Date().toLocaleDateString('en-IN', { month: 'long', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-xl shadow-slate-200/50 bg-white group hover:scale-[1.02] transition-all duration-300 overflow-hidden relative">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-[13px] font-bold text-slate-500 uppercase tracking-wider">{stat.title}</CardTitle>
              <div className={`${stat.bg} ${stat.color} p-2.5 rounded-xl transition-colors`}>
                <stat.icon className="w-4 h-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-extrabold text-slate-900 font-headline">{stat.value}</div>
              <p className="text-xs text-slate-400 font-semibold mt-1 flex items-center gap-1">
                {stat.description}
              </p>
            </CardContent>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          </Card>
        ))}
      </div>

      <div className="grid gap-8 md:grid-cols-12">
        <div className="md:col-span-8 space-y-6">
          <section className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 border border-slate-100/60 overflow-hidden">
            <div className="p-6 pb-0 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-900 font-headline flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" /> Recent Activity
              </h3>
              <Link href="/dashboard/sales" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {sales.length > 0 ? (
                  sales.slice(0, 5).map((sale) => (
                    <div key={sale.id} className="group flex items-center justify-between p-5 bg-slate-50/50 hover:bg-white rounded-2xl border border-transparent hover:border-slate-200 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                          <ShoppingCart className="w-5 h-5" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-800 text-[15px]">{sale.productName}</span>
                          <span className="text-xs text-slate-500 font-semibold">
                            {new Date(sale.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="font-bold text-slate-900 text-lg">₹{sale.total}</span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Qty: {sale.quantity}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-12 text-center bg-slate-50/50 rounded-3xl border-2 border-dashed border-slate-200 flex flex-col items-center gap-3">
                    <Package className="w-10 h-10 text-slate-300" />
                    <p className="text-slate-400 font-bold">No sales recorded yet today.</p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>

        <div className="md:col-span-4 space-y-6">
          <section className="space-y-6">
            <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10 flex flex-col h-full">
                <div className="mb-6 self-start bg-white/10 p-3 rounded-2xl backdrop-blur-md border border-white/10 group-hover:scale-110 transition-transform duration-500">
                  <BrainCircuit className="w-8 h-8 text-indigo-300" />
                </div>
                <h3 className="text-2xl font-bold font-headline mb-2">Smart Prediction</h3>
                <p className="text-slate-400 text-sm font-medium mb-8 leading-relaxed">
                  Our AI engine analyzes your sales history to predict future demand and prevent stockouts.
                </p>
                <Link href="/dashboard/predictions" className="mt-auto inline-flex items-center justify-center gap-2 bg-indigo-500 text-white font-bold px-6 py-4 rounded-2xl hover:bg-indigo-400 transition-all duration-300 shadow-xl shadow-indigo-500/20 group/btn">
                  Try AI Predictor <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                </Link>
              </div>
              <div className="absolute top-[-20%] right-[-20%] w-60 h-60 bg-indigo-500/20 rounded-full blur-[80px]" />
              <div className="absolute bottom-[-20%] left-[-20%] w-40 h-40 bg-primary/20 rounded-full blur-[60px]" />
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-[0.2em] ml-2">Critical Alerts</h3>
              <div className="space-y-3">
                {outOfStockItems.length > 0 || lowStockItems.filter(i => i.quantity > 0).length > 0 ? (
                  <>
                    {outOfStockItems.map((item) => (
                      <Alert variant="destructive" key={item.id} className="bg-red-50 border-red-100 rounded-2xl group border-l-4 border-l-red-500">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <div className="ml-2">
                          <AlertTitle className="font-bold text-red-900 text-sm">Out of Stock</AlertTitle>
                          <AlertDescription className="text-red-700/80 text-[11px] font-bold uppercase tracking-tight">
                            {item.name} is SOLD OUT
                          </AlertDescription>
                        </div>
                      </Alert>
                    ))}
                    {lowStockItems.filter(i => i.quantity > 0).map((item) => (
                      <Alert key={item.id} className="bg-orange-50 border-orange-100 rounded-2xl border-l-4 border-l-orange-400">
                        <AlertTriangle className="h-4 w-4 text-orange-600" />
                        <div className="ml-2">
                          <AlertTitle className="font-bold text-orange-900 text-sm">Low Stock Alert</AlertTitle>
                          <AlertDescription className="text-orange-700/80 text-[11px] font-bold uppercase tracking-tight">
                            {item.name}: {item.quantity} items left
                          </AlertDescription>
                        </div>
                      </Alert>
                    ))}
                  </>
                ) : (
                  <div className="p-8 bg-emerald-50 text-emerald-700 rounded-3xl border border-emerald-100 text-[13px] font-bold flex flex-col items-center gap-2 text-center">
                    <ShieldCheck className="w-8 h-8 opacity-50 mb-1" />
                    INVENTORY HEALTHY
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
