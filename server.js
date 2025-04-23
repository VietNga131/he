// File: server.js
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');

const app = express();
const PORT = process.env.PORT || 3000;

// 1. Kết nối MySQL
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',             // Thay bằng user của bạn
  password: 'chitogeABVs32', // Thay bằng mật khẩu của bạn
  database: 'app'           // Tên database đã tạo
});

db.connect((err) => {
  if (err) {
    console.error('Lỗi kết nối MySQL: ', err);
    return;
  }
  console.log('Kết nối MySQL thành công!');
});

// 2. Cấu hình middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Cho phép truy cập các file tĩnh
app.use(express.static(__dirname));
app.use('/css', express.static(path.join(__dirname, 'css')));

// 3. Các route HTML cơ bản
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

app.get('/search', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'search.html'));
});

app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dictionary.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'dictionary.html'));
});
app.get('/flashcard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'flashcard.html'));
});
app.get('/jlpt.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'jlpt.html'));
});
app.get('/chatbot.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'chatbot.html'));
});

// 4. Route POST /login
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn MySQL:', err);
      return res.json({ success: false, message: 'Có lỗi xảy ra.' });
    }
    if (results.length === 0) {
      return res.json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      return res.redirect('/index.html');
    } else {
      return res.json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }
  });
});

app.post('/', (req, res) => {
  const { username, password } = req.body;
  const sql = 'SELECT * FROM users WHERE username = ?';
  db.query(sql, [username], async (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn MySQL:', err);
      return res.json({ success: false, message: 'Có lỗi xảy ra.' });
    }
    if (results.length === 0) {
      return res.json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }
    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (match) {
      return res.redirect('/index.html');
    } else {
      return res.json({ success: false, message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
    }
  });
});

// 5. Route POST /signup
app.post('/signup', (req, res) => {
  const { username, password } = req.body;
  const checkUserSql = 'SELECT * FROM users WHERE username = ?';
  db.query(checkUserSql, [username], (err, results) => {
    if (err) {
      console.error('Lỗi truy vấn MySQL:', err);
      return res.json({ success: false, message: 'Có lỗi xảy ra.' });
    }
    if (results.length > 0) {
      return res.json({ success: false, message: 'Tên đăng nhập đã tồn tại' });
    }
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Lỗi hash mật khẩu:', err);
        return res.json({ success: false, message: 'Có lỗi xảy ra.' });
      }
      const insertSql = 'INSERT INTO users (username, password) VALUES (?, ?)';
      db.query(insertSql, [username, hashedPassword], (err, result) => {
        if (err) {
          console.error('Lỗi thêm user:', err);
          return res.json({ success: false, message: 'Có lỗi xảy ra.' });
        }
        return res.redirect('/login');
      });
    });
  });
});

// =====================
// API cho flashcard
// =====================

// Thêm flashcard mới với 2 trường: front và back
app.post('/flashcard/add', (req, res) => {
  const { front, back } = req.body;
  const sql = 'INSERT INTO flashcards (front, back) VALUES (?, ?)';
  db.query(sql, [front, back], (err, result) => {
    if (err) {
      console.error('Lỗi thêm flashcard:', err);
      return res.json({ success: false, message: "Lỗi khi thêm flashcard" });
    }
    return res.json({ success: true, message: "Flashcard đã được thêm thành công" });
  });
});

// Lấy danh sách tất cả flashcards
app.get('/flashcards', (req, res) => {
  const sql = 'SELECT * FROM flashcards WHERE is_active = 1 ORDER BY id ASC';
  db.query(sql, (err, results) => {
    if (err) {
      return res.json({ success: false, message: "Lỗi khi truy vấn flashcards" });
    }
    return res.json({ success: true, flashcards: results });
  });
});

// Xử lý khi nhấn Pass: tăng số lần pass, nếu đạt 3 thì xóa flashcard
app.post('/flashcard/pass', (req, res) => {
  const { id } = req.body;
  db.query('SELECT pass_count FROM flashcards WHERE id = ?', [id], (err, results) => {
    if (err || results.length === 0) 
      return res.json({ success: false, message: "Không tìm thấy flashcard" });

    let pass_count = results[0].pass_count + 1;
    // Luôn tăng tổng lần pass
    const incTotalSql = 'UPDATE flashcards SET pass_total = pass_total + 1 WHERE id = ?';
    db.query(incTotalSql, [id]);

    if (pass_count >= 3) {
      // Ẩn khi đạt 3 lần liên tiếp
      const updateSql = 'UPDATE flashcards SET is_active = 0, pass_count = ? WHERE id = ?';
      db.query(updateSql, [pass_count, id], err2 => {
        if (err2) return res.json({ success: false, message: "Lỗi khi ẩn flashcard" });
        return res.json({ success: true, removed: true });
      });
    } else {
      const updateSql = 'UPDATE flashcards SET pass_count = ? WHERE id = ?';
      db.query(updateSql, [pass_count, id], err2 => {
        if (err2) return res.json({ success: false, message: "Lỗi khi cập nhật flashcard" });
        return res.json({ success: true, removed: false });
      });
    }
  });
});

// Xử lý khi nhấn Fail: reset pass_count về 0
app.post('/flashcard/fail', (req, res) => {
  const { id } = req.body;
  // Tăng fail_count và reset pass_count
  const updateSql = `
    UPDATE flashcards 
    SET pass_count = 0, fail_count = fail_count + 1 
    WHERE id = ?
  `;
  db.query(updateSql, [id], err => {
    if (err) return res.json({ success: false, message: "Lỗi khi cập nhật flashcard" });
    return res.json({ success: true });
  });
});

app.post('/flashcard/reset', (req, res) => {
  const sql = 'UPDATE flashcards SET pass_count = 0, fail_count = 0, pass_total = 0, is_active = 1';
  db.query(sql, (err, result) => {
    if (err) {
      return res.json({ success: false, message: "Lỗi khi reset flashcards" });
    }
    return res.json({ success: true, message: "Đã reset tất cả flashcards" });
  });
});

app.get('/flashcard/summary', (req, res) => {
  // Kiểm tra nếu tất cả các flashcards đều không còn active
  const checkActiveSql = `SELECT COUNT(*) AS inactiveCount FROM flashcards WHERE is_active = 1`;
  
  db.query(checkActiveSql, (err, result) => {
    if (err) return res.json({ success: false, message: "Lỗi truy vấn kiểm tra active" });

    // Nếu còn bất kỳ flashcard nào is_active = 1, không hiển thị bảng thông báo chúc mừng
    if (result[0].inactiveCount > 0) {
      return res.json({ success: false, message: "Chưa hoàn thành tất cả flashcards." });
    }

    // Nếu tất cả đều không active, trả về bảng thống kê
    const sql = `
      SELECT 
        front, 
        pass_total, 
        fail_count,
        ROUND(
          CASE WHEN (pass_total + fail_count) = 0 THEN 0
          ELSE pass_total / (pass_total + fail_count) * 100 END
        , 2) AS pass_rate
      FROM flashcards
      ORDER BY front ASC
    `;
    
    db.query(sql, (err, results) => {
      if (err) return res.json({ success: false, message: "Lỗi truy vấn summary" });
      return res.json({ success: true, summary: results });
    });
  });
});

app.get('/flashcard/all', (req, res) => {
  const sql = 'SELECT * FROM flashcards ORDER BY id ASC';
  db.query(sql, (err, results) => {
    if (err) return res.json({ success: false, message: "Lỗi truy vấn flashcards" });
    return res.json({ success: true, flashcards: results });
  });
});

app.post('/flashcard/delete', (req, res) => {
  const { id } = req.body;
  const sql = 'DELETE FROM flashcards WHERE id = ?';
  db.query(sql, [id], (err, result) => {
    if (err) return res.json({ success: false, message: "Lỗi khi xóa từ" });
    return res.json({ success: true });
  });
});

app.post("/flashcard/reset-pass", async (req, res) => {
  try {
    await db.query("UPDATE flashcards SET pass_count = 0");
    res.json({ success: true });
  } catch (e) {
    res.json({ success: false });
  }
});

// 8. Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});