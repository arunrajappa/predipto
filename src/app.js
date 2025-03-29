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
    updateDoc
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

// Football API service for real data
const footballAPIService = {
    apiKey: "290d0464a250411fa71d0599771e26c5", // Replace with your actual API key
    baseUrl: "https://api.football-data.org/v4",
    
    async getCompetitions() {
        try {
            const response = await fetch(`${this.baseUrl}/competitions`, {
                headers: {
                    "X-Auth-Token": this.apiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.competitions.filter(comp => 
                ["PL", "BL1", "SA", "PD", "FL1", "CL", "EC"].includes(comp.code)
            );
        } catch (error) {
            console.error("Error fetching competitions:", error);
            // Fallback to mock data if API fails
            return [
                { id: 2021, name: "Premier League", code: "PL", emblem: "https://crests.football-data.org/PL.png" },
                { id: 2002, name: "Bundesliga", code: "BL1", emblem: "https://crests.football-data.org/BL1.png" },
                { id: 2019, name: "Serie A", code: "SA", emblem: "https://crests.football-data.org/SA.png" },
                { id: 2014, name: "La Liga", code: "PD", emblem: "https://crests.football-data.org/PD.png" },
                { id: 2015, name: "Ligue 1", code: "FL1", emblem: "https://crests.football-data.org/FL1.png" },
                { id: 2001, name: "UEFA Champions League", code: "CL", emblem: "https://crests.football-data.org/CL.png" }
            ];
        }
    },
    
    async getMatches(competitionCode = null) {
        try {
            // Get current date in YYYY-MM-DD format
            const today = new Date();
            const formattedDate = today.toISOString().split('T')[0];
            
            // Create a date 30 days from now
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + 30);
            const formattedFutureDate = futureDate.toISOString().split('T')[0];
            
            // Build URL with date filters to get only upcoming matches
            let url = `${this.baseUrl}/matches?dateFrom=${formattedDate}&dateTo=${formattedFutureDate}`;
            if (competitionCode) {
                url = `${this.baseUrl}/competitions/${competitionCode}/matches?dateFrom=${formattedDate}&dateTo=${formattedFutureDate}`;
            }
            
            const response = await fetch(url, {
                headers: {
                    "X-Auth-Token": this.apiKey
                }
            });
            
            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }
            
            const data = await response.json();
            return data.matches.map(match => ({
                id: match.id,
                competition: match.competition.name,
                competitionCode: match.competition.code,
                teamA: match.homeTeam.name,
                teamALogo: match.homeTeam.crest || null,
                teamB: match.awayTeam.name,
                teamBLogo: match.awayTeam.crest || null,
                date: new Date(match.utcDate).toLocaleDateString(),
                time: new Date(match.utcDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                status: "upcoming",
                group: match.group || null
            }));
        } catch (error) {
            console.error("Error fetching matches:", error);
            // Fallback to mock data if API fails - using 2025 dates for upcoming matches
            return [
                { 
                    id: 1, 
                    competition: "UEFA Champions League 2025",
                    competitionCode: "CL",
                    teamA: "Manchester City", 
                    teamALogo: "https://crests.football-data.org/65.png",
                    teamB: "Real Madrid", 
                    teamBLogo: "https://crests.football-data.org/86.png",
                    date: "2025-04-15", 
                    time: "20:00", 
                    status: "upcoming", 
                    group: "Quarter-final" 
                },
                { 
                    id: 2, 
                    competition: "Premier League 2025",
                    competitionCode: "PL",
                    teamA: "Arsenal", 
                    teamALogo: "https://crests.football-data.org/57.png",
                    teamB: "Liverpool", 
                    teamBLogo: "https://crests.football-data.org/64.png",
                    date: "2025-04-10", 
                    time: "17:30", 
                    status: "upcoming", 
                    group: null 
                },
                { 
                    id: 3, 
                    competition: "La Liga 2025",
                    competitionCode: "PD",
                    teamA: "Barcelona", 
                    teamALogo: "https://crests.football-data.org/81.png",
                    teamB: "Atletico Madrid", 
                    teamBLogo: "https://crests.football-data.org/78.png",
                    date: "2025-04-12", 
                    time: "21:00", 
                    status: "upcoming", 
                    group: null 
                }
            ];
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
            const userRef = doc(firestore, "users", user.uid);
            const userSnap = await getDoc(userRef);
            
            if (!userSnap.exists() || !userSnap.data().isAdmin) {
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
    }
};

// Authentication service
const authService = {
    async register(name, email, password) {
        try {
            // Create user
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            // Save additional user data
            await setDoc(doc(firestore, "users", user.uid), {
                name: name,
                email: email,
                totalPoints: 0,
                isAdmin: false,
                createdAt: new Date().toISOString()
            });
            
            return { success: true, user: user };
        } catch (error) {
            console.error("Error registering user:", error);
            return { success: false, error: error.message };
        }
    },
    
    async login(email, password) {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            return { success: true, user: userCredential.user };
        } catch (error) {
            console.error("Error logging in:", error);
            return { success: false, error: error.message };
        }
    },
    
    async logout() {
        try {
            await signOut(auth);
            return { success: true };
        } catch (error) {
            console.error("Error logging out:", error);
            return { success: false, error: error.message };
        }
    },
    
    async getUserData(userId) {
        try {
            const userRef = doc(firestore, "users", userId);
            const userSnap = await getDoc(userRef);
            
            if (userSnap.exists()) {
                return userSnap.data();
            } else {
                return null;
            }
        } catch (error) {
            console.error("Error getting user data:", error);
            return null;
        }
    },
    
    getCurrentUser() {
        return auth.currentUser;
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
        competitionFilter: document.getElementById("competition-filter")
    },
    
    // Initialize UI
    init() {
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
            
            const result = await authService.login(email, password);
            if (!result.success) {
                this.showMessage(this.elements.loginForm, result.error, "error");
            }
        });
        
        // Register form submission
        this.elements.registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const name = document.getElementById("register-name").value;
            const email = document.getElementById("register-email").value;
            const password = document.getElementById("register-password").value;
            
            const result = await authService.register(name, email, password);
            if (!result.success) {
                this.showMessage(this.elements.registerForm, result.error, "error");
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
                
                // Load user data
                const userData = await authService.getUserData(user.uid);
                this.renderUserProfile(user, userData);
                
                // Load competitions for filter
                const competitions = await footballAPIService.getCompetitions();
                this.renderCompetitionFilter(competitions);
                
                // Load matches
                const matches = await footballAPIService.getMatches();
                this.renderMatches(matches);
                
                // Load leaderboard
                const leaderboard = await dataService.getLeaderboard();
                this.renderLeaderboard(leaderboard);
                
                // Update total points
                if (userData) {
                    this.elements.totalPoints.textContent = userData.totalPoints || 0;
                }
            } else {
                // User is signed out
                this.elements.mainContent.classList.add("hidden");
                this.elements.authContent.classList.remove("hidden");
                this.elements.loginFormContainer.classList.remove("hidden");
                this.elements.registerFormContainer.classList.add("hidden");
            }
        });
    },
    
    // Render matches
    renderMatches(matches) {
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
        
        matches.forEach(match => {
            const matchElement = document.createElement('div');
            matchElement.className = 'match-card';
            matchElement.dataset.matchId = match.id;
            
            // Get user prediction if available
            const prediction = dataService.getUserPrediction(match.id);
            const predictionHtml = prediction 
                ? `
                    <div class="prediction-badge">
                        <span class="badge bg-primary">
                            <i class="fas fa-check-circle me-1"></i>
                            Your prediction: ${prediction.homeScore} - ${prediction.awayScore}
                        </span>
                    </div>
                ` 
                : '';
            
            matchElement.innerHTML = `
                <div class="match-header">
                    <div class="competition-name">
                        <i class="fas fa-trophy me-2"></i>${match.competition}
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
                        <input type="number" id="home-score-${match.id}" min="0" max="20" value="${prediction ? prediction.homeScore : ''}" ${prediction ? 'disabled' : ''}>
                    </div>
                    
                    <div class="score-separator">-</div>
                    
                    <div class="team-score">
                        <label for="away-score-${match.id}">${match.teamB}</label>
                        <input type="number" id="away-score-${match.id}" min="0" max="20" value="${prediction ? prediction.awayScore : ''}" ${prediction ? 'disabled' : ''}>
                    </div>
                </div>
                
                <div class="text-center mt-3">
                    ${prediction 
                        ? '<button class="btn btn-secondary disabled w-100"><i class="fas fa-lock me-2"></i>Prediction Locked</button>' 
                        : `<button class="btn btn-primary w-100 predict-btn" data-match-id="${match.id}"><i class="fas fa-check-circle me-2"></i>Submit Prediction</button>`
                    }
                </div>
            `;
            
            container.appendChild(matchElement);
        });
        
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
                    this.renderMatches(matches);
                    
                    // Update points
                    const userData = await authService.getUserData(auth.currentUser.uid);
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
    
    // Render competition filter
    renderCompetitionFilter(competitions) {
        const container = document.getElementById('competition-filter');
        
        if (!competitions || competitions.length === 0) {
            container.innerHTML = '';
            return;
        }
        
        let html = `
            <div class="filter-buttons">
                <button class="filter-btn active" data-code="all">
                    <i class="fas fa-globe me-1"></i> All Competitions
                </button>
        `;
        
        competitions.forEach(competition => {
            html += `
                <button class="filter-btn" data-code="${competition.code}">
                    <i class="fas fa-trophy me-1"></i> ${competition.name}
                </button>
            `;
        });
        
        html += '</div>';
        container.innerHTML = html;
        
        // Add event listeners
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', async () => {
                // Update active state
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Show loading state
                document.getElementById('matches-container').innerHTML = `
                    <div class="loading text-center py-5">
                        <div class="spinner-border text-primary" role="status">
                            <span class="visually-hidden">Loading...</span>
                        </div>
                        <p class="mt-3">Loading matches...</p>
                    </div>
                `;
                
                // Filter matches
                const code = btn.dataset.code;
                const matches = code === "all" 
                    ? await footballAPIService.getMatches() 
                    : await footballAPIService.getMatches(code);
                
                this.renderMatches(matches);
            });
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
                await authService.logout();
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
};

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
    UI.init();
});
