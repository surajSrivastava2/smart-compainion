const API = "https://smart-compainion.onrender.com";

function addMsg(text, type) {
  const div = document.createElement("div");
  div.classList.add("msg", type);
  div.innerText = text;
  document.getElementById("chatBox").appendChild(div);
}

// Chat
async function send() {
  const input = document.getElementById("input");
  const text = input.value;

  if (!text) return;

  addMsg(text, "user");
  input.value = "";

  const res = await fetch(API + "/ai/ask", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ question: text })
  });

  const data = await res.json();

  addMsg(data.answer, "bot");
}

// Sections
function showQuiz() {
  document.getElementById("quizSection").classList.remove("hidden");
  document.getElementById("chatSection").style.display = "none";
}

function showChat() {
  document.getElementById("quizSection").classList.add("hidden");
  document.getElementById("chatSection").style.display = "block";
}

// Quiz
async function generateQuiz() {
  const difficulty = document.getElementById("difficulty").value;

  const res = await fetch(API + "/ai/quiz", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({
      text: "Generate quiz from basic concepts",
      difficulty
    })
  });

  const data = await res.json();

  document.getElementById("quizOutput").innerText = data.quiz;
}

// New Chat
function newChat() {
  document.getElementById("chatBox").innerHTML = "";
}
