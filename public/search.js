// File: public/search.js
document.addEventListener("DOMContentLoaded", function() {
  const searchInput = document.getElementById("searchInput");
  const searchBtn = document.getElementById("searchBtn");
  const resultsContainer = document.getElementById("results");

  // Hàm gọi API tìm kiếm
  function fetchWords(query) {
    resultsContainer.innerHTML = "<p>Đang tìm kiếm...</p>";

    const apiUrl = `https://backend-production-278881502558.asia-northeast1.run.app/v1/lexemes/search/${encodeURIComponent(query)}`;

    fetch(apiUrl)
      .then(response => {
        if (!response.ok) {
          throw new Error("Lỗi mạng hoặc không tìm thấy dữ liệu");
        }
        return response.json();
      })
      .then(data => {
        displayResults(data);
      })
      .catch(error => {
        resultsContainer.innerHTML = `<p style="color: red;">${error.message}</p>`;
      });
  }

  function displayResults(responseData) {
    if (
      responseData && 
      responseData.message === "OK" && 
      responseData.data
    ) {
      const data = responseData.data; // chứa id, lexeme, meaning,...

      // Hiển thị thông tin cơ bản
      resultsContainer.innerHTML = `
        <h2>${data.lexeme} (${data.hanviet})</h2>
        <p><strong>Hiragana:</strong> ${data.hiragana}</p>
        <p><strong>JLPT level:</strong> ${data.Jlptlevel}</p>
        <p><strong>Từ tương tự:</strong> ${data.similars.join(", ")}</p>
        <button id="addFlashcardBtn">Thêm vào flash card</button>
      `;

      // Hiển thị danh sách các nghĩa (meaning) nếu có
      if (Array.isArray(data.meaning) && data.meaning.length > 0) {
        const list = document.createElement("ul");
        data.meaning.forEach(item => {
          const li = document.createElement("li");
          li.innerHTML = `
            <h4>${item.meaning}</h4>
            <p>${item.explaination}</p>
            <pre>${item.example}</pre>
          `;
          list.appendChild(li);
        });
        resultsContainer.appendChild(list);
      } else {
        resultsContainer.innerHTML += "<p>Không tìm thấy nghĩa.</p>";
      }

      document.getElementById("addFlashcardBtn").addEventListener("click", function() {
        const flashcardData = {
          front: data.lexeme,
          back: Array.isArray(data.meaning)
            ? data.meaning.map(m => m.meaning).join("; ")
            : data.meaning
        };
      
        fetch("/flashcard/add", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(flashcardData)
        })
        .then(response => response.json())
        .then(result => {
          alert(result.message);
        })
        .catch(error => {
          alert("Lỗi khi thêm flashcard");
        });
      });      

    } else {
      resultsContainer.innerHTML = "<p>Không tìm thấy kết quả.</p>";
    }
  }
  
  // Sự kiện khi click nút tìm kiếm
  searchBtn.addEventListener("click", () => {
    const query = searchInput.value.trim();
    if (query) {
      fetchWords(query);
    }
  });

  // Cho phép nhấn Enter để tìm kiếm
  searchInput.addEventListener("keyup", (event) => {
    if (event.key === "Enter") {
      const query = searchInput.value.trim();
      if (query) {
        fetchWords(query);
      }
    }
  });
});

