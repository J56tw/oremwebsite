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

$email = isset($input['email']) ? trim((string) $input['email']) : '';
$password = isset($input['password']) ? (string) $input['password'] : '';

if ($email === '' || $password === '') {
  echo json_encode(['ok' => false, 'message' => '請填寫電子郵件與密碼']);
  exit;
}

$usersFile = __DIR__ . '/data/users.json';
if (!file_exists($usersFile)) {
  echo json_encode(['ok' => false, 'message' => '電子郵件或密碼錯誤']);
  exit;
}

$content = file_get_contents($usersFile);
$users = json_decode($content, true);
if (!is_array($users)) {
  echo json_encode(['ok' => false, 'message' => '電子郵件或密碼錯誤']);
  exit;
}

$emailLower = mb_strtolower($email);
foreach ($users as $u) {
  if (isset($u['email']) && isset($u['password_hash']) && mb_strtolower($u['email']) === $emailLower) {
    if (password_verify($password, $u['password_hash'])) {
      echo json_encode([
        'ok' => true,
        'message' => '登入成功！',
        'user' => ['name' => $u['name'] ?? '', 'email' => $u['email']],
      ]);
      exit;
    }
    break;
  }
}

echo json_encode(['ok' => false, 'message' => '電子郵件或密碼錯誤']);
