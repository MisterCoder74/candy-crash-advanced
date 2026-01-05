// Candy Crush Clone - UI Event Handlers

document.addEventListener('DOMContentLoaded', () => {
    // Restart level button
    document.getElementById('restartBtn').addEventListener('click', () => {
        if (window.game) {
            window.game.resetLevel();
        }
    });

    // New game button
    document.getElementById('newGameBtn').addEventListener('click', () => {
        if (window.game) {
            window.game.newGame();
        }
    });

    // Retry button (from results modal)
    document.getElementById('retryBtn').addEventListener('click', () => {
        const modal = document.getElementById('resultsModal');
        modal.classList.add('hidden');
        
        if (window.game) {
            window.game.resetLevel();
        }
    });

    // Next level button (from results modal)
    document.getElementById('nextLevelBtn').addEventListener('click', () => {
        const modal = document.getElementById('resultsModal');
        modal.classList.add('hidden');
        
        if (window.game) {
            window.game.nextLevel();
        }
    });

    // Pause timer when modal is shown
    const modal = document.getElementById('resultsModal');
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                if (!modal.classList.contains('hidden') && window.game) {
                    // Modal is shown, timer is already stopped by game logic
                }
            }
        });
    });
    observer.observe(modal, { attributes: true });

    // Close modal when clicking outside
    document.getElementById('resultsModal').addEventListener('click', (e) => {
        if (e.target.id === 'resultsModal') {
            // Don't close on outside click for game over
            // Player should explicitly choose an option
        }
    });

    // Keyboard support for accessibility
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            const modal = document.getElementById('resultsModal');
            if (!modal.classList.contains('hidden')) {
                modal.classList.add('hidden');
            }
        }
    });
});
