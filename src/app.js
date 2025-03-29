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
    
    // Render user profile
    renderUserProfile(user, userData) {
        const name = userData?.name || user.email;
        
        this.elements.userProfile.innerHTML = `
            <span class="mr-2 text-secondary-700">${name}</span>
            <div class="dropdown">
                <button class="flex items-center justify-center w-8 h-8 bg-primary-100 text-primary-800 rounded-full">
                    ${name.charAt(0).toUpperCase()}
                </button>
                <div class="dropdown-content" id="user-dropdown">
                    <div class="py-1">
                        <div class="dropdown-item font-medium">${name}</div>
                        <div class="dropdown-item text-secondary-500">${user.email}</div>
                        <hr class="my-1 border-secondary-200">
                        <a href="#" id="logout-btn" class="dropdown-item text-accent-600">Logout</a>
                    </div>
                </div>
            </div>
        `;
        
        // Toggle dropdown
        const dropdownBtn = this.elements.userProfile.querySelector("button");
        const dropdownContent = document.getElementById("user-dropdown");
        
        dropdownBtn.addEventListener("click", () => {
            dropdownContent.classList.toggle("hidden");
        });
        
        // Close dropdown when clicking outside
        document.addEventListener("click", (e) => {
            if (!dropdownBtn.contains(e.target) && !dropdownContent.contains(e.target)) {
                dropdownContent.classList.add("hidden");
            }
        });
        
        // Logout button
        document.getElementById("logout-btn").addEventListener("click", async (e) => {
            e.preventDefault();
            await authService.logout();
        });
    },
    
    // Render competition filter
    renderCompetitionFilter(competitions) {
        let html = `
            <div class="flex flex-wrap items-center gap-2">
                <span class="text-sm font-medium text-secondary-700">Filter by:</span>
                <button class="competition-btn badge badge-primary active" data-code="all">All Competitions</button>
        `;
        
        competitions.forEach(comp => {
            html += `
                <button class="competition-btn badge badge-secondary" data-code="${comp.code}">
                    ${comp.name}
                </button>
            `;
        });
        
        html += `</div>`;
        this.elements.competitionFilter.innerHTML = html;
        
        // Add event listeners to competition buttons
        const competitionBtns = document.querySelectorAll(".competition-btn");
        competitionBtns.forEach(btn => {
            btn.addEventListener("click", async () => {
                // Update active button
                competitionBtns.forEach(b => {
                    b.classList.remove("badge-primary", "active");
                    b.classList.add("badge-secondary");
                });
                btn.classList.remove("badge-secondary");
                btn.classList.add("badge-primary", "active");
                
                // Filter matches
                const code = btn.dataset.code;
                const matches = code === "all" 
                    ? await footballAPIService.getMatches() 
                    : await footballAPIService.getMatches(code);
                
                this.renderMatches(matches);
            });
        });
    },
    
    // Render matches
    async renderMatches(matches) {
        if (!matches || matches.length === 0) {
            this.elements.matchesContainer.innerHTML = `
                <div class="text-center py-8">
                    <p class="text-secondary-500">No upcoming matches found.</p>
                </div>
            `;
            return;
        }
        
        let html = "";
        
        for (const match of matches) {
            // Get user prediction
            const prediction = await dataService.getUserPrediction(match.id);
            
            // Get match result
            const result = await dataService.getMatchResult(match.id);
            
            html += `
                <div class="match-card ${prediction ? 'match-card-active' : ''}">
                    <div class="flex justify-between items-center mb-3">
                        <div>
                            <span class="badge badge-primary">${match.competition}</span>
                            ${match.group ? `<span class="badge badge-secondary ml-1">${match.group}</span>` : ''}
                        </div>
                        <div class="text-sm text-secondary-500">
                            ${match.date} • ${match.time}
                        </div>
                    </div>
                    
                    <div class="flex items-center justify-between">
                        <div class="flex items-center flex-1">
                            <div class="w-8 h-8 mr-2">
                                ${match.teamALogo ? `<img src="${match.teamALogo}" alt="${match.teamA}" class="w-full h-full object-contain">` : ''}
                            </div>
                            <span class="font-medium">${match.teamA}</span>
                        </div>
                        
                        <div class="mx-4">
                            <div class="flex items-center justify-center">
                                <input type="number" min="0" max="99" class="input-number home-score" 
                                    data-match-id="${match.id}" 
                                    value="${prediction ? prediction.homeScore : ''}" 
                                    ${result ? 'disabled' : ''}>
                                <span class="mx-2 text-xl">:</span>
                                <input type="number" min="0" max="99" class="input-number away-score" 
                                    data-match-id="${match.id}" 
                                    value="${prediction ? prediction.awayScore : ''}" 
                                    ${result ? 'disabled' : ''}>
                            </div>
                            
                            ${result ? `
                                <div class="text-center mt-2">
                                    <span class="text-sm font-medium">Result: ${result.homeScore} - ${result.awayScore}</span>
                                </div>
                            ` : ''}
                            
                            ${!result ? `
                                <div class="text-center mt-2">
                                    <button class="btn btn-primary save-prediction" data-match-id="${match.id}">
                                        ${prediction ? 'Update Prediction' : 'Save Prediction'}
                                    </button>
                                </div>
                            ` : ''}
                        </div>
                        
                        <div class="flex items-center justify-end flex-1">
                            <span class="font-medium">${match.teamB}</span>
                            <div class="w-8 h-8 ml-2">
                                ${match.teamBLogo ? `<img src="${match.teamBLogo}" alt="${match.teamB}" class="w-full h-full object-contain">` : ''}
                            </div>
                        </div>
                    </div>
                    
                    <div class="prediction-status mt-2" id="status-${match.id}"></div>
                </div>
            `;
        }
        
        this.elements.matchesContainer.innerHTML = html;
        
        // Add event listeners to save prediction buttons
        const saveBtns = document.querySelectorAll(".save-prediction");
        saveBtns.forEach(btn => {
            btn.addEventListener("click", async () => {
                const matchId = btn.dataset.matchId;
                const homeScoreInput = document.querySelector(`.home-score[data-match-id="${matchId}"]`);
                const awayScoreInput = document.querySelector(`.away-score[data-match-id="${matchId}"]`);
                
                const homeScore = parseInt(homeScoreInput.value);
                const awayScore = parseInt(awayScoreInput.value);
                
                if (isNaN(homeScore) || isNaN(awayScore)) {
                    this.showMessage(document.getElementById(`status-${matchId}`), "Please enter valid scores", "error");
                    return;
                }
                
                const result = await dataService.savePrediction(matchId, homeScore, awayScore);
                
                if (result.success) {
                    this.showMessage(document.getElementById(`status-${matchId}`), "Prediction saved successfully!", "success");
                    btn.textContent = "Update Prediction";
                    document.querySelector(`.match-card[data-match-id="${matchId}"]`).classList.add("match-card-active");
                } else {
                    this.showMessage(document.getElementById(`status-${matchId}`), result.error, "error");
                }
            });
        });
    },
    
    // Render leaderboard
    renderLeaderboard(leaderboard) {
        if (!leaderboard || leaderboard.length === 0) {
            this.elements.leaderboardContainer.innerHTML = `
                <div class="text-center py-4">
                    <p class="text-secondary-500">No leaderboard data available.</p>
                </div>
            `;
            return;
        }
        
        let html = `
            <div class="space-y-2">
        `;
        
        leaderboard.forEach((user, index) => {
            html += `
                <div class="flex items-center p-2 ${index === 0 ? 'bg-primary-50 rounded-md' : ''}">
                    <div class="flex-shrink-0 w-8 text-center">
                        <span class="font-bold ${index < 3 ? 'text-primary-600' : 'text-secondary-600'}">${index + 1}</span>
                    </div>
                    <div class="flex-grow ml-2">
                        <span class="font-medium">${user.name}</span>
                    </div>
                    <div class="flex-shrink-0 font-bold text-primary-600">
                        ${user.points}
                    </div>
                </div>
            `;
        });
        
        html += `</div>`;
        this.elements.leaderboardContainer.innerHTML = html;
    },
    
    // Show message
    showMessage(container, message, type) {
        const statusDiv = document.createElement("div");
        statusDiv.className = `status-message status-${type}`;
        statusDiv.textContent = message;
        
        // Remove any existing status messages
        const existingStatus = container.querySelector(".status-message");
        if (existingStatus) {
            existingStatus.remove();
        }
        
        container.appendChild(statusDiv);
        
        // Remove the message after 5 seconds
        setTimeout(() => {
            statusDiv.remove();
        }, 5000);
    }
};

// Initialize the app
document.addEventListener("DOMContentLoaded", () => {
    UI.init();
});
