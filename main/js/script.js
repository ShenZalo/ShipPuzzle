const portSaidSelect = document.getElementById('portSaidSelect');
const teaSelect = document.getElementById('teaSelect');
const submitButton = document.getElementById('submitButton');
const resultMessage = document.getElementById('resultMessage');

const correctAnswers = {
  portSaid: 'English',
  tea: 'English'
};

async function submitFinalAnswer() {
  const portSaid = portSaidSelect.value;
  const tea = teaSelect.value;

  if (!portSaid || !tea) {
    if (resultMessage) {
      resultMessage.textContent = 'Please select both answers.';
    } else {
      alert('Please select both answers.');
    }
    return;
  }

  const isCorrect = portSaid === correctAnswers.portSaid && tea === correctAnswers.tea;

  if (resultMessage) {
    resultMessage.textContent = isCorrect
      ? 'Perfect! The English ship goes to Port Said and carries tea!'
      : 'Not quite. Try again.';
  }

  window.location.href = isCorrect ? 'congratulation.html' : 'retry.html';
}

submitButton.addEventListener('click', submitFinalAnswer);
window.submitFinalAnswer = submitFinalAnswer;