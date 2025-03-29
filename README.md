# Football Tournament Prediction Game - MVP 1

## Overview
This is the MVP 1 implementation of the Football Tournament Prediction Game. It provides a multi-match prediction system with simulated API integration, allowing users to predict scores for multiple matches, view results, and track their total points.

## Features
- Multiple match display with tournament and group information
- Prediction input forms for each match
- Admin result entry for each match
- Scoring logic implementation based on the PRD rules:
  - Exact score correct: 20 points
  - Goal difference correct: 15 points
  - Winner correct: 10 points
  - Everything wrong: -10 points
- Total points tracking
- Basic leaderboard
- Responsive design with Tailwind CSS

## Technical Implementation
- HTML with Tailwind CSS for styling
- JavaScript for client-side functionality
- Mock API integration (simulated with JavaScript)
- In-memory data storage
- Mobile-responsive design

## How to Use
1. Open `index.html` in any modern web browser
2. View the list of upcoming matches
3. Enter your predictions for each match
4. Submit your predictions
5. As an admin, enter the actual match results
6. View your earned points and explanations for each match
7. Track your total points in the leaderboard

## Project Structure
- `index.html` - Main HTML structure
- `src/app.js` - Core application logic
- `src/input.css` - Tailwind CSS input file
- `dist/output.css` - Compiled CSS
- `package.json` - Project dependencies
- `tailwind.config.js` - Tailwind configuration
- `README.md` - Documentation

## Next Steps (Future MVPs)
- User authentication and backend integration
- Bonus questions and multipliers
- Social features and groups
- Performance optimization and real-time updates

## Development
This MVP was developed as part of the implementation plan outlined in `myimplementation.md`, based on the requirements specified in the PRD.

## License
 2025 Football Tournament Prediction Game
