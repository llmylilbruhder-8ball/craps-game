// Game State
let gameState = {
    balance: 100,
    currentBet: 0,
    point: null,
    isRolling: false,
    gamePhase: 'comeOut', // comeOut or pointPhase
    round: 1
};

// DOM Elements
const balanceDisplay = document.getElementById('balance');
const statusDisplay = document.getElementById('status');
const betAmountInput = document.getElementById('betAmount');
const placeBetBtn = document.getElementById('placeBetBtn');
const betStatusDisplay = document.getElementById('betStatus');
const dice1 = document.getElementById('dice1');
const dice2 = document.getElementById('dice2');
const totalDisplay = document.getElementById('total');
const rollBtn = document.getElementById('rollBtn');
const resetBtn = document.getElementById('resetBtn');
const resultSection = document.getElementById('resultSection');
const resultMessage = document.getElementById('resultMessage');
const resultDetails = document.getElementById('resultDetails');
const roundDisplay = document.getElementById('round');
const pointDisplay = document.getElementById('point');
const gamePhaseDisplay = document.getElementById('gamePhase');

// Dice emoji numbers
const diceEmojis = ['🎲', '⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];

// Place Bet Function
placeBetBtn.addEventListener('click', function() {
    const betAmount = parseInt(betAmountInput.value);
    
    // Validation
    if (isNaN(betAmount) || betAmount <= 0) {
        alert('Please enter a valid bet amount!');
        return;
    }
    
    if (betAmount > gameState.balance) {
        alert('You don\'t have enough balance! Maximum bet: $' + gameState.balance);
        return;
    }
    
    // Set bet
    gameState.currentBet = betAmount;
    betStatusDisplay.textContent = 'Current Bet: $' + gameState.currentBet;
    placeBetBtn.disabled = true;
    rollBtn.disabled = false;
    statusDisplay.textContent = 'Bet placed! Click "Roll Dice" to start.';
    resultSection.style.display = 'none';
});

// Roll Dice Function
rollBtn.addEventListener('click', function() {
    if (gameState.currentBet === 0) {
        alert('Please place a bet first!');
        return;
    }
    
    if (gameState.isRolling) return;
    
    gameState.isRolling = true;
    rollBtn.disabled = true;
    
    // Animate dice rolling
    animateDice();
});

// Animate Dice Rolling
function animateDice() {
    let rollCount = 0;
    const maxRolls = 20;
    
    const rollInterval = setInterval(() => {
        const num1 = Math.floor(Math.random() * 6) + 1;
        const num2 = Math.floor(Math.random() * 6) + 1;
        
        dice1.textContent = diceEmojis[num1];
        dice2.textContent = diceEmojis[num2];
        
        rollCount++;
        
        if (rollCount >= maxRolls) {
            clearInterval(rollInterval);
            // Get final roll
            const finalDice1 = Math.floor(Math.random() * 6) + 1;
            const finalDice2 = Math.floor(Math.random() * 6) + 1;
            
            dice1.textContent = diceEmojis[finalDice1];
            dice2.textContent = diceEmojis[finalDice2];
            
            handleRoll(finalDice1, finalDice2);
        }
    }, 100);
}

// Handle Roll Result
function handleRoll(dice1Value, dice2Value) {
    const total = dice1Value + dice2Value;
    totalDisplay.textContent = 'Total: ' + total;
    
    let result = {};
    
    if (gameState.gamePhase === 'comeOut') {
        result = handleComeOutRoll(total);
    } else {
        result = handlePointRoll(total);
    }
    
    // Display result
    displayResult(result);
    
    // Update balance if game ended
    if (result.gameEnded) {
        if (result.won) {
            gameState.balance += gameState.currentBet;
            balanceDisplay.textContent = gameState.balance;
        } else {
            gameState.balance -= gameState.currentBet;
            balanceDisplay.textContent = gameState.balance;
        }
        
        // Check if player is broke
        if (gameState.balance <= 0) {
            alert('Game Over! You\'re out of money!');
            resetGame();
            return;
        }
        
        // Reset for next round
        gameState.currentBet = 0;
        gameState.point = null;
        gameState.gamePhase = 'comeOut';
        gameState.round++;
        roundDisplay.textContent = gameState.round;
        pointDisplay.textContent = 'None';
        
        betStatusDisplay.textContent = 'Current Bet: $0';
        placeBetBtn.disabled = false;
        rollBtn.disabled = true;
        betAmountInput.value = 10;
    }
    
    gameState.isRolling = false;
    rollBtn.disabled = false;
}

// Handle Come Out Roll (first roll)
function handleComeOutRoll(total) {
    if (total === 7 || total === 11) {
        // Natural - Player wins
        return {
            won: true,
            gameEnded: true,
            message: '🎉 YOU WIN! NATURAL! 🎉',
            details: 'You rolled ' + total + '! Congratulations! Won $' + gameState.currentBet
        };
    } else if (total === 2 || total === 3 || total === 12) {
        // Craps - Player loses
        return {
            won: false,
            gameEnded: true,
            message: '💀 YOU LOSE! CRAPS! 💀',
            details: 'You rolled ' + total + ' (Craps). Lost $' + gameState.currentBet
        };
    } else {
        // Point established
        gameState.point = total;
        gameState.gamePhase = 'pointPhase';
        pointDisplay.textContent = total;
        
        return {
            won: null,
            gameEnded: false,
            message: 'Point Established: ' + total,
            details: 'Roll ' + total + ' again to WIN, or 7 to LOSE. Keep rolling!'
        };
    }
}

// Handle Point Roll (subsequent rolls)
function handlePointRoll(total) {
    if (total === gameState.point) {
        // Made the point - Player wins
        return {
            won: true,
            gameEnded: true,
            message: '🎉 YOU WIN! MADE THE POINT! 🎉',
            details: 'You rolled ' + total + ' (your point)! Won $' + gameState.currentBet
        };
    } else if (total === 7) {
        // Sevened out - Player loses
        return {
            won: false,
            gameEnded: true,
            message: '💀 YOU LOSE! SEVENED OUT! 💀',
            details: 'You rolled 7 before making your point. Lost $' + gameState.currentBet
        };
    } else {
        // Keep rolling
        return {
            won: null,
            gameEnded: false,
            message: 'No Decision',
            details: 'You rolled ' + total + '. Keep rolling for your point (' + gameState.point + ') or a 7!'
        };
    }
}

// Display Result
function displayResult(result) {
    resultSection.style.display = 'block';
    resultMessage.textContent = result.message;
    resultDetails.textContent = result.details;
    
    // Add color class
    resultMessage.classList.remove('win', 'lose');
    if (result.won === true) {
        resultMessage.classList.add('win');
    } else if (result.won === false) {
        resultMessage.classList.add('lose');
    }
    
    // Update game phase display
    updateGamePhaseDisplay();
}

// Update Game Phase Display
function updateGamePhaseDisplay() {
    if (gameState.gamePhase === 'comeOut') {
        gamePhaseDisplay.textContent = 'Come Out Roll - Roll 7 or 11 to WIN, 2/3/12 to LOSE';
    } else {
        gamePhaseDisplay.textContent = 'Point Phase - Roll ' + gameState.point + ' to WIN, 7 to LOSE';
    }
}

// Reset Game
resetBtn.addEventListener('click', function() {
    resetGame();
});

function resetGame() {
    gameState = {
        balance: 100,
        currentBet: 0,
        point: null,
        isRolling: false,
        gamePhase: 'comeOut',
        round: 1
    };
    
    // Reset UI
    balanceDisplay.textContent = '100';
    statusDisplay.textContent = 'Welcome! Place your bet and roll the dice.';
    betStatusDisplay.textContent = 'Current Bet: $0';
    betAmountInput.value = '10';
    placeBetBtn.disabled = false;
    rollBtn.disabled = true;
    dice1.textContent = '🎲';
    dice2.textContent = '🎲';
    totalDisplay.textContent = 'Total: 0';
    roundDisplay.textContent = '1';
    pointDisplay.textContent = 'None';
    resultSection.style.display = 'none';
    updateGamePhaseDisplay();
}

// Initialize on page load
window.addEventListener('load', function() {
    updateGamePhaseDisplay();
    betAmountInput.addEventListener('input', function() {
        placeBetBtn.textContent = 'Place Bet: $' + (this.value || '0');
    });
});
