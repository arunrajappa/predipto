Based on your friend's idea for a football prediction game, I've created a Product Requirements Document (PRD) to outline the key features, functionality, and scope of the application. Here's a detailed breakdown:

---

# Product Requirements Document (PRD)  
## Football Tournament Prediction Game

### 1. Overview
The Football Tournament Prediction Game is a web or mobile-based application designed for football fans to predict match outcomes during major tournaments (e.g., UEFA Euro, FIFA World Cup). Participants compete by submitting score predictions before each game, earning points based on the accuracy of their predictions. The game includes bonus questions and multipliers to enhance engagement and reward strategic thinking.

---

### 2. Objectives
- Create an engaging, interactive platform for football fans to test their prediction skills.
- Support social competition among friends or a broader community.
- Provide a simple, intuitive interface for submitting predictions and viewing results.
- Ensure scalability to handle multiple matches and participants during a tournament.

---

### 3. Key Features

#### 3.1 User Roles
- **Participants**: Individuals who predict match scores and compete for points.
- **Admin**: Manages the game by entering official match results and moderating bonus questions.

#### 3.2 Core Functionality
1. **Prediction Submission**
   - Before each match, participants submit their predicted score (e.g., Team A: 2, Team B: 1).
   - Predictions must be submitted before a cutoff time (e.g., match kickoff).
   - Interface displays upcoming matches with team names and a form for score input.

2. **Scoring System**
   - After each match, the admin enters the official score.
   - Points are awarded automatically based on the following rules:
     - **Exact Score Correct**: 20 points (e.g., predicts 2-1, actual score is 2-1).
     - **Goal Difference Correct**: 15 points (e.g., predicts 3-1, actual score is 2-0; difference of 2).
     - **Winner Correct**: 10 points (e.g., predicts 1-0, actual score is 2-0; Team A wins).
     - **Everything Wrong**: -10 points (e.g., predicts 1-0, actual score is 0-2; wrong winner and difference).
   - Points are calculated and updated in real-time after admin input.

3. **Bonus Questions**
   - Before the tournament or specific rounds, participants answer bonus questions (e.g., "Which team will score the most goals in the group stage?" or "Will there be a penalty shootout in the final?").
   - Correct answers apply a multiplier to the participant's total points (e.g., 1.5x or 2x) or award bonus points (e.g., 10 points).
   - Admin defines and resolves bonus questions.

4. **Leaderboard**
   - Displays rankings of all participants based on total points.
   - Updates dynamically after each match result is entered.
   - Option to filter by tournament stage (e.g., group stage, knockout rounds).

5. **Match Schedule**
   - Displays all tournament matches with dates, times, and teams.
   - Highlights prediction deadlines and completed matches.

#### 3.3 Admin Tools
- **Result Entry**: Form to input official match scores after games conclude.
- **Bonus Management**: Interface to create, edit, and resolve bonus questions.
- **User Management**: Ability to add/remove participants or reset scores if needed.

---

### 4. User Flow
1. **Registration**: Participants sign up with a username and optional email.
2. **Tournament Selection**: Choose a tournament (e.g., Euro 2024) to participate in.
3. **Prediction Phase**: View upcoming matches, submit score predictions before kickoff.
4. **Post-Match**: Admin enters results, participants see updated scores and leaderboard.
5. **Bonus Interaction**: Answer bonus questions at designated times, see multiplier effects.
6. **End of Tournament**: Final leaderboard declares the winner.

---

### 5. Technical Requirements
- **Platform**: Web app (responsive design) or native mobile app (iOS/Android).
- **Database**: Store user profiles, predictions, match results, and leaderboard data.
- **Real-Time Updates**: Push notifications or live refresh for scores and rankings.
- **Security**: Basic authentication (username/password) and data validation to prevent cheating.
- **Scalability**: Handle hundreds or thousands of participants across multiple matches.

---

### 6. Scoring Examples
| Prediction | Actual Score | Outcome                | Points |
|------------|--------------|------------------------|--------|
| 2-1        | 2-1          | Exact score            | 20     |
| 3-1        | 2-0          | Goal difference (2)    | 15     |
| 1-0        | 3-1          | Winner (Team A)        | 10     |
| 1-0        | 0-2          | Everything wrong       | -10    |

**Bonus Example**:  
- Question: "Will the final go to extra time?"  
- Answer: Yes (correct) → 1.5x multiplier applied to total points.

---

### 7. Future Enhancements (Optional)
- **Social Features**: Invite friends, create private groups, share predictions.
- **Live Match Integration**: Pull real-time scores from an API (e.g., ESPN, FIFA).
- **Customization**: Admins set their own scoring rules or bonus questions.
- **Prizes**: Integrate virtual badges or real-world rewards for top performers.

---

### 8. Assumptions
- Tournament schedule is predefined and manually entered by the admin.
- Participants act in good faith (no automated cheating detection required initially).
- One prediction allowed per participant per match.

---

### 9. Next Steps
1. Validate the concept with your friend and potential users.
2. Design wireframes for the user interface.
3. Choose a development stack (e.g., React for web, Firebase for backend).
4. Build a minimum viable product (MVP) with core prediction and scoring features.

---

Does this PRD capture your friend’s vision? Let me know if you'd like to tweak the scoring system, add more details, or adjust anything else!