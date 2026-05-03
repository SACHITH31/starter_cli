const messageEl = document.getElementById("message");
const statusEl = document.getElementById("status");

fetch("http://localhost:5000/")
  .then((res) => {
    if(res.ok) return res.text();
    throw new Error("Network response was not ok");
  })
  .then((data) => {
    statusEl.textContent = "Online";
    statusEl.style.color = "green";
    messageEl.textContent = data;
    console.log("Success:", data);
  })
  .catch((err) => {
    statusEl.textContent = "Offline";
    statusEl.style.color = "red";
    messageEl.textContent = "Could not connect to backend (is it running?)";
    console.error("Error:", err);
  });