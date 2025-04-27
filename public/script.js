const fileInput = document.getElementById('uploadSelfie');
const fileNameDisplay = document.getElementById('file-name');
const analyzeBtn = document.querySelector('.analyze-btn');
const textInput = document.getElementById('feelingsInput');
const output = document.getElementById('responseOutput');

fileInput.addEventListener('change', () => {
  if (fileInput.files.length > 0) {
    fileNameDisplay.textContent = `Uploaded: ${fileInput.files[0].name}`;
  } else {
    fileNameDisplay.textContent = '';
  }
});

analyzeBtn.addEventListener('click', async () => {
  const file = fileInput.files[0];
  const text = textInput.value.trim();

  if (!file || !text) {
    alert("Please upload a selfie and enter your feelings.");
    return;
  }

  try {
    const base64Image = await toBase64(file);

    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image, text })
    });

    const data = await response.json();

    // Save the result in localStorage
    localStorage.setItem('moodData', JSON.stringify(data));

    // Redirect to services.html
    window.location.href = 'services.html';
  } catch (error) {
    console.error('Error:', error);
    alert("Something went wrong. Please try again.");
  }
});


function toBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
