import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { User, Account, Transaction, Schedule, Benefit, Budget, Goal, Installment, ShoppingList } from '../types';

const COLLECTIONS = {
  users: 'users',
  accounts: 'accounts',
  transactions: 'transactions',
  schedules: 'schedules',
  benefits: 'benefits',
  budgets: 'budgets',
  goals: 'goals',
  installments: 'installments',
  shoppingLists: 'shoppingLists',
};

// User operations
export const createUser = async (userId: string, userData: Omit<User, 'id'>) => {
  await setDoc(doc(db, COLLECTIONS.users, userId), userData);
};

export const getUser = async (userId: string): Promise<User | null> => {
  const docRef = doc(db, COLLECTIONS.users, userId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } as User : null;
};

export const updateUser = async (userId: string, userData: Partial<User>) => {
  await updateDoc(doc(db, COLLECTIONS.users, userId), userData);
};

// Generic CRUD operations for user-specific collections
export const addUserDocument = async <T>(collectionName: string, userId: string, data: Omit<T, 'id' | 'userId'>) => {
  const docRef = await addDoc(collection(db, collectionName), { ...data, userId });
  return docRef.id;
};

export const getUserDocuments = async <T>(collectionName: string, userId: string): Promise<T[]> => {
  const q = query(collection(db, collectionName), where('userId', '==', userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
};

export const updateUserDocument = async (collectionName: string, docId: string, data: any) => {
  await updateDoc(doc(db, collectionName, docId), data);
};

export const deleteUserDocument = async (collectionName: string, docId: string) => {
  await deleteDoc(doc(db, collectionName, docId));
};

// Specific collection helpers
export const getAccounts = (userId: string) => getUserDocuments<Account>(COLLECTIONS.accounts, userId);
export const addAccount = (userId: string, account: Omit<Account, 'id' | 'userId'>) => addUserDocument(COLLECTIONS.accounts, userId, account);
export const updateAccount = (accountId: string, data: Partial<Account>) => updateUserDocument(COLLECTIONS.accounts, accountId, data);
export const deleteAccount = (accountId: string) => deleteUserDocument(COLLECTIONS.accounts, accountId);

export const getTransactions = (userId: string) => getUserDocuments<Transaction>(COLLECTIONS.transactions, userId);
export const addTransaction = (userId: string, transaction: Omit<Transaction, 'id' | 'userId'>) => addUserDocument(COLLECTIONS.transactions, userId, transaction);
export const updateTransaction = (transactionId: string, data: Partial<Transaction>) => updateUserDocument(COLLECTIONS.transactions, transactionId, data);
export const deleteTransaction = (transactionId: string) => deleteUserDocument(COLLECTIONS.transactions, transactionId);

export const getSchedules = (userId: string) => getUserDocuments<Schedule>(COLLECTIONS.schedules, userId);
export const addSchedule = (userId: string, schedule: Omit<Schedule, 'id' | 'userId'>) => addUserDocument(COLLECTIONS.schedules, userId, schedule);
export const updateSchedule = (scheduleId: string, data: Partial<Schedule>) => updateUserDocument(COLLECTIONS.schedules, scheduleId, data);
export const deleteSchedule = (scheduleId: string) => deleteUserDocument(COLLECTIONS.schedules, scheduleId);

export const getBenefits = (userId: string) => getUserDocuments<Benefit>(COLLECTIONS.benefits, userId);
export const addBenefit = (userId: string, benefit: Omit<Benefit, 'id' | 'userId'>) => addUserDocument(COLLECTIONS.benefits, userId, benefit);
export const updateBenefit = (benefitId: string, data: Partial<Benefit>) => updateUserDocument(COLLECTIONS.benefits, benefitId, data);
export const deleteBenefit = (benefitId: string) => deleteUserDocument(COLLECTIONS.benefits, benefitId);

export const getBudgets = (userId: string) => getUserDocuments<Budget>(COLLECTIONS.budgets, userId);
export const addBudget = (userId: string, budget: Omit<Budget, 'id' | 'userId'>) => addUserDocument(COLLECTIONS.budgets, userId, budget);
export const updateBudget = (budgetId: string, data: Partial<Budget>) => updateUserDocument(COLLECTIONS.budgets, budgetId, data);
export const deleteBudget = (budgetId: string) => deleteUserDocument(COLLECTIONS.budgets, budgetId);

export const getGoals = (userId: string) => getUserDocuments<Goal>(COLLECTIONS.goals, userId);
export const addGoal = (userId: string, goal: Omit<Goal, 'id' | 'userId'>) => addUserDocument(COLLECTIONS.goals, userId, goal);
export const updateGoal = (goalId: string, data: Partial<Goal>) => updateUserDocument(COLLECTIONS.goals, goalId, data);
export const deleteGoal = (goalId: string) => deleteUserDocument(COLLECTIONS.goals, goalId);

export const getInstallments = (userId: string) => getUserDocuments<Installment>(COLLECTIONS.installments, userId);
export const addInstallment = (userId: string, installment: Omit<Installment, 'id' | 'userId'>) => addUserDocument(COLLECTIONS.installments, userId, installment);
export const updateInstallment = (installmentId: string, data: Partial<Installment>) => updateUserDocument(COLLECTIONS.installments, installmentId, data);
export const deleteInstallment = (installmentId: string) => deleteUserDocument(COLLECTIONS.installments, installmentId);

export const getShoppingLists = (userId: string) => getUserDocuments<ShoppingList>(COLLECTIONS.shoppingLists, userId);
export const addShoppingList = (userId: string, list: Omit<ShoppingList, 'id' | 'userId'>) => addUserDocument(COLLECTIONS.shoppingLists, userId, list);
export const updateShoppingList = (listId: string, data: Partial<ShoppingList>) => updateUserDocument(COLLECTIONS.shoppingLists, listId, data);
export const deleteShoppingList = (listId: string) => deleteUserDocument(COLLECTIONS.shoppingLists, listId);