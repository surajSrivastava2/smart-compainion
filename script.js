const API = "https://smart-compainion.onrender.com";

async function handleAuth() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await fetch(API + "/auth/signup", {
    method: "POST",
    headers: {"Content-Type":"application/json"},
    body: JSON.stringify({ email, password })
  });

  window.location.href = "chat.html";
}
