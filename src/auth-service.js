// Authentication Service
import { initializeFirebase } from '../firebase-config.js';

class AuthService {
  constructor() {
    const { auth, firestore } = initializeFirebase();
    this.auth = auth;
    this.firestore = firestore;
    this.currentUser = null;
    
    // Initialize auth state
    this.auth.onAuthStateChanged(user => {
      this.currentUser = user;
      // Dispatch event for components to react
      window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
    });
  }
  
  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }
  
  // Check if user is logged in
  isLoggedIn() {
    return !!this.currentUser;
  }
  
  // Register a new user
  async register(email, password, displayName) {
    try {
      // Create user in Firebase Auth
      const userCredential = await this.auth.createUserWithEmailAndPassword(email, password);
      const user = userCredential.user;
      
      // Create user profile in Firestore
      await this.firestore.collection('users').doc(user.uid).set({
        email,
        displayName: displayName || email.split('@')[0],
        createdAt: new Date().toISOString(),
        totalPoints: 0,
        isAdmin: false
      });
      
      return { success: true, user };
    } catch (error) {
      console.error('Registration error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Login user
  async login(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Logout user
  async logout() {
    try {
      await this.auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Get user profile data
  async getUserProfile(userId) {
    try {
      const doc = await this.firestore.collection('users').doc(userId || this.currentUser.uid).get();
      if (doc.exists) {
        return { success: true, profile: doc.data() };
      } else {
        return { success: false, error: 'User profile not found' };
      }
    } catch (error) {
      console.error('Get profile error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Update user profile
  async updateProfile(profileData) {
    if (!this.currentUser) {
      return { success: false, error: 'User not logged in' };
    }
    
    try {
      await this.firestore.collection('users').doc(this.currentUser.uid).update(profileData);
      return { success: true };
    } catch (error) {
      console.error('Update profile error:', error);
      return { success: false, error: error.message };
    }
  }
  
  // Check if user is admin
  async isAdmin() {
    if (!this.currentUser) {
      return false;
    }
    
    try {
      const profile = await this.getUserProfile();
      return profile.success && profile.profile.isAdmin;
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  }
}

// Export a singleton instance
export const authService = new AuthService();
