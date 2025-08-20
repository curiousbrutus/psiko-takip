import '@testing-library/jest-dom';

// Mock Firebase auth for testing
jest.mock('firebase/auth', () => ({
  getAuth: jest.fn(() => ({})),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
  onAuthStateChanged: jest.fn(),
}));

// Mock Firebase firestore for testing
jest.mock('firebase/firestore', () => ({
  getFirestore: jest.fn(() => ({})),
  collection: jest.fn(),
  doc: jest.fn(),
  addDoc: jest.fn(),
  setDoc: jest.fn(),
  getDoc: jest.fn(),
  getDocs: jest.fn(),
  query: jest.fn(),
  where: jest.fn(),
  orderBy: jest.fn(),
  onSnapshot: jest.fn(),
}));

// Mock lucide-react icons
jest.mock('lucide-react', () => ({
  ArrowRight: () => 'ArrowRight',
  BrainCircuit: () => 'BrainCircuit',
  Flame: () => 'Flame',
  CheckCircle: () => 'CheckCircle',
  Loader2: () => 'Loader2',
}));

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
    };
  },
  useSearchParams() {
    return {
      get: jest.fn(),
    };
  },
  usePathname() {
    return '';
  },
}));
