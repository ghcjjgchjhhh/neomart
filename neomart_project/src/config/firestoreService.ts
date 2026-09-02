import { collection, addDoc, query, where, getDocs, writeBatch, doc } from 'firebase/firestore';
import { db } from './firebase';
import { allProducts } from '../data/products';

/**
 * Import all products from local data to Firestore
 * Run this once to populate your Firestore database
 */
export async function importProductsToFirestore() {
  try {
    console.log('Starting product import...');
    
    const productsRef = collection(db, 'products');
    
    // Check if products already exist
    const q = query(productsRef);
    const snapshot = await getDocs(q);
    
    if (snapshot.size > 0) {
      console.log(`Database already has ${snapshot.size} products. Skipping import.`);
      return { success: true, message: 'Products already imported' };
    }
    
    // Use batch write for better performance
    const batch = writeBatch(db);
    let count = 0;
    
    allProducts.forEach((product) => {
      // Create a new doc with an auto-generated ID
      const newDocRef = doc(productsRef);
      batch.set(newDocRef, {
        ...product,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      count++;
    });
    
    // Commit the batch
    await batch.commit();
    
    console.log(`✅ Successfully imported ${count} products to Firestore`);
    return { success: true, count };
  } catch (error) {
    console.error('Error importing products:', error);
    return { success: false, error };
  }
}

/**
 * Get all products from Firestore
 */
export async function getProductsFromFirestore() {
  try {
    const productsRef = collection(db, 'products');
    const snapshot = await getDocs(productsRef);
    
    const products = snapshot.docs.map(doc => ({
      firebaseId: doc.id,
      ...doc.data()
    }));
    
    return products;
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Get products by category
 */
export async function getProductsByCategory(category: string) {
  try {
    const productsRef = collection(db, 'products');
    const q = query(productsRef, where('category', '==', category));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => ({
      firebaseId: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}
