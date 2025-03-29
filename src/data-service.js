// Data Service for Predipto
// Handles all data operations related to predictions, match results, points calculation, and leaderboard
// Uses Firebase Firestore for data storage and retrieval
import { initializeFirebase } from '../firebase-config.js';
import { authService } from './auth-service.js';

/**
 * DataService class
 * 
 * Provides methods to interact with the application's data layer.
 * Handles predictions, match results, points calculation, and leaderboard functionality.
 * Uses Firebase Firestore as the backend database.
 */
class DataService {
  /**
   * Constructor
   * 
   * Initializes the service with a Firestore instance from Firebase.
   */
  constructor() {
    const { firestore } = initializeFirebase();
    this.firestore = firestore;
  }
  
  /**
   * Save a user's prediction for a match
   * 
   * Creates a new prediction or updates an existing one in the database.
   * Requires the user to be authenticated.
   * 
   * @param {number|string} matchId - ID of the match being predicted
   * @param {number} homeScore - Predicted score for the home team
   * @param {number} awayScore - Predicted score for the away team
   * @returns {Object} Object with success status or error message
   */
  async savePrediction(matchId, homeScore, awayScore) {
    if (!authService.isLoggedIn()) {
      return { success: false, error: 'User not logged in' };
    }
    
    try {
      const userId = authService.getCurrentUser().uid;
      const predictionId = `${userId}_${matchId}`;
      
      // Check if prediction already exists
      const existingPrediction = await this.firestore.collection('predictions').doc(predictionId).get();
      
      if (existingPrediction.exists) {
        // Update existing prediction
        await this.firestore.collection('predictions').doc(predictionId).update({
          homeScore,
          awayScore,
          updatedAt: new Date().toISOString()
        });
      } else {
        // Create new prediction
        await this.firestore.collection('predictions').doc(predictionId).set({
          userId,
          matchId,
          homeScore,
          awayScore,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        });
      }
      
      return { success: true };
    } catch (error) {
      console.error('Save prediction error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get a user's prediction for a specific match
   * 
   * Retrieves a user's prediction for a given match from the database.
   * If userId is not provided, uses the currently authenticated user.
   * 
   * @param {number|string} matchId - ID of the match
   * @param {string} [userId=null] - Optional user ID (defaults to current user)
   * @returns {Object} Object with success status and prediction data or error message
   */
  async getPrediction(matchId, userId = null) {
    if (!userId && !authService.isLoggedIn()) {
      return { success: false, error: 'User not logged in' };
    }
    
    try {
      const uid = userId || authService.getCurrentUser().uid;
      const predictionId = `${uid}_${matchId}`;
      
      const doc = await this.firestore.collection('predictions').doc(predictionId).get();
      
      if (doc.exists) {
        return { success: true, prediction: doc.data() };
      } else {
        return { success: true, prediction: null };
      }
    } catch (error) {
      console.error('Get prediction error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get all predictions for a user
   * 
   * Retrieves all predictions made by a specific user.
   * If userId is not provided, uses the currently authenticated user.
   * 
   * @param {string} [userId=null] - Optional user ID (defaults to current user)
   * @returns {Object} Object with success status and array of predictions or error message
   */
  async getUserPredictions(userId = null) {
    if (!userId && !authService.isLoggedIn()) {
      return { success: false, error: 'User not logged in' };
    }
    
    try {
      const uid = userId || authService.getCurrentUser().uid;
      
      const snapshot = await this.firestore.collection('predictions')
        .where('userId', '==', uid)
        .get();
      
      const predictions = snapshot.docs.map(doc => doc.data());
      
      return { success: true, predictions };
    } catch (error) {
      console.error('Get user predictions error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Save a match result (admin only)
   * 
   * Records the actual result of a match in the database.
   * Only users with admin privileges can perform this action.
   * After saving the result, updates points for all users who made predictions.
   * 
   * @param {number|string} matchId - ID of the match
   * @param {number} homeScore - Actual score for the home team
   * @param {number} awayScore - Actual score for the away team
   * @returns {Object} Object with success status or error message
   */
  async saveMatchResult(matchId, homeScore, awayScore) {
    try {
      // Check if user has admin privileges
      const isAdmin = await authService.isAdmin();
      
      if (!isAdmin) {
        return { success: false, error: 'Unauthorized: Admin access required' };
      }
      
      await this.firestore.collection('results').doc(matchId.toString()).set({
        matchId,
        homeScore,
        awayScore,
        createdAt: new Date().toISOString(),
        createdBy: authService.getCurrentUser().uid
      });
      
      // Update user points after saving result
      await this.updatePointsForMatch(matchId, homeScore, awayScore);
      
      return { success: true };
    } catch (error) {
      console.error('Save match result error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get a match result
   * 
   * Retrieves the recorded result for a specific match.
   * 
   * @param {number|string} matchId - ID of the match
   * @returns {Object} Object with success status and result data or error message
   */
  async getMatchResult(matchId) {
    try {
      const doc = await this.firestore.collection('results').doc(matchId.toString()).get();
      
      if (doc.exists) {
        return { success: true, result: doc.data() };
      } else {
        return { success: true, result: null };
      }
    } catch (error) {
      console.error('Get match result error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Calculate points for a prediction
   * 
   * Determines how many points a user earns based on their prediction and the actual result.
   * Points are awarded as follows:
   * - 20 points for exact score match
   * - 15 points for correct goal difference
   * - 10 points for correct winner/draw
   * - -10 points for completely wrong prediction
   * 
   * @param {Object} prediction - User's prediction object
   * @param {Object} result - Actual match result object
   * @returns {number} Points earned for the prediction
   */
  calculatePoints(prediction, result) {
    if (!prediction || !result) return 0;
    
    const predHomeScore = prediction.homeScore;
    const predAwayScore = prediction.awayScore;
    const resultHomeScore = result.homeScore;
    const resultAwayScore = result.awayScore;
    
    // Exact score match
    if (predHomeScore === resultHomeScore && predAwayScore === resultAwayScore) {
      return 20;
    }
    
    // Goal difference match
    const predDiff = predHomeScore - predAwayScore;
    const resultDiff = resultHomeScore - resultAwayScore;
    
    if (predDiff === resultDiff) {
      return 15;
    }
    
    // Winner match
    const predWinner = predDiff > 0 ? "home" : (predDiff < 0 ? "away" : "draw");
    const resultWinner = resultDiff > 0 ? "home" : (resultDiff < 0 ? "away" : "draw");
    
    if (predWinner === resultWinner) {
      return 10;
    }
    
    // Everything wrong
    return -10;
  }
  
  /**
   * Update points for all users who predicted a match
   * 
   * Calculates and records points for all users who made predictions for a specific match.
   * Called automatically after saving a match result.
   * 
   * @param {number|string} matchId - ID of the match
   * @param {number} homeScore - Actual score for the home team
   * @param {number} awayScore - Actual score for the away team
   * @returns {Object} Object with success status or error message
   */
  async updatePointsForMatch(matchId, homeScore, awayScore) {
    try {
      // Get all predictions for this match
      const snapshot = await this.firestore.collection('predictions')
        .where('matchId', '==', matchId)
        .get();
      
      if (snapshot.docs.length === 0) {
        return { success: true, message: 'No predictions found for this match' };
      }
      
      // Result object
      const result = { homeScore, awayScore };
      
      // Process each prediction
      for (const doc of snapshot.docs) {
        const prediction = doc.data();
        const points = this.calculatePoints(prediction, result);
        
        // Save points for this prediction
        await this.firestore.collection('points').doc(doc.id).set({
          userId: prediction.userId,
          matchId,
          points,
          createdAt: new Date().toISOString()
        });
        
        // Update user's total points
        await this.updateUserTotalPoints(prediction.userId);
      }
      
      return { success: true };
    } catch (error) {
      console.error('Update points error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Update a user's total points
   * 
   * Calculates and updates the total points for a specific user.
   * Sums all points earned across all matches and updates the user's profile.
   * 
   * @param {string} userId - ID of the user
   * @returns {Object} Object with success status, total points, or error message
   */
  async updateUserTotalPoints(userId) {
    try {
      // Get all points for this user
      const snapshot = await this.firestore.collection('points')
        .where('userId', '==', userId)
        .get();
      
      // Calculate total points
      let totalPoints = 0;
      snapshot.docs.forEach(doc => {
        totalPoints += doc.data().points;
      });
      
      // Update user profile with total points
      await this.firestore.collection('users').doc(userId).update({
        totalPoints
      });
      
      return { success: true, totalPoints };
    } catch (error) {
      console.error('Update total points error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get points for a specific match and user
   * 
   * Retrieves the points earned by a user for a specific match.
   * If userId is not provided, uses the currently authenticated user.
   * 
   * @param {number|string} matchId - ID of the match
   * @param {string} [userId=null] - Optional user ID (defaults to current user)
   * @returns {Object} Object with success status and points data or error message
   */
  async getPointsForMatch(matchId, userId = null) {
    if (!userId && !authService.isLoggedIn()) {
      return { success: false, error: 'User not logged in' };
    }
    
    try {
      const uid = userId || authService.getCurrentUser().uid;
      const pointsId = `${uid}_${matchId}`;
      
      const doc = await this.firestore.collection('points').doc(pointsId).get();
      
      if (doc.exists) {
        return { success: true, points: doc.data().points };
      } else {
        return { success: true, points: null };
      }
    } catch (error) {
      console.error('Get points error:', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get leaderboard (top users by points)
   * 
   * Retrieves a sorted list of users ranked by their total points.
   * 
   * @param {number} [limit=10] - Maximum number of users to include in the leaderboard
   * @returns {Object} Object with success status and leaderboard data or error message
   */
  async getLeaderboard(limit = 10) {
    try {
      // In a real app with a proper database, we would use a query like:
      // const snapshot = await this.firestore.collection('users')
      //   .orderBy('totalPoints', 'desc')
      //   .limit(limit)
      //   .get();
      
      // For our localStorage implementation, we need to get all users and sort manually
      const users = [];
      
      // Scan localStorage for user data
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('predipto_users_')) {
          const userData = JSON.parse(localStorage.getItem(key));
          users.push({
            id: key.replace('predipto_users_', ''),
            ...userData
          });
        }
      }
      
      // Sort by total points and limit
      const leaderboard = users
        .sort((a, b) => (b.totalPoints || 0) - (a.totalPoints || 0))
        .slice(0, limit);
      
      return { success: true, leaderboard };
    } catch (error) {
      console.error('Get leaderboard error:', error);
      return { success: false, error: error.message };
    }
  }
}

// Export a singleton instance
export const dataService = new DataService();
