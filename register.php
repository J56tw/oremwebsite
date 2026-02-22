<?php
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['ok' => false, 'message' => '僅接受 POST']);
  exit;
}

$raw = file_get_contents('php://input');
$input = json_decode($raw, true) ?: [];

$name = isset($input['name']) ? trim((string) $input['name']) : '';
$email = isset($input['email']) ? trim((string) $input['email']) : '';
$password = isset($input['password']) ? (string) $input['password'] : '';

if ($name === '' || $email === '' || $password === '') {
  echo json_encode(['ok' => false, 'message' => '請填寫名稱、電子郵件與密碼']);
  exit;
}

if (strlen($password) < 8) {
  echo json_encode(['ok' => false, 'message' => '密碼請至少 8 個字元']);
  exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  echo json_encode(['ok' => false, 'message' => '請輸入有效的電子郵件']);
  exit;
}

$dataDir = __DIR__ . '/data';
if (!is_dir($dataDir)) {
  if (!@mkdir($dataDir, 0755, true)) {
    echo json_encode(['ok' => false, 'message' => '無法建立資料目錄']);
    exit;
  }
}

$usersFile = $dataDir . '/users.json';
$users = [];
if (file_exists($usersFile)) {
  $content = file_get_contents($usersFile);
  $users = json_decode($content, true);
  if (!is_array($users)) {
    $users = [];
  }
}

$emailLower = mb_strtolower($email);
foreach ($users as $u) {
  if (isset($u['email']) && mb_strtolower($u['email']) === $emailLower) {
    echo json_encode(['ok' => false, 'message' => '此電子郵件已被註冊']);
    exit;
  }
}

$hash = password_hash($password, PASSWORD_DEFAULT);
$users[] = [
  'name' => $name,
  'email' => $emailLower,
  'password_hash' => $hash,
  'created_at' => date('Y-m-d H:i:s'),
];

$json = json_encode($users, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
if ($json === false || file_put_contents($usersFile, $json) === false) {
  echo json_encode(['ok' => false, 'message' => '寫入失敗，請檢查資料目錄權限']);
  exit;
}

echo json_encode(['ok' => true, 'message' => '註冊成功！請使用新帳號登入。']);
