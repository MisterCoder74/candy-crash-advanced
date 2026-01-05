// Candy Crush Clone - Game Logic

const BOARD_SIZE = 8;
const CANDY_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
const CANDY_EMOJIS = {
    red: '🍎',
    blue: '🫐',
    green: '🍀',
    yellow: '⭐',
    purple: '🍇',
    orange: '🍊'
};

class CandyCrushGame {
    constructor() {
        this.board = [];
        this.selectedCandy = null;
        this.isProcessing = false;
        this.score = 0;
        this.moves = 30;
        this.level = 1;
        this.highScore = parseInt(localStorage.getItem('candyCrushHighScore')) || 0;
        this.targetScore = 1000;
        this.targetScores = [1000, 2000, 3000, 5000, 7500];
        
        this.init();
    }

    init() {
        this.loadGameState();
        this.createBoard();
        this.renderBoard();
        this.updateUI();
    }

    loadGameState() {
        const savedState = localStorage.getItem('candyCrushGameState');
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                this.level = state.level || 1;
                this.score = state.score || 0;
                this.moves = state.moves || 30;
                this.targetScore = this.targetScores[Math.min(this.level - 1, this.targetScores.length - 1)];
            } catch (e) {
                console.error('Error loading game state:', e);
                this.resetLevel();
            }
        }
    }

    saveGameState() {
        const state = {
            level: this.level,
            score: this.score,
            moves: this.moves
        };
        localStorage.setItem('candyCrushGameState', JSON.stringify(state));
        
        if (this.score > this.highScore) {
            this.highScore = this.score;
            localStorage.setItem('candyCrushHighScore', this.highScore);
        }
    }

    createBoard() {
        this.board = [];
        for (let row = 0; row < BOARD_SIZE; row++) {
            this.board[row] = [];
            for (let col = 0; col < BOARD_SIZE; col++) {
                this.board[row][col] = this.getRandomCandy(row, col);
            }
        }
        
        // Remove initial matches
        while (this.findMatches().length > 0) {
            this.createBoard();
        }
    }

    getRandomCandy(row, col) {
        let color;
        let attempts = 0;
        do {
            color = CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)];
            attempts++;
        } while (this.wouldCreateMatch(row, col, color) && attempts < 50);
        
        return {
            color: color,
            id: `${row}-${col}-${Date.now()}-${Math.random()}`
        };
    }

    wouldCreateMatch(row, col, color) {
        // Check horizontal
        if (col >= 2 && 
            this.board[row][col - 1]?.color === color && 
            this.board[row][col - 2]?.color === color) {
            return true;
        }
        
        // Check vertical
        if (row >= 2 && 
            this.board[row - 1]?.[col]?.color === color && 
            this.board[row - 2]?.[col]?.color === color) {
            return true;
        }
        
        return false;
    }

    renderBoard() {
        const boardElement = document.getElementById('gameBoard');
        boardElement.innerHTML = '';
        
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE; col++) {
                const candy = this.board[row][col];
                if (candy) {
                    const candyElement = document.createElement('div');
                    candyElement.className = `candy candy-${candy.color}`;
                    candyElement.dataset.row = row;
                    candyElement.dataset.col = col;
                    candyElement.textContent = CANDY_EMOJIS[candy.color];
                    candyElement.addEventListener('click', () => this.handleCandyClick(row, col));
                    boardElement.appendChild(candyElement);
                } else {
                    const emptyElement = document.createElement('div');
                    emptyElement.className = 'candy empty';
                    boardElement.appendChild(emptyElement);
                }
            }
        }
    }

    handleCandyClick(row, col) {
        if (this.isProcessing || this.moves <= 0) return;
        
        const candy = this.board[row][col];
        if (!candy) return;
        
        if (!this.selectedCandy) {
            // Select first candy
            this.selectedCandy = { row, col };
            this.highlightCandy(row, col, true);
        } else {
            // Check if adjacent
            const { row: selectedRow, col: selectedCol } = this.selectedCandy;
            
            if (this.isAdjacent(selectedRow, selectedCol, row, col)) {
                this.highlightCandy(selectedRow, selectedCol, false);
                this.trySwap(selectedRow, selectedCol, row, col);
            } else {
                // Select new candy
                this.highlightCandy(selectedRow, selectedCol, false);
                this.selectedCandy = { row, col };
                this.highlightCandy(row, col, true);
            }
        }
    }

    highlightCandy(row, col, highlight) {
        const candyElements = document.querySelectorAll('.candy');
        candyElements.forEach(el => {
            if (parseInt(el.dataset.row) === row && parseInt(el.dataset.col) === col) {
                if (highlight) {
                    el.classList.add('selected');
                } else {
                    el.classList.remove('selected');
                }
            }
        });
    }

    isAdjacent(row1, col1, row2, col2) {
        const rowDiff = Math.abs(row1 - row2);
        const colDiff = Math.abs(col1 - col2);
        return (rowDiff === 1 && colDiff === 0) || (rowDiff === 0 && colDiff === 1);
    }

    async trySwap(row1, col1, row2, col2) {
        this.isProcessing = true;
        
        // Perform swap
        this.swap(row1, col1, row2, col2);
        await this.animateSwap(row1, col1, row2, col2);
        
        // Check if swap creates matches
        const matches = this.findMatches();
        
        if (matches.length > 0) {
            // Valid swap - process matches
            this.moves--;
            await this.processMatches();
        } else {
            // Invalid swap - swap back
            this.swap(row1, col1, row2, col2);
            await this.animateSwap(row1, col1, row2, col2);
        }
        
        this.selectedCandy = null;
        this.isProcessing = false;
        this.saveGameState();
        this.updateUI();
        this.checkGameEnd();
    }

    swap(row1, col1, row2, col2) {
        const temp = this.board[row1][col1];
        this.board[row1][col1] = this.board[row2][col2];
        this.board[row2][col2] = temp;
    }

    async animateSwap(row1, col1, row2, col2) {
        this.renderBoard();
        await this.delay(250);
    }

    findMatches() {
        const matches = new Set();
        
        // Check horizontal matches
        for (let row = 0; row < BOARD_SIZE; row++) {
            for (let col = 0; col < BOARD_SIZE - 2; col++) {
                const candy = this.board[row][col];
                if (!candy) continue;
                
                let matchLength = 1;
                while (col + matchLength < BOARD_SIZE && 
                       this.board[row][col + matchLength]?.color === candy.color) {
                    matchLength++;
                }
                
                if (matchLength >= 3) {
                    for (let i = 0; i < matchLength; i++) {
                        matches.add(`${row},${col + i}`);
                    }
                }
            }
        }
        
        // Check vertical matches
        for (let col = 0; col < BOARD_SIZE; col++) {
            for (let row = 0; row < BOARD_SIZE - 2; row++) {
                const candy = this.board[row][col];
                if (!candy) continue;
                
                let matchLength = 1;
                while (row + matchLength < BOARD_SIZE && 
                       this.board[row + matchLength]?.[col]?.color === candy.color) {
                    matchLength++;
                }
                
                if (matchLength >= 3) {
                    for (let i = 0; i < matchLength; i++) {
                        matches.add(`${row + i},${col}`);
                    }
                }
            }
        }
        
        return Array.from(matches).map(pos => {
            const [row, col] = pos.split(',').map(Number);
            return { row, col };
        });
    }

    async processMatches() {
        let matches = this.findMatches();
        
        while (matches.length > 0) {
            // Animate matches
            await this.animateMatches(matches);
            
            // Calculate score
            const points = matches.length * 10 * Math.floor(matches.length / 3);
            this.score += points;
            
            // Remove matched candies
            this.removeMatches(matches);
            
            // Apply gravity
            await this.applyGravity();
            
            // Fill empty spaces
            await this.fillEmptySpaces();
            
            // Find new matches
            matches = this.findMatches();
            
            this.saveGameState();
            this.updateUI();
        }
    }

    async animateMatches(matches) {
        matches.forEach(({ row, col }) => {
            const candyElements = document.querySelectorAll('.candy');
            candyElements.forEach(el => {
                if (parseInt(el.dataset.row) === row && parseInt(el.dataset.col) === col) {
                    el.classList.add('matched');
                }
            });
        });
        await this.delay(300);
    }

    removeMatches(matches) {
        matches.forEach(({ row, col }) => {
            this.board[row][col] = null;
        });
    }

    async applyGravity() {
        let moved = false;
        
        for (let col = 0; col < BOARD_SIZE; col++) {
            for (let row = BOARD_SIZE - 1; row >= 0; row--) {
                if (!this.board[row][col]) {
                    // Find candy above
                    for (let searchRow = row - 1; searchRow >= 0; searchRow--) {
                        if (this.board[searchRow][col]) {
                            this.board[row][col] = this.board[searchRow][col];
                            this.board[searchRow][col] = null;
                            moved = true;
                            break;
                        }
                    }
                }
            }
        }
        
        if (moved) {
            this.renderBoard();
            await this.delay(300);
        }
    }

    async fillEmptySpaces() {
        let filled = false;
        
        for (let col = 0; col < BOARD_SIZE; col++) {
            for (let row = 0; row < BOARD_SIZE; row++) {
                if (!this.board[row][col]) {
                    this.board[row][col] = {
                        color: CANDY_COLORS[Math.floor(Math.random() * CANDY_COLORS.length)],
                        id: `${row}-${col}-${Date.now()}-${Math.random()}`
                    };
                    filled = true;
                }
            }
        }
        
        if (filled) {
            this.renderBoard();
            await this.delay(300);
        }
    }

    checkGameEnd() {
        if (this.score >= this.targetScore) {
            this.showResults(true);
        } else if (this.moves <= 0) {
            this.showResults(false);
        }
    }

    showResults(won) {
        const modal = document.getElementById('resultsModal');
        const title = document.getElementById('modalTitle');
        const message = document.getElementById('modalMessage');
        const nextLevelBtn = document.getElementById('nextLevelBtn');
        
        if (won) {
            title.textContent = '🎉 Level Complete!';
            title.style.color = '#4CAF50';
            message.textContent = `You scored ${this.score} points! Target was ${this.targetScore}.`;
            nextLevelBtn.classList.remove('hidden');
        } else {
            title.textContent = '😢 Game Over';
            title.style.color = '#f44336';
            message.textContent = `You scored ${this.score} points. Target was ${this.targetScore}.`;
            nextLevelBtn.classList.add('hidden');
        }
        
        modal.classList.remove('hidden');
    }

    resetLevel() {
        this.score = 0;
        this.moves = 30;
        this.createBoard();
        this.renderBoard();
        this.saveGameState();
        this.updateUI();
    }

    newGame() {
        this.level = 1;
        this.targetScore = this.targetScores[0];
        this.resetLevel();
    }

    nextLevel() {
        this.level++;
        this.targetScore = this.targetScores[Math.min(this.level - 1, this.targetScores.length - 1)];
        this.moves = 30;
        this.createBoard();
        this.renderBoard();
        this.saveGameState();
        this.updateUI();
    }

    updateUI() {
        document.getElementById('scoreDisplay').textContent = this.score;
        document.getElementById('movesDisplay').textContent = this.moves;
        document.getElementById('highScoreDisplay').textContent = this.highScore;
        document.getElementById('levelDisplay').textContent = `Level ${this.level}`;
        document.getElementById('targetScoreDisplay').textContent = this.targetScore;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Initialize game when DOM is ready
let game;
document.addEventListener('DOMContentLoaded', () => {
    game = new CandyCrushGame();
    window.game = game;
});
