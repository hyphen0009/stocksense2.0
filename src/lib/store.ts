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
  where,
  orderBy,
  Timestamp,
  setDoc,
  getDocs
} from 'firebase/firestore';
import { useFirestore, useUser } from '@/firebase';

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
  const { firestore } = useFirestore();
  const { user } = useUser();
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (!firestore || !user) return;

    // 1. Subscribe to Products
    const productsQuery = query(
      collection(firestore, 'products'),
      where('shopId', '==', user.uid)
    );

    const unsubProducts = onSnapshot(productsQuery, (snapshot: any) => {
      const pData: Product[] = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      })) as Product[];
      setProducts(pData);

      // Auto-migration from localStorage if Firestore is empty
      if (snapshot.empty) {
        const local = localStorage.getItem('kiranatalk_products');
        if (local) {
          const items = JSON.parse(local);
          items.forEach((item: any) => {
            const { id, ...rest } = item;
            addDoc(collection(firestore, 'products'), { ...rest, shopId: user.uid });
          });
          localStorage.removeItem('kiranatalk_products');
        }
      }
    });

    // 2. Subscribe to Sales
    const salesQuery = query(
      collection(firestore, 'sales'),
      where('shopId', '==', user.uid),
      orderBy('timestamp', 'desc')
    );

    const unsubSales = onSnapshot(salesQuery, (snapshot) => {
      const sData: Sale[] = snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate()?.toISOString() || new Date().toISOString()
      })) as Sale[];
      setSales(sData);
    });

    setIsInitialized(true);
    return () => {
      unsubProducts();
      unsubSales();
    };
  }, [firestore, user]);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    if (!firestore || !user) return;
    const docRef = await addDoc(collection(firestore, 'products'), {
      ...product,
      shopId: user.uid,
      updatedAt: Timestamp.now()
    });
    return { ...product, id: docRef.id };
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    if (!firestore) return;
    const docRef = doc(firestore, 'products', id);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  };

  const deleteProduct = async (id: string) => {
    if (!firestore) return;
    await deleteDoc(doc(firestore, 'products', id));
  };

  const recordSale = async (barcode: string, quantity: number = 1) => {
    if (!firestore || !user) return null;

    const product = products.find((p) => p.barcode === barcode);
    if (!product || product.quantity < quantity) return null;

    const saleData = {
      productId: product.id,
      productName: product.name,
      quantity,
      total: product.price * quantity,
      timestamp: Timestamp.now(),
      shopId: user.uid
    };

    // 1. Record Sale
    const saleRef = await addDoc(collection(firestore, 'sales'), saleData);

    // 2. Update Stock
    const productRef = doc(firestore, 'products', product.id);
    await updateDoc(productRef, {
      quantity: product.quantity - quantity,
      updatedAt: Timestamp.now()
    });

    return { ...saleData, id: saleRef.id, timestamp: saleData.timestamp.toDate().toISOString() };
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
