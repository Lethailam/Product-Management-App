import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
  DocumentData,
} from 'firebase/firestore';
import { db } from '../config/firebase';

export interface Product extends DocumentData {
  idsanpham: string;
  [key: string]: unknown;
}

const productCollection = collection(db, 'sanpham');

export async function getProducts(): Promise<(Product & { docId: string })[]> {
  const snapshot = await getDocs(productCollection);

  return snapshot.docs.map((item) => ({
    docId: item.id,
    ...(item.data() as Product),
  }));
}

export async function addProduct(productData: Product): Promise<string> {
  const docRef = await addDoc(productCollection, productData);
  return docRef.id;
}

export async function updateProduct(
  docId: string,
  productData: Partial<Product>
): Promise<void> {
  const productRef = doc(db, 'sanpham', docId);
  await updateDoc(productRef, productData);
}

export async function deleteProductById(docId: string): Promise<void> {
  const productRef = doc(db, 'sanpham', docId);
  await deleteDoc(productRef);
}

export async function checkProductIdExists(idsanpham: string): Promise<boolean> {
  const q = query(productCollection, where('idsanpham', '==', idsanpham));
  const snapshot = await getDocs(q);
  return !snapshot.empty;
}