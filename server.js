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

// Cho phép truy cập các file tĩnh
app.use(express.static(__dirname));

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

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/dictionary.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'dictionary.html'));
});
app.get('/flashcard.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'flashcard.html'));
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
  const sql = 'SELECT * FROM flashcards ORDER BY id ASC';
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
  const selectSql = 'SELECT pass_count FROM flashcards WHERE id = ?';
  db.query(selectSql, [id], (err, results) => {
    if (err || results.length === 0) {
      return res.json({ success: false, message: "Không tìm thấy flashcard" });
    }
    let pass_count = results[0].pass_count + 1;
    if (pass_count >= 3) {
      const deleteSql = 'DELETE FROM flashcards WHERE id = ?';
      db.query(deleteSql, [id], (err, result) => {
        if (err) {
          return res.json({ success: false, message: "Lỗi khi xóa flashcard" });
        }
        return res.json({ success: true, removed: true });
      });
    } else {
      const updateSql = 'UPDATE flashcards SET pass_count = ? WHERE id = ?';
      db.query(updateSql, [pass_count, id], (err, result) => {
        if (err) {
          return res.json({ success: false, message: "Lỗi khi cập nhật flashcard" });
        }
        return res.json({ success: true, removed: false });
      });
    }
  });
});

// Xử lý khi nhấn Fail: reset pass_count về 0
app.post('/flashcard/fail', (req, res) => {
  const { id } = req.body;
  const updateSql = 'UPDATE flashcards SET pass_count = 0 WHERE id = ?';
  db.query(updateSql, [id], (err, result) => {
    if (err) {
      return res.json({ success: false, message: "Lỗi khi cập nhật flashcard" });
    }
    return res.json({ success: true });
  });
});

// 8. Khởi chạy server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
