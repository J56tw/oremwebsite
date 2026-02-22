# 登入 / 註冊網站

具深色/淺色模式切換，並以 Node.js 將註冊資料儲存於 `data/users.json`。

## 功能

- 登入、註冊（密碼以 bcrypt 儲存）
- 深色 / 淺色模式切換（偏好會存在瀏覽器 localStorage）
- 強圓角、陰影、按鈕 hover 風格

## 執行方式

**使用 Node.js 啟動**（需先安裝依賴）：

```bash
cd login-register-site
npm install
npm start
```

瀏覽器開啟：**http://localhost:8000**

## 資料儲存

- 註冊資料寫入：`data/users.json`
- 若 `data` 目錄不存在，首次註冊時會自動建立

## 檔案說明

| 檔案 | 說明 |
|------|------|
| `index.html` | 頁面與表單 |
| `styles.css` | 樣式（含深/淺色主題） |
| `script.js` | 主題切換、表單送出、Toast 訊息 |
| `server.js` | Node 伺服器（靜態檔案 + POST /login、/register） |
| `package.json` | 依賴：express、bcrypt |
| `data/users.json` | 使用者列表（由伺服器自動建立） |

專案內也保留 `login.php`、`register.php`，若已安裝 PHP 可改回用 `php -S localhost:8000` 並將前端改為呼叫 `login.php`、`register.php`。
