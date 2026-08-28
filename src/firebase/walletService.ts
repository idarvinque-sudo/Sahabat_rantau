import {
  collection,
  doc,
  addDoc,
  updateDoc,
  increment,
  query,
  where,
  orderBy,
  onSnapshot,
  limit,
} from 'firebase/firestore';
import { db } from './config';
import { Transaction } from '../types';

/**
 * Update user balance and record transaction document
 */
export async function updateBalance(
  userId: string,
  amount: number,
  type: 'income' | 'expense' | 'topup' | 'withdraw' | 'transfer',
  description: string
): Promise<void> {
  const userDocRef = doc(db, 'users', userId);
  
  // Update balance in user doc
  await updateDoc(userDocRef, {
    balance: increment(amount),
    updatedAt: new Date().toISOString(),
  });

  // Create audit transaction document
  const txRef = collection(db, 'transactions');
  await addDoc(txRef, {
    userId,
    type,
    amount,
    description,
    status: 'completed',
    createdAt: new Date().toISOString(),
  });
}

/**
 * Subscribe to user transactions
 */
export function subscribeToTransactions(
  userId: string,
  callback: (transactions: Transaction[]) => void
) {
  const txQuery = query(
    collection(db, 'transactions'),
    where('userId', '==', userId),
    orderBy('createdAt', 'desc'),
    limit(20)
  );

  return onSnapshot(
    txQuery,
    (snapshot) => {
      const items: Transaction[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Transaction, 'id'>),
      }));
      callback(items);
    },
    (err) => {
      console.warn('Error listening to transactions:', err);
      callback([]);
    }
  );
}
