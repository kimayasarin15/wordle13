(function () {
  const ANSWER = "KAPIL";
  const WORD_LENGTH = ANSWER.length;
  const MAX_GUESSES = 6;

  const board = document.getElementById("board");
  const keyboardEl = document.getElementById("keyboard");
  const messageEl = document.getElementById("message");

  let currentRow = 0;
  let currentCol = 0;
  let gameOver = false;
  const guesses = Array.from({ length: MAX_GUESSES }, () => Array(WORD_LENGTH).fill(""));

  const KEY_ROWS = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    ["ENTER", "Z", "X", "C", "V", "B", "N", "M", "BACK"],
  ];

  function buildBoard() {
    for (let r = 0; r < MAX_GUESSES; r++) {
      const row = document.createElement("div");
      row.className = "row";
      row.id = `row-${r}`;
      for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = document.createElement("div");
        tile.className = "tile";
        tile.id = `tile-${r}-${c}`;
        row.appendChild(tile);
      }
      board.appendChild(row);
    }
  }

  function buildKeyboard() {
    KEY_ROWS.forEach((rowKeys) => {
      const rowEl = document.createElement("div");
      rowEl.className = "kb-row";
      rowKeys.forEach((key) => {
        const btn = document.createElement("button");
        btn.className = "key" + (key.length > 1 ? " wide" : "");
        btn.id = `key-${key}`;
        btn.textContent = key === "BACK" ? "⌫" : key;
        btn.addEventListener("click", () => handleKey(key));
        rowEl.appendChild(btn);
      });
      keyboardEl.appendChild(rowEl);
    });
  }

  function showMessage(text, cls, timeout) {
    messageEl.textContent = text;
    messageEl.className = "message" + (cls ? " " + cls : "");
    if (timeout) {
      setTimeout(() => {
        if (messageEl.textContent === text) {
          messageEl.textContent = "";
          messageEl.className = "message";
        }
      }, timeout);
    }
  }

  function shakeRow(r) {
    const row = document.getElementById(`row-${r}`);
    row.querySelectorAll(".tile").forEach((t) => {
      t.classList.add("shake");
      setTimeout(() => t.classList.remove("shake"), 400);
    });
  }

  function handleKey(key) {
    if (gameOver) return;

    if (key === "BACK") {
      if (currentCol > 0) {
        currentCol--;
        guesses[currentRow][currentCol] = "";
        const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
        tile.textContent = "";
        tile.classList.remove("filled");
      }
      return;
    }

    if (key === "ENTER") {
      submitGuess();
      return;
    }

    if (/^[A-Z]$/.test(key) && currentCol < WORD_LENGTH) {
      guesses[currentRow][currentCol] = key;
      const tile = document.getElementById(`tile-${currentRow}-${currentCol}`);
      tile.textContent = key;
      tile.classList.add("filled");
      currentCol++;
    }
  }

  function submitGuess() {
    if (currentCol < WORD_LENGTH) {
      showMessage("Not enough letters", null, 1200);
      shakeRow(currentRow);
      return;
    }

    const guess = guesses[currentRow].join("");
    const result = scoreGuess(guess, ANSWER);

    revealRow(currentRow, result, guess, () => {
      if (guess === ANSWER) {
        showMessage("You got it! 🎉", "win");
        gameOver = true;
      } else if (currentRow === MAX_GUESSES - 1) {
        showMessage(`Out of guesses! The word was ${ANSWER}`, "lose");
        gameOver = true;
      }
    });

    currentRow++;
    currentCol = 0;
  }

  function scoreGuess(guess, answer) {
    const result = Array(WORD_LENGTH).fill("absent");
    const answerLetters = answer.split("");
    const guessLetters = guess.split("");
    const used = Array(WORD_LENGTH).fill(false);

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessLetters[i] === answerLetters[i]) {
        result[i] = "correct";
        used[i] = true;
        guessLetters[i] = null;
      }
    }

    for (let i = 0; i < WORD_LENGTH; i++) {
      if (guessLetters[i] === null) continue;
      const idx = answerLetters.findIndex(
        (letter, j) => letter === guessLetters[i] && !used[j]
      );
      if (idx !== -1) {
        result[i] = "present";
        used[idx] = true;
      }
    }

    return result;
  }

  function revealRow(r, result, guess, onDone) {
    result.forEach((status, i) => {
      const tile = document.getElementById(`tile-${r}-${i}`);
      setTimeout(() => {
        tile.classList.add("flip");
        setTimeout(() => {
          tile.classList.add(status);
          updateKeyColor(guess[i], status);
        }, 250);
      }, i * 300);
    });

    setTimeout(() => onDone(), result.length * 300 + 300);
  }

  function updateKeyColor(letter, status) {
    const keyEl = document.getElementById(`key-${letter}`);
    if (!keyEl) return;
    const priority = { absent: 0, present: 1, correct: 2 };
    const current = keyEl.dataset.status || "absent";
    if (!keyEl.dataset.status || priority[status] > priority[current]) {
      keyEl.dataset.status = status;
      keyEl.classList.remove("correct", "present", "absent");
      keyEl.classList.add(status);
    }
  }

  document.addEventListener("keydown", (e) => {
    const key = e.key.toUpperCase();
    if (key === "ENTER") handleKey("ENTER");
    else if (key === "BACKSPACE") handleKey("BACK");
    else if (/^[A-Z]$/.test(key)) handleKey(key);
  });

  buildBoard();
  buildKeyboard();
})();
