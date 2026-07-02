const CLUE_STATE_KEY = "shipPuzzleClueChecks";

function onClueToggle(checkbox) {
  applyCheckedStyle(checkbox);
  saveClueState();
  updateProgressLabel();
}

function applyCheckedStyle(checkbox) {
  const li = checkbox.closest(".clue-item");
  const text = li.querySelector(".clue-text");
  if (checkbox.checked) {
    text.classList.add("line-through", "text-gray-400");
    li.classList.add("opacity-60");
  } else {
    text.classList.remove("line-through", "text-gray-400");
    li.classList.remove("opacity-60");
  }
}

function saveClueState() {
  const state = {};
  document.querySelectorAll(".clue-checkbox").forEach((cb) => {
    state[cb.getAttribute("data-clue-id")] = cb.checked;
  });
  localStorage.setItem(CLUE_STATE_KEY, JSON.stringify(state));
}

function loadClueState() {
  const saved = localStorage.getItem(CLUE_STATE_KEY);
  if (!saved) {
    updateProgressLabel();
    return;
  }

  let state;
  try {
    state = JSON.parse(saved);
  } catch (e) {
    console.error("Could not parse saved clue state:", e);
    updateProgressLabel();
    return;
  }

  document.querySelectorAll(".clue-checkbox").forEach((cb) => {
    const id = cb.getAttribute("data-clue-id");
    if (state[id]) {
      cb.checked = true;
      applyCheckedStyle(cb);
    }
  });

  updateProgressLabel();
}

function updateProgressLabel() {
  const total = document.querySelectorAll(".clue-checkbox").length;
  const checked = document.querySelectorAll(".clue-checkbox:checked").length;
  document.getElementById("clueProgress").innerText = `${checked} / ${total}`;
}

document.addEventListener("DOMContentLoaded", loadClueState);
window.addEventListener("pageshow", loadClueState);
