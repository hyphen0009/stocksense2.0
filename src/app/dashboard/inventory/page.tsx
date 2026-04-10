
"use client";

import { useKiranaStore, Product } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Plus, Search, Edit2, Trash2, Package, Barcode, Filter } from 'lucide-react';
import { useState } from 'react';
import { BarcodeScanner } from '@/components/barcode-scanner';

export default function InventoryPage() {
  const { products, addProduct, updateProduct, deleteProduct, isInitialized } = useKiranaStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isScannerOpen, setIsScannerOpen] = useState(false);
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
    } else {
      addProduct(data);
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

  const handleScanSuccess = (code: string) => {
    setFormData(prev => ({ ...prev, barcode: code }));
    setIsScannerOpen(false);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-xl shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search items, categories, or barcodes..."
            className="pl-10 h-11 bg-muted/30 border-none focus-visible:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Button variant="outline" className="flex-1 md:flex-none h-11 border-primary text-primary hover:bg-primary/10">
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
              <Button className="flex-1 md:flex-none h-11 bg-primary hover:bg-primary/90 text-white font-bold">
                <Plus className="w-5 h-5 mr-1" /> Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-headline text-primary">
                  {editingProduct ? 'Edit Product' : 'New Product'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSaveProduct} className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product Name</Label>
                  <Input id="name" name="name" value={formData.name} onChange={handleInputChange} required />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" name="category" value={formData.category} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="price">Price (₹)</Label>
                    <Input id="price" name="price" type="number" step="0.01" value={formData.price} onChange={handleInputChange} required />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">Stock Quantity</Label>
                    <Input id="quantity" name="quantity" type="number" value={formData.quantity} onChange={handleInputChange} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="barcode">Barcode</Label>
                    <div className="relative flex gap-2">
                      <Input id="barcode" name="barcode" value={formData.barcode} onChange={handleInputChange} required />
                      <Button 
                        type="button" 
                        size="icon" 
                        variant="secondary" 
                        className="shrink-0 text-primary hover:bg-primary/10"
                        onClick={() => setIsScannerOpen(true)}
                      >
                        <Barcode className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
                <DialogFooter className="pt-4">
                  <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
                    {editingProduct ? 'Update Inventory' : 'Add to Catalog'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-md overflow-hidden border border-border/50">
        <Table>
          <TableHeader className="bg-muted/30">
            <TableRow>
              <TableHead className="w-[300px]">Product</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.map((product) => (
              <TableRow key={product.id} className="hover:bg-primary/5 transition-colors">
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span className="text-base font-bold text-foreground">{product.name}</span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <Barcode className="w-3 h-3" /> {product.barcode}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className="bg-secondary/50 text-primary font-medium">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell className="font-bold text-primary">₹{product.price}</TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1">
                    <span className={`font-bold ${product.quantity <= 10 ? 'text-orange-600' : 'text-green-600'}`}>
                      {product.quantity} Units
                    </span>
                    {product.quantity <= 5 && (
                      <span className="text-[10px] text-red-500 font-bold uppercase tracking-wider">Critical</span>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-primary hover:bg-primary/10"
                      onClick={() => handleEditClick(product)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
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
                <TableCell colSpan={5} className="h-64 text-center">
                  <div className="flex flex-col items-center justify-center space-y-3 text-muted-foreground">
                    <Package className="w-12 h-12 opacity-20" />
                    <p className="text-lg">No products found matching your search.</p>
                    <Button variant="link" onClick={() => setSearchTerm('')} className="text-primary font-bold">
                      Clear Search
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
