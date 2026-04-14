const API = "https://smart-compainion.onrender.com";

function addMsg(text) {
  const div = document.createElement("div");
  div.innerText = text;
  document.getElementById("chatBox").appendChild(div);
}

async function send() {
  const text = document.getElementById("input").value;

  addMsg("You: " + text);

  const res = await fetch(API + "/ai/ask", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ question: text })
  });

  const data = await res.json();
  addMsg("AI: " + data.answer);
}

async function uploadPDF() {
  const file = document.getElementById("pdfFile").files[0];
  const form = new FormData();
  form.append("pdf", file);

  const res = await fetch(API + "/upload", {
    method: "POST",
    body: form
  });

  const data = await res.json();
  window.filePath = data.filePath;
}

async function summarize() {
  const res = await fetch(API + "/ai/summarize", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ filePath: window.filePath })
  });

  const data = await res.json();
  addMsg(data.summary);
}
