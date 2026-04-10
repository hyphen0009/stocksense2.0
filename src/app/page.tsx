import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Store, ShieldCheck, ChevronRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex flex-col items-center text-center space-y-2">
          <div className="bg-primary p-3 rounded-2xl shadow-lg">
            <Store className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-primary font-headline">KiranaLink</h1>
          <p className="text-muted-foreground">Modern inventory for local businesses</p>
        </div>

        <Card className="border-none shadow-xl">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl text-center font-headline">Shopkeeper Login</CardTitle>
            <CardDescription className="text-center">
              Enter your credentials to manage your shop
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="shop@kiranatalk.com" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4">
            <Button asChild className="w-full h-12 text-lg font-semibold rounded-xl bg-primary hover:bg-primary/90">
              <Link href="/dashboard">
                Log In <ChevronRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
            <div className="text-center text-sm">
              Don't have an account?{" "}
              <Link href="#" className="text-primary font-semibold hover:underline">
                Register your shop
              </Link>
            </div>
          </CardFooter>
        </Card>

        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium">
          <ShieldCheck className="w-4 h-4" />
          <span>Secure AES-256 Encrypted Access</span>
        </div>
      </div>
    </div>
  );
}