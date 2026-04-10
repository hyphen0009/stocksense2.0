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
      <div className="flex min-h-screen w-full bg-[#F8FAFC]">
        <Sidebar className="border-r border-slate-200/60 bg-white shadow-xl shadow-slate-200/50">
          <SidebarHeader className="p-6 pb-2 mb-4 flex flex-row items-center gap-3">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-100 transition-transform hover:scale-105 duration-300">
              <Package className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold text-slate-900 font-headline leading-none">Stock Sense</span>
              <span className="text-[10px] font-bold text-indigo-600 tracking-[0.2em] uppercase mt-1">Smart Inventory</span>
            </div>
          </SidebarHeader>
          <SidebarContent className="px-3">
            <SidebarMenu className="space-y-1">
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    isActive={pathname === item.url}
                    tooltip={item.title}
                    className={`h-12 px-4 rounded-xl transition-all duration-300 group overflow-hidden relative ${pathname === item.url
                      ? 'bg-primary text-white shadow-lg shadow-primary/25 translate-x-1'
                      : 'text-slate-500 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-1'
                      }`}
                  >
                    <Link href={item.url} className="flex items-center gap-3">
                      <div className={`transition-all duration-300 ${pathname === item.url ? 'scale-110' : 'group-hover:scale-110'}`}>
                        <item.icon className="w-5 h-5" />
                      </div>
                      <span className="text-[15px] font-semibold tracking-tight">{item.title}</span>
                      {pathname === item.url && (
                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-white/20 rounded-l-full" />
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className="p-4 mt-auto">
            <div className="bg-slate-50 rounded-2xl p-4 mb-4 border border-slate-100">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Current Shop</p>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                  SK
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-xs font-bold text-slate-800 truncate">Sai Krishna Store</span>
                  <span className="text-[10px] text-slate-500 truncate">Siddharth Nagar</span>
                </div>
              </div>
            </div>
            <SidebarMenuButton asChild className="h-12 px-4 text-slate-500 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all duration-300 hover:translate-x-1">
              <Link href="/" className="flex items-center gap-3">
                <LogOut className="w-5 h-5" />
                <span className="text-[15px] font-semibold">Sign Out</span>
              </Link>
            </SidebarMenuButton>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex-1 flex flex-col min-w-0">
          <header className="h-20 flex items-center justify-between px-4 md:px-8 border-b border-slate-200/60 bg-white/80 backdrop-blur-xl sticky top-0 z-20">
            <div className="flex items-center gap-3">
              <SidebarTrigger className="md:hidden">
                <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg shadow-slate-900/10 cursor-pointer hover:scale-105 transition-transform">
                  <Menu className="w-5 h-5" />
                </div>
              </SidebarTrigger>
              <div className="flex flex-col ml-1 md:ml-0">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 font-headline tracking-tight">
                  {menuItems.find(item => item.url === pathname)?.title || 'Dashboard'}
                </h2>
                <p className="text-[10px] text-slate-500 font-medium hidden sm:block">
                  System Live • {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex flex-col items-end mr-2 text-right">
                <span className="text-xs font-bold text-slate-900 leading-none">Admin Panel</span>
                <span className="text-[10px] font-bold text-emerald-600 mt-1 uppercase tracking-wider flex items-center gap-1">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse" /> Online
                </span>
              </div>
              <div className="w-10 h-10 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 font-bold hover:bg-indigo-50 hover:text-indigo-600 transition-colors cursor-pointer group">
                <BrainCircuit className="w-5 h-5 group-hover:scale-110 transition-transform" />
              </div>
            </div>
          </header>
          <main className="flex-1 overflow-auto p-6 md:p-10">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
