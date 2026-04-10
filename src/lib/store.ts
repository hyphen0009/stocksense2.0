"use client";

import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  orderBy,
  setDoc,
  getDocs,
  Timestamp,
  writeBatch
} from 'firebase/firestore';
import { initializeFirebase } from '@/firebase';

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

export function useKiranaStore() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const [db, setDb] = useState<any>(null);

  useEffect(() => {
    const { firestore } = initializeFirebase();
    setDb(firestore);

    // Listen to Products
    const qProducts = query(collection(firestore, 'products'), orderBy('name', 'asc'));
    const unsubscribeProducts = onSnapshot(qProducts, (snapshot) => {
      const pData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(pData);

      // Migration logic: If cloud is empty but local has data, migrate
      if (pData.length === 0) {
        const localProducts = localStorage.getItem('kiranatalk_products');
        if (localProducts) {
          const parsed = JSON.parse(localProducts);
          const batch = writeBatch(firestore);
          parsed.forEach((p: Product) => {
            const docRef = doc(collection(firestore, 'products'));
            batch.set(docRef, { ...p, id: docRef.id });
          });
          batch.commit().then(() => {
            localStorage.removeItem('kiranatalk_products');
          });
        }
      }
    });

    // Listen to Sales
    const qSales = query(collection(firestore, 'sales'), orderBy('timestamp', 'desc'));
    const unsubscribeSales = onSnapshot(qSales, (snapshot) => {
      const sData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Sale));
      setSales(sData);
    });

    setIsInitialized(true);

    return () => {
      unsubscribeProducts();
      unsubscribeSales();
    };
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!db) return;
    const docRef = await addDoc(collection(db, 'products'), product);
    return { ...product, id: docRef.id };
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!db) return;
    const docRef = doc(db, 'products', id);
    await updateDoc(docRef, updates);
  };

  const deleteProduct = async (id: string) => {
    if (!db) return;
    await deleteDoc(doc(db, 'products', id));
  };

  const recordSale = async (barcode: string, quantity: number = 1) => {
    if (!db) return null;
    const product = products.find((p) => p.barcode === barcode);
    if (!product || product.quantity < quantity) return null;

    const sale: Omit<Sale, 'id'> = {
      productId: product.id,
      productName: product.name,
      quantity,
      total: product.price * quantity,
      timestamp: new Date().toISOString(),
    };

    // Use a batch to update stock and log sale atomically
    const batch = writeBatch(db);
    const saleRef = doc(collection(db, 'sales'));
    const productRef = doc(db, 'products', product.id);

    batch.set(saleRef, sale);
    batch.update(productRef, { quantity: product.quantity - quantity });

    await batch.commit();
    return { ...sale, id: saleRef.id };
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
