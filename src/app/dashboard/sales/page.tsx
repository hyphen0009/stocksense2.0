
"use client";

import { useKiranaStore, Product, Sale } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Barcode, Trash2, Plus, Minus, Search, CreditCard, Banknote, CheckCircle2, Sparkles } from 'lucide-react';
import { useState, useMemo } from 'react';
import { toast } from '@/hooks/use-toast';
import { BarcodeScanner } from '@/components/barcode-scanner';

export default function SalesPage() {
  const { products, recordSale, isInitialized } = useKiranaStore();
  const [cart, setCart] = useState<{ product: Product; qty: number }[]>([]);
  const [scanning, setScanning] = useState(false);
  const [search, setSearch] = useState('');

  if (!isInitialized) return null;

  const totalAmount = cart.reduce((acc, item) => acc + item.product.price * item.qty, 0);

  const addToCart = (product: Product) => {
    if (product.quantity <= 0) {
      toast({
        title: "Out of Stock",
        description: `${product.name} is currently unavailable.`,
        variant: "destructive",
      });
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.qty >= product.quantity) {
          toast({
            title: "Limit Reached",
            description: `Only ${product.quantity} units of ${product.name} are in stock.`,
            variant: "destructive",
          });
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { product, qty: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.product.id === id) {
        const newQty = Math.max(1, Math.min(item.product.quantity, item.qty + delta));
        return { ...item, qty: newQty };
      }
      return item;
    }));
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    cart.forEach((item) => {
      recordSale(item.product.barcode, item.qty);
    });

    setCart([]);
    toast({
      title: "Sale Successful!",
      description: `Total Amount: ₹${totalAmount} collected.`,
      className: "bg-green-50 border-green-200 text-green-800",
    });
  };

  const handleScanSuccess = (code: string) => {
    const product = products.find(p => p.barcode === code);
    if (product) {
      // Logic for instant add or increment
      const inCart = cart.find(item => item.product.id === product.id);

      if (inCart && inCart.qty >= product.quantity) {
        toast({
          variant: "destructive",
          title: "Out of Stock",
          description: `Cannot add more ${product.name}. Max stock reached.`,
        });
      } else {
        addToCart(product);
        toast({
          title: inCart ? "Quantity Updated" : "Added to Cart",
          description: `${product.name} ${inCart ? `is now x${inCart.qty + 1}` : 'added'}.`,
          className: "bg-indigo-600 text-white border-none",
        });
      }
    } else {
      toast({
        variant: "destructive",
        title: "Product Not Found",
        description: `No product found with barcode: ${code}. Add it to inventory first.`,
      });
    }
    setScanning(false);
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.barcode.includes(search)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto min-h-screen lg:h-[calc(100vh-140px)] animate-in slide-in-from-bottom-4 duration-500 pb-20 lg:pb-0">
      {/* Product Selection Area */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        <div className="flex gap-3">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Search products or scan..."
              className="pl-12 h-14 text-lg bg-white shadow-xl shadow-slate-200/50 border-none rounded-2xl focus-visible:ring-2 focus-visible:ring-primary/20"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button
            className={`h-14 w-14 rounded-2xl shadow-xl transition-all ${scanning ? 'bg-primary text-white scale-110' : 'bg-white text-primary hover:bg-slate-50'}`}
            onClick={() => setScanning(true)}
          >
            <Barcode className="w-7 h-7" />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto pr-2 custom-scrollbar pb-6">
          {filteredProducts.map((p) => (
            <Card
              key={p.id}
              className={`group cursor-pointer hover:border-primary/50 transition-all hover:shadow-2xl hover:-translate-y-1 border-none shadow-lg shadow-slate-200/50 rounded-[1.5rem] overflow-hidden ${p.quantity === 0 ? 'opacity-50 grayscale' : ''}`}
              onClick={() => addToCart(p)}
            >
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <Badge className="bg-slate-100 text-slate-600 text-[10px] font-bold border-none px-2 rounded-lg group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                    {p.category}
                  </Badge>
                  <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${p.quantity <= 5 ? 'bg-red-50 text-red-500' : 'bg-emerald-50 text-emerald-500'}`}>
                    {p.quantity} LEFT
                  </span>
                </div>
                <h4 className="font-extrabold text-slate-800 text-sm leading-tight h-10 line-clamp-2 group-hover:text-primary transition-colors">{p.name}</h4>
                <div className="flex justify-between items-end">
                  <div className="text-xl font-black text-slate-900 font-headline">₹{p.price}</div>
                  <div className="p-1.5 bg-primary/5 rounded-lg text-primary group-hover:bg-primary group-hover:text-white transition-all">
                    <Plus className="w-4 h-4" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart/Checkout Area */}
      <div className="lg:col-span-5">
        <Card className="h-full flex flex-col border-none shadow-2xl bg-white rounded-[2.5rem] overflow-hidden">
          <CardHeader className="bg-slate-50/50 pb-6 pt-8 px-8">
            <div className="flex justify-between items-center">
              <CardTitle className="text-2xl font-headline font-black flex items-center gap-3 text-slate-900">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <ShoppingCart className="w-6 h-6 text-primary" />
                </div>
                Active Cart
              </CardTitle>
              <Badge variant="outline" className="text-primary border-primary/20 bg-primary/5 font-black text-xs px-3 py-1 rounded-full">
                {cart.length} ITEMS
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0 custom-scrollbar px-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-12 text-center">
                <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6 text-slate-200">
                  <ShoppingCart className="w-12 h-12" />
                </div>
                <p className="text-xl font-extrabold text-slate-400">Your cart is empty</p>
                <p className="text-sm text-slate-300 font-medium max-w-[200px] mt-2">Scan items or select from the list to start billing</p>
              </div>
            ) : (
              <div className="space-y-2 p-4">
                {cart.map((item) => (
                  <div key={item.product.id} className="p-4 bg-slate-50/50 rounded-2xl flex items-center gap-4 animate-in slide-in-from-right-4 group hover:bg-slate-50 transition-colors">
                    <div className="flex-1">
                      <h5 className="font-extrabold text-slate-800 text-sm">{item.product.name}</h5>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-primary font-black text-lg">₹{item.product.price}</span>
                        <span className="text-slate-400 text-xs font-bold">per unit</span>
                      </div>
                    </div>
                    <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-slate-100">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100" onClick={() => updateQty(item.product.id, -1)}>
                        <Minus className="w-4 h-4" />
                      </Button>
                      <span className="w-10 text-center font-black text-slate-900">{item.qty}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg hover:bg-slate-100" onClick={() => updateQty(item.product.id, 1)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-500 hover:bg-red-50 transition-all rounded-xl" onClick={() => removeFromCart(item.product.id)}>
                      <Trash2 className="w-5 h-5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col p-8 bg-slate-900 border-t space-y-6 rounded-t-[3rem]">
            <div className="w-full flex justify-between items-center">
              <span className="text-slate-400 font-bold text-lg">Grand Total</span>
              <div className="text-right">
                <span className="text-4xl font-black text-white font-headline tracking-tight">₹{totalAmount.toLocaleString()}</span>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Inclusive of all taxes</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 w-full">
              <Button variant="secondary" className="h-16 rounded-2xl bg-white/5 border border-white/10 text-white font-black flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all group">
                <Banknote className="w-6 h-6 text-emerald-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase tracking-widest">Cash Payment</span>
              </Button>
              <Button variant="secondary" className="h-16 rounded-2xl bg-white/5 border border-white/10 text-white font-black flex flex-col items-center justify-center gap-1 hover:bg-white/10 transition-all group">
                <CreditCard className="w-6 h-6 text-indigo-400 group-hover:scale-110 transition-transform" />
                <span className="text-[10px] uppercase tracking-widest">Digital UPI</span>
              </Button>
            </div>

            <Button
              className="w-full h-20 rounded-[1.5rem] text-2xl font-black bg-primary hover:bg-primary/90 text-white shadow-2xl shadow-primary/30 disabled:opacity-50 transition-all active:scale-[0.98] group"
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              <CheckCircle2 className="w-7 h-7 mr-3 group-hover:animate-bounce" />
              FINALIZE ORDER
            </Button>
          </CardFooter>
        </Card>
      </div>

      <BarcodeScanner
        isOpen={scanning}
        onClose={() => setScanning(false)}
        onScan={handleScanSuccess}
      />
    </div>
  );
}
