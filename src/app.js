// In-memory database for MVP 1
const db = {
  matches: [],
  predictions: [],
  results: []
};

// Mock API for football matches
const footballAPI = {
  // Simulates fetching matches from an API
  getMatches: async () => {
    // For MVP 1, we'll use mock data to simulate API response
    return [
      {
        id: 1,
        teamA: "Germany",
        teamB: "France",
        date: "2025-03-30",
        time: "19:00",
        status: "upcoming",
        tournament: "Euro 2025",
        group: "Group F"
      },
      {
        id: 2,
        teamA: "Spain",
        teamB: "Italy",
        date: "2025-03-31",
        time: "20:00",
        status: "upcoming",
        tournament: "Euro 2025",
        group: "Group E"
      },
      {
        id: 3,
        teamA: "England",
        teamB: "Netherlands",
        date: "2025-04-01",
        time: "19:00",
        status: "upcoming",
        tournament: "Euro 2025",
        group: "Group D"
      },
      {
        id: 4,
        teamA: "Portugal",
        teamB: "Belgium",
        date: "2025-04-02",
        time: "20:00",
        status: "upcoming",
        tournament: "Euro 2025",
        group: "Group B"
      },
      {
        id: 5,
        teamA: "Croatia",
        teamB: "Denmark",
        date: "2025-04-03",
        time: "19:00",
        status: "upcoming",
        tournament: "Euro 2025",
        group: "Group C"
      }
    ];
  },
  
  // Simulates fetching team flags
  getTeamFlag: (teamName) => {
    const teamFlags = {
      "Germany": "https://flagcdn.com/w80/de.png",
      "France": "https://flagcdn.com/w80/fr.png",
      "Spain": "https://flagcdn.com/w80/es.png",
      "Italy": "https://flagcdn.com/w80/it.png",
      "England": "https://flagcdn.com/w80/gb-eng.png",
      "Netherlands": "https://flagcdn.com/w80/nl.png",
      "Portugal": "https://flagcdn.com/w80/pt.png",
      "Belgium": "https://flagcdn.com/w80/be.png",
      "Croatia": "https://flagcdn.com/w80/hr.png",
      "Denmark": "https://flagcdn.com/w80/dk.png"
    };
    
    return teamFlags[teamName] || "https://via.placeholder.com/80?text=" + teamName.substring(0, 3).toUpperCase();
  }
};

// Import services
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getAuth, 
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    onAuthStateChanged,
    signOut
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { 
    getFirestore, 
    collection, 
    doc, 
    addDoc, 
    setDoc, 
    getDoc, 
    getDocs, 
    query, 
    where, 
    orderBy, 
    limit,
    updateDoc,
    writeBatch,
    serverTimestamp,
    increment,
    Timestamp
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyAWIdXl3wiHqG53HFdiALHhRm52rRCZiiU",
    authDomain: "predipto.firebaseapp.com",
    projectId: "predipto",
    storageBucket: "predipto.firebasestorage.app",
    messagingSenderId: "77671182258",
    appId: "1:77671182258:web:516ddea7909a10f06d7eab",
    measurementId: "G-K4HB1MLBN1"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

// Football API Service
const footballAPIService = {
    apiKey: "YOUR_API_KEY", // Replace with your actual API key
    baseUrl: "https://api.football-data.org/v4",
    
    // Get competitions
    async getCompetitions() {
        try {
            // Check if we're running on Firebase hosting
            const isFirebaseHosted = window.location.hostname.includes('web.app') || 
                                    window.location.hostname.includes('firebaseapp.com');
            
            // Always use mock data when on Firebase hosting
            if (isFirebaseHosted) {
                console.log("Using mock competitions data for Firebase hosting");
                const mockCompetitions = [
                    { id: 2001, name: "UEFA Champions League", code: "CL" },
                    { id: 2021, name: "Premier League", code: "PL" },
                    { id: 2014, name: "La Liga", code: "PD" },
                    { id: 2002, name: "Bundesliga", code: "BL1" },
                    { id: 2019, name: "Serie A", code: "SA" }
                ];
                return mockCompetitions;
            }
            
            // Check if we have cached competitions
            const cachedCompetitions = localStorage.getItem('competitions');
            if (cachedCompetitions) {
                return JSON.parse(cachedCompetitions);
            }
            
            // Only make the actual API call on localhost
            const response = await fetch(`${this.baseUrl}/competitions`, {
                method: "GET",
                headers: {
                    "X-Auth-Token": this.apiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const competitions = data.competitions.map(comp => ({
                id: comp.id,
                name: comp.name,
                code: comp.code
            }));
            
            // Cache the competitions
            localStorage.setItem('competitions', JSON.stringify(competitions));
            
            return competitions;
        } catch (error) {
            console.error("Error fetching competitions:", error);
            
            // Return mock data on error
            const mockCompetitions = [
                { id: 2001, name: "UEFA Champions League", code: "CL" },
                { id: 2021, name: "Premier League", code: "PL" },
                { id: 2014, name: "La Liga", code: "PD" },
                { id: 2002, name: "Bundesliga", code: "BL1" },
                { id: 2019, name: "Serie A", code: "SA" }
            ];
            
            return mockCompetitions;
        }
    },
    
    // Get matches
    async getMatches(competitionCode = null) {
        try {
            // Check if we're running on Firebase hosting
            const isFirebaseHosted = window.location.hostname.includes('web.app') || 
                                    window.location.hostname.includes('firebaseapp.com');
            
            // Always use mock data when on Firebase hosting
            if (isFirebaseHosted) {
                console.log("Using mock matches data for Firebase hosting");
                const mockMatches = [
                    {
                        id: 1001,
                        competition: "UEFA Champions League",
                        competitionCode: "CL",
                        teamA: "Real Madrid",
                        teamB: "Bayern Munich",
                        teamALogo: "https://crests.football-data.org/86.png",
                        teamBLogo: "https://crests.football-data.org/5.png",
                        date: "2025-04-05",
                        time: "20:00",
                        status: "SCHEDULED",
                        group: "Quarter-final"
                    },
                    {
                        id: 1002,
                        competition: "UEFA Champions League",
                        competitionCode: "CL",
                        teamA: "Manchester City",
                        teamB: "Barcelona",
                        teamALogo: "https://crests.football-data.org/65.png",
                        teamBLogo: "https://crests.football-data.org/81.png",
                        date: "2025-04-06",
                        time: "20:00",
                        status: "SCHEDULED",
                        group: "Quarter-final"
                    },
                    {
                        id: 1003,
                        competition: "Premier League",
                        competitionCode: "PL",
                        teamA: "Liverpool",
                        teamB: "Arsenal",
                        teamALogo: "https://crests.football-data.org/64.png",
                        teamBLogo: "https://crests.football-data.org/57.png",
                        date: "2025-04-10",
                        time: "17:30",
                        status: "SCHEDULED"
                    },
                    {
                        id: 1004,
                        competition: "Premier League",
                        competitionCode: "PL",
                        teamA: "Manchester United",
                        teamB: "Chelsea",
                        teamALogo: "https://crests.football-data.org/66.png",
                        teamBLogo: "https://crests.football-data.org/61.png",
                        date: "2025-04-12",
                        time: "15:00",
                        status: "SCHEDULED"
                    },
                    {
                        id: 1005,
                        competition: "La Liga",
                        competitionCode: "PD",
                        teamA: "Atletico Madrid",
                        teamB: "Sevilla",
                        teamALogo: "https://crests.football-data.org/78.png",
                        teamBLogo: "https://crests.football-data.org/559.png",
                        date: "2025-04-15",
                        time: "21:00",
                        status: "SCHEDULED"
                    }
                ];
                
                // Filter by competition if specified
                const filteredMatches = competitionCode 
                    ? mockMatches.filter(match => match.competitionCode === competitionCode)
                    : mockMatches;
                
                return filteredMatches;
            }
            
            // Calculate date range (current month)
            const today = new Date();
            const dateFrom = today.toISOString().split('T')[0];
            const nextMonth = new Date(today);
            nextMonth.setMonth(today.getMonth() + 1);
            const dateTo = nextMonth.toISOString().split('T')[0];
            
            // Check if we have cached matches
            const cacheKey = `matches_${competitionCode || 'all'}_${dateFrom}_${dateTo}`;
            const cachedMatches = localStorage.getItem(cacheKey);
            
            if (cachedMatches) {
                return JSON.parse(cachedMatches);
            }
            
            // Only make the actual API call on localhost
            let url = `${this.baseUrl}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
            
            if (competitionCode) {
                url = `${this.baseUrl}/competitions/${competitionCode}/matches?dateFrom=${dateFrom}&dateTo=${dateTo}`;
            }
            
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "X-Auth-Token": this.apiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const matches = data.matches.map(match => {
                return {
                    id: match.id,
                    competition: match.competition.name,
                    competitionCode: match.competition.code,
                    teamA: match.homeTeam.name || match.homeTeam.shortName,
                    teamB: match.awayTeam.name || match.awayTeam.shortName,
                    teamALogo: match.homeTeam.crest,
                    teamBLogo: match.awayTeam.crest,
                    date: match.utcDate.split('T')[0],
                    time: match.utcDate.split('T')[1].substring(0, 5),
                    status: match.status,
                    group: match.group || null
                };
            });
            
            // Cache the matches
            localStorage.setItem(cacheKey, JSON.stringify(matches));
            
            return matches;
        } catch (error) {
            console.error("Error fetching matches:", error);
            
            // Return mock data on error
            const mockMatches = [
                {
                    id: 1001,
                    competition: "UEFA Champions League",
                    competitionCode: "CL",
                    teamA: "Real Madrid",
                    teamB: "Bayern Munich",
                    teamALogo: "https://crests.football-data.org/86.png",
                    teamBLogo: "https://crests.football-data.org/5.png",
                    date: "2025-04-05",
                    time: "20:00",
                    status: "SCHEDULED",
                    group: "Quarter-final"
                },
                {
                    id: 1002,
                    competition: "UEFA Champions League",
                    competitionCode: "CL",
                    teamA: "Manchester City",
                    teamB: "Barcelona",
                    teamALogo: "https://crests.football-data.org/65.png",
                    teamBLogo: "https://crests.football-data.org/81.png",
                    date: "2025-04-06",
                    time: "20:00",
                    status: "SCHEDULED",
                    group: "Quarter-final"
                },
                {
                    id: 1003,
                    competition: "Premier League",
                    competitionCode: "PL",
                    teamA: "Liverpool",
                    teamB: "Arsenal",
                    teamALogo: "https://crests.football-data.org/64.png",
                    teamBLogo: "https://crests.football-data.org/57.png",
                    date: "2025-04-10",
                    time: "17:30",
                    status: "SCHEDULED"
                },
                {
                    id: 1004,
                    competition: "Premier League",
                    competitionCode: "PL",
                    teamA: "Manchester United",
                    teamB: "Chelsea",
                    teamALogo: "https://crests.football-data.org/66.png",
                    teamBLogo: "https://crests.football-data.org/61.png",
                    date: "2025-04-12",
                    time: "15:00",
                    status: "SCHEDULED"
                },
                {
                    id: 1005,
                    competition: "La Liga",
                    competitionCode: "PD",
                    teamA: "Atletico Madrid",
                    teamB: "Sevilla",
                    teamALogo: "https://crests.football-data.org/78.png",
                    teamBLogo: "https://crests.football-data.org/559.png",
                    date: "2025-04-15",
                    time: "21:00",
                    status: "SCHEDULED"
                }
            ];
            
            // Filter by competition if specified
            const filteredMatches = competitionCode 
                ? mockMatches.filter(match => match.competitionCode === competitionCode)
                : mockMatches;
                
            return filteredMatches;
        }
    }
};

// Data service for handling predictions and results
const dataService = {
    async savePrediction(matchId, homeScore, awayScore) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User not authenticated");
            }
            
            const predictionRef = collection(firestore, "predictions");
            const q = query(predictionRef, 
                where("userId", "==", user.uid),
                where("matchId", "==", matchId)
            );
            
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                // Create new prediction
                await addDoc(predictionRef, {
                    userId: user.uid,
                    userName: user.displayName || user.email,
                    matchId: matchId,
                    homeScore: homeScore,
                    awayScore: awayScore,
                    timestamp: new Date().toISOString(),
                    points: null
                });
            } else {
                // Update existing prediction
                const predictionDoc = querySnapshot.docs[0];
                await updateDoc(doc(firestore, "predictions", predictionDoc.id), {
                    homeScore: homeScore,
                    awayScore: awayScore,
                    timestamp: new Date().toISOString()
                });
            }
            
            return { success: true };
        } catch (error) {
            console.error("Error saving prediction:", error);
            return { success: false, error: error.message };
        }
    },
    
    async getUserPrediction(matchId) {
        try {
            const user = auth.currentUser;
            if (!user) {
                return null;
            }
            
            const predictionRef = collection(firestore, "predictions");
            const q = query(predictionRef, 
                where("userId", "==", user.uid),
                where("matchId", "==", matchId)
            );
            
            const querySnapshot = await getDocs(q);
            
            if (querySnapshot.empty) {
                return null;
            }
            
            const predictionData = querySnapshot.docs[0].data();
            return {
                homeScore: predictionData.homeScore,
                awayScore: predictionData.awayScore
            };
        } catch (error) {
            console.error("Error getting user prediction:", error);
            return null;
        }
    },
    
    async saveMatchResult(matchId, homeScore, awayScore) {
        try {
            const user = auth.currentUser;
            if (!user) {
                throw new Error("User not authenticated");
            }
            
            // Check if user is admin (in a real app, you'd have admin roles in Firestore)
            const isAdmin = await authService.isAdmin(user.uid);
            if (!isAdmin) {
                throw new Error("Only admins can save match results");
            }
            
            // Save the result
            const resultRef = doc(firestore, "results", matchId.toString());
            await setDoc(resultRef, {
                matchId: matchId,
                homeScore: homeScore,
                awayScore: awayScore,
                timestamp: new Date().toISOString()
            });
            
            // Update points for all predictions for this match
            await this.calculatePoints(matchId, homeScore, awayScore);
            
            return { success: true };
        } catch (error) {
            console.error("Error saving match result:", error);
            return { success: false, error: error.message };
        }
    },
    
    async getMatchResult(matchId) {
        try {
            const resultRef = doc(firestore, "results", matchId.toString());
            const resultSnap = await getDoc(resultRef);
            
            if (!resultSnap.exists()) {
                return null;
            }
            
            const resultData = resultSnap.data();
            return {
                homeScore: resultData.homeScore,
                awayScore: resultData.awayScore
            };
        } catch (error) {
            console.error("Error getting match result:", error);
            return null;
        }
    },
    
    async calculatePoints(matchId, actualHomeScore, actualAwayScore) {
        try {
            const predictionRef = collection(firestore, "predictions");
            const q = query(predictionRef, where("matchId", "==", matchId));
            const querySnapshot = await getDocs(q);
            
            querySnapshot.forEach(async (predictionDoc) => {
                const prediction = predictionDoc.data();
                const predHomeScore = prediction.homeScore;
                const predAwayScore = prediction.awayScore;
                
                let points = 0;
                
                // Exact score
                if (predHomeScore === actualHomeScore && predAwayScore === actualAwayScore) {
                    points = 20;
                }
                // Correct goal difference
                else if ((predHomeScore - predAwayScore) === (actualHomeScore - actualAwayScore)) {
                    points = 15;
                }
                // Correct winner
                else if ((predHomeScore > predAwayScore && actualHomeScore > actualAwayScore) ||
                         (predHomeScore < predAwayScore && actualHomeScore < actualAwayScore) ||
                         (predHomeScore === predAwayScore && actualHomeScore === actualAwayScore)) {
                    points = 10;
                }
                // Everything wrong
                else {
                    points = -10;
                }
                
                // Update the prediction with points
                await updateDoc(doc(firestore, "predictions", predictionDoc.id), { points: points });
                
                // Update user's total points
                const userRef = doc(firestore, "users", prediction.userId);
                const userSnap = await getDoc(userRef);
                
                if (userSnap.exists()) {
                    const userData = userSnap.data();
                    const currentPoints = userData.totalPoints || 0;
                    await updateDoc(userRef, { totalPoints: currentPoints + points });
                }
            });
            
            return { success: true };
        } catch (error) {
            console.error("Error calculating points:", error);
            return { success: false, error: error.message };
        }
    },
    
    async getLeaderboard() {
        try {
            const userRef = collection(firestore, "users");
            const q = query(userRef, orderBy("totalPoints", "desc"), limit(10));
            const querySnapshot = await getDocs(q);
            
            const leaderboard = [];
            querySnapshot.forEach((doc) => {
                const userData = doc.data();
                leaderboard.push({
                    userId: doc.id,
                    name: userData.name || userData.email,
                    points: userData.totalPoints || 0
                });
            });
            
            return leaderboard;
        } catch (error) {
            console.error("Error getting leaderboard:", error);
            return [];
        }
    },
    
    async updateLeaderboard() {
        try {
            const leaderboard = await this.getLeaderboard();
            const leaderboardRef = doc(firestore, "leaderboard", "main");
            await setDoc(leaderboardRef, { leaderboard });
        } catch (error) {
            console.error("Error updating leaderboard:", error);
        }
    },
    
    async loadBonusQuestionsForUser() {
        const container = document.getElementById('bonus-questions-container');
        if (!container) return;
        
        try {
            // Get current user
            const user = auth.currentUser;
            if (!user) return;
            
            // Get all active bonus questions from Firestore
            // Use Firestore Timestamp instead of ISO string for date comparison
            const now = Timestamp.now();
            console.log("Current timestamp for bonus questions query:", now);
            
            const bonusQuery = query(
                collection(firestore, "bonusQuestions"),
                where("isResolved", "==", false)
            );
            
            const bonusSnapshot = await getDocs(bonusQuery);
            const bonusQuestions = [];
            
            bonusSnapshot.forEach(doc => {
                const data = doc.data();
                // Filter client-side for due date if needed
                // This avoids potential date format issues
                bonusQuestions.push({
                    id: doc.id,
                    ...data
                });
            });
            
            // Clear container
            container.innerHTML = '';
            
            if (bonusQuestions.length === 0) {
                container.innerHTML = `
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        No active bonus questions available at the moment.
                    </div>
                `;
                return;
            }
            
            // Render each bonus question
            for (const question of bonusQuestions) {
                // Check if user has already answered this question
                const answerQuery = query(
                    collection(firestore, "bonusAnswers"),
                    where("userId", "==", user.uid),
                    where("bonusId", "==", question.id)
                );
                
                const answerSnapshot = await getDocs(answerQuery);
                const hasAnswered = !answerSnapshot.empty;
                
                // Format due date
                const dueDate = new Date(question.dueDate);
                const formattedDueDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString();
                
                // Create bonus question card
                const questionCard = document.createElement('div');
                questionCard.className = 'card bonus-question-card shadow-sm';
                questionCard.innerHTML = `
                    <div class="card-header">
                        <h5 class="card-title">${question.text}</h5>
                        <div class="reward-badge">
                            <i class="fas fa-${question.type === 'multiplier' ? 'star' : 'plus-circle'}"></i>
                            ${question.type === 'multiplier' ? 
                                `${question.value}x Multiplier` : 
                                `${question.value} Bonus Points`}
                        </div>
                        <div class="due-date">
                            <i class="fas fa-clock"></i>
                            Due: ${formattedDueDate}
                        </div>
                    </div>
                    <div class="card-body">
                        <form id="bonus-form-${question.id}">
                            ${question.options.map((option, index) => `
                                <div class="form-check">
                                    <input class="form-check-input" type="radio" name="bonus-answer-${question.id}" 
                                        id="bonus-option-${question.id}-${index}" value="${index}"
                                        ${hasAnswered ? 'disabled' : ''}>
                                    <label class="form-check-label" for="bonus-option-${question.id}-${index}">
                                        ${option}
                                    </label>
                                </div>
                            `).join('')}
                            
                            ${hasAnswered ? `
                                <div class="alert alert-success mt-3">
                                    <i class="fas fa-check-circle me-2"></i>
                                    You've already answered this question. Results will be available once the question is resolved.
                                </div>
                            ` : `
                                <button type="submit" class="btn btn-primary btn-submit">
                                    <i class="fas fa-paper-plane me-2"></i>Submit Answer
                                </button>
                            `}
                        </form>
                    </div>
                `;
                
                container.appendChild(questionCard);
                
                // Add event listener to form if user hasn't answered yet
                if (!hasAnswered) {
                    const form = document.getElementById(`bonus-form-${question.id}`);
                    form.addEventListener('submit', async (e) => {
                        e.preventDefault();
                        
                        const selectedOption = form.querySelector(`input[name="bonus-answer-${question.id}"]:checked`);
                        
                        if (!selectedOption) {
                            this.showMessage(form, 'Please select an answer', 'error');
                            return;
                        }
                        
                        const answerIndex = parseInt(selectedOption.value);
                        
                        try {
                            // Save answer to Firestore
                            await addDoc(collection(firestore, "bonusAnswers"), {
                                userId: user.uid,
                                bonusId: question.id,
                                answerIndex,
                                answerText: question.options[answerIndex],
                                timestamp: serverTimestamp()
                            });
                            
                            // Show success message
                            this.showMessage(form, 'Your answer has been submitted', 'success');
                            
                            // Reload bonus questions after a delay
                            setTimeout(() => {
                                this.loadBonusQuestionsForUser();
                            }, 1500);
                        } catch (error) {
                            console.error('Error submitting bonus answer:', error);
                            this.showMessage(form, `Error submitting answer: ${error.message}`, 'error');
                        }
                    });
                }
            }
        } catch (error) {
            console.error('Error loading bonus questions:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Error loading bonus questions. Please try again later.
                </div>
            `;
        }
    },
};

// Authentication service
const authService = {
    // Sign up with email and password
    async signUp(email, password, username) {
        try {
            // Create user in Firebase Auth
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Add user to Firestore
            await setDoc(doc(firestore, "users", userCredential.user.uid), {
                email,
                username,
                points: 0,
                isAdmin: false,
                createdAt: serverTimestamp()
            });
            
            return userCredential.user;
        } catch (error) {
            console.error("Error signing up:", error);
            throw error;
        }
    },
    
    // Sign in with email and password
    async signIn(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return userCredential.user;
        } catch (error) {
            console.error("Error signing in:", error);
            throw error;
        }
    },
    
    // Sign out
    async signOut() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Error signing out:", error);
            throw error;
        }
    },
    
    // Get current user
    getCurrentUser() {
        return auth.currentUser;
    },
    
    // Check if user is admin
    async isAdmin(userId) {
        try {
            if (!userId) return false;
            
            const userDoc = await getDoc(doc(firestore, "users", userId));
            if (userDoc.exists()) {
                return userDoc.data().isAdmin === true;
            }
            return false;
        } catch (error) {
            console.error("Error checking admin status:", error);
            return false;
        }
    }
};

// UI Components
const UI = {
    // DOM elements
    elements: {
        authContent: document.getElementById("auth-content"),
        mainContent: document.getElementById("main-content"),
        loginForm: document.getElementById("login-form"),
        registerForm: document.getElementById("register-form"),
        loginFormContainer: document.getElementById("login-form-container"),
        registerFormContainer: document.getElementById("register-form-container"),
        loginToggle: document.getElementById("login-toggle"),
        registerToggle: document.getElementById("register-toggle"),
        userProfile: document.getElementById("user-profile"),
        matchesContainer: document.getElementById("matches-container"),
        leaderboardContainer: document.getElementById("leaderboard-container"),
        totalPoints: document.getElementById("total-points"),
        competitionFilter: document.getElementById("competition-filter"),
        adminPanelToggle: document.getElementById("admin-panel-toggle")
    },
    
    // Initialize UI
    async init() {
        this.setupEventListeners();
        this.setupAuthStateListener();
    },
    
    // Setup event listeners
    setupEventListeners() {
        // Auth form toggles
        this.elements.registerToggle.addEventListener("click", (e) => {
            e.preventDefault();
            this.elements.loginFormContainer.classList.add("hidden");
            this.elements.registerFormContainer.classList.remove("hidden");
        });
        
        this.elements.loginToggle.addEventListener("click", (e) => {
            e.preventDefault();
            this.elements.registerFormContainer.classList.add("hidden");
            this.elements.loginFormContainer.classList.remove("hidden");
        });
        
        // Login form submission
        this.elements.loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = document.getElementById("login-email").value;
            const password = document.getElementById("login-password").value;
            
            const result = await authService.signIn(email, password);
            if (!result) {
                this.showMessage(this.elements.loginForm, "Invalid email or password", "error");
            }
        });
        
        // Register form submission
        this.elements.registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("register-name").value;
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;
            
            const result = await authService.signUp(email, password, name);
            if (!result) {
                this.showMessage(this.elements.registerForm, "Error signing up", "error");
            }
        });
    },
    
    // Setup auth state listener
    setupAuthStateListener() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in
                this.elements.authContent.classList.add("hidden");
                this.elements.mainContent.classList.remove("hidden");
                
                try {
                    // Get user data
                    const userRef = doc(firestore, "users", user.uid);
                    const userSnap = await getDoc(userRef);
                    const userData = userSnap.exists() ? userSnap.data() : null;
                    
                    // If this is the first user, make them an admin
                    if (userData) {
                        const usersQuery = query(collection(firestore, "users"));
                        const usersSnapshot = await getDocs(usersQuery);
                        
                        if (usersSnapshot.size === 1) {
                            // This is the only user, make them an admin
                            await updateDoc(userRef, { isAdmin: true });
                            console.log("First user set as admin:", user.uid);
                            userData.isAdmin = true;
                        }
                    }
                    
                    // Check if user is admin
                    const isAdmin = userData && userData.isAdmin === true;
                    console.log("User admin status:", isAdmin);
                    
                    // Render user profile
                    this.renderUserProfile(user, userData);
                    
                    // Load competitions for filter
                    const competitions = await footballAPIService.getCompetitions();
                    this.renderCompetitionFilters(competitions);
                    
                    // Load matches
                    const matches = await footballAPIService.getMatches();
                    await this.renderMatches(matches);
                    
                    // Load leaderboard
                    await dataService.updateLeaderboard();
                    
                    // Update total points
                    if (userData) {
                        this.elements.totalPoints.textContent = userData.points || 0;
                    }
                    
                    // Show admin panel toggle if user is admin
                    if (isAdmin && this.elements.adminPanelToggle) {
                        console.log("Showing admin panel toggle");
                        this.elements.adminPanelToggle.classList.remove('hidden');
                        
                        // Add event listener to admin panel toggle
                        this.elements.adminPanelToggle.addEventListener('click', () => {
                            this.showAdminPanel();
                        });
                    } else if (this.elements.adminPanelToggle) {
                        console.log("Hiding admin panel toggle");
                        this.elements.adminPanelToggle.classList.add('hidden');
                    }
                    
                    // Load bonus questions for user
                    dataService.loadBonusQuestionsForUser();
                } catch (error) {
                    console.error("Error in auth state listener:", error);
                }
            } else {
                // User is signed out
                this.elements.authContent.classList.remove("hidden");
                this.elements.loginFormContainer.classList.remove("hidden");
                this.elements.registerFormContainer.classList.add("hidden");
                this.elements.mainContent.classList.add("hidden");
            }
        });
    },
    
    // Render matches
    async renderMatches(matches) {
        const container = document.getElementById('matches-container');
        
        if (!matches || matches.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info text-center my-5">
                    <i class="fas fa-info-circle me-2"></i>
                    No upcoming matches found.
                </div>
            `;
            return;
        }
        
        container.innerHTML = '';
        
        // Process matches one by one to handle async operations
        for (const match of matches) {
            const matchElement = document.createElement('div');
            matchElement.className = 'match-card';
            matchElement.dataset.matchId = match.id;
            
            // Get user prediction if available - using await since it's an async function
            let predictionHtml = '';
            let isPredictionMade = false;
            let homeScoreValue = '';
            let awayScoreValue = '';
            
            try {
                const prediction = await dataService.getUserPrediction(match.id);
                if (prediction) {
                    isPredictionMade = true;
                    homeScoreValue = prediction.homeScore;
                    awayScoreValue = prediction.awayScore;
                    
                    predictionHtml = `
                        <div class="prediction-badge">
                            <span class="badge bg-primary">
                                <i class="fas fa-check-circle me-1"></i>
                                Your prediction: ${prediction.homeScore} - ${prediction.awayScore}
                            </span>
                        </div>
                    `;
                }
            } catch (error) {
                console.error("Error getting prediction for match", match.id, error);
                // Continue without showing prediction
            }
            
            matchElement.innerHTML = `
                <div class="match-header">
                    <div class="competition-name">
                        <i class="fas fa-trophy me-2"></i>${match.competition || match.competitionCode || 'Unknown Competition'}
                        ${match.group ? `<span class="badge bg-secondary ms-2">${match.group}</span>` : ''}
                    </div>
                    <div class="match-date">
                        <i class="far fa-calendar-alt me-1"></i> ${match.date} 
                        <i class="far fa-clock ms-2 me-1"></i> ${match.time}
                    </div>
                </div>
                
                <div class="match-details">
                    <div class="team">
                        <img src="${match.teamALogo || 'https://via.placeholder.com/60?text=' + match.teamA.substring(0, 2)}" alt="${match.teamA}" class="team-flag">
                        <div class="team-name">${match.teamA}</div>
                    </div>
                    
                    <div class="versus">VS</div>
                    
                    <div class="team">
                        <img src="${match.teamBLogo || 'https://via.placeholder.com/60?text=' + match.teamB.substring(0, 2)}" alt="${match.teamB}" class="team-flag">
                        <div class="team-name">${match.teamB}</div>
                    </div>
                </div>
                
                ${predictionHtml}
                
                <div class="score-inputs">
                    <div class="team-score">
                        <label for="home-score-${match.id}">${match.teamA}</label>
                        <input type="number" id="home-score-${match.id}" min="0" max="20" value="${homeScoreValue}" required>
                    </div>
                    
                    <div class="score-separator">-</div>
                    
                    <div class="team-score">
                        <label for="away-score-${match.id}">${match.teamB}</label>
                        <input type="number" id="away-score-${match.id}" min="0" max="20" value="${awayScoreValue}" required>
                    </div>
                </div>
                
                <div class="text-center mt-3">
                    <button class="btn btn-primary w-100 predict-btn" data-match-id="${match.id}">
                        <i class="fas fa-check-circle me-2"></i>${isPredictionMade ? 'Update Prediction' : 'Submit Prediction'}
                    </button>
                </div>
            `;
            
            container.appendChild(matchElement);
        }
        
        // Add event listeners to predict buttons
        const predictButtons = document.querySelectorAll('.predict-btn');
        predictButtons.forEach(button => {
            button.addEventListener('click', async (e) => {
                const matchId = e.target.dataset.matchId;
                const homeScoreInput = document.getElementById(`home-score-${matchId}`);
                const awayScoreInput = document.getElementById(`away-score-${matchId}`);
                
                if (!homeScoreInput.value || !awayScoreInput.value) {
                    this.showMessage(
                        e.target.closest('.match-card'),
                        'Please enter scores for both teams',
                        'error'
                    );
                    return;
                }
                
                const homeScore = parseInt(homeScoreInput.value);
                const awayScore = parseInt(awayScoreInput.value);
                
                try {
                    await dataService.savePrediction(matchId, homeScore, awayScore);
                    
                    // Re-render matches to update UI
                    const matches = await footballAPIService.getMatches();
                    await this.renderMatches(matches);
                    
                    // Update points
                    const userData = await authService.isAdmin(auth.currentUser.uid);
                    document.getElementById('total-points').textContent = userData.points || 0;
                } catch (error) {
                    console.error('Error saving prediction:', error);
                    this.showMessage(
                        e.target.closest('.match-card'),
                        'Error saving prediction. Please try again.',
                        'error'
                    );
                }
            });
        });
    },
    
    // Render competition filters
    renderCompetitionFilters(competitions) {
        const filterContainer = document.getElementById('competition-filter');
        if (!filterContainer) return;
        
        // Clear existing filters
        filterContainer.innerHTML = '<option value="all">All Competitions</option>';
        
        // Add competition options
        competitions.forEach(comp => {
            const option = document.createElement('option');
            option.value = comp.code;
            option.textContent = comp.name;
            filterContainer.appendChild(option);
        });
        
        // Add event listener to filter
        filterContainer.addEventListener('change', async (e) => {
            const competitionCode = e.target.value;
            const matches = competitionCode === 'all' 
                ? await footballAPIService.getMatches()
                : await footballAPIService.getMatches(competitionCode);
            await this.renderMatches(matches);
        });
    },
    
    // Render leaderboard
    renderLeaderboard(leaderboard) {
        const container = document.getElementById('leaderboard-container');
        
        if (!leaderboard || leaderboard.length === 0) {
            container.innerHTML = `
                <div class="alert alert-info text-center">
                    <i class="fas fa-info-circle me-2"></i>
                    No leaderboard data available.
                </div>
            `;
            return;
        }
        
        let html = '';
        
        leaderboard.forEach((user, index) => {
            const rank = index + 1;
            const rankClass = rank <= 3 ? `rank-${rank}` : '';
            
            html += `
                <div class="leaderboard-item">
                    <div class="leaderboard-rank ${rankClass}">${rank}</div>
                    <div class="leaderboard-name">${user.name}</div>
                    <div class="leaderboard-points">${user.points} pts</div>
                </div>
            `;
        });
        
        container.innerHTML = html;
    },
    
    // Render user profile
    renderUserProfile(user, userData) {
        const container = document.getElementById('user-profile');
        
        if (!user) {
            container.innerHTML = '';
            return;
        }
        
        const points = userData?.points || 0;
        const rank = userData?.rank || '-';
        
        container.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-light dropdown-toggle d-flex align-items-center" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <div class="avatar me-2">
                        <i class="fas fa-user-circle fa-lg"></i>
                    </div>
                    <div class="user-info">
                        <div class="user-name">${user.displayName || user.email}</div>
                        <div class="user-stats small">
                            <span class="badge bg-success me-1">${points} pts</span>
                            <span class="badge bg-secondary">Rank: ${rank}</span>
                        </div>
                    </div>
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="#"><i class="fas fa-user me-2"></i>Profile</a></li>
                    <li><a class="dropdown-item" href="#"><i class="fas fa-cog me-2"></i>Settings</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logout-btn"><i class="fas fa-sign-out-alt me-2"></i>Logout</a></li>
                </ul>
            </div>
        `;
        
        // Add event listener to logout button
        document.getElementById('logout-btn').addEventListener('click', async (e) => {
            e.preventDefault();
            try {
                await authService.signOut();
            } catch (error) {
                console.error('Error logging out:', error);
            }
        });
    },
    
    // Show message
    showMessage(container, message, type) {
        const messageElement = document.createElement('div');
        messageElement.className = `status-message status-${type} mt-3`;
        messageElement.innerHTML = `
            <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
            ${message}
        `;
        
        container.appendChild(messageElement);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            messageElement.remove();
        }, 5000);
    },
    
    // Show admin panel
    showAdminPanel() {
        const container = document.createElement('div');
        container.className = 'admin-panel';
        
        // Create admin panel content
        const content = document.createElement('div');
        content.className = 'card shadow';
        content.innerHTML = `
            <div class="card-header d-flex justify-content-between align-items-center">
                <h3>Admin Panel</h3>
                <button type="button" class="btn-close" aria-label="Close"></button>
            </div>
            <div class="card-body">
                <ul class="nav nav-tabs mb-4" id="adminTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="results-tab" data-bs-toggle="tab" 
                            data-bs-target="#results-content" type="button" role="tab" 
                            aria-controls="results-content" aria-selected="true">
                            <i class="fas fa-futbol me-2"></i>Match Results
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="users-tab" data-bs-toggle="tab" 
                            data-bs-target="#users-content" type="button" role="tab" 
                            aria-controls="users-content" aria-selected="false">
                            <i class="fas fa-users me-2"></i>Users
                        </button>
                    </li>
                    <li class="nav-item" role="presentation">
                        <button class="nav-link" id="bonus-tab" data-bs-toggle="tab" 
                            data-bs-target="#bonus-content" type="button" role="tab" 
                            aria-controls="bonus-content" aria-selected="false">
                            <i class="fas fa-star me-2"></i>Bonus Questions
                        </button>
                    </li>
                </ul>
                <div class="tab-content" id="adminTabContent">
                    <div class="tab-pane fade show active" id="results-content" role="tabpanel" aria-labelledby="results-tab">
                        <div id="admin-results-container">
                            <div class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="users-content" role="tabpanel" aria-labelledby="users-tab">
                        <div id="admin-users-container">
                            <div class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="tab-pane fade" id="bonus-content" role="tabpanel" aria-labelledby="bonus-tab">
                        <div id="admin-bonus-container">
                            <div class="text-center py-4">
                                <div class="spinner-border text-primary" role="status">
                                    <span class="visually-hidden">Loading...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        container.appendChild(content);
        document.body.appendChild(container);
        
        // Close button event
        const closeBtn = content.querySelector('.btn-close');
        closeBtn.addEventListener('click', () => {
            document.body.removeChild(container);
        });
        
        // Load admin panel content
        this.loadAdminResultsPanel();
        
        // Add event listeners for tab changes
        const userTab = document.getElementById('users-tab');
        userTab.addEventListener('click', () => {
            this.loadAdminUsersPanel();
        });
        
        const bonusTab = document.getElementById('bonus-tab');
        bonusTab.addEventListener('click', () => {
            this.loadAdminBonusPanel();
        });
    },
    
    // Load admin results panel
    async loadAdminResultsPanel() {
        const container = document.getElementById('admin-results-container');
        if (!container) return;
        
        try {
            // Get all matches
            const matches = await footballAPIService.getMatches();
            
            // Create table
            let html = `
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Competition</th>
                                <th colspan="3">Match</th>
                                <th>Result</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            for (const match of matches) {
                // Get current result if exists
                const result = await dataService.getMatchResult(match.id);
                
                html += `
                    <tr>
                        <td>${match.date}</td>
                        <td>${match.competition}</td>
                        <td class="text-end">
                            <img src="${match.teamALogo || 'https://via.placeholder.com/24'}" alt="${match.teamA}" class="team-icon me-2">
                            ${match.teamA}
                        </td>
                        <td class="text-center">vs</td>
                        <td>
                            <img src="${match.teamBLogo || 'https://via.placeholder.com/24'}" alt="${match.teamB}" class="team-icon me-2">
                            ${match.teamB}
                        </td>
                        <td>
                            ${result ? `${result.homeScore} - ${result.awayScore}` : '-'}
                        </td>
                        <td>
                            <button class="btn btn-primary btn-sm enter-result-btn" data-match-id="${match.id}" 
                                data-team-a="${match.teamA}" data-team-b="${match.teamB}"
                                ${result ? `data-home-score="${result.homeScore}" data-away-score="${result.awayScore}"` : ''}>
                                ${result ? '<i class="fas fa-edit me-1"></i>Edit' : '<i class="fas fa-plus me-1"></i>Enter'}
                            </button>
                        </td>
                    </tr>
                `;
            }
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
            
            container.innerHTML = html;
            
            // Add event listeners to enter result buttons
            const enterResultBtns = container.querySelectorAll('.enter-result-btn');
            enterResultBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const matchId = btn.dataset.matchId;
                    const teamA = btn.dataset.teamA;
                    const teamB = btn.dataset.teamB;
                    const homeScore = btn.dataset.homeScore || '';
                    const awayScore = btn.dataset.awayScore || '';
                    
                    this.showEnterResultModal(matchId, teamA, teamB, homeScore, awayScore);
                });
            });
            
        } catch (error) {
            console.error('Error loading admin results panel:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Error loading matches: ${error.message}
                </div>
            `;
        }
    },
    
    // Load admin users panel
    async loadAdminUsersPanel() {
        const container = document.getElementById('admin-users-container');
        if (!container) return;
        
        try {
            // Get all users
            const usersSnapshot = await getDocs(collection(firestore, "users"));
            const users = [];
            
            usersSnapshot.forEach(doc => {
                users.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Create table
            let html = `
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Username</th>
                                <th>Email</th>
                                <th>Points</th>
                                <th>Admin</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            for (const user of users) {
                html += `
                    <tr>
                        <td>${user.username || 'N/A'}</td>
                        <td>${user.email}</td>
                        <td>${user.points || 0}</td>
                        <td>
                            <div class="form-check form-switch">
                                <input class="form-check-input toggle-admin" type="checkbox" 
                                    data-user-id="${user.id}" ${user.isAdmin ? 'checked' : ''}>
                            </div>
                        </td>
                        <td>
                            <div class="btn-group">
                                <button class="btn btn-outline-primary btn-sm edit-user-btn" data-user-id="${user.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-outline-danger btn-sm delete-user-btn" data-user-id="${user.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
            
            container.innerHTML = html;
            
            // Add event listeners to toggle admin switches
            const toggleAdminSwitches = container.querySelectorAll('.toggle-admin');
            toggleAdminSwitches.forEach(toggle => {
                toggle.addEventListener('change', async () => {
                    const userId = toggle.dataset.userId;
                    const isAdmin = toggle.checked;
                    
                    try {
                        await updateDoc(doc(firestore, "users", userId), {
                            isAdmin
                        });
                        
                        this.showToast(`User admin status ${isAdmin ? 'enabled' : 'disabled'}`);
                    } catch (error) {
                        console.error('Error updating admin status:', error);
                        this.showToast('Error updating admin status', 'error');
                        toggle.checked = !isAdmin; // Revert the toggle
                    }
                });
            });
            
            // Add event listeners to edit user buttons
            const editUserBtns = container.querySelectorAll('.edit-user-btn');
            editUserBtns.forEach(btn => {
                btn.addEventListener('click', async () => {
                    const userId = btn.dataset.userId;
                    const userDoc = await getDoc(doc(firestore, "users", userId));
                    
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        this.showEditUserModal(userId, userData);
                    }
                });
            });
            
            // Add event listeners to delete user buttons
            const deleteUserBtns = container.querySelectorAll('.delete-user-btn');
            deleteUserBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const userId = btn.dataset.userId;
                    this.showDeleteUserModal(userId);
                });
            });
            
        } catch (error) {
            console.error('Error loading admin users panel:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Error loading users: ${error.message}
                </div>
            `;
        }
    },
    
    // Load admin bonus questions panel
    async loadAdminBonusPanel() {
        const container = document.getElementById('admin-bonus-container');
        if (!container) return;
        
        try {
            // Get all bonus questions
            const bonusSnapshot = await getDocs(collection(firestore, "bonusQuestions"));
            const bonusQuestions = [];
            
            bonusSnapshot.forEach(doc => {
                bonusQuestions.push({
                    id: doc.id,
                    ...doc.data()
                });
            });
            
            // Create content
            let html = `
                <div class="d-flex justify-content-end mb-3">
                    <button class="btn btn-primary add-bonus-btn">
                        <i class="fas fa-plus me-2"></i>Add Bonus Question
                    </button>
                </div>
                
                <div class="table-responsive">
                    <table class="table table-hover">
                        <thead>
                            <tr>
                                <th>Question</th>
                                <th>Type</th>
                                <th>Value</th>
                                <th>Due Date</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            for (const question of bonusQuestions) {
                const dueDate = new Date(question.dueDate);
                const formattedDueDate = dueDate.toLocaleDateString() + ' ' + dueDate.toLocaleTimeString();
                
                html += `
                    <tr>
                        <td>${question.text}</td>
                        <td>${question.type === 'multiplier' ? 'Multiplier' : 'Bonus Points'}</td>
                        <td>${question.value}${question.type === 'multiplier' ? 'x' : ' pts'}</td>
                        <td>${formattedDueDate}</td>
                        <td>
                            <span class="badge ${question.isResolved ? 'bg-success' : 'bg-warning'}">
                                ${question.isResolved ? 'Resolved' : 'Active'}
                            </span>
                        </td>
                        <td>
                            <div class="btn-group">
                                <button class="btn btn-outline-primary btn-sm edit-bonus-btn" data-bonus-id="${question.id}">
                                    <i class="fas fa-edit"></i>
                                </button>
                                ${!question.isResolved ? `
                                <button class="btn btn-outline-success btn-sm resolve-bonus-btn" data-bonus-id="${question.id}">
                                    <i class="fas fa-check"></i>
                                </button>` : ''}
                                <button class="btn btn-outline-danger btn-sm delete-bonus-btn" data-bonus-id="${question.id}">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
            
            container.innerHTML = html;
            
            // Add event listener to add bonus button
            const addBonusBtn = container.querySelector('.add-bonus-btn');
            addBonusBtn.addEventListener('click', () => {
                this.showAddBonusModal();
            });
            
            // Add event listeners to edit bonus buttons
            const editBonusBtns = container.querySelectorAll('.edit-bonus-btn');
            editBonusBtns.forEach(btn => {
                btn.addEventListener('click', async () => {
                    const bonusId = btn.dataset.bonusId;
                    const bonusDoc = await getDoc(doc(firestore, "bonusQuestions", bonusId));
                    
                    if (bonusDoc.exists()) {
                        const bonusData = bonusDoc.data();
                        this.showEditBonusModal(bonusId, bonusData);
                    }
                });
            });
            
            // Add event listeners to resolve bonus buttons
            const resolveBonusBtns = container.querySelectorAll('.resolve-bonus-btn');
            resolveBonusBtns.forEach(btn => {
                btn.addEventListener('click', async () => {
                    const bonusId = btn.dataset.bonusId;
                    const bonusDoc = await getDoc(doc(firestore, "bonusQuestions", bonusId));
                    
                    if (bonusDoc.exists()) {
                        const bonusData = bonusDoc.data();
                        this.showResolveBonusModal(bonusId, bonusData);
                    }
                });
            });
            
            // Add event listeners to delete bonus buttons
            const deleteBonusBtns = container.querySelectorAll('.delete-bonus-btn');
            deleteBonusBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    const bonusId = btn.dataset.bonusId;
                    this.showDeleteBonusModal(bonusId);
                });
            });
            
        } catch (error) {
            console.error('Error loading admin bonus panel:', error);
            container.innerHTML = `
                <div class="alert alert-danger">
                    <i class="fas fa-exclamation-circle me-2"></i>
                    Error loading bonus questions: ${error.message}
                </div>
            `;
        }
    },
    
    // Show enter result modal
    showEnterResultModal(matchId, teamA, teamB, homeScore, awayScore) {
        const modalHtml = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h4>Enter Match Result</h4>
                        <button type="button" class="btn-close" id="close-modal"></button>
                    </div>
                    <div class="admin-modal-body">
                        <h5 class="mb-3">${teamA} vs ${teamB}</h5>
                        <form id="result-form">
                            <div class="row g-3 align-items-center mb-3">
                                <div class="col-5">
                                    <label for="home-score" class="form-label">${teamA}</label>
                                    <input type="number" class="form-control" id="home-score" min="0" max="20" value="${homeScore}" required>
                                </div>
                                <div class="col-2 text-center pt-4">
                                    <span class="fs-5">-</span>
                                </div>
                                <div class="col-5">
                                    <label for="away-score" class="form-label">${teamB}</label>
                                    <input type="number" class="form-control" id="away-score" min="0" max="20" value="${awayScore}" required>
                                </div>
                            </div>
                        </form>
                    </div>
                    <div class="admin-modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancel-result">Cancel</button>
                        <button type="button" class="btn btn-primary" id="save-result">Save Result</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        
        // Add event listeners
        document.getElementById('close-modal').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
        
        document.getElementById('cancel-result').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
        
        document.getElementById('save-result').addEventListener('click', async () => {
            const homeScore = parseInt(document.getElementById('home-score').value);
            const awayScore = parseInt(document.getElementById('away-score').value);
            
            if (isNaN(homeScore) || isNaN(awayScore)) {
                this.showToast('Please enter valid scores for both teams', 'error');
                return;
            }
            
            try {
                // Save the result
                await dataService.saveMatchResult(matchId, homeScore, awayScore);
                
                // Calculate points for all users
                await dataService.calculatePoints(matchId, homeScore, awayScore);
                
                this.showToast('Match result saved successfully');
                
                // Close the modal
                document.body.removeChild(modalContainer);
                
                // Reload the admin panel
                this.loadAdminResultsPanel();
                
                // Update leaderboard
                await dataService.updateLeaderboard();
            } catch (error) {
                console.error('Error saving match result:', error);
                this.showToast('Error saving match result: ' + error.message, 'error');
            }
        });
    },
    
    // Show edit user modal
    showEditUserModal(userId, userData) {
        const modalHtml = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h4>Edit User</h4>
                        <button type="button" class="btn-close" id="close-modal"></button>
                    </div>
                    <div class="admin-modal-body">
                        <form id="edit-user-form">
                            <div class="mb-3">
                                <label for="username" class="form-label">Username</label>
                                <input type="text" class="form-control" id="username" value="${userData.username || ''}">
                            </div>
                            <div class="mb-3">
                                <label for="email" class="form-label">Email</label>
                                <input type="email" class="form-control" id="email" value="${userData.email}" readonly>
                            </div>
                            <div class="mb-3">
                                <label for="points" class="form-label">Points</label>
                                <input type="number" class="form-control" id="points" value="${userData.points || 0}">
                            </div>
                            <div class="form-check form-switch mb-3">
                                <input class="form-check-input" type="checkbox" id="is-admin" ${userData.isAdmin ? 'checked' : ''}>
                                <label class="form-check-label" for="is-admin">Admin</label>
                            </div>
                        </form>
                    </div>
                    <div class="admin-modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancel-edit">Cancel</button>
                        <button type="button" class="btn btn-primary" id="save-user">Save Changes</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        
        // Add event listeners
        document.getElementById('close-modal').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
        
        document.getElementById('cancel-edit').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
        
        document.getElementById('save-user').addEventListener('click', async () => {
            const username = document.getElementById('username').value;
            const points = parseInt(document.getElementById('points').value);
            const isAdmin = document.getElementById('is-admin').checked;
            
            try {
                await updateDoc(doc(firestore, "users", userId), {
                    username,
                    points,
                    isAdmin
                });
                
                this.showToast('User updated successfully');
                
                // Close the modal
                document.body.removeChild(modalContainer);
                
                // Reload the admin panel
                this.loadAdminUsersPanel();
                
                // Update leaderboard
                await dataService.updateLeaderboard();
            } catch (error) {
                console.error('Error updating user:', error);
                this.showToast('Error updating user: ' + error.message, 'error');
            }
        });
    },
    
    // Show delete user modal
    showDeleteUserModal(userId) {
        const modalHtml = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h4>Delete User</h4>
                        <button type="button" class="btn-close" id="close-modal"></button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancel-delete">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirm-delete">Delete User</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        
        // Add event listeners
        document.getElementById('close-modal').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
        
        document.getElementById('cancel-delete').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
        
        document.getElementById('confirm-delete').addEventListener('click', async () => {
            try {
                await deleteDoc(doc(firestore, "users", userId));
                
                this.showToast('User deleted successfully');
                
                // Close the modal
                document.body.removeChild(modalContainer);
                
                // Reload the admin panel
                this.loadAdminUsersPanel();
            } catch (error) {
                console.error('Error deleting user:', error);
                this.showToast('Error deleting user: ' + error.message, 'error');
            }
        });
    },
    
    // Show add bonus modal
    showAddBonusModal() {
        const modalHtml = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h4>Add Bonus Question</h4>
                        <button type="button" class="btn-close" id="close-modal"></button>
                    </div>
                    <div class="admin-modal-body">
                        <form id="add-bonus-form">
                            <div class="mb-3">
                                <label for="bonus-text" class="form-label">Question</label>
                                <textarea class="form-control" id="bonus-text" rows="3" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="bonus-type" class="form-label">Reward Type</label>
                                <select class="form-select" id="bonus-type" required>
                                    <option value="multiplier">Multiplier</option>
                                    <option value="points">Bonus Points</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="bonus-value" class="form-label">Reward Value</label>
                                <input type="number" class="form-control" id="bonus-value" min="1" step="0.1" value="1" required>
                                <div class="form-text">For multiplier, enter value like 1.5 (1.5x). For bonus points, enter whole number.</div>
                            </div>
                            <div class="mb-3">
                                <label for="bonus-options" class="form-label">Answer Options (one per line)</label>
                                <textarea class="form-control" id="bonus-options" rows="4" required></textarea>
                            </div>
                            <div class="mb-3">
                                <label for="bonus-due-date" class="form-label">Due Date</label>
                                <input type="datetime-local" class="form-control" id="bonus-due-date" required>
                            </div>
                        </form>
                    </div>
                    <div class="admin-modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancel-bonus">Cancel</button>
                        <button type="button" class="btn btn-primary" id="save-bonus">Save Question</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        
        // Set default due date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(23, 59, 0, 0);
        document.getElementById('bonus-due-date').value = tomorrow.toISOString().slice(0, 16);
        
        // Add event listeners
        document.getElementById('close-modal').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
        
        document.getElementById('cancel-bonus').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
        
        document.getElementById('save-bonus').addEventListener('click', async () => {
            const form = document.getElementById('add-bonus-form');
            
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }
            
            const text = document.getElementById('bonus-text').value;
            const type = document.getElementById('bonus-type').value;
            const value = parseFloat(document.getElementById('bonus-value').value);
            const options = document.getElementById('bonus-options').value.split('\n').filter(option => option.trim() !== '');
            const dueDate = document.getElementById('bonus-due-date').value;
            
            if (options.length < 2) {
                this.showToast('Please provide at least 2 answer options', 'error');
                return;
            }
            
            try {
                await addDoc(collection(firestore, "bonusQuestions"), {
                    text,
                    type,
                    value,
                    options,
                    dueDate: new Date(dueDate).toISOString(),
                    isResolved: false,
                    createdAt: serverTimestamp()
                });
                
                this.showToast('Bonus question added successfully');
                
                // Close the modal
                document.body.removeChild(modalContainer);
                
                // Reload the admin panel
                this.loadAdminBonusPanel();
            } catch (error) {
                console.error('Error adding bonus question:', error);
                this.showToast('Error adding bonus question: ' + error.message, 'error');
            }
        });
    },
    
    // Show edit bonus modal
    showEditBonusModal(bonusId, bonusData) {
        const modalHtml = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h4>Edit Bonus Question</h4>
                        <button type="button" class="btn-close" id="close-modal"></button>
                    </div>
                    <div class="admin-modal-body">
                        <form id="edit-bonus-form">
                            <div class="mb-3">
                                <label for="bonus-text" class="form-label">Question</label>
                                <textarea class="form-control" id="bonus-text" rows="3" required>${bonusData.text}</textarea>
                            </div>
                            <div class="mb-3">
                                <label for="bonus-type" class="form-label">Reward Type</label>
                                <select class="form-select" id="bonus-type" required ${bonusData.isResolved ? 'disabled' : ''}>
                                    <option value="multiplier" ${bonusData.type === 'multiplier' ? 'selected' : ''}>Multiplier</option>
                                    <option value="points" ${bonusData.type === 'points' ? 'selected' : ''}>Bonus Points</option>
                                </select>
                            </div>
                            <div class="mb-3">
                                <label for="bonus-value" class="form-label">Reward Value</label>
                                <input type="number" class="form-control" id="bonus-value" min="1" step="0.1" value="${bonusData.value}" required ${bonusData.isResolved ? 'disabled' : ''}>
                                <div class="form-text">For multiplier, enter value like 1.5 (1.5x). For bonus points, enter whole number.</div>
                            </div>
                            <div class="mb-3">
                                <label for="bonus-options" class="form-label">Answer Options (one per line)</label>
                                <textarea class="form-control" id="bonus-options" rows="4" required ${bonusData.isResolved ? 'disabled' : ''}>${bonusData.options.join('\n')}</textarea>
                            </div>
                            <div class="mb-3">
                                <label for="bonus-due-date" class="form-label">Due Date</label>
                                <input type="datetime-local" class="form-control" id="bonus-due-date" required ${bonusData.isResolved ? 'disabled' : ''}>
                            </div>
                        </form>
                    </div>
                    <div class="admin-modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancel-edit">Cancel</button>
                        <button type="button" class="btn btn-primary" id="save-bonus" ${bonusData.isResolved ? 'disabled' : ''}>Save Changes</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        
        // Set due date
        const dueDate = new Date(bonusData.dueDate);
        document.getElementById('bonus-due-date').value = dueDate.toISOString().slice(0, 16);
        
        // Add event listeners
        document.getElementById('close-modal').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
        
        document.getElementById('cancel-edit').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
        
        if (!bonusData.isResolved) {
            document.getElementById('save-bonus').addEventListener('click', async () => {
                const form = document.getElementById('edit-bonus-form');
                
                if (!form.checkValidity()) {
                    form.reportValidity();
                    return;
                }
                
                const text = document.getElementById('bonus-text').value;
                const type = document.getElementById('bonus-type').value;
                const value = parseFloat(document.getElementById('bonus-value').value);
                const options = document.getElementById('bonus-options').value.split('\n').filter(option => option.trim() !== '');
                const dueDate = document.getElementById('bonus-due-date').value;
                
                if (options.length < 2) {
                    this.showToast('Please provide at least 2 answer options', 'error');
                    return;
                }
                
                try {
                    await updateDoc(doc(firestore, "bonusQuestions", bonusId), {
                        text,
                        type,
                        value,
                        options,
                        dueDate: new Date(dueDate).toISOString(),
                        updatedAt: serverTimestamp()
                    });
                    
                    this.showToast('Bonus question updated successfully');
                    
                    // Close the modal
                    document.body.removeChild(modalContainer);
                    
                    // Reload the admin panel
                    this.loadAdminBonusPanel();
                } catch (error) {
                    console.error('Error updating bonus question:', error);
                    this.showToast('Error updating bonus question: ' + error.message, 'error');
                }
            });
        }
    },
    
    // Show resolve bonus modal
    showResolveBonusModal(bonusId, bonusData) {
        const modalHtml = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h4>Resolve Bonus Question</h4>
                        <button type="button" class="btn-close" id="close-modal"></button>
                    </div>
                    <div class="admin-modal-body">
                        <h5 class="mb-3">${bonusData.text}</h5>
                        <p class="text-muted mb-4">
                            ${bonusData.type === 'multiplier' ? 
                                `Reward: ${bonusData.value}x multiplier` : 
                                `Reward: ${bonusData.value} bonus points`}
                        </p>
                        
                        <div class="mb-3">
                            <label for="correct-answer" class="form-label">Select Correct Answer</label>
                            <select class="form-select" id="correct-answer" required>
                                <option value="" selected disabled>Select the correct answer</option>
                                ${bonusData.options.map((option, index) => 
                                    `<option value="${index}">${option}</option>`).join('')}
                            </select>
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancel-resolve">Cancel</button>
                        <button type="button" class="btn btn-success" id="resolve-bonus">Resolve Question</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        
        // Add event listeners
        document.getElementById('close-modal').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
        
        document.getElementById('cancel-resolve').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
        
        document.getElementById('resolve-bonus').addEventListener('click', async () => {
            const correctAnswerSelect = document.getElementById('correct-answer');
            
            if (!correctAnswerSelect.value) {
                this.showToast('Please select the correct answer', 'error');
                return;
            }
            
            const correctAnswerIndex = parseInt(correctAnswerSelect.value);
            
            try {
                // Update the bonus question
                await updateDoc(doc(firestore, "bonusQuestions", bonusId), {
                    isResolved: true,
                    correctAnswerIndex,
                    resolvedAt: serverTimestamp()
                });
                
                // Calculate rewards for users who answered correctly
                await this.calculateBonusRewards(bonusId, correctAnswerIndex, bonusData);
                
                this.showToast('Bonus question resolved successfully');
                
                // Close the modal
                document.body.removeChild(modalContainer);
                
                // Reload the admin panel
                this.loadAdminBonusPanel();
            } catch (error) {
                console.error('Error resolving bonus question:', error);
                this.showToast('Error resolving bonus question: ' + error.message, 'error');
            }
        });
    },
    
    // Show delete bonus modal
    showDeleteBonusModal(bonusId) {
        const modalHtml = `
            <div class="admin-modal">
                <div class="admin-modal-content">
                    <div class="admin-modal-header">
                        <h4>Delete Bonus Question</h4>
                        <button type="button" class="btn-close" id="close-modal"></button>
                    </div>
                    <div class="admin-modal-body">
                        <div class="alert alert-danger">
                            <i class="fas fa-exclamation-triangle me-2"></i>
                            Are you sure you want to delete this bonus question? This action cannot be undone.
                        </div>
                    </div>
                    <div class="admin-modal-footer">
                        <button type="button" class="btn btn-secondary" id="cancel-delete">Cancel</button>
                        <button type="button" class="btn btn-danger" id="confirm-delete">Delete Question</button>
                    </div>
                </div>
            </div>
        `;
        
        // Add modal to DOM
        const modalContainer = document.createElement('div');
        modalContainer.innerHTML = modalHtml;
        document.body.appendChild(modalContainer);
        
        // Add event listeners
        document.getElementById('close-modal').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
        
        document.getElementById('cancel-delete').addEventListener('click', () => {
            document.body.removeChild(modalContainer);
        });
        
        document.getElementById('confirm-delete').addEventListener('click', async () => {
            try {
                await deleteDoc(doc(firestore, "bonusQuestions", bonusId));
                
                this.showToast('Bonus question deleted successfully');
                
                // Close the modal
                document.body.removeChild(modalContainer);
                
                // Reload the admin panel
                this.loadAdminBonusPanel();
            } catch (error) {
                console.error('Error deleting bonus question:', error);
                this.showToast('Error deleting bonus question: ' + error.message, 'error');
            }
        });
    },
    
    // Calculate bonus rewards for users
    async calculateBonusRewards(bonusId, correctAnswerIndex, bonusData) {
        try {
            // Get all answers for this bonus question
            const answersQuery = query(
                collection(firestore, "bonusAnswers"),
                where("bonusId", "==", bonusId)
            );
            
            const answersSnapshot = await getDocs(answersQuery);
            
            // Process each answer
            const batch = writeBatch(firestore);
            
            answersSnapshot.forEach(doc => {
                const answer = doc.data();
                const isCorrect = answer.answerIndex === correctAnswerIndex;
                
                // Update the answer document
                batch.update(doc.ref, {
                    isCorrect,
                    resolvedAt: serverTimestamp()
                });
                
                // If correct, apply the reward to the user
                if (isCorrect) {
                    const userRef = doc(firestore, "users", answer.userId);
                    
                    if (bonusData.type === 'multiplier') {
                        // For multiplier, we'll store it in the user document
                        batch.update(userRef, {
                            multiplier: bonusData.value,
                            multiplierExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 1 week expiry
                        });
                    } else {
                        // For bonus points, add directly to user's points
                        batch.update(userRef, {
                            points: increment(bonusData.value)
                        });
                    }
                }
            });
            
            // Commit all the updates
            await batch.commit();
            
            // Update leaderboard
            await dataService.updateLeaderboard();
            
            return true;
        } catch (error) {
            console.error('Error calculating bonus rewards:', error);
            throw error;
        }
    },
    
    // Show toast message
    showToast(message, type = 'success') {
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type === 'success' ? 'success' : 'danger'} border-0 position-fixed bottom-0 end-0 m-3`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Initialize Bootstrap toast
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 3000
        });
        
        bsToast.show();
        
        // Remove from DOM after hiding
        toast.addEventListener('hidden.bs.toast', () => {
            document.body.removeChild(toast);
        });
    },
};

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
    UI.init();
});
