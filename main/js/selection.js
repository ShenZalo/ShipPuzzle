// Function to handle item selection, adding a green background and scale of 105 to the selected item and removing it from others
function selectItem(el) {
  const isSelected = el.classList.contains("bg-green-400");

  // remove from all first (optional: only if you want single-select mode)
  document.querySelectorAll(".item").forEach((i) => {
    i.classList.remove("bg-green-400", "scale-105");
  });

  // if it was already selected → just exit (toggle off)
  if (isSelected) return;

  // otherwise select it
  el.classList.add("bg-green-400", "scale-105");
}
