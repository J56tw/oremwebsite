const express = require('express');
const bcrypt = require('bcrypt');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8000;
const DATA_DIR = path.join(__dirname, 'data');
const USERS_FILE = path.join(DATA_DIR, 'users.json');

app.use(express.json());
app.use(express.static(__dirname));

function getUsers() {
  if (!fs.existsSync(USERS_FILE)) return [];
  const raw = fs.readFileSync(USERS_FILE, 'utf8');
  const data = JSON.parse(raw);
  return Array.isArray(data) ? data : [];
}

function saveUsers(users) {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

// 註冊
app.post('/register', (req, res) => {
  const { name = '', email = '', password = '' } = req.body;
  const nameTrim = String(name).trim();
  const emailTrim = String(email).trim();
  const pwd = String(password);

  if (!nameTrim || !emailTrim || !pwd) {
    return res.json({ ok: false, message: '請填寫名稱、電子郵件與密碼' });
  }
  if (pwd.length < 8) {
    return res.json({ ok: false, message: '密碼請至少 8 個字元' });
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(emailTrim)) {
    return res.json({ ok: false, message: '請輸入有效的電子郵件' });
  }

  const users = getUsers();
  const emailLower = emailTrim.toLowerCase();
  if (users.some(u => (u.email || '').toLowerCase() === emailLower)) {
    return res.json({ ok: false, message: '此電子郵件已被註冊' });
  }

  const hash = bcrypt.hashSync(pwd, 10);
  users.push({
    name: nameTrim,
    email: emailLower,
    password_hash: hash,
    created_at: new Date().toISOString().slice(0, 19).replace('T', ' '),
  });
  saveUsers(users);
  res.json({ ok: true, message: '註冊成功！請使用新帳號登入。' });
});

// 登入
app.post('/login', (req, res) => {
  const { email = '', password = '' } = req.body;
  const emailTrim = String(email).trim();
  const pwd = String(password);

  if (!emailTrim || !pwd) {
    return res.json({ ok: false, message: '請填寫電子郵件與密碼' });
  }

  const users = getUsers();
  const emailLower = emailTrim.toLowerCase();
  const user = users.find(u => (u.email || '').toLowerCase() === emailLower);

  if (!user || !user.password_hash) {
    return res.json({ ok: false, message: '電子郵件或密碼錯誤' });
  }
  if (!bcrypt.compareSync(pwd, user.password_hash)) {
    return res.json({ ok: false, message: '電子郵件或密碼錯誤' });
  }

  res.json({
    ok: true,
    message: '登入成功！',
    user: { name: user.name || '', email: user.email },
  });
});

app.listen(PORT, () => {
  console.log('伺服器已啟動： http://localhost:' + PORT);
});
