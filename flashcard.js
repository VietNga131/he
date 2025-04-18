// File: public/flashcard.js
document.addEventListener("DOMContentLoaded", function() {
  loadAllFlashcards();
});

let flashcards = [];
let currentIndex = 0;

function loadAllFlashcards() {
  fetch("/flashcards")
    .then(response => response.json())
    .then(data => {
      if (data.success && data.flashcards && data.flashcards.length > 0) {
         flashcards = data.flashcards;
         currentIndex = 0;
         displayCurrentFlashcard(false); // false: chưa hiện đáp án
      } else {
         document.getElementById("flashcardContainer").innerHTML = "<p>Không có flashcard nào. Vui lòng thêm từ mới.</p>";
      }
    })
    .catch(err => {
       document.getElementById("flashcardContainer").innerHTML = "<p>Lỗi khi tải flashcard.</p>";
    });
}

// showAnswer: nếu true hiển thị mặt sau
function displayCurrentFlashcard(showAnswer) {
  if (flashcards.length === 0) {
    document.getElementById("flashcardContainer").innerHTML = "<p>Không có flashcard nào. Vui lòng thêm từ mới.</p>";
    return;
  }
  
  let card = flashcards[currentIndex];
  const container = document.getElementById("flashcardContainer");
  
  // Nếu chưa show đáp án, chỉ hiển thị mặt trước
  if (!showAnswer) {
    container.innerHTML = `
      <div class="card">
        <h2>${card.front}</h2>
      </div>
      <div class="card-actions">
        <button id="showAnswerBtn">Hiện đáp án</button>
      </div>
    `;
    document.getElementById("showAnswerBtn").addEventListener("click", function() {
      displayCurrentFlashcard(true);
    });
  } else {
    // Nếu đã ấn nút hiển thị đáp án, hiện mặt sau và nút Pass/Fail
    container.innerHTML = `
      <div class="card">
        <h2>${card.front}</h2>
        <p><strong>Đáp án:</strong> ${card.back}</p>
      </div>
      <div class="card-actions">
        <button id="passBtn">Pass</button>
        <button id="failBtn">Fail</button>
      </div>
    `;
  
    document.getElementById("passBtn").addEventListener("click", function() {
      handlePass(card.id);
    });
  
    document.getElementById("failBtn").addEventListener("click", function() {
      handleFail(card.id);
    });
  }
}

function handlePass(cardId) {
  fetch("/flashcard/pass", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id: cardId })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      if (data.removed) {
        alert("Bạn đã học thành công từ này!");
        // Xóa flashcard khỏi mảng
        flashcards.splice(currentIndex, 1);
        if (flashcards.length === 0) {
          document.getElementById("flashcardContainer").innerHTML = "<p>Không có flashcard nào. Vui lòng thêm từ mới.</p>";
          return;
        }
        // Nếu currentIndex vượt quá độ dài mảng, reset về 0
        if (currentIndex >= flashcards.length) {
          currentIndex = 0;
        }
      }
      nextFlashcard();
    }
  })
  .catch(err => {
    alert("Lỗi khi xử lý pass.");
  });
}

function handleFail(cardId) {
  fetch("/flashcard/fail", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id: cardId })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      nextFlashcard();
    }
  })
  .catch(err => {
    alert("Lỗi khi xử lý fail.");
  });
}

function nextFlashcard() {
  if (flashcards.length === 0) {
    document.getElementById("flashcardContainer").innerHTML = "<p>Không có flashcard nào. Vui lòng thêm từ mới.</p>";
    return;
  }
  // Tăng currentIndex theo cơ chế vòng tròn
  currentIndex = (currentIndex + 1) % flashcards.length;
  // Mặc định quay về trạng thái chưa hiện đáp án
  displayCurrentFlashcard(false);
}
