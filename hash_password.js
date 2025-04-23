const bcrypt = require('bcrypt');
const mysql = require('mysql2');

// 1. Kết nối với database
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',  // Thay bằng user của bạn
  password: 'chitogeABVs32',  // Thay bằng mật khẩu của bạn
  database: 'app'
});

db.connect(async (err) => {
  if (err) {
    console.error('Lỗi kết nối MySQL:', err);
    return;
  }
  console.log('Kết nối MySQL thành công!');

  // 2. Nhập thông tin user cần thêm
  const username = 'admin';
  const password = '123456';

  // 3. Hash mật khẩu trước khi lưu
  const hashedPassword = await bcrypt.hash(password, 10);

  // 4. Chèn user vào database
  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(sql, [username, hashedPassword], (err, result) => {
    if (err) {
      console.error('Lỗi thêm user:', err);
    } else {
      console.log('Thêm user thành công!');
    }
    db.end();  // Đóng kết nối database
  });
});
