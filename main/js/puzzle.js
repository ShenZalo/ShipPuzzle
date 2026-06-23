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
  // REMOVAL LOGIC: Click a filled cell to clear it and return item to selection board
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

        // Remove selection behavior once the item is inside the table cell
        const nestedCard = cells[savedItem.cellIndex].querySelector(".item");
        if (nestedCard) {
          nestedCard.removeAttribute("onclick");
        }

        // Mark this specific card key combination as used (e.g., "ship-Red")
        usedItems.add(`${savedItem.type}-${savedItem.val}`);
      }
    });
  }

  // 3. Loop through your selection board pool items and show ONLY the unused ones
  const allSelectionCards = document.querySelectorAll("#selection .item");
  allSelectionCards.forEach((card) => {
    const cardType = card.getAttribute("data-type");
    const cardVal = card.getAttribute("data-value");
    const lookupKey = `${cardType}-${cardVal}`;

    // If the item key isn't in our used list, make it visible instantly
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

function submitAnswer() {
  const portAnswer = document.getElementById("portSaidSelect").value;
  const teaAnswer = document.getElementById("teaSelect").value;
  const banner = document.getElementById("resultMessage");

  // Check if all 25 cells are filled
  const cells = document.querySelectorAll(".dashboard-table tbody td");
  const allFilled = [...cells].every((cell) => cell.innerHTML.trim() !== "");

  if (!allFilled) {
    banner.style.color = "#ef4444";
    banner.innerText =
      "❌ Please complete the entire Answer Matrix before submitting.";
    return;
  }

  // Check dropdowns
  if (!portAnswer || !teaAnswer) {
    banner.style.color = "#ef4444";
    banner.innerText = "❌ Please answer both deduction questions.";
    return;
  }

  if (portAnswer === "Spanish" && teaAnswer === "French") {
    banner.style.color = "#10b981";
    banner.innerText =
      "🎉 Brilliant! Your puzzle deductions match the nautical logs perfectly!";

    localStorage.removeItem("shipPuzzleGrid");
    localStorage.removeItem("shipPuzzlePortSaid");
    localStorage.removeItem("shipPuzzleTea");

    setTimeout(() => {
      window.location.href = "congratulation.html";
    }, 1000);
  } else {
    banner.style.color = "#ef4444";
    banner.innerText =
      "❌ That does not match the 15 puzzle logs. Check your grid positions and try again!";

    setTimeout(() => {
      window.location.href = "retry.html";
    }, 1000);
  }
}
