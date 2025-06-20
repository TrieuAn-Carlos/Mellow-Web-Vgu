// filepath: src/lib/firebase-schema.ts
/**
 * Main export file for Firebase schema utilities
 * This provides a clean interface for importing Firebase functionality
 */

// Type definitions
export type * from '../types/schema';

// Firebase configuration
export { auth, db, storage } from './firebase';

// Collection references and utilities
export * from './firebase-collections';

// CRUD operations
export * from './firebase-operations';

// Data converters
export * from './firebase-converters';

// React hooks
export * from '../hooks/useFirestore';

// Test utilities (for development)
export * from './__tests__/firebase-schema.test';
