/**
 * Main App Object
 * 
 * Central controller for the Predipto application that handles:
 * - UI rendering and updates
 * - Event listeners and user interactions
 * - Authentication state management
 * - Match predictions and results
 * - Admin functionality
 */
const app = {
    /**
     * DOM elements used throughout the application
     * Cached for performance and convenience
     */
    elements: {
        // Auth elements
        authContent: document.getElementById("auth-content"),
        loginForm: document.getElementById("login-form"),
        registerForm: document.getElementById("register-form"),
        loginFormContainer: document.getElementById("login-form-container"),
        registerFormContainer: document.getElementById("register-form-container"),
        loginToggle: document.getElementById("login-toggle"),
        registerToggle: document.getElementById("register-toggle"),
        
        // Main content elements
        userProfile: document.getElementById("user-profile"),
        mainContent: document.getElementById("main-content"),
        matchesContainer: document.getElementById("matches-container"),
        leaderboardContainer: document.getElementById("leaderboard-container"),
        totalPoints: document.getElementById("total-points"),
        adminPanelBtn: document.getElementById("admin-panel-btn"),
        competitionFilter: document.getElementById("competition-filter"),
        adminPanel: document.getElementById("admin-panel"),
        bonusQuestionsContainer: document.getElementById("bonus-questions-container")
    },
    
    /**
     * Initialize the application
     * 
     * Entry point for the application that:
     * - Sets up event listeners for user interactions
     * - Configures the authentication state observer
     * - Prepares the UI for user interaction
     */
    init() {
        this.setupEventListeners();
        this.setupAuthStateListener();
        console.log("Predipto application initialized");
    },
    
    /**
     * Set up event listeners for UI elements
     * 
     * Configures all event listeners for:
     * - Form submissions (login, register, predictions)
     * - Button clicks (login/register toggles, admin panel)
     * - Competition filter changes
     */
    setupEventListeners() {
        // Auth form toggles
        this.elements.loginToggle.addEventListener("click", () => {
            this.elements.loginFormContainer.classList.remove("hidden");
            this.elements.registerFormContainer.classList.add("hidden");
        });
        
        this.elements.registerToggle.addEventListener("click", () => {
            this.elements.loginFormContainer.classList.add("hidden");
            this.elements.registerFormContainer.classList.remove("hidden");
        });
        
        // Login form submission
        this.elements.loginForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            
            try {
                await authService.signIn(email, password);
                // Auth state listener will handle UI updates
            } catch (error) {
                this.showMessage(this.elements.loginFormContainer, `Login failed: ${error.message}`, "error");
            }
        });
        
        // Register form submission
        this.elements.registerForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const email = e.target.email.value;
            const password = e.target.password.value;
            const username = e.target.username.value;
            
            try {
                await authService.signUp(email, password, username);
                // Auth state listener will handle UI updates
            } catch (error) {
                this.showMessage(this.elements.registerFormContainer, `Registration failed: ${error.message}`, "error");
            }
        });
        
        // Competition filter change
        this.elements.competitionFilter.addEventListener("change", async (e) => {
            const competitionCode = e.target.value;
            const matches = await footballAPIService.getMatches(competitionCode === "all" ? null : competitionCode);
            this.renderMatches(matches);
        });
    },
    
    /**
     * Set up Firebase authentication state listener
     * 
     * Monitors user authentication state changes and:
     * - Updates the UI based on login status
     * - Loads user data and matches when logged in
     * - Shows appropriate content (auth forms or main app)
     * - Handles admin panel visibility
     */
    setupAuthStateListener() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in
                console.log("User is signed in:", user.uid);
                
                // Hide auth content, show main content
                this.elements.authContent.classList.add("hidden");
                this.elements.mainContent.classList.remove("hidden");
                
                try {
                    // Get user data from Firestore
                    const userDoc = await firestore.collection("users").doc(user.uid).get();
                    let userData = null;
                    
                    if (userDoc.exists) {
                        userData = userDoc.data();
                    } else {
                        // Create user document if it doesn't exist
                        userData = {
                            email: user.email,
                            displayName: user.displayName || user.email.split("@")[0],
                            createdAt: new Date().toISOString(),
                            totalPoints: 0,
                            isAdmin: false
                        };
                        
                        await firestore.collection("users").doc(user.uid).set(userData);
                    }
                    
                    // Render user profile
                    this.renderUserProfile(user, userData);
                    
                    // Check if user is admin and show admin panel button if they are
                    const isAdmin = await authService.isAdmin(user.uid);
                    if (isAdmin) {
                        this.elements.adminPanelBtn.classList.remove("hidden");
                        this.elements.adminPanelBtn.addEventListener("click", () => {
                            this.showAdminPanel();
                        });
                    } else {
                        this.elements.adminPanelBtn.classList.add("hidden");
                    }
                    
                    // Load competitions and matches
                    const competitions = await footballAPIService.getCompetitions();
                    this.renderCompetitionFilters(competitions);
                    
                    const matches = await footballAPIService.getMatches();
                    this.renderMatches(matches);
                    
                    // Load bonus questions
                    const bonusQuestions = await dataService.loadBonusQuestionsForUser();
                    if (bonusQuestions.success && bonusQuestions.questions.length > 0) {
                        this.renderBonusQuestions(bonusQuestions.questions);
                    }
                } catch (error) {
                    console.error("Error setting up user data:", error);
                    this.showMessage(this.elements.mainContent, `Error loading data: ${error.message}`, "error");
                }
            } else {
                // User is signed out
                console.log("User is signed out");
                
                // Show auth content, hide main content
                this.elements.authContent.classList.remove("hidden");
                this.elements.mainContent.classList.add("hidden");
                this.elements.adminPanelBtn.classList.add("hidden");
                
                // Reset forms
                this.elements.loginForm.reset();
                this.elements.registerForm.reset();
            }
        });
    },
    
    /**
     * Render user profile in the UI
     * 
     * Displays the user's information and statistics in the profile section
     * 
     * @param {Object} user - Firebase user object
     * @param {Object} userData - User data from Firestore
     */
    renderUserProfile(user, userData) {
        const profileElement = this.elements.userProfile;
        
        // Clear existing content
        profileElement.innerHTML = "";
        
        // Create profile content
        const profileContent = document.createElement("div");
        profileContent.classList.add("profile-content");
        
        // User info
        const userInfo = document.createElement("div");
        userInfo.classList.add("user-info");
        
        const displayName = document.createElement("h3");
        displayName.textContent = userData.displayName || user.email.split("@")[0];
        userInfo.appendChild(displayName);
        
        const email = document.createElement("p");
        email.textContent = user.email;
        userInfo.appendChild(email);
        
        // User stats
        const userStats = document.createElement("div");
        userStats.classList.add("user-stats");
        
        const pointsDisplay = document.createElement("div");
        pointsDisplay.classList.add("points-display");
        pointsDisplay.innerHTML = `<span>Total Points:</span> <span id="total-points">${userData.totalPoints || 0}</span>`;
        userStats.appendChild(pointsDisplay);
        
        // Sign out button
        const signOutBtn = document.createElement("button");
        signOutBtn.textContent = "Sign Out";
        signOutBtn.classList.add("btn", "btn-danger");
        signOutBtn.addEventListener("click", async () => {
            try {
                await authService.signOut();
                // Auth state listener will handle UI updates
            } catch (error) {
                this.showMessage(profileElement, `Sign out failed: ${error.message}`, "error");
            }
        });
        
        // Assemble profile
        profileContent.appendChild(userInfo);
        profileContent.appendChild(userStats);
        profileContent.appendChild(signOutBtn);
        
        profileElement.appendChild(profileContent);
    },
    
    /**
     * Render competition filters in the UI
     * 
     * Creates a dropdown menu for filtering matches by competition
     * 
     * @param {Array} competitions - List of competitions
     */
    renderCompetitionFilters(competitions) {
        const filterElement = this.elements.competitionFilter;
        
        // Clear existing options
        filterElement.innerHTML = "";
        
        // Add "All Competitions" option
        const allOption = document.createElement("option");
        allOption.value = "all";
        allOption.textContent = "All Competitions";
        filterElement.appendChild(allOption);
        
        // Add competition options
        competitions.forEach(competition => {
            const option = document.createElement("option");
            option.value = competition.code;
            option.textContent = competition.name;
            
            // Add competition emblem if available
            if (competition.emblem) {
                const emblemImg = document.createElement("img");
                emblemImg.src = competition.emblem;
                emblemImg.alt = competition.name;
                emblemImg.classList.add("competition-emblem");
                option.prepend(emblemImg);
            }
            
            filterElement.appendChild(option);
        });
    },
    
    /**
     * Render matches in the UI
     * 
     * Displays all matches with prediction inputs and existing predictions
     * Handles different match statuses (scheduled, in-play, finished)
     * 
     * @param {Array} matches - List of matches to display
     */
    renderMatches(matches) {
        const container = this.elements.matchesContainer;
        
        // Clear existing content
        container.innerHTML = "";
        
        if (!matches || matches.length === 0) {
            const noMatches = document.createElement("div");
            noMatches.classList.add("no-matches");
            noMatches.textContent = "No matches available";
            container.appendChild(noMatches);
            return;
        }
        
        // Create matches grid
        const matchesGrid = document.createElement("div");
        matchesGrid.classList.add("matches-grid");
        
        // Process each match
        matches.forEach(async match => {
            const matchCard = document.createElement("div");
            matchCard.classList.add("match-card");
            matchCard.dataset.matchId = match.id;
            
            // Match header with competition name
            const matchHeader = document.createElement("div");
            matchHeader.classList.add("match-header");
            
            const competitionName = document.createElement("span");
            competitionName.classList.add("competition-name");
            competitionName.textContent = match.competition?.name || "Unknown Competition";
            matchHeader.appendChild(competitionName);
            
            const matchDate = document.createElement("span");
            matchDate.classList.add("match-date");
            matchDate.textContent = new Date(match.utcDate).toLocaleString();
            matchHeader.appendChild(matchDate);
            
            matchCard.appendChild(matchHeader);
            
            // Match teams
            const matchTeams = document.createElement("div");
            matchTeams.classList.add("match-teams");
            
            // Home team
            const homeTeam = document.createElement("div");
            homeTeam.classList.add("team", "home-team");
            
            const homeTeamName = document.createElement("span");
            homeTeamName.classList.add("team-name");
            homeTeamName.textContent = match.homeTeam.name;
            homeTeam.appendChild(homeTeamName);
            
            if (match.homeTeam.crest) {
                const homeTeamCrest = document.createElement("img");
                homeTeamCrest.src = match.homeTeam.crest;
                homeTeamCrest.alt = match.homeTeam.name;
                homeTeamCrest.classList.add("team-crest");
                homeTeam.appendChild(homeTeamCrest);
            }
            
            matchTeams.appendChild(homeTeam);
            
            // VS
            const vs = document.createElement("div");
            vs.classList.add("vs");
            vs.textContent = "VS";
            matchTeams.appendChild(vs);
            
            // Away team
            const awayTeam = document.createElement("div");
            awayTeam.classList.add("team", "away-team");
            
            if (match.awayTeam.crest) {
                const awayTeamCrest = document.createElement("img");
                awayTeamCrest.src = match.awayTeam.crest;
                awayTeamCrest.alt = match.awayTeam.name;
                awayTeamCrest.classList.add("team-crest");
                awayTeam.appendChild(awayTeamCrest);
            }
            
            const awayTeamName = document.createElement("span");
            awayTeamName.classList.add("team-name");
            awayTeamName.textContent = match.awayTeam.name;
            awayTeam.appendChild(awayTeamName);
            
            matchTeams.appendChild(awayTeam);
            
            matchCard.appendChild(matchTeams);
            
            // Match status and result/prediction
            const matchStatus = document.createElement("div");
            matchStatus.classList.add("match-status");
            
            const statusText = document.createElement("span");
            statusText.classList.add("status-text");
            statusText.textContent = match.status;
            matchStatus.appendChild(statusText);
            
            // Get user's prediction for this match
            const predictionResult = await dataService.getUserPrediction(match.id);
            const prediction = predictionResult.success ? predictionResult.prediction : null;
            
            // Get match result if available
            const resultData = await dataService.getMatchResult(match.id);
            const result = resultData.success ? resultData.result : null;
            
            // Show result if match is finished
            if (match.status === "FINISHED" || result) {
                const resultDisplay = document.createElement("div");
                resultDisplay.classList.add("result-display");
                
                const homeScore = document.createElement("span");
                homeScore.classList.add("score", "home-score");
                homeScore.textContent = result ? result.homeScore : match.score.fullTime.home;
                resultDisplay.appendChild(homeScore);
                
                const scoreSeparator = document.createElement("span");
                scoreSeparator.classList.add("score-separator");
                scoreSeparator.textContent = "-";
                resultDisplay.appendChild(scoreSeparator);
                
                const awayScore = document.createElement("span");
                awayScore.classList.add("score", "away-score");
                awayScore.textContent = result ? result.awayScore : match.score.fullTime.away;
                resultDisplay.appendChild(awayScore);
                
                matchStatus.appendChild(resultDisplay);
                
                // Show user's points if they made a prediction
                if (prediction) {
                    const pointsData = await dataService.getPointsForMatch(match.id);
                    if (pointsData.success && pointsData.points !== null) {
                        const pointsDisplay = document.createElement("div");
                        pointsDisplay.classList.add("points-display");
                        pointsDisplay.textContent = `Points: ${pointsData.points}`;
                        matchStatus.appendChild(pointsDisplay);
                    }
                }
            } else {
                // Show prediction form if match is not finished
                const predictionForm = document.createElement("form");
                predictionForm.classList.add("prediction-form");
                
                const homeScoreInput = document.createElement("input");
                homeScoreInput.type = "number";
                homeScoreInput.min = "0";
                homeScoreInput.max = "99";
                homeScoreInput.name = "homeScore";
                homeScoreInput.placeholder = "0";
                homeScoreInput.value = prediction ? prediction.homeScore : "";
                homeScoreInput.classList.add("score-input", "home-score-input");
                predictionForm.appendChild(homeScoreInput);
                
                const scoreSeparator = document.createElement("span");
                scoreSeparator.classList.add("score-separator");
                scoreSeparator.textContent = "-";
                predictionForm.appendChild(scoreSeparator);
                
                const awayScoreInput = document.createElement("input");
                awayScoreInput.type = "number";
                awayScoreInput.min = "0";
                awayScoreInput.max = "99";
                awayScoreInput.name = "awayScore";
                awayScoreInput.placeholder = "0";
                awayScoreInput.value = prediction ? prediction.awayScore : "";
                awayScoreInput.classList.add("score-input", "away-score-input");
                predictionForm.appendChild(awayScoreInput);
                
                const submitBtn = document.createElement("button");
                submitBtn.type = "submit";
                submitBtn.classList.add("btn", "btn-primary", "prediction-btn");
                submitBtn.textContent = prediction ? "Update Prediction" : "Submit Prediction";
                predictionForm.appendChild(submitBtn);
                
                // Handle prediction submission
                predictionForm.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    
                    const homeScore = parseInt(homeScoreInput.value, 10);
                    const awayScore = parseInt(awayScoreInput.value, 10);
                    
                    if (isNaN(homeScore) || isNaN(awayScore)) {
                        this.showMessage(matchCard, "Please enter valid scores", "error");
                        return;
                    }
                    
                    try {
                        const result = await dataService.savePrediction(match.id, homeScore, awayScore);
                        
                        if (result.success) {
                            this.showMessage(matchCard, "Prediction saved successfully", "success");
                            submitBtn.textContent = "Update Prediction";
                        } else {
                            this.showMessage(matchCard, `Error: ${result.error}`, "error");
                        }
                    } catch (error) {
                        this.showMessage(matchCard, `Error: ${error.message}`, "error");
                    }
                });
                
                matchStatus.appendChild(predictionForm);
            }
            
            matchCard.appendChild(matchStatus);
            
            // Add match card to grid
            matchesGrid.appendChild(matchCard);
        });
        
        container.appendChild(matchesGrid);
    },
    
    /**
     * Show the admin panel
     * 
     * Creates and displays the admin panel with tabs for different admin functions:
     * - Match management (adding results)
     * - User management
     * - Bonus questions
     */
    showAdminPanel() {
        const adminPanel = this.elements.adminPanel;
        
        // Clear existing content
        adminPanel.innerHTML = "";
        
        // Create panel container
        const panelContainer = document.createElement("div");
        panelContainer.classList.add("admin-panel-container");
        
        // Create panel header
        const panelHeader = document.createElement("div");
        panelHeader.classList.add("admin-panel-header");
        
        const panelTitle = document.createElement("h2");
        panelTitle.textContent = "Admin Panel";
        panelHeader.appendChild(panelTitle);
        
        const closeBtn = document.createElement("button");
        closeBtn.classList.add("btn", "btn-danger", "close-btn");
        closeBtn.textContent = "Close";
        closeBtn.addEventListener("click", () => {
            adminPanel.classList.add("hidden");
        });
        panelHeader.appendChild(closeBtn);
        
        panelContainer.appendChild(panelHeader);
        
        // Create tabs
        const tabsContainer = document.createElement("div");
        tabsContainer.classList.add("tabs-container");
        
        const tabsList = document.createElement("ul");
        tabsList.classList.add("tabs-list");
        
        const tabs = [
            { id: "matches-tab", text: "Matches" },
            { id: "users-tab", text: "Users" },
            { id: "bonus-tab", text: "Bonus Questions" }
        ];
        
        tabs.forEach((tab, index) => {
            const tabItem = document.createElement("li");
            tabItem.classList.add("tab-item");
            tabItem.dataset.tabId = tab.id;
            tabItem.textContent = tab.text;
            
            if (index === 0) {
                tabItem.classList.add("active");
            }
            
            tabItem.addEventListener("click", () => {
                // Deactivate all tabs
                document.querySelectorAll(".tab-item").forEach(item => {
                    item.classList.remove("active");
                });
                
                // Activate clicked tab
                tabItem.classList.add("active");
                
                // Hide all tab contents
                document.querySelectorAll(".tab-content").forEach(content => {
                    content.classList.add("hidden");
                });
                
                // Show corresponding tab content
                document.getElementById(tab.id + "-content").classList.remove("hidden");
            });
            
            tabsList.appendChild(tabItem);
        });
        
        tabsContainer.appendChild(tabsList);
        
        // Create tab contents
        const tabContents = document.createElement("div");
        tabContents.classList.add("tab-contents");
        
        // Matches tab content
        const matchesContent = document.createElement("div");
        matchesContent.id = "matches-tab-content";
        matchesContent.classList.add("tab-content");
        
        // TODO: Implement matches management
        
        tabContents.appendChild(matchesContent);
        
        // Users tab content
        const usersContent = document.createElement("div");
        usersContent.id = "users-tab-content";
        usersContent.classList.add("tab-content", "hidden");
        
        // TODO: Implement users management
        
        tabContents.appendChild(usersContent);
        
        // Bonus questions tab content
        const bonusContent = document.createElement("div");
        bonusContent.id = "bonus-tab-content";
        bonusContent.classList.add("tab-content", "hidden");
        
        // TODO: Implement bonus questions management
        
        tabContents.appendChild(bonusContent);
        
        tabsContainer.appendChild(tabContents);
        
        panelContainer.appendChild(tabsContainer);
        
        adminPanel.appendChild(panelContainer);
        adminPanel.classList.remove("hidden");
    },
    
    /**
     * Display a message to the user
     * 
     * Shows a temporary notification message in a specified container
     * 
     * @param {HTMLElement} container - Container element to show the message in
     * @param {string} message - Message text
     * @param {string} type - Message type (success, error, info)
     */
    showMessage(container, message, type = 'info') {
        const messageElement = document.createElement("div");
        messageElement.classList.add("message", `message-${type}`);
        messageElement.textContent = message;
        
        // Add message to container
        container.appendChild(messageElement);
        
        // Remove message after 3 seconds
        setTimeout(() => {
            messageElement.classList.add("fade-out");
            
            setTimeout(() => {
                container.removeChild(messageElement);
            }, 500);
        }, 3000);
    }
};
