let currentQuestion = null;
let score = 0;
let questionCount = 0;
const totalQuestions = 10;

const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const nextBtn = document.getElementById("nextBtn");
const scoreEl = document.getElementById("score");
const categorySelect = document.getElementById("categorySelect");

function decodeHTML(html) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

async function loadQuiz(retries = 3) {
  const category = categorySelect.value;

  if (questionCount >= totalQuestions) {
    questionEl.innerText = `Quiz Completed!\nCategory: ${categorySelect.options[categorySelect.selectedIndex].text}`;
    answersEl.innerHTML = "";
    scoreEl.innerText = `Your final score: ${score} / ${totalQuestions}`;
    nextBtn.style.display = "none";
    return;
  }

  const url = `https://opentdb.com/api.php?amount=1&type=multiple&category=${category}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      if (retries > 0) return loadQuiz(retries - 1);
      questionEl.innerText = "No questions available! Try a different category.";
      answersEl.innerHTML = "";
      return;
    }

    const q = data.results[0];
    const options = [...q.incorrect_answers, q.correct_answer].sort(() => Math.random() - 0.5);

    currentQuestion = {
      question: decodeHTML(q.question),
      options: options.map(decodeHTML),
      correct: decodeHTML(q.correct_answer)
    };

    questionCount++;
    questionEl.innerText = `Question ${questionCount} of ${totalQuestions}\n\n${currentQuestion.question}`;
    answersEl.innerHTML = "";
    nextBtn.style.display = "none";

    currentQuestion.options.forEach(opt => {
      const btn = document.createElement("button");
      btn.innerText = opt;
      btn.onclick = () => handleAnswer(opt, btn);
      answersEl.appendChild(btn);
    });

    scoreEl.innerText = `Category: ${categorySelect.options[categorySelect.selectedIndex].text} | Score: ${score}`;

  } catch (error) {
    questionEl.innerText = "Failed to load question. Check your internet connection.";
    answersEl.innerHTML = "";
    console.error(error);
  }
}

function handleAnswer(selected, btn) {
  const isCorrect = selected === currentQuestion.correct;
  btn.style.backgroundColor = isCorrect ? "green" : "red";
  if (isCorrect) score++;

  Array.from(answersEl.children).forEach(b => b.disabled = true);
  nextBtn.style.display = "block";

  scoreEl.innerText = `Category: ${categorySelect.options[categorySelect.selectedIndex].text} | Score: ${score}`;
}

nextBtn.onclick = loadQuiz;

categorySelect.onchange = () => {
  score = 0;
  questionCount = 0;
  scoreEl.innerText = "";
  loadQuiz();
};

loadQuiz();
