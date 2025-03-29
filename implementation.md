Below is a detailed implementation plan for your Football Tournament Prediction Game, structured as a series of Minimum Viable Products (MVPs) from MVP 0 to MVP 5. As a Principal Engineering Manager at Google, I’ve designed this plan to prioritize simplicity, scalability, and developer efficiency while leveraging modern web practices. The focus is on a mobile-optimized website (no native app), starting with a local-only MVP 0 and progressively adding features. I’ve also investigated open APIs for live match data and incorporated that into MVP 1 where feasible. The plan assumes a world-class design partner is handling UI/UX, so I’ll focus on engineering deliverables, architecture, and technical details.

---

# Implementation Plan: Football Tournament Prediction Game  
**Role**: Principal Engineering Manager at Google  
**Target**: Mobile-optimized website  
**Team**: Engineering team with support from a world-class design manager  
**Date**: March 29, 2025  

---

## Guiding Principles
1. **Simplicity**: Keep code short, modular, and optimized for fast iteration.
2. **Scalability**: Build with future growth in mind, even in early MVPs.
3. **User Focus**: Deliver core value (predictions and scoring) early and often.
4. **Leverage Open Tools**: Use existing APIs where possible to reduce manual effort.

---

## MVP 0: Local-Only Prototype
**Objective**: Build a functional, local-only version with no backend or persistence.  
**Scope**: Core prediction and scoring for a single match, stored in-memory using JavaScript.  

### Features
- **Match Display**: Show one hardcoded match (e.g., "Germany vs. France, March 30, 2025").
- **Prediction Input**: Form for users to enter a score (e.g., 2-1).
- **Admin Result Entry**: Form to input the actual score post-match.
- **Scoring Logic**: Calculate points based on rules (20/15/10/-10).
- **Result Display**: Show the user’s points after result entry.

### Tech Stack
- **HTML/CSS/JS**: Vanilla JavaScript, no frameworks for simplicity.
- **Storage**: In-memory JS object (e.g., `let gameData = {}`).
- **Design**: Mobile-optimized CSS (assume design manager provides styles).

### Deliverables
1. **HTML Structure**: Single-page app with sections for prediction, result entry, and score display.
   - `<div id="match-info">`, `<form id="prediction-form">`, `<form id="result-form">`, `<div id="score-output">`.
2. **CSS**: Responsive grid layout (e.g., Flexbox or CSS Grid), optimized for mobile (assume design manager’s spec).
3. **JS Logic**:
   - Store prediction and result in `gameData`.
   - Scoring function: Compare prediction vs. result, return points.
   - Event listeners for form submissions to update UI.

### Sample Code Snippet
```html
<!DOCTYPE html>
<html>
<head>
  <title>Football Prediction MVP 0</title>
  <style>/* Assume design manager’s mobile-optimized CSS */</style>
</head>
<body>
  <div id="match-info">Germany vs France, March 30, 2025</div>
  <form id="prediction-form">
    <input type="number" id="team1-pred" min="0" placeholder="Germany">
    <input type="number" id="team2-pred" min="0" placeholder="France">
    <button type="submit">Predict</button>
  </form>
  <form id="result-form">
    <input type="number" id="team1-result" min="0" placeholder="Germany">
    <input type="number" id="team2-result" min="0" placeholder="France">
    <button type="submit">Enter Result</button>
  </form>
  <div id="score-output"></div>

  <script>
    let gameData = {};
    document.getElementById('prediction-form').addEventListener('submit', (e) => {
      e.preventDefault();
      gameData.prediction = {
        team1: +document.getElementById('team1-pred').value,
        team2: +document.getElementById('team2-pred').value
      };
    });
    document.getElementById('result-form').addEventListener('submit', (e) => {
      e.preventDefault();
      gameData.result = {
        team1: +document.getElementById('team1-result').value,
        team2: +document.getElementById('team2-result').value
      };
      const points = calculateScore(gameData.prediction, gameData.result);
      document.getElementById('score-output').innerText = `Points: ${points}`;
    });
    function calculateScore(pred, result) {
      if (pred.team1 === result.team1 && pred.team2 === result.team2) return 20;
      const predDiff = pred.team1 - pred.team2, resDiff = result.team1 - result.team2;
      if (predDiff === resDiff) return 15;
      if ((pred.team1 > pred.team2 && result.team1 > result.team2) || 
          (pred.team2 > pred.team1 && result.team2 > result.team1)) return 10;
      return -10;
    }
  </script>
</body>
</html>
```

### Timeline
- **Duration**: 1-2 days.
- **Team**: 1 frontend engineer.

### Success Criteria
- User can predict a score, enter a result, and see points calculated correctly.

---

## Investigation: Open APIs for Live Match Data
I researched open APIs for ongoing football match data as of March 29, 2025. Here’s the outcome:
- **Available APIs**:
  - **Football-Data.org**: Free API with live scores, fixtures, and results for major tournaments (e.g., Euro, World Cup). Requires API key, rate-limited.
  - **Sportradar**: Paid API with comprehensive live data, suitable for production but costly for MVP.
  - **API-Football**: Freemium API with match schedules, live scores, and historical data (500 requests/month free tier).
- **Feasibility**: API-Football’s free tier is sufficient for MVP 1 to fetch mock or live data for testing.
- **Plan**: Use API-Football in MVP 1 for match schedules and results. If no live tournaments are active, use mock data from their historical endpoints.

---

## MVP 1: Multi-Match with API Integration
**Objective**: Expand to multiple matches with real or mock data from an API, still local-only storage.  
**Scope**: Fetch match schedule from API-Football, allow predictions for multiple matches.

### Features
- **Match Schedule**: Fetch and display upcoming matches (e.g., 5 matches).
- **Prediction Input**: Form per match, stored in-memory.
- **Result Fetch**: Use API or mock data for results (admin entry as fallback).
- **Scoring**: Calculate points per match, show total score.

### Tech Stack
- **HTML/CSS/JS**: Add a lightweight framework (e.g., Preact) for component reuse.
- **API**: API-Football (fetch match data via `fetch()`).
- **Storage**: In-memory JS array (e.g., `let matches = []`).

### Deliverables
1. **Match Fetch**: JS function to call API-Football’s `/fixtures` endpoint.
   - API Key: Team to sign up at [api-football.com](https://api-football.com).
   - Endpoint: `GET https://api-football.com/v3/fixtures?season=2025&league=1`.
2. **UI**: List of matches with prediction forms (assume design manager’s spec).
3. **Scoring**: Aggregate points across matches, display total.

### Timeline
- **Duration**: 3-5 days.
- **Team**: 1 frontend engineer.

### Success Criteria
- Display 5+ matches from API, allow predictions, and calculate total score.

---

## MVP 2: Backend and Persistence
**Objective**: Add a backend for persistence and multi-user support.  
**Scope**: Store predictions and results in a database, support multiple users.

### Features
- **User Accounts**: Simple login (username/password).
- **Prediction Storage**: Save predictions per user per match.
- **Result Entry**: Admin UI to input results.
- **Leaderboard**: Show top 5 users by total points.

### Tech Stack
- **Frontend**: Preact + fetch for API calls.
- **Backend**: Node.js + Express, Firebase Firestore (serverless DB).
- **Auth**: Firebase Authentication.

### Deliverables
1. **Backend Setup**: Express server with endpoints:
   - `POST /predictions`: Save user prediction.
   - `POST /results`: Admin enters match result.
   - `GET /leaderboard`: Fetch top scores.
2. **DB Schema**: Firestore collections:
   - `users`: `{ id, username, totalPoints }`.
   - `predictions`: `{ userId, matchId, team1Score, team2Score }`.
   - `matches`: `{ id, team1, team2, result }`.
3. **Frontend**: Login form, leaderboard component.

### Timeline
- **Duration**: 7-10 days.
- **Team**: 1 frontend, 1 backend engineer.

### Success Criteria
- Multiple users can predict, scores persist, leaderboard updates.

---

## MVP 3: Bonus Questions and Multipliers
**Objective**: Add bonus questions and scoring multipliers.  
**Scope**: Introduce bonus mechanics to enhance engagement.

### Features
- **Bonus Questions**: Admin creates questions (e.g., "Most goals in tournament?").
- **User Answers**: Form to submit answers before tournament/round.
- **Scoring**: Apply multipliers (e.g., 1.5x) or bonus points for correct answers.

### Deliverables
1. **Backend**: New endpoints:
   - `POST /bonus-questions`: Admin adds question.
   - `POST /bonus-answers`: User submits answer.
   - `POST /resolve-bonus`: Admin marks correct answer, applies multiplier.
2. **DB**: Add `bonusQuestions` and `bonusAnswers` collections.
3. **Frontend**: Bonus question UI, updated leaderboard with multipliers.

### Timeline
- **Duration**: 5-7 days.
- **Team**: 1 frontend, 1 backend engineer.

### Success Criteria
- Users answer bonus questions, see multiplied scores.

---

## MVP 4: Social Features
**Objective**: Add social competition and sharing.  
**Scope**: Enable group play and social interaction.

### Features
- **Groups**: Create/join private groups with friends.
- **Group Leaderboard**: Rankings within groups.
- **Sharing**: Share predictions/scores via link (e.g., Twitter).

### Deliverables
1. **Backend**: Endpoints for group creation, membership, and rankings.
2. **DB**: Add `groups` and `groupMembers` collections.
3. **Frontend**: Group UI, share button with URL generator.

### Timeline
- **Duration**: 7-10 days.
- **Team**: 1 frontend, 1 backend engineer.

### Success Criteria
- Users can form groups, see group rankings, share results.

---

## MVP 5: Polish and Scale
**Objective**: Refine UX and prepare for scale.  
**Scope**: Add notifications, real-time updates, and performance optimizations.

### Features
- **Notifications**: Push reminders for prediction deadlines (via Firebase).
- **Real-Time**: Live leaderboard updates using WebSockets.
- **Optimization**: Cache API calls, compress assets.

### Deliverables
1. **Backend**: WebSocket server (e.g., Socket.IO) for real-time updates.
2. **Frontend**: Notification opt-in, real-time UI refresh.
3. **Infra**: Add CDN (e.g., Cloudflare) for static assets.

### Timeline
- **Duration**: 10-14 days.
- **Team**: 1 frontend, 1 backend, 1 infra engineer.

### Success Criteria
- Users get timely notifications, see live updates, site handles 1000+ users.

---

## Hand-Off Instructions
1. **Team Briefing**: Share this plan, assign engineers per MVP.
2. **Design Sync**: Coordinate with design manager for UI specs per MVP.
3. **API Key**: Obtain API-Football key before MVP 1.
4. **Repo Setup**: Use GitHub, enforce PR reviews, aim for <200 LOC per file.
5. **Testing**: Unit tests for scoring logic (Jest), manual testing for UI.

---

This plan ensures a staged rollout with clear deliverables and minimal dependencies. Let me know if you need adjustments or further details!