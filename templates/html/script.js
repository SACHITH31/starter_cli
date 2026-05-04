const messageEl = document.getElementById("message");
const statusEl = document.getElementById("status");

fetch("http://localhost:5000/")
  .then((res) => res.text())
  .then((data) => {
    statusEl.textContent = "Online";
    messageEl.textContent = data;
  })
  .catch(() => {
    statusEl.textContent = "Offline";
    messageEl.textContent = "Could not connect to backend";
  });