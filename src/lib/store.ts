"use client";

import { useState, useEffect } from 'react';

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  barcode: string;
}

export interface Sale {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  total: number;
  timestamp: string;
}

const INITIAL_PRODUCTS: Product[] = [
  { id: '1', name: 'Premium Basmati Rice', category: 'Grains', price: 120, quantity: 45, barcode: '8901234567890' },
  { id: '2', name: 'Cold Pressed Sunflower Oil', category: 'Oils', price: 180, quantity: 5, barcode: '8901234567891' },
  { id: '3', name: 'Organic Turmeric Powder', category: 'Spices', price: 50, quantity: 2, barcode: '8901234567892' },
  { id: '4', name: 'Whole Wheat Flour 5kg', category: 'Grains', price: 240, quantity: 15, barcode: '8901234567893' },
  { id: '5', name: 'Darjeeling Tea Leaves', category: 'Beverages', price: 350, quantity: 8, barcode: '8901234567894' },
];

export function useKiranaStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const storedProducts = localStorage.getItem('kiranatalk_products');
    const storedSales = localStorage.getItem('kiranatalk_sales');

    if (storedProducts) {
      setProducts(JSON.parse(storedProducts));
    } else {
      setProducts(INITIAL_PRODUCTS);
      localStorage.setItem('kiranatalk_products', JSON.stringify(INITIAL_PRODUCTS));
    }

    if (storedSales) {
      setSales(JSON.parse(storedSales));
    }
    
    setIsInitialized(true);
  }, []);

  const saveToStorage = (p: Product[], s: Sale[]) => {
    localStorage.setItem('kiranatalk_products', JSON.stringify(p));
    localStorage.setItem('kiranatalk_sales', JSON.stringify(s));
  };

  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct = { ...product, id: Math.random().toString(36).substr(2, 9) };
    const newProducts = [...products, newProduct];
    setProducts(newProducts);
    saveToStorage(newProducts, sales);
    return newProduct;
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    const newProducts = products.map((p) => (p.id === id ? { ...p, ...updates } : p));
    setProducts(newProducts);
    saveToStorage(newProducts, sales);
  };

  const deleteProduct = (id: string) => {
    const newProducts = products.filter((p) => p.id !== id);
    setProducts(newProducts);
    saveToStorage(newProducts, sales);
  };

  const recordSale = (barcode: string, quantity: number = 1) => {
    const product = products.find((p) => p.barcode === barcode);
    if (!product || product.quantity < quantity) return null;

    const sale: Sale = {
      id: Math.random().toString(36).substr(2, 9),
      productId: product.id,
      productName: product.name,
      quantity,
      total: product.price * quantity,
      timestamp: new Date().toISOString(),
    };

    const newSales = [sale, ...sales];
    const newProducts = products.map((p) => 
      p.id === product.id ? { ...p, quantity: p.quantity - quantity } : p
    );

    setSales(newSales);
    setProducts(newProducts);
    saveToStorage(newProducts, newSales);
    return sale;
  };

  return {
    products,
    sales,
    isInitialized,
    addProduct,
    updateProduct,
    deleteProduct,
    recordSale,
  };
}