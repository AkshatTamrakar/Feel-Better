async function askAI(titleFromClick = null) { 
  const inputBox = document.getElementById("askInput");
  const input = titleFromClick || inputBox.value.trim();
  const responseBox = document.getElementById("aiResponse");
  const popup = document.getElementById("popupContainer");

  if (input === "") {
    responseBox.textContent = "Please enter a book title.";
    popup.classList.remove("hidden");
    return;
  }

  responseBox.innerHTML = `⏳ Fetching detailed summary for <strong>${input}</strong>...`;
  popup.classList.remove("hidden");

  try {
    const res = await fetch("/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ bookTitle: input })
    });

    const data = await res.json();

    if (data.summary) {
      responseBox.innerHTML = data.summary;
    } else {
      responseBox.textContent = "No summary received from the AI.";
    }
  } catch (error) {
    console.error("Error:", error);
    responseBox.textContent = "Something went wrong while fetching the summary.";
  }
}

function closePopup() {
  document.getElementById("popupContainer").classList.add("hidden");
}

// Attach click listeners to all book cards
document.querySelectorAll(".book-card").forEach(card => {
  card.addEventListener("click", () => {
    const title = card.getAttribute("data-title");
    document.getElementById("askInput").value = title;
    askAI(title);
  });
});
