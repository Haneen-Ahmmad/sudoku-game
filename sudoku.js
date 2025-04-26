let numSelected = null;
let tileSelected = null;
let errors = 0;
let board = [];
let solution = [];

window.onload = () => {
    newGame();
};

function newGame() {
    const difficulty = document.getElementById("difficulty").value;
    const holes = getHoleCount(difficulty);

    solution = generateFullBoard();
    board = maskBoard(solution, holes);

    errors = 0;
    document.getElementById("errors").innerText = errors;
    renderDigits();
    renderBoard();
}

function getHoleCount(difficulty) {
    switch (difficulty) {
        case "easy": return 30;
        case "medium": return 40;
        case "hard": return 55;
        default: return 40;
    }
}

function generateFullBoard() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));

    function isValid(row, col, num) {
        for (let i = 0; i < 9; i++) {
            if (board[row][i] === num || board[i][col] === num) return false;
            const boxRow = 3 * Math.floor(row / 3) + Math.floor(i / 3);
            const boxCol = 3 * Math.floor(col / 3) + (i % 3);
            if (board[boxRow][boxCol] === num) return false;
        }
        return true;
    }

    function solve() {
        for (let row = 0; row < 9; row++) {
            for (let col = 0; col < 9; col++) {
                if (board[row][col] === 0) {
                    const nums = shuffle([...Array(9).keys()].map(n => n + 1));
                    for (let num of nums) {
                        if (isValid(row, col, num)) {
                            board[row][col] = num;
                            if (solve()) return true;
                            board[row][col] = 0;
                        }
                    }
                    return false;
                }
            }
        }
        return true;
    }

    solve();
    return board.map(row => row.join(""));
}

function maskBoard(fullBoard, holes) {
    const masked = fullBoard.map(row => row.split(""));
    let count = 0;

    while (count < holes) {
        const r = Math.floor(Math.random() * 9);
        const c = Math.floor(Math.random() * 9);
        if (masked[r][c] !== "-") {
            masked[r][c] = "-";
            count++;
        }
    }

    return masked.map(row => row.join(""));
}

function shuffle(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function renderDigits() {
    const digitsContainer = document.getElementById("digits");
    digitsContainer.innerHTML = "";

    for (let i = 1; i <= 9; i++) {
        const number = document.createElement("div");
        number.id = i;
        number.innerText = i;
        number.classList.add("number");
        number.addEventListener("click", selectNumber);
        digitsContainer.appendChild(number);
    }
}

function renderBoard() {
    const boardContainer = document.getElementById("board");
    boardContainer.innerHTML = "";

    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const tile = document.createElement("div");
            tile.id = `${r}-${c}`;
            tile.classList.add("tile");

            if (board[r][c] !== "-") {
                tile.innerText = board[r][c];
                tile.classList.add("tile-start");
            }

            if (r === 2 || r === 5) tile.classList.add("horizontal-line");
            if (c === 2 || c === 5) tile.classList.add("vertical-line");

            tile.addEventListener("click", selectTile);
            boardContainer.appendChild(tile);
        }
    }
}

function selectNumber() {
    if (numSelected) numSelected.classList.remove("select-Number");
    numSelected = this;
    numSelected.classList.add("select-Number");
}

function selectTile() {
    if (!numSelected || this.classList.contains("tile-start") || this.innerText !== "") return;

    if (tileSelected) {
        clearHighlights();
    }

    tileSelected = this;

    const [r, c] = this.id.split("-").map(Number);

    highlightRelatedTiles(r, c);

    if (solution[r][c] === numSelected.id) {
        this.innerText = numSelected.id;
    } else {
        errors++;
        document.getElementById("errors").innerText = errors;
    }
}
function clearHighlights() {
    document.querySelectorAll(".tile").forEach(tile => {
        tile.classList.remove("selected", "related");
    });
}


function highlightRelatedTiles(row, col) {
    document.getElementById(`${row}-${col}`).classList.add("selected");

    // Row and Column
    for (let i = 0; i < 9; i++) {
        document.getElementById(`${row}-${i}`)?.classList.add("related");
        document.getElementById(`${i}-${col}`)?.classList.add("related");
    }

    // Box
    const boxRow = Math.floor(row / 3) * 3;
    const boxCol = Math.floor(col / 3) * 3;
    for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
            document.getElementById(`${boxRow + r}-${boxCol + c}`)?.classList.add("related");
        }
    }
}

