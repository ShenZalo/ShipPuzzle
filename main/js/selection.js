let selectedItem = null;
let selectedSourceCell = null;
let selectedCategory = null;

const categoryKeywords = {
  0: ["chimney ship"],
  1: ["5.00", "6.00", "7.00", "8.00", "9.00"],
  2: ["French", "Greek", "Brazillian", "English", "Spanish"],
  3: ["Coffee", "Tea", "Cocoa", "Rice", "Corn"],
  4: ["Hamburg", "Genoa", "Manila", "Port Said", "Marseille"],
};

function getCategoryFromItem(innerHTML) {
  const text = innerHTML.trim();
  for (const [col, keywords] of Object.entries(categoryKeywords)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return parseInt(col);
    }
  }
  return null;
}

function clearAllHighlights() {
  document.querySelectorAll(".item").forEach((item) => {
    item.classList.remove("bg-green-400", "scale-105");
  });
  document.querySelectorAll("#answer-body td").forEach((cell) => {
    cell.classList.remove("bg-green-400");
  });
}

function unhideSelectionItem(innerHTML) {
  for (const item of document.querySelectorAll(".item")) {
    if (
      item.innerHTML.trim() === innerHTML.trim() &&
      item.dataset.used === "true"
    ) {
      item.style.visibility = "visible";
      item.dataset.used = "false";
      break;
    }
  }
}

function hideSelectionItem(innerHTML) {
  for (const item of document.querySelectorAll(".item")) {
    if (
      item.innerHTML.trim() === innerHTML.trim() &&
      item.classList.contains("bg-green-400") &&
      item.dataset.used !== "true"
    ) {
      item.style.visibility = "hidden";
      item.dataset.used = "true";
      item.classList.remove("bg-green-400", "scale-105");
      break;
    }
  }
}

function selectItem(el) {
  if (el.dataset.used === "true") return;
  clearAllHighlights();
  selectedItem = el.innerHTML.trim();
  selectedSourceCell = null;
  selectedCategory = getCategoryFromItem(selectedItem);
  el.classList.add("bg-green-400", "scale-105");
}

function saveTableState() {
  const cells = document.querySelectorAll("#answer-body td");
  const state = [...cells].map((cell) => cell.innerHTML.trim());
  localStorage.setItem("shipPuzzleAnswers", JSON.stringify(state));
}

function restoreTableState() {
  const saved = localStorage.getItem("shipPuzzleAnswers");
  if (!saved) return;

  const state = JSON.parse(saved);
  const cells = document.querySelectorAll("#answer-body td");

  state.forEach((content, i) => {
    if (content !== "") {
      cells[i].innerHTML = content;

      for (const item of document.querySelectorAll(".item")) {
        if (item.innerHTML.trim() === content) {
          item.style.visibility = "hidden";
          item.dataset.used = "true";
          break;
        }
      }
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const cells = document.querySelectorAll("#answer-body td");

  cells.forEach((cell, index) => {
    const colIndex = index % 5;
    cell.classList.add("cursor-pointer");

    cell.addEventListener("click", () => {
      // Click source cell again = deselect
      if (cell === selectedSourceCell) {
        clearAllHighlights();
        selectedItem = null;
        selectedSourceCell = null;
        selectedCategory = null;
        return;
      }

      // Click a filled cell with nothing selected = pick it up
      if (!selectedItem && cell.innerHTML.trim() !== "") {
        clearAllHighlights();
        selectedItem = cell.innerHTML.trim();
        selectedSourceCell = cell;
        selectedCategory = getCategoryFromItem(selectedItem);
        cell.classList.add("bg-green-400");
        return;
      }

      if (selectedItem) {
        // Check correct column
        if (selectedCategory !== colIndex) {
          alert("This item doesn't belong in this column!");
          return;
        }

        const existingContent = cell.innerHTML.trim();

        if (selectedSourceCell) {
          // Moving from another table cell
          if (existingContent !== "") {
            // Swap contents
            selectedSourceCell.innerHTML = existingContent;
          } else {
            selectedSourceCell.innerHTML = "";
          }
          selectedSourceCell.classList.remove("bg-green-400");
        } else {
          // Coming from selection area
          if (existingContent !== "") {
            // Return displaced item back to selection
            unhideSelectionItem(existingContent);
          }
          // Hide newly placed item from selection
          hideSelectionItem(selectedItem);
        }

        cell.innerHTML = selectedItem;
        selectedItem = null;
        selectedSourceCell = null;
        selectedCategory = null;
        clearAllHighlights();
        saveTableState();
      }
    });
  });

  restoreTableState();
});
