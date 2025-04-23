# CNPM
# cấu trúc thư mục
D: ungdung
├── package.json
├── server.js
└── public
    ├── login.html
    ├── login.js
    └── styles.css
# mẫu csdl
CREATE DATABASE app;
USE app;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL
);

#mẫu csdl flash card
CREATE TABLE flashcards (
    id INT AUTO_INCREMENT PRIMARY KEY,
    front VARCHAR(255) NOT NULL,  -- Ví dụ: "青い"
    back VARCHAR(255) NOT NULL,   -- Ví dụ: "màu xanh"
    pass_count INT DEFAULT 0      -- Số lần pass liên tục
);

ALTER TABLE flashcards ADD COLUMN is_active TINYINT(1) DEFAULT 1;
ALTER TABLE flashcards ADD COLUMN sort_order INT DEFAULT 0;
ALTER TABLE flashcards ADD COLUMN fail_count INT DEFAULT 0;

