const correctSolution = [
  ["Blue chimney ship", "5.00", "French", "Tea", "Genoa"],
  ["Red chimney ship", "6.00", "Greek", "Coffee", "Hamburg"],
  ["Black chimney ship", "8.00", "Brazillian", "Cocoa", "Manila"],
  ["White chimney ship", "9.00", "English", "Rice", "Marseille"],
  ["Green chimney ship", "7.00", "Spanish", "Corn", "Port Said"],
];

const correctPortSaid = "Spanish";
const correctTea = ["French", "Brazilian"];

function clearTable() {
  if (!confirm("Are you sure you want to clear the table?")) return;

  document.querySelectorAll("#answer-body td").forEach((cell) => {
    cell.innerHTML = "";
  });

  document.querySelectorAll(".item").forEach((item) => {
    item.style.visibility = "visible";
    item.dataset.used = "false";
    item.classList.remove("bg-green-400", "scale-105");
  });

  selectedItem = null;
  selectedSourceCell = null;
  selectedCategory = null;

  localStorage.removeItem("shipPuzzleAnswers");
}

function submitAnswer() {
  // Check table is fully filled
  const allFilled = [...document.querySelectorAll("#answer-body td")].every(
    (cell) => cell.innerHTML.trim() !== "",
  );

  if (!allFilled) {
    alert("Please fill in all table cells before submitting.");
    return;
  }

  // Check table correctness
  const userRows = [...document.querySelectorAll("#answer-body tr")].map(
    (row) =>
      [...row.querySelectorAll("td")].map((cell) => cell.innerText.trim()),
  );

  const tableCorrect = userRows.every((userRow) =>
    correctSolution.some((correctRow) =>
      correctRow.every((val, i) => val === userRow[i]),
    ),
  );

  // Check conclusion dropdowns
  const portSaid = document.getElementById("portSaidSelect").value;
  const tea = document.getElementById("teaSelect").value;

  if (!portSaid || !tea) {
    alert("Please select both conclusion answers before submitting.");
    return;
  }

  const conclusionCorrect =
    portSaid === correctPortSaid && correctTea.includes(tea);

  const resultMessage = document.getElementById("resultMessage");

  if (tableCorrect && conclusionCorrect) {
    localStorage.removeItem("shipPuzzleAnswers");
    resultMessage.textContent = "Correct!";
    setTimeout(() => {
      location.href = "congratulation.html";
    }, 1000);
  } else {
    resultMessage.textContent = "Some answers are incorrect. Try again!";
    setTimeout(() => {
      location.href = "retry.html";
    }, 1000);
  }
}
