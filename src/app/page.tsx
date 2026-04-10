import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, ShieldCheck, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#F8FAFC] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-400/10 rounded-full blur-[120px] animate-pulse" />

      <div className="w-full max-w-md z-10 space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="bg-white p-4 rounded-3xl shadow-2xl glass border border-white/40 group transition-transform hover:scale-110 duration-500">
            <Store className="w-10 h-10 text-primary group-hover:rotate-12 transition-transform" />
          </div>
          <div className="space-y-1">
            <h1 className="text-5xl font-extrabold tracking-tight font-headline text-gradient">
              KiranaLink
            </h1>
            <p className="text-slate-500 font-medium tracking-wide">
              Intelligence for your neighborhood store
            </p>
          </div>
        </div>

        <Card className="border-white/40 shadow-2xl bg-white/80 backdrop-blur-xl rounded-[2rem] p-2 overflow-hidden">
          <CardHeader className="space-y-2 pb-6 pt-8 text-center">
            <CardTitle className="text-3xl font-bold font-headline text-slate-800">Welcome Back</CardTitle>
            <CardDescription className="text-slate-500 font-medium">
              Access your digital inventory manager
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5 px-6 pb-2">
            <div className="space-y-2 group">
              <Label htmlFor="email" className="text-sm font-semibold text-slate-700 ml-1">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="sai.krishna@link.com"
                className="h-12 bg-white/50 border-slate-200 rounded-2xl focus:ring-primary/20 transition-all duration-300 px-4"
              />
            </div>
            <div className="space-y-2 group">
              <Label htmlFor="password" theological="text-sm font-semibold text-slate-700 ml-1">Password</Label>
              <Input
                id="password"
                type="password"
                className="h-12 bg-white/50 border-slate-200 rounded-2xl focus:ring-primary/20 transition-all duration-300 px-4"
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-6 px-6 pb-10 pt-4">
            <Button asChild className="w-full h-14 text-lg font-bold rounded-2xl bg-primary hover:bg-primary/90 shadow-lg shadow-primary/25 transition-all duration-300 group overflow-hidden relative">
              <Link href="/dashboard" className="flex items-center justify-center">
                <span className="relative z-10 flex items-center gap-2 group-hover:translate-x-1 transition-transform">
                  Enter Dashboard <ChevronRight className="w-5 h-5" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
              </Link>
            </Button>
            <div className="text-center text-sm font-medium text-slate-500">
              New shopkeeper?{" "}
              <Link href="#" className="text-primary font-bold hover:text-primary/80 transition-colors">
                Apply for Access
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-1000 delay-500">
          <div className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full flex items-center gap-2 text-xs font-bold border border-emerald-100 shadow-sm">
            <ShieldCheck className="w-4 h-4" />
            <span>SECURE CLOUD SYNC ACTIVE</span>
          </div>
        </div>
      </div>
    </div>
  );
}
