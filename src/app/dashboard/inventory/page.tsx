
"use client";

import { useKiranaStore, Product } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Package, Barcode, Filter, Loader2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { BarcodeScanner } from '@/components/barcode-scanner';
import { fetchProductInfo } from '@/lib/barcode-utils';
import { toast } from '@/hooks/use-toast';

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct, isInitialized } = useKiranaStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Local state for the form to allow scanner updates
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    price: '',
    quantity: '',
    barcode: ''
  });

  if (!isInitialized) return null;

  const filteredProducts = products.filter((p) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.barcode.includes(searchTerm)
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProduct = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = {
      name: formData.name,
      category: formData.category,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      barcode: formData.barcode,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, data);
      toast({ title: "Product Updated", description: `${data.name} has been updated.` });
    } else {
      addProduct(data);
      toast({ title: "Product Added", description: `${data.name} is now in your inventory.` });
    }

    setIsAddOpen(false);
    setEditingProduct(null);
    setFormData({ name: '', category: '', price: '', quantity: '', barcode: '' });
  };

  const handleEditClick = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      category: product.category,
      price: product.price.toString(),
      quantity: product.quantity.toString(),
      barcode: product.barcode
    });
    setIsAddOpen(true);
  };

  const handleScanSuccess = async (code: string) => {
    setIsScannerOpen(false);

    // 1. Check if product exists locally
    const existing = products.find(p => p.barcode === code);
    if (existing) {
      handleEditClick(existing);
      toast({
        title: "Product Found",
        description: `Autofilled details for ${existing.name}.`,
      });
      return;
    }

    // 2. Otherwise, fetch from external API
    setIsSearching(true);
    toast({
      title: "Searching Database...",
      description: `Looking up barcode: ${code}`,
    });

    const info = await fetchProductInfo(code);
    setIsSearching(false);

    if (info) {
      setFormData({
        name: info.name,
        category: info.category,
        barcode: code,
        price: '',
        quantity: ''
      });
      setIsAddOpen(true);
      toast({
        title: "Smart Info Found!",
        description: `Imported details for ${info.name}.`,
        className: "bg-indigo-50 border-indigo-200 text-indigo-700",
      });
    } else {
      setFormData(prev => ({ ...prev, barcode: code }));
      setIsAddOpen(true);
      toast({
        title: "Barcode Scanned",
        description: "No automatic info found. Please enter details manually.",
      });
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-6 rounded-2xl shadow-xl shadow-slate-200/50">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search catalog..."
            className="pl-10 h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none h-12 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </Button>
          <Dialog open={isAddOpen} onOpenChange={(open) => {
            setIsAddOpen(open);
            if (!open) {
              setEditingProduct(null);
              setFormData({ name: '', category: '', price: '', quantity: '', barcode: '' });
            }
          }}>
            <DialogTrigger asChild>
              <Button className="flex-1 md:flex-none h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20">
                <Plus className="w-5 h-5 mr-1" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px] border-none rounded-[2rem] shadow-2xl">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline text-slate-900 font-bold">
                  {editingProduct ? 'Update Product' : 'Add to Inventory'}
                </DialogTitle>
                <p className="text-slate-500 text-sm font-medium">Enter product details or scan a barcode.</p>
              </DialogHeader>
              <form onSubmit={handleSaveProduct} className="space-y-5 py-6">
                <div className="space-y-2">
                  <Label htmlFor="barcode" className="text-slate-700 font-bold ml-1">Barcode ID</Label>
                  <div className="relative flex gap-2">
                    <Input id="barcode" name="barcode" value={formData.barcode} onChange={handleInputChange} required className="h-12 bg-slate-50 border-none rounded-xl font-mono text-primary font-bold" />
                    <Button
                      type="button"
                      size="icon"
                      variant="secondary"
                      className="shrink-0 h-12 w-12 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl"
                      onClick={() => setIsScannerOpen(true)}
                      disabled={isSearching}
                    >
                      {isSearching ? <Loader2 className="w-5 h-5 animate-spin" /> : <Barcode className="w-5 h-5" />}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-700 font-bold ml-1">Product Display Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required className="h-12 bg-slate-50 border-none rounded-xl focus-visible:ring-primary" placeholder="e.g. Organic Brown Rice" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category" className="text-slate-700 font-bold ml-1">Category</Label>
                    <Input id="category" name="category" value={formData.category} onChange={handleInputChange} required className="h-12 bg-slate-50 border-none rounded-xl" placeholder="Grains" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price" className="text-slate-700 font-bold ml-1">Price (₹)</Label>
                    <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required className="h-12 bg-slate-50 border-none rounded-xl" placeholder="0.00" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="quantity" className="text-slate-700 font-bold ml-1">Opening Stock</Label>
                  <Input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} required className="h-12 bg-slate-50 border-none rounded-xl" placeholder="0" />
                </div>

                <DialogFooter className="pt-4 gap-2">
                  <Button type="submit" className="w-full h-14 bg-slate-900 hover:bg-slate-800 text-white text-lg font-bold rounded-2xl shadow-xl shadow-slate-900/20">
                    {editingProduct ? 'Save Changes' : 'Confirm Registration'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-xl shadow-slate-200/40 overflow-hidden border border-slate-100">
        <Table>
          <TableHeader className="bg-slate-50/50">
            <TableRow className="border-slate-100">
              <TableHead className="w-[350px] font-bold text-slate-500 uppercase tracking-widest text-[11px] p-6">Product Information</TableHead>
              <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[11px]">Category</TableHead>
              <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[11px]">Unit Price</TableHead>
              <TableHead className="font-bold text-slate-500 uppercase tracking-widest text-[11px]">Availability</TableHead>
              <TableHead className="text-right font-bold text-slate-500 uppercase tracking-widest text-[11px] p-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="border-slate-50 hover:bg-slate-50/80 transition-colors group">
                <TableCell className="p-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Package className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-base font-extrabold text-slate-800">{product.name}</span>
                      <span className="text-xs text-slate-400 font-bold flex items-center gap-1.5 uppercase tracking-tighter">
                        <Barcode className="w-3 h-3" /> {product.barcode}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 border-none font-bold py-1 px-3 rounded-lg">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell className="font-extrabold text-slate-900 text-lg">₹{product.price}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <div className={`w-2.5 h-2.5 rounded-full ${product.quantity <= 5 ? 'bg-red-500' : product.quantity <= 15 ? 'bg-orange-500' : 'bg-emerald-500'}`} />
                      <span className={`font-black text-sm ${product.quantity <= 5 ? 'text-red-700' : product.quantity <= 15 ? 'text-orange-700' : 'text-emerald-700'}`}>
                        {product.quantity} Units
                      </span>
                    </div>
                    {product.quantity <= 5 && (
                      <span className="inline-flex px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-black uppercase tracking-wider rounded-md w-fit">Refill Soon</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="p-6 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 bg-slate-100 text-slate-600 hover:bg-primary/10 hover:text-primary rounded-xl"
                      onClick={() => handleEditClick(product)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="secondary"
                      size="icon"
                      className="h-10 w-10 bg-slate-100 text-red-400 hover:bg-red-500 hover:text-white rounded-xl"
                      onClick={() => deleteProduct(product.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {filteredProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="h-80 text-center">
                  <div className="flex flex-col items-center justify-center space-y-4 text-slate-300">
                    <div className="p-6 bg-slate-50 rounded-full">
                      <Package className="w-16 h-16 opacity-20" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-xl font-bold text-slate-400">Inventory Empty</p>
                      <p className="text-sm font-medium">Try searching for something else or add a new product.</p>
                    </div>
                    <Button variant="outline" onClick={() => setSearchTerm('')} className="text-primary font-bold border-primary/20 hover:bg-primary/5 rounded-xl">
                      Show All Products
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <BarcodeScanner
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanSuccess}
      />
    </div>
  );
}
