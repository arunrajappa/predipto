// Authentication Service for Predipto
// Handles user authentication, registration, profile management, and admin access control
// Uses Firebase Authentication and Firestore for user data storage
import { initializeFirebase } from '../firebase-config.js';

/**
 * AuthService class
 * 
 * Provides authentication and user management functionality for the application.
 * Handles user registration, login, logout, profile management, and admin access control.
 * Uses Firebase Authentication for identity management and Firestore for user profile data.
 */
class AuthService {
  /**
   * Constructor
   * 
   * Initializes the AuthService with Firebase auth and Firestore instances.
   * Sets up an auth state listener to track user login status changes.
   */
  constructor() {
    const { auth, firestore } = initializeFirebase();
    this.auth = auth;
    this.firestore = firestore;
    this.currentUser = null;
    
    // Initialize auth state listener to track user login status
    this.auth.onAuthStateChanged(user => {
      this.currentUser = user;
      // Dispatch custom event for components to react to auth state changes
      window.dispatchEvent(new CustomEvent('authStateChanged', { detail: { user } }));
    });
  }
  
  /**
   * Get current authenticated user
   * 
   * @returns {Object|null} The current Firebase user object or null if not logged in
   */
  getCurrentUser() {
    return this.currentUser;
  }
  
  /**
   * Check if a user is currently logged in
   * 
   * @returns {boolean} True if user is logged in, false otherwise
   */
  isLoggedIn() {
    return !!this.currentUser;
  }
  
  /**
   * Register a new user
   * 
   * Creates a new user account with Firebase Authentication and
   * creates the corresponding user profile document in Firestore.
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @param {string} [displayName] - Optional display name (defaults to email username)
   * @returns {Object} Object with success status and user data or error message
   */
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
  
  /**
   * Login user with email and password
   * 
   * Authenticates a user with Firebase Authentication.
   * 
   * @param {string} email - User's email address
   * @param {string} password - User's password
   * @returns {Object} Object with success status and user data or error message
   */
  async login(email, password) {
    try {
      const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
      return { success: true, user: userCredential.user };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Logout current user
   * 
   * Signs out the currently authenticated user from Firebase.
   * 
   * @returns {Object} Object with success status or error message
   */
  async logout() {
    try {
      await this.auth.signOut();
      return { success: true };
    } catch (error) {
      console.error('Logout error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get user profile data from Firestore
   * 
   * Retrieves the user profile document from the Firestore database.
   * 
   * @param {string} [userId] - Optional user ID (defaults to current user)
   * @returns {Object} Object with success status and profile data or error message
   */
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
  
  /**
   * Update user profile data
   * 
   * Updates the current user's profile document in Firestore.
   * 
   * @param {Object} profileData - Object containing profile fields to update
   * @returns {Object} Object with success status or error message
   */
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
  
  /**
   * Check if current user has admin privileges
   * 
   * Retrieves the user profile and checks the isAdmin flag.
   * 
   * @returns {boolean} True if user is an admin, false otherwise
   */
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
