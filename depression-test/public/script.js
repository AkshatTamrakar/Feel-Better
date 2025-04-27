const questions = [
    "Little interest or pleasure in doing things?",
    "Feeling down, depressed, or hopeless?",
    "Trouble falling/staying asleep, or sleeping too much?",
    "Feeling tired or having little energy?",
    "Poor appetite or overeating?",
    "Feeling bad about yourself — or that you are a failure or have let yourself or your family down?",
    "Trouble concentrating on things, such as reading or watching TV?",
    "Moving or speaking so slowly that others could have noticed?",
    "Thoughts that you would be better off dead, or hurting yourself in some way?"
  ];
  
  const options = [
    "Not at all",       // 0
    "Several days",     // 1
    "More than half",   // 2
    "Nearly every day"  // 3
  ];
  
  let scores = Array(questions.length).fill(null);
  let currentQuestion = 0;
  
  const container = document.getElementById('question-container');
  const resultDiv = document.getElementById('result');
  
  function showQuestion(index) {
    container.innerHTML = '';
    resultDiv.innerHTML = '';
  
    const qDiv = document.createElement('div');
    qDiv.className = 'question active';
  
    const questionText = document.createElement('h3');
    questionText.innerText = `Q${index + 1}: ${questions[index]}`;
    qDiv.appendChild(questionText);
  
    const optDiv = document.createElement('div');
    optDiv.className = 'options';
  
    options.forEach((text, i) => {
      const label = document.createElement('label');
      label.innerHTML = `
        <input type="radio" name="option" value="${i}"> ${text}
      `;
  
      if (scores[index] === i) {
        label.querySelector('input').checked = true;
      }
  
      label.querySelector('input').addEventListener('click', () => {
        scores[index] = i;
        qDiv.classList.remove('active');
        setTimeout(() => {
          currentQuestion++;
          if (currentQuestion < questions.length) {
            showQuestion(currentQuestion);
          } else {
            showResult();
          }
        }, 400);
      });
  
      optDiv.appendChild(label);
    });
  
    qDiv.appendChild(optDiv);
    container.appendChild(qDiv);
  
    // Toggle back button
    document.getElementById('backBtn').style.display = currentQuestion > 0 ? 'inline-block' : 'none';
  }
  
  function goBack() {
    if (currentQuestion > 0) {
      currentQuestion--;
      showQuestion(currentQuestion);
    }
  }
  
  function showResult() {
    container.innerHTML = '';
    document.getElementById('backBtn').style.display = 'none';
  
    const total = scores.reduce((a, b) => a + (b ?? 0), 0);
    let level = "";
  
    if (total <= 4) level = "Minimal depression";
    else if (total <= 9) level = "Mild depression";
    else if (total <= 14) level = "Moderate depression";
    else if (total <= 19) level = "Moderately severe depression";
    else level = "Severe depression";
  
    resultDiv.innerHTML = `
      Your Score: ${total} / 27<br>
      <span style="color: #007BFF;">Level: ${level}</span>
    `;
  }
  
  // Start
  showQuestion(currentQuestion);
  