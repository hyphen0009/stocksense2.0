"use client";

import { SidebarProvider, Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarFooter, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import { LayoutDashboard, Package, ShoppingCart, BrainCircuit, LogOut, Store, Menu } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const menuItems = [
    { title: 'Overview', icon: LayoutDashboard, url: '/dashboard' },
    { title: 'Inventory', icon: Package, url: '/dashboard/inventory' },
    { title: 'Sales (POS)', icon: ShoppingCart, url: '/dashboard/sales' },
    { title: 'Predictions', icon: BrainCircuit, url: '/dashboard/predictions' },
  ];

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        <Sidebar className="border-r border-border/50 shadow-sm">
          <SidebarHeader className="p-4 flex flex-row items-center gap-3">
            <div className="bg-primary p-2 rounded-lg">
              <Store className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-primary font-headline">KiranaLink</span>
          </SidebarHeader>
          <SidebarContent className="p-2">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className={`h-12 px-4 rounded-xl transition-all duration-200 ${
                      pathname === item.url 
                        ? 'bg-primary text-white hover:bg-primary hover:text-white' 
                        : 'hover:bg-primary/10 hover:text-primary'
                    }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <item.icon className="w-5 h-5" />
                      <span className="text-base font-medium">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4">
            <SidebarMenuButton asChild className="h-12 px-4 text-destructive hover:bg-destructive/10">
              <Link href="/" className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span className="text-base font-medium">Log Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col">
          <header className="h-16 flex items-center justify-between px-6 border-b border-border/50 bg-white/50 backdrop-blur-md sticky top-0 z-10">
            <div className="flex items-center gap-4">
              <SidebarTrigger className="md:hidden" />
              <h2 className="text-lg font-bold text-foreground">
                {menuItems.find(item => item.url === pathname)?.title || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end hidden sm:flex">
                <span className="text-sm font-semibold">Sai Krishna Stores</span>
                <span className="text-xs text-muted-foreground">Admin Access</span>
              </div>
              <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center text-primary font-bold shadow-sm">
                SK
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-4 md:p-8">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}