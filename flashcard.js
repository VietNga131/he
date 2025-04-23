// File: public/flashcard.js
document.addEventListener("DOMContentLoaded", function() {
  loadAllFlashcards();

  const resetBtn = document.getElementById("resetBtn");
  if (resetBtn) {
    resetBtn.addEventListener("click", () => {
      fetch('/flashcard/reset', {
        method: 'POST'
      })
      .then(response => response.json())
      .then(data => {
        if (data.success) {
          alert("Tất cả flashcard đã được reset!");
          location.reload(); // Reload để học lại từ đầu
        } else {
          alert("Có lỗi xảy ra khi reset.");
        }
      });
    });
  }

  const summaryBtn = document.getElementById("summaryBtn");
  if (summaryBtn) {
    summaryBtn.addEventListener("click", () => {
      const container = document.getElementById("summaryContainer");
      // Toggle hiển thị
      if (container.innerHTML.trim() !== "") {
        container.innerHTML = "";
        return;
      }
      loadSummary();
    });
  }
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

// Gọi API summary và render bảng
function loadSummary() {
  fetch('/flashcard/summary')
    .then(res => res.json())
    .then(data => {
      if (!data.success) {
        alert(data.message || "Không lấy được dữ liệu thống kê.");
        return;
      }
      const rows = data.summary.map(row => `
        <tr>
          <td>${row.front}</td>
          <td>${row.pass_total}</td>
          <td>${row.fail_count}</td>
          <td>${row.pass_rate}%</td>
        </tr>
      `).join('');
      const html = `
        <table class="summary-table">
          <thead>
            <tr>
              <th>Từ</th>
              <th>Đã đúng</th>
              <th>Đã sai</th>
              <th>Tỷ lệ đúng</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>
      `;
      document.getElementById('summaryContainer').innerHTML = html;
    })
    .catch(err => {
      alert("Lỗi khi tải thống kê.");
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
        <button id="passBtn">
          <span class="material-symbols-outlined">check</span>
        </button>
        <button id="failBtn">
          <span class="material-symbols-outlined">close</span>
        </button>
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
  .then(r=>r.json()).then(d=>{
    if(d.success && d.removed){
      flashcards.splice(currentIndex,1);
      if(flashcards.length===0){
        showCongratsModal(); return;
      }
      if(currentIndex>=flashcards.length)currentIndex=0;
    }
    nextFlashcard();
  });
}

function nextFlashcard() {
  if (flashcards.length === 0) {
    showCongratsModal(); 
    return;
  }
  // Tăng currentIndex theo cơ chế vòng tròn
  currentIndex = (currentIndex + 1) % flashcards.length;
  // Mặc định quay về trạng thái chưa hiện đáp án
  displayCurrentFlashcard(false);
}

document.getElementById("viewAllBtn").addEventListener("click", () => {
  const container = document.getElementById("wordInfoContainer");
  // Nếu đã có bảng hiển thị => ẩn đi
  if (container.innerHTML.trim() !== "") {
    container.innerHTML = ""; // Xóa bảng
    return;
  }

  fetch('/flashcard/all')
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        let html = `
          <table border="1" style="width:100%; border-collapse:collapse">
            <thead>
              <tr>
                <th>Từ</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
        `;
        data.flashcards.forEach(f => {
          html += `
            <tr>
              <td>${f.front}</td>
              <td>${f.is_active ? "Đang học" : "Đã ẩn"}</td>
              <td>
                <button onclick="deleteFlashcard(${f.id})">Xóa</button>
              </td>
            </tr>
          `;
        });        
        html += `</tbody></table>`;
        document.getElementById("wordInfoContainer").innerHTML = html;
      }
    });
});


function moveUp(id) {
  fetch('/flashcard/moveUp', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Đã di chuyển lên!");
      document.getElementById("viewAllBtn").click(); // Reload bảng
    } else {
      alert("Lỗi khi di chuyển lên.");
    }
  });
}

function moveDown(id) {
  fetch('/flashcard/moveDown', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Đã di chuyển xuống!");
      document.getElementById("viewAllBtn").click(); // Reload bảng
    } else {
      alert("Lỗi khi di chuyển xuống.");
    }
  });
}

function deleteFlashcard(id) {
  if (confirm("Bạn có chắc chắn muốn xóa từ này?")) {
    fetch('/flashcard/delete', {
      method: 'POST',
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        alert("Đã xóa!");
        // 🔄 Reload lại toàn bộ trang
        window.location.reload();
      } else {
        alert("Lỗi khi xóa.");
      }
    });
  }
}

function handleRightClick(event, id) {
  event.preventDefault(); // Ngăn mở menu chuột phải mặc định

  const confirmDelete = confirm("Bạn có muốn xóa từ này vĩnh viễn?");
  if (!confirmDelete) return;

  fetch('/flashcard/delete', {
    method: 'POST',
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      alert("Đã xóa!");
      document.getElementById("viewAllBtn").click(); // Reload bảng
    } else {
      alert("Lỗi khi xóa.");
    }
  });
}

function showCongratsModal(){
  fetch('/flashcard/stats').then(r=>r.json()).then(d=>{
    if(!d.success)return;
    let html='<table border=1 style="width:100%;border-collapse:collapse">'
      +'<tr><th>Từ</th><th>Pass</th><th>Fail</th><th>% Pass</th></tr>';
    d.stats.forEach(w=>{
      const total=w.pass_count+w.fail_count;
      const pct= total? Math.round(w.pass_count/total*100):0;
      html+=`<tr>
        <td>${w.front}</td>
        <td>${w.pass_count}</td>
        <td>${w.fail_count}</td>
        <td>${pct}%</td>
      </tr>`;
    });
    html+='</table>';
    document.getElementById('statsTable').innerHTML=html;
    document.getElementById('congratsModal').style.display='flex';
  });
}
document.getElementById('closeCongrats').addEventListener('click',()=>{
  document.getElementById('congratsModal').style.display='none';
});
