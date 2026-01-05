# Candy Crush Clone

A fully functional Candy Crush-style match-3 game built with vanilla HTML, CSS, and JavaScript.

## Features

### Core Gameplay
- **8x8 game board** with 6 different candy colors
- **Match detection** - Find matches of 3 or more candies horizontally or vertically
- **Cascade system** - Matched candies disappear, remaining candies fall down, new candies spawn at the top
- **Swap validation** - Only valid swaps that create matches are allowed
- **Smooth animations** - Animated swaps, matches, and cascades

### Game Mechanics
- **Scoring system** - Points awarded based on match size (more candies = more points)
- **Moves system** - Start with 30 moves per level
- **5 levels** - Progressively increasing score targets:
  - Level 1: 1000 points
  - Level 2: 2000 points
  - Level 3: 3000 points
  - Level 4: 5000 points
  - Level 5: 7500 points
- **High score tracking** - Persists in localStorage
- **Game state persistence** - Resume your game after page reload

### UI Elements
- Responsive design for desktop and tablet
- Game header with level and target score display
- 8x8 game board with colorful candies
- Side panel showing current score, moves remaining, and high score
- Restart level and new game buttons
- Results modal with win/lose messages and next level option

## How to Play

1. **Click on a candy** to select it (it will pulse)
2. **Click on an adjacent candy** to swap positions
3. **Valid swaps** create matches of 3+ same-colored candies
4. **Matched candies** disappear and candies fall down to fill gaps
5. **New candies** spawn at the top to fill empty spaces
6. **Cascades continue** until no more matches exist
7. **Win** the level by reaching the target score before running out of moves
8. **Lose** if moves reach 0 before reaching the target score

## Technical Details

### File Structure
```
index.html       - Main game page structure
css/style.css    - All styling and animations
js/game.js       - Core game logic and mechanics
js/ui.js         - UI updates and event handlers
```

### Technologies Used
- **Pure vanilla JavaScript** - No frameworks or libraries
- **CSS Grid** - Game board layout
- **CSS Flexbox** - Overall page layout
- **CSS Animations** - Smooth candy movements
- **localStorage** - Game state and high score persistence
- **ES6+** - Modern JavaScript features (classes, async/await, arrow functions)

### Key Implementation Details

#### Candy Representation
- Each candy is an object with `color` and `id` properties
- Colors: red, blue, green, yellow, purple, orange
- Each candy has a unique emoji for visual appeal

#### Match Detection Algorithm
- Scans horizontal and vertical lines for 3+ consecutive same-colored candies
- Uses Set data structure to avoid duplicate matches
- Handles overlapping horizontal and vertical matches

#### Gravity System
- Iterates from bottom to top
- Moves candies down to fill empty spaces
- Spawns new candies at the top
- Processes cascades recursively until stable

#### Animation Timing
- Uses async/await with Promise-based delays
- Swap animation: 250ms
- Match animation: 300ms
- Gravity/fall animation: 300ms
- Ensures animations complete before next game state update

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Future Enhancements

Potential features for future versions:
- Special candies (striped, wrapped, color bomb)
- Power-ups and boosters
- Obstacles and blockers
- Timed challenges
- Combo multipliers
- Sound effects and music
- Mobile touch support
- Leaderboards
- More levels and challenges

## License

This is a prototype project for educational purposes.
