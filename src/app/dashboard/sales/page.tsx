
"use client";

import { useKiranaStore, Product, Sale } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Barcode, Trash2, Plus, Minus, Search, CreditCard, Banknote, CheckCircle2 } from 'lucide-react';
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
      addToCart(product);
      toast({
        title: "Scanned Successfully",
        description: `Added ${product.name} to cart.`,
      });
    } else {
      toast({
        variant: "destructive",
        title: "Product Not Found",
        description: `No product found with barcode: ${code}`,
      });
    }
    setScanning(false);
  };

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(search.toLowerCase()) || 
    p.barcode.includes(search)
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 max-w-7xl mx-auto h-[calc(100vh-140px)]">
      {/* Product Selection Area */}
      <div className="lg:col-span-7 flex flex-col space-y-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search or scan barcode..." 
              className="pl-10 h-12 text-lg bg-white shadow-sm border-none rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <Button 
            className={`h-12 w-12 rounded-xl bg-accent text-primary transition-all ${scanning ? 'animate-pulse ring-2 ring-primary' : ''}`}
            onClick={() => setScanning(true)}
          >
            <Barcode className="w-6 h-6" />
          </Button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 overflow-y-auto pr-2 custom-scrollbar">
          {filteredProducts.map((p) => (
            <Card 
              key={p.id} 
              className={`cursor-pointer hover:border-primary transition-all hover:shadow-md border-none ${p.quantity === 0 ? 'opacity-50 grayscale' : ''}`}
              onClick={() => addToCart(p)}
            >
              <CardContent className="p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <Badge className="bg-secondary text-primary text-[10px] py-0">{p.category}</Badge>
                  <span className="text-xs text-muted-foreground">#{p.quantity}</span>
                </div>
                <h4 className="font-bold text-sm leading-tight h-10 line-clamp-2">{p.name}</h4>
                <div className="text-lg font-black text-primary">₹{p.price}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Cart/Checkout Area */}
      <div className="lg:col-span-5">
        <Card className="h-full flex flex-col border-none shadow-xl bg-white rounded-2xl">
          <CardHeader className="border-b bg-muted/20 pb-4">
            <div className="flex justify-between items-center">
              <CardTitle className="text-xl font-headline flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-primary" /> Current Order
              </CardTitle>
              <Badge variant="outline" className="text-primary border-primary">
                {cart.length} Items
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto p-0 custom-scrollbar">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center text-muted-foreground opacity-50">
                <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                  <ShoppingCart className="w-10 h-10" />
                </div>
                <p className="text-lg font-bold">Your cart is empty</p>
                <p className="text-sm">Scan items or select from the list to start a sale</p>
              </div>
            ) : (
              <div className="divide-y">
                {cart.map((item) => (
                  <div key={item.product.id} className="p-4 flex items-center gap-4 animate-in slide-in-from-right-4">
                    <div className="flex-1">
                      <h5 className="font-bold text-sm">{item.product.name}</h5>
                      <span className="text-primary font-bold">₹{item.product.price} × {item.qty}</span>
                    </div>
                    <div className="flex items-center bg-secondary rounded-lg overflow-hidden border">
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => updateQty(item.product.id, -1)}>
                        <Minus className="w-3 h-3" />
                      </Button>
                      <span className="w-8 text-center font-bold text-sm">{item.qty}</span>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={() => updateQty(item.product.id, 1)}>
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                    <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => removeFromCart(item.product.id)}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
          <CardFooter className="flex flex-col p-6 bg-muted/20 border-t space-y-4">
            <div className="w-full flex justify-between items-end">
              <span className="text-muted-foreground font-medium">Grand Total</span>
              <span className="text-4xl font-black text-primary">₹{totalAmount.toLocaleString()}</span>
            </div>
            
            <div className="grid grid-cols-2 gap-3 w-full">
              <Button variant="outline" className="h-14 rounded-xl border-2 font-bold flex flex-col items-center justify-center gap-1 hover:bg-white">
                <Banknote className="w-5 h-5" />
                <span className="text-[10px] uppercase">Cash</span>
              </Button>
              <Button variant="outline" className="h-14 rounded-xl border-2 font-bold flex flex-col items-center justify-center gap-1 hover:bg-white">
                <CreditCard className="w-5 h-5" />
                <span className="text-[10px] uppercase">UPI/Card</span>
              </Button>
            </div>

            <Button 
              className="w-full h-16 rounded-xl text-xl font-black bg-primary hover:bg-primary/90 text-white shadow-lg disabled:opacity-50"
              disabled={cart.length === 0}
              onClick={handleCheckout}
            >
              COMPLETE SALE
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
