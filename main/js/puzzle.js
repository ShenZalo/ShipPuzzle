let currentSelectedElement = null;

document.addEventListener("DOMContentLoaded", loadGameState);
window.addEventListener("pageshow", loadGameState);

function selectItem(element) {
  event.stopPropagation();
  if (currentSelectedElement) {
    currentSelectedElement.classList.remove("selected-active");
  }
  currentSelectedElement = element;
  currentSelectedElement.classList.add("selected-active");
}

function targetCellClick(cell) {
  //Logic for removing an item from the cell and returning it to the selection board
  if (!currentSelectedElement) {
    if (cell.innerHTML !== "") {
      const storedVal = cell
        .querySelector(".item")
        .getAttribute("data-stored-value");
      const storedType = cell.querySelector(".item").getAttribute("data-type");

      const selectionBoardItem = document.querySelector(
        `#selection .item[data-type="${storedType}"][data-value="${storedVal}"]`,
      );
      if (selectionBoardItem) {
        selectionBoardItem.parentElement.style.visibility = "visible";
      }

      cell.innerHTML = "";
      saveGameState();
    }
    return;
  }

  const expectedType = cell.getAttribute("data-col");
  const activeType = currentSelectedElement.getAttribute("data-type");

  if (expectedType !== activeType) {
    alert(
      `Invalid Placement: This column only accepts ${expectedType} tokens.`,
    );
    return;
  }

  // If the cell already has an item, restore the old item to the board first
  if (cell.innerHTML !== "") {
    const oldVal = cell
      .querySelector(".item")
      .getAttribute("data-stored-value");
    const oldType = cell.querySelector(".item").getAttribute("data-type");
    const oldBoardItem = document.querySelector(
      `#selection .item[data-type="${oldType}"][data-value="${oldVal}"]`,
    );
    if (oldBoardItem) {
      oldBoardItem.parentElement.style.visibility = "visible";
    }
  }

  cell.innerHTML = "";

  const itemVal = currentSelectedElement.getAttribute("data-value");
  const clonedNode = currentSelectedElement.cloneNode(true);
  clonedNode.classList.remove("selected-active");
  clonedNode.removeAttribute("onclick");
  clonedNode.setAttribute("data-stored-value", itemVal);

  cell.appendChild(clonedNode);

  // Hide item from the choice pool immediately
  currentSelectedElement.parentElement.style.visibility = "hidden";

  currentSelectedElement.classList.remove("selected-active");
  currentSelectedElement = null;

  saveGameState();
}

function saveGameState() {
  const gridState = [];
  const cells = document.querySelectorAll(".dashboard-table tbody tr td");

  cells.forEach((cell, index) => {
    if (cell.innerHTML.trim() !== "") {
      const nestedItem = cell.querySelector(".item");
      gridState.push({
        cellIndex: index,
        htmlContent: cell.innerHTML,
        val: nestedItem.getAttribute("data-stored-value"),
        type: nestedItem.getAttribute("data-type"),
      });
    }
  });

  localStorage.setItem("shipPuzzleGrid", JSON.stringify(gridState));
  localStorage.setItem(
    "shipPuzzlePortSaid",
    document.getElementById("portSaidSelect").value,
  );
  localStorage.setItem(
    "shipPuzzleTea",
    document.getElementById("teaSelect").value,
  );
}

function loadGameState() {
  const savedGrid = localStorage.getItem("shipPuzzleGrid");
  const savedPort = localStorage.getItem("shipPuzzlePortSaid");
  const savedTea = localStorage.getItem("shipPuzzleTea");
  const cells = document.querySelectorAll(".dashboard-table tbody tr td");

  // 1. Wipe out table cell contents first
  cells.forEach((cell) => (cell.innerHTML = ""));

  // 2. Track which items have been used in the answer matrix table
  const usedItems = new Set();

  if (savedGrid) {
    const gridState = JSON.parse(savedGrid);
    gridState.forEach((savedItem) => {
      if (cells[savedItem.cellIndex]) {
        cells[savedItem.cellIndex].innerHTML = savedItem.htmlContent;

        // Remove selection item from the pool once it's placed in the answer matrix
        const nestedCard = cells[savedItem.cellIndex].querySelector(".item");
        if (nestedCard) {
          nestedCard.removeAttribute("onclick");
        }

        // Mark this item as used so it won't be shown in the selection board
        usedItems.add(`${savedItem.type}-${savedItem.val}`);
      }
    });
  }

  // 3. Loop through the selection board pool items and show ONLY the unused ones
  const allSelectionCards = document.querySelectorAll("#selection .item");
  allSelectionCards.forEach((card) => {
    const cardType = card.getAttribute("data-type");
    const cardVal = card.getAttribute("data-value");
    const lookupKey = `${cardType}-${cardVal}`;

    // If the item key isn't in the used list, make it visible instantly
    if (!usedItems.has(lookupKey)) {
      card.parentElement.style.visibility = "visible";
    } else {
      card.parentElement.style.visibility = "hidden";
    }
  });

  if (savedPort) document.getElementById("portSaidSelect").value = savedPort;
  if (savedTea) document.getElementById("teaSelect").value = savedTea;

  // Show selection board only after everything is restored
  const selectionBoard = document.getElementById("selection");
  if (selectionBoard) {
    selectionBoard.style.visibility = "visible";
  }
}

function saveAndGoBack() {
  saveGameState();
  window.location.href = "instruction.html";
}

function clearTable() {
  const cells = document.querySelectorAll(".dashboard-table td");
  cells.forEach((cell) => (cell.innerHTML = ""));

  // Make the entire pool visible again instantly
  const selectionItems = document.querySelectorAll("#selection ocean-sway");
  selectionItems.forEach((item) => (item.style.visibility = "visible"));

  document.getElementById("portSaidSelect").value = "";
  document.getElementById("teaSelect").value = "";
  document.getElementById("resultMessage").innerText = "";

  if (currentSelectedElement) {
    currentSelectedElement.classList.remove("selected-active");
    currentSelectedElement = null;
  }

  localStorage.removeItem("shipPuzzleGrid");
  localStorage.removeItem("shipPuzzlePortSaid");
  localStorage.removeItem("shipPuzzleTea");
}

/* Puzzle Solving Algorithm, let's hope this work shall we fellas, imma try my best lol */

/* The variables for the puzzle */
const NATIONALITIES = ["Greek", "English", "French", "Brazilian", "Spanish"];
const CHIMNEYS = ["black", "blue", "green", "red", "white"];
const CARGO = ["coffee", "cocoa", "rice", "corn", "tea"];
const DESTINATIONS = ["Marseille", "Manila", "Genoa", "Hamburg", "Port Said"];
const TIMES = ["five", "six", "seven", "eight", "nine"];
const POSITIONS = [1, 2, 3, 4, 5];

/* This is for generation all possible permutations of the arrays */
function* permutations(arr) {
  if (arr.length <= 1) {
    yield arr;
    return;
  }
  for (let i = 0; i < arr.length; i++) {
    const rest = [...arr.slice(0, i), ...arr.slice(i + 1)];
    for (const perm of permutations(rest)) {
      yield [arr[i], ...perm];
    }
  }
}

/* takes one of the permutations and converts it into a map of position to value */
function toPositionMap(perm) {
  const map = {};
  POSITIONS.forEach((pos, idx) => (map[pos] = perm[idx]));
  return map;
}

/* finds the position of a value in a map of position to value, basically just the reverse of the top lol*/
function findPos(map, value) {
  return POSITIONS.find((p) => map[p] === value);
}

/* alright fellas this one gonna take a lot of work*/
/*the algorithm for puzzle solver*/
function solveShipPuzzle() {
  const solutions = [];

  for (const natPerm of permutations(NATIONALITIES)) {
    const nat = toPositionMap(natPerm);

    for (const chimPerm of permutations(CHIMNEYS)) {
      const chim = toPositionMap(chimPerm);
      if (chim[3] !== "black") continue; // Clue 2

      for (const cargoPerm of permutations(CARGO)) {
        const cargo = toPositionMap(cargoPerm);

        const greekPos = findPos(nat, "Greek");
        if (cargo[greekPos] !== "coffee") continue; // Clue 1 (partial)

        const frenchPos = findPos(nat, "French");
        const coffeePos = findPos(cargo, "coffee");
        if (chim[frenchPos] !== "blue") continue; // Clue 4
        if (frenchPos + 1 !== coffeePos) continue; // Clue 4

        const cornPos = findPos(cargo, "corn");
        if (cornPos !== 1 && cornPos !== 5) continue; // Clue 12

        const ricePos = findPos(cargo, "rice");
        if (Math.abs(cornPos - ricePos) !== 1) continue; // Clue 14

        const riceNeighbors = [ricePos - 1, ricePos + 1].filter((p) =>
          POSITIONS.includes(p),
        );
        if (!riceNeighbors.some((p) => chim[p] === "green")) continue; // Clue 7

        for (const destPerm of permutations(DESTINATIONS)) {
          const dest = toPositionMap(destPerm);

          const brazPos = findPos(nat, "Brazilian");
          if (dest[brazPos] !== "Manila") continue; // Clue 6

          const cocoaPos = findPos(cargo, "cocoa");
          if (cocoaPos + 1 > 5) continue;
          if (dest[cocoaPos + 1] !== "Marseille") continue; // Clue 5

          const spanishPos = findPos(nat, "Spanish");
          const marseillePos = findPos(dest, "Marseille");
          if (spanishPos <= marseillePos) continue; // Clue 9 (partial)

          const redPos = findPos(chim, "red");
          if (dest[redPos] !== "Hamburg") continue; // Clue 10

          for (const timePerm of permutations(TIMES)) {
            const time = toPositionMap(timePerm);

            if (time[greekPos] !== "six") continue; // Clue 1

            const engPos = findPos(nat, "English");
            if (time[engPos] !== "nine") continue; // Clue 3

            const genoaPos = findPos(dest, "Genoa");
            if (time[genoaPos] !== "five") continue; // Clue 8

            if (time[spanishPos] !== "seven") continue; // Clue 9

            const sevenPos = findPos(time, "seven");
            const sevenNeighbors = [sevenPos - 1, sevenPos + 1].filter((p) =>
              POSITIONS.includes(p),
            );
            if (!sevenNeighbors.some((p) => chim[p] === "white")) continue; // Clue 11

            if (time[3] !== "eight") continue; // Clue 13

            const hamburgPos = findPos(dest, "Hamburg");
            if (time[hamburgPos] !== "six") continue; // Clue 15

            solutions.push({
              nationality: nat,
              chimney: chim,
              cargo,
              destination: dest,
              time,
            });
          }
        }
      }
    }
  }

  return solutions;
}

/* converting the variable to the display values in HTML */

const CHIMNEY_DISPLAY = {
  black: "Black",
  blue: "Blue",
  green: "Green",
  red: "Red",
  white: "White",
};

const CARGO_DISPLAY = {
  coffee: "Coffee",
  cocoa: "Cocoa",
  rice: "Rice",
  corn: "Corn",
  tea: "Tea",
};

const TIME_DISPLAY = {
  five: "5.00",
  six: "6.00",
  seven: "7.00",
  eight: "8.00",
  nine: "9.00",
};

// Convert a solved position's attributes into the same shape/values
// used by the Answer Matrix cells (ship, time, country, item, destination).
function solvedShipToDisplayTuple(sol, pos) {
  return {
    ship: CHIMNEY_DISPLAY[sol.chimney[pos]],
    time: TIME_DISPLAY[sol.time[pos]],
    country: sol.nationality[pos],
    item: CARGO_DISPLAY[sol.cargo[pos]],
    destination: sol.destination[pos],
  };
}

/* this is to turn the tuple into a string for comparison, since the order of the rows doesn't matter */
function tupleKey(t) {
  return `${t.ship}|${t.time}|${t.country}|${t.item}|${t.destination}`;
}

/* ============================================================
   Rewired submitAnswer — checks the player's grid against a
   solution derived by the solver at check-time, not a hardcoded
   answer. If the solver disagreed with itself between page loads
   it would still be self-consistent since it's recomputed here.
   ============================================================ */

function submitAnswer() {
  const portAnswer = document.getElementById("portSaidSelect").value;
  const teaAnswer = document.getElementById("teaSelect").value;
  const banner = document.getElementById("resultMessage");

  const cells = document.querySelectorAll(".dashboard-table tbody td");
  const allFilled = [...cells].every((cell) => cell.innerHTML.trim() !== "");

  if (!allFilled) {
    banner.style.color = "#ef4444";
    banner.innerText =
      "❌ Please complete the entire Answer Matrix before submitting.";
    return;
  }

  if (!portAnswer || !teaAnswer) {
    banner.style.color = "#ef4444";
    banner.innerText = "❌ Please answer both deduction questions.";
    return;
  }

  // Derive the correct answer from the clues
  const solutions = solveShipPuzzle();
  if (solutions.length !== 1) {
    // The solver should always return exactly one solution for a valid puzzle. If it doesn't, something is wrong.
    banner.style.color = "#ef4444";
    banner.innerText =
      "Internal error: puzzle solver did not find a unique solution.";
    console.error("Solver returned", solutions.length, "solutions:", solutions);
    return;
  }
  const solution = solutions[0];

  /* convert the solution into a comparable format for the player's grid */
  const solvedTuples = POSITIONS.map((p) =>
    solvedShipToDisplayTuple(solution, p),
  );
  const solvedKeys = solvedTuples.map(tupleKey).sort();

  // Build the player's 5 ship tuples from the DOM
  const categoryRows = document.querySelectorAll(".dashboard-table tbody tr");
  const playerTuples = [0, 1, 2, 3, 4].map((posIndex) => {
    const tuple = {};
    categoryRows.forEach((row) => {
      const col = row.getAttribute("data-row");
      const cell = row.querySelectorAll("td")[posIndex];
      const nestedItem = cell.querySelector(".item");
      const val =
        nestedItem?.getAttribute("data-stored-value") ||
        nestedItem?.getAttribute("data-value");
      tuple[col] = val;
    });
    return tuple;
  });
  const playerKeys = playerTuples.map(tupleKey).sort();

  /* Compare the player's grid to the solved grid and check the conclusions */
  const gridCorrect = JSON.stringify(playerKeys) === JSON.stringify(solvedKeys);

  /* Check the conclusions against the solved solution */
  const portSaidPos = findPos(solution.destination, "Port Said");
  const teaPos = findPos(solution.cargo, "tea");
  const correctPortShip = solution.nationality[portSaidPos];
  const correctTeaShip = solution.nationality[teaPos];

  const conclusionsCorrect =
    portAnswer === correctPortShip && teaAnswer === correctTeaShip;

  if (gridCorrect && conclusionsCorrect) {
    banner.style.color = "#10b981";
    banner.innerText =
      "Brilliant! You are truly the sea detective! You have solved the puzzle and deduced the correct answers.";
    localStorage.removeItem("shipPuzzleGrid");
    localStorage.removeItem("shipPuzzlePortSaid");
    localStorage.removeItem("shipPuzzleTea");

    setTimeout(() => {
      window.location.href = "congratulation.html";
    }, 1000);
  } else {
    banner.style.color = "#ef4444";
    banner.innerText =
      "Incorrect solution or conclusions. Please review your Answer Matrix and deduction answers and then try again.";

    setTimeout(() => {
      window.location.href = "retry.html";
    }, 1000);
  }
}
