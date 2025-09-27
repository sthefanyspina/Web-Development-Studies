const CORRECT_COLOR = '#777';
const WRONG_COLOR = '#f66061';

let board = Array.from({ length: 9 }, () => Array(9).fill(0));
let rowNumber = 0;
let colNumber = 0;

var confettiSettings = { target: 'confetti' };
var confetti = new ConfettiGenerator(confettiSettings);


function generateSudoku(fixedNumbersPercentage) {
  board = Array.from({ length: 9 }, () => Array(9).fill(0));
  confetti.clear();
  document.querySelector('.sudoku-grid').classList.remove('dance');

  const fillBoard = (board) => {
    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) {
          let numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9];
          while (numbers.length > 0) {
            let rand = Math.floor(Math.random() * numbers.length);
            if (check(board, i, j, numbers[rand])) {
              board[i][j] = numbers[rand];
              if (fillBoard(board)) {
                return true;
              } else {
                board[i][j] = 0;
              }
            }
            numbers.splice(rand, 1);
          }
          return false;
        }
      }
    }
    return true;
  };

  const check = (board, row, col, number) => {
    for (let i = 0; i < 9; i++) {
      const m = 3 * Math.floor(row / 3) + Math.floor(i / 3);
      const n = 3 * Math.floor(col / 3) + i % 3;
      if (board[row][i] === number || board[i][col] === number || board[m][n] === number) {
        return false;
      }
    }
    return true;
  };

  fillBoard(board);

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      if (Math.random() < fixedNumbersPercentage) {
        board[i][j] = "";
      }
    }
  }

  return board;
}

function generateGame(difficulty) {
  const game = generateSudoku(difficulty);

  for (let i = 0; i < 9; i++) {
    for (let j = 0; j < 9; j++) {
      const cell = document.getElementById(`cell-${i}-${j}`);
      cell.textContent = game[i][j];
      cell.classList.remove("user_input");

      if(game[i][j] == "")
        cell.dataset.editable = true;
      else
        cell.dataset.editable = false;
    }
  }
}

function startNewGame() {
  if (!confirm('Are you sure you want to start a new game?')) {
    return;
  }

  generateGame(difficulty);
}

function checkSudokuStatus() {
  for (let i = 0; i < 9; i++) {
    const row = new Set();
    const col = new Set();
    const box = new Set();

    for (let j = 0; j < 9; j++) {
      const cellRow = document.getElementById(`cell-${i}-${j}`).textContent;
      const cellCol = document.getElementById(`cell-${j}-${i}`).textContent;
      const cellBox = document.getElementById(`cell-${Math.floor(i / 3) * 3 + Math.floor(j / 3)}-${i % 3 * 3 + j % 3}`).textContent;

      if (cellRow === '' || cellCol === '' || cellBox === '') {
        return 'incomplete';
      }

      row.add(cellRow);
      col.add(cellCol);
      box.add(cellBox);
    }

    if (row.size !== 9 || col.size !== 9 || box.size !== 9) {
      return 'incorrect';
    }
  }

  return 'complete';
}

function checkSudoku() {
  const status = checkSudokuStatus();
  if (status === 'complete') {
    document.querySelector('.sudoku-grid').classList.add('dance');

    confetti.render();
    setTimeout(() => {
      confetti.clear();
    }, 80000);

    $('#victoryModal').modal('show');
  } else if (status === 'incorrect') {
    alert('The Sudoku is complete, but incorrect. Please check again!');
  } else {
    alert('The Sudoku is not complete yet. Keep trying!');
  }
}

function isNumberDuplicate(i, j, number) {
  for (let x = 0; x < 9; x++) {
    if (document.getElementById(`cell-${i}-${x}`).textContent === number) {
      return true;
    }
  }

  for (let x = 0; x < 9; x++) {
    if (document.getElementById(`cell-${x}-${j}`).textContent === number) {
      return true;
    }
  }

  const startRow = Math.floor(i / 3) * 3;
  const startCol = Math.floor(j / 3) * 3;
  for (let x = 0; x < 3; x++) {
    for (let y = 0; y < 3; y++) {
      if (document.getElementById(`cell-${startRow + x}-${startCol + y}`).textContent === number) {
        return true;
      }
    }
  }

  return false;
}

function clearUserNumbers() {
  const cells = document.querySelectorAll('.user_input');

  cells.forEach(cell => {
    cell.classList.remove('user_input');
    cell.textContent = '';
  });
}

const clearBtn = document.getElementById('clear-btn');

clearBtn.addEventListener('click', function() {
  const userConfirmed = confirm('Are you sure you want to clear all the numbers you entered?');
  
  if (userConfirmed) {
    clearUserNumbers();
  }
});

const difficultySelect = document.getElementById('difficulty-select');
let difficulty = difficultySelect.options[difficultySelect.selectedIndex].value;

difficultySelect.addEventListener('change', function() {
  const userConfirmed = confirm('You have selected a new difficulty. Would you like to generate a new game?');
  
  if (userConfirmed) {
    const difficulty = difficultySelect.options[difficultySelect.selectedIndex].value;
    generateGame(difficulty);
  }
});

let selectedCell = null;
const cells = document.querySelectorAll('.cell');

const numberButtons = document.querySelectorAll('.numbers-container button');


function isValid(board, row, col, num) {
  // Check row
  for (let i = 0; i < 9; i++) {
    if (board[row][i] === num) {
      return false;
    }
  }

  // Check column
  for (let i = 0; i < 9; i++) {
    if (board[i][col] === num) {
      return false;
    }
  }

  // Check 3x3 box
  const startRow = row - row % 3;
  const startCol = col - col % 3;
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (board[i + startRow][j + startCol] === num) {
        return false;
      }
    }
  }

  return true;
}

const insert_number = (number, selectedCell) => {
  if (number >= 1 && number <= 9) {
    selectedCell.classList.add('user_input');
    selectedCell.textContent = number;

    if(errorCheckingEnabled && !isValid(board, rowNumber, colNumber, number)) {
      selectedCell.style.color = WRONG_COLOR;
    } else {
      selectedCell.style.color = CORRECT_COLOR;
    }

    if (Array.from(cells).every(cell => cell.textContent.trim() !== '')) {
      checkSudoku();
    }

  } else {
    alert('Invalid number. Please enter a number from 1 to 9.');
  }
}



cells.forEach(cell => {
  cell.addEventListener('click', function() {
    if (selectedCell)
      selectedCell.style.border = '';

    if (cell.dataset.editable == "false")
      return;

    const cellId = cell.id;
    const [_, row, col] = cellId.split('-');
    rowNumber = parseInt(row);
    colNumber = parseInt(col);

    cell.style.border = '2px solid yellow';

    selectedCell = cell;

    numberButtons.forEach(button => {
      button.disabled = false;
    });
  });
});

numberButtons.forEach(button => {
  button.addEventListener('click', function() {
    if (selectedCell) {
      number = parseInt(button.textContent);
      insert_number(number, selectedCell);
    }
  });
});

document.addEventListener('keydown', function(event) {
  if (selectedCell) {
    if (event.key >= 0 && event.key <= 9) {
      number = parseInt(event.key);
      insert_number(number, selectedCell);
    } else if (event.key === 'Escape') {
      selectedCell.classList.remove('user_input');
      selectedCell.textContent = '';
    } 
    if (selectedCell) {
      selectedCell.style.border = '';
      selectedCell = null;
    }
  }
});

document.addEventListener('click', function(event) {
  const clickedElement = event.target;
  
  if (!clickedElement.classList.contains('cell')) {
    if (selectedCell) {
      selectedCell.style.border = '';
      selectedCell = null;
    }
    
    numberButtons.forEach(button => {
      button.disabled = true;
    });
  }
});


// -- Error Checking -- //
const toggleButton = document.querySelector('#toggle-button');
let errorCheckingEnabled = false;
toggleButton.addEventListener('change', function() {
  errorCheckingEnabled = this.checked;
});

toggleButton.addEventListener('change', function() {
  errorCheckingEnabled = this.checked;
  
  if (errorCheckingEnabled) {
    cells.forEach(cell => {
      if (cell.classList.contains('user_input')) {
        const [_, row, col] = cell.id.split('-');
        const number = parseInt(cell.textContent);

        if (!isValid(board, parseInt(row), parseInt(col), number)) {
          cell.style.color = WRONG_COLOR;
        } else {
          cell.style.color = '';
        }
      }
    });
  } else {
    cells.forEach(cell => {
      cell.style.color = '';
    });
  }
});
// -- //


document.getElementById('new-game-btn').addEventListener('click', startNewGame);
generateGame(difficulty);


window.addEventListener('load', function() {

});
