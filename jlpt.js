// function submitAnswer(questionName, correctAnswer) {
//     const selected = document.querySelector(`input[name="${questionName}"]:checked`);
//     const resultText = document.getElementById(`result-${questionName}`);
    
//     if (!selected) {
//         resultText.textContent = "Vui lòng chọn một đáp án.";
//         resultText.style.color = "orange";
//         return;
//     }

//     if (selected.value === correctAnswer) {
//         resultText.textContent = "Đúng rồi!";
//         resultText.style.color = "green";
//     } else {
//         resultText.textContent = `Sai rồi. Đáp án đúng là ${correctAnswer}.`;
//         resultText.style.color = "red";
//     }
// }

let currentTestFile = ''; // To keep track of the current test file
let currentData = [];

function loadTest(filename) {
    currentTestFile = filename;
  
    fetch(`test/${filename}`)
      .then(res => res.json())
      .then(data => {
        currentData = data;
        renderTest(data);
        showTimerAndSubmit();         // ⏱️ Show + start timer AFTER test loaded
        startTimer(75 * 60);          // 1h15m
      })
      .catch(err => {
        console.error("Lỗi khi tải đề:", err);
      });
  }
  
  function showTimerAndSubmit() {
    const testContainer = document.getElementById("test-container");
  
    // If timer & button aren't already inserted, add them
    if (!document.getElementById("timer")) {
      const timer = document.createElement("span");
      timer.id = "timer";
      timer.style = "font-size: 20px; font-weight: bold;";
      timer.textContent = "1:15:00";
      testContainer.prepend(timer); // Add on top

      const submitBtn = document.createElement("button");
      submitBtn.id = "submit-btn";
      submitBtn.textContent = "Nộp bài";
      //submitBtn.style = "margin-left: 20px; background-color: #007bff; color: white; border: none; padding: 8px 16px; border-radius: 5px; cursor: pointer;";
      submitBtn.addEventListener("click", () => {
        clearInterval(timerInterval);
        submitTest();
      });
      testContainer.appendChild(submitBtn);
    }
  }
  

  
  function renderTest(data) {
    const container = document.getElementById('test-container');
    container.innerHTML = ''; // Clear old content
  
    let questionNumber = 1; // Use this to number actual questions only
  
    data.forEach(item => {
      // Nếu chỉ có đoạn văn (không có câu hỏi)
      if (item.paragraph && !item.question) {
        const paraBlock = document.createElement('div');
        paraBlock.className = 'paragraph-block';
        paraBlock.innerHTML = `<strong>Đoạn văn:</strong><br>${item.paragraph}`;
        container.appendChild(paraBlock);
        return; // skip the rest
      }
  
      // Nếu có đoạn văn kèm câu hỏi
      if (item.paragraph && item.question) {
        const paraBlock = document.createElement('div');
        paraBlock.className = 'paragraph-block';
        paraBlock.innerHTML = `<strong>Đoạn văn:</strong><br>${item.paragraph}`;
        container.appendChild(paraBlock);
      }
  
      // Hiển thị câu hỏi + đáp án
      if (item.question && item.choices) {
        const qBlock = document.createElement('div');
        qBlock.className = 'question-block';
        qBlock.innerHTML = `
  <p><strong>Câu ${questionNumber}:</strong> ${item.question}</p>
  ${item.choices.map((choice, i) => `
    <label data-q="${questionNumber}">
      <input type="radio" name="q${questionNumber}" value="${choice}">
      ${String.fromCharCode(65 + i)}. ${choice}
    </label><br>
  `).join('')}
`;
        container.appendChild(qBlock);
        questionNumber++;
      }
    });
  }

let interval = null; // To keep track of the timer interval
  // Countdown logic
function startTimer(durationInSeconds) {
    let timer = durationInSeconds;
    const display = document.getElementById("timer");
  
     interval = setInterval(() => {
      const hours = Math.floor(timer / 3600);
      const minutes = Math.floor((timer % 3600) / 60);
      const seconds = timer % 60;
  
      display.textContent = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  
      if (--timer < 0) {
        clearInterval(interval);
        submitTest(); // Auto submit when time ends
      }
    }, 1000);
  
    // Stop if user submits early
    document.getElementById("submit-btn").addEventListener("click", () => {
      clearInterval(interval);
      submitTest();
    });
  }
  
  // Call it after loading the test
  // startTimer(75 * 60); // 1h15m in seconds

  function submitTest() {
    let correctCount = 0;
    let questionNumber = 1;
  
    currentData.forEach(item => {
      if (item.question && item.choices) {
        const selected = document.querySelector(`input[name="q${questionNumber}"]:checked`);
        const correctAnswer = item.correct;
  
        // Mark correct / incorrect
        const labels = document.querySelectorAll(`[data-q="${questionNumber}"]`);
  
        labels.forEach(label => {
          const input = label.querySelector('input');
          const value = input.value;
  
          if (value === correctAnswer && (!selected || selected.value !== correctAnswer)) {
            label.style.color = 'green'; // correct, not selected
          }
  
          if (selected && value === selected.value) {
            if (value === correctAnswer) {
              label.style.color = 'blue'; // correct chosen
            } else {
              label.style.color = 'red'; // wrong chosen
            }
          }
        });
  
        if (selected && selected.value === correctAnswer) {
          correctCount++;
        }
  
        questionNumber++;
      }
    });
    showResultPopup(correctCount, questionNumber - 1);
    document.querySelectorAll('input[type="radio"]').forEach(input => {
      input.disabled = true;
    });
  }

  function showResultPopup(correct, total) {
    const popup = document.createElement("div");
    popup.id = "result-popup";
    popup.style = `
      position: fixed;
      top: 30%;
      left: 50%;
      transform: translate(-50%, -30%);
      background: white;
      border: 2px solid #007bff;
      padding: 20px 30px;
      box-shadow: 0 4px 10px rgba(0,0,0,0.3);
      z-index: 1000;
      text-align: center;
    `;
  
    popup.innerHTML = `
      <h2>Kết quả</h2>
      <p>Bạn làm đúng <strong>${correct}</strong> / ${total} câu.</p>
      <button onclick="document.body.removeChild(this.parentNode)" style="margin-top: 10px; background: #007bff; color: white; padding: 6px 12px; border: none; border-radius: 5px; cursor: pointer;">
        Đóng
      </button>
    `;
  
    document.body.appendChild(popup);
  }