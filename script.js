// Game data storage (in-memory for MVP 0)
const gameData = {
    match: {
        teamA: "Germany",
        teamB: "France",
        date: "March 30, 2025",
        time: "19:00 UTC",
        isCompleted: false
    },
    prediction: null,
    result: null,
    points: null,
    pointsExplanation: ""
};

// DOM Elements
const predictionForm = document.getElementById('prediction-form');
const resultForm = document.getElementById('result-form');
const predictionStatus = document.getElementById('prediction-status');
const resultStatus = document.getElementById('result-status');
const scoreSection = document.getElementById('score-section');
const predictionDisplay = document.getElementById('prediction-display');
const resultDisplay = document.getElementById('result-display');
const pointsDisplay = document.getElementById('points-display');
const pointsExplanation = document.getElementById('points-explanation');

// Event Listeners
predictionForm.addEventListener('submit', handlePredictionSubmit);
resultForm.addEventListener('submit', handleResultSubmit);

// Handle prediction submission
function handlePredictionSubmit(event) {
    event.preventDefault();
    
    const teamAScore = parseInt(document.getElementById('team-a-score').value);
    const teamBScore = parseInt(document.getElementById('team-b-score').value);
    
    // Store prediction
    gameData.prediction = {
        teamA: teamAScore,
        teamB: teamBScore
    };
    
    // Update UI
    predictionStatus.textContent = `Prediction submitted: ${teamAScore} - ${teamBScore}`;
    predictionStatus.classList.remove('hidden', 'status-error');
    predictionStatus.classList.add('status-success');
    
    // Disable prediction form if result is already submitted
    if (gameData.result) {
        calculatePoints();
        updateScoreDisplay();
    }
}

// Handle result submission
function handleResultSubmit(event) {
    event.preventDefault();
    
    const teamAResult = parseInt(document.getElementById('team-a-result').value);
    const teamBResult = parseInt(document.getElementById('team-b-result').value);
    
    // Store result
    gameData.result = {
        teamA: teamAResult,
        teamB: teamBResult
    };
    
    // Update UI
    resultStatus.textContent = `Result submitted: ${teamAResult} - ${teamBResult}`;
    resultStatus.classList.remove('hidden', 'status-error');
    resultStatus.classList.add('status-success');
    
    // Calculate points if prediction is already submitted
    if (gameData.prediction) {
        calculatePoints();
        updateScoreDisplay();
    } else {
        resultStatus.textContent = `Result submitted, but no prediction was made.`;
    }
}

// Calculate points based on prediction and result
function calculatePoints() {
    const pred = gameData.prediction;
    const result = gameData.result;
    
    // Check for exact score match
    if (pred.teamA === result.teamA && pred.teamB === result.teamB) {
        gameData.points = 20;
        gameData.pointsExplanation = "Exact score correct! You predicted the exact final score.";
        return;
    }
    
    // Check for goal difference match
    const predDiff = pred.teamA - pred.teamB;
    const resultDiff = result.teamA - result.teamB;
    
    if (predDiff === resultDiff) {
        gameData.points = 15;
        gameData.pointsExplanation = "Goal difference correct! You predicted the correct goal difference.";
        return;
    }
    
    // Check for winner match
    const predWinner = predDiff > 0 ? "A" : (predDiff < 0 ? "B" : "draw");
    const resultWinner = resultDiff > 0 ? "A" : (resultDiff < 0 ? "B" : "draw");
    
    if (predWinner === resultWinner) {
        gameData.points = 10;
        gameData.pointsExplanation = "Winner correct! You predicted the correct winning team.";
        return;
    }
    
    // Everything wrong
    gameData.points = -10;
    gameData.pointsExplanation = "Everything wrong. You didn't predict the correct winner or goal difference.";
}

// Update the score display section
function updateScoreDisplay() {
    // Show the score section
    scoreSection.classList.remove('hidden');
    
    // Update prediction display
    predictionDisplay.textContent = `${gameData.prediction.teamA} - ${gameData.prediction.teamB}`;
    
    // Update result display
    resultDisplay.textContent = `${gameData.result.teamA} - ${gameData.result.teamB}`;
    
    // Update points display
    pointsDisplay.textContent = gameData.points;
    pointsExplanation.textContent = gameData.pointsExplanation;
    
    // Apply color based on points
    if (gameData.points > 0) {
        pointsDisplay.style.color = 'var(--success-color)';
    } else {
        pointsDisplay.style.color = 'var(--error-color)';
    }
}

// Check for saved data in localStorage (for future implementation)
function loadSavedData() {
    const savedData = localStorage.getItem('footballPredictionGame');
    if (savedData) {
        const parsedData = JSON.parse(savedData);
        // Implement data loading logic here for future MVPs
    }
}

// Initialize the app
function init() {
    // Future initialization logic can go here
    console.log('Football Prediction Game MVP 0 initialized');
}

// Start the app
init();
