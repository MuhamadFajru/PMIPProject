<?php
include "db.php"; // menghubungkan ke database

// ambil data dari form signup
$fullname = $_POST['fullname'];
$email = $_POST['email'];
$password = $_POST['password'];
$confirm = $_POST['confirm_password'];

// cek apakah password dan konfirmasi sama
if ($password !== $confirm) {
    echo "<script>alert('Konfirmasi password tidak cocok!'); window.history.back();</script>";
    exit;
}

// enkripsi password biar aman
$hashed = password_hash($password, PASSWORD_DEFAULT);

// simpan data ke tabel users
$sql = "INSERT INTO users (fullname, email, password) VALUES ('$fullname', '$email', '$hashed')";

if (mysqli_query($conn, $sql)) {
    echo "<script>alert('Pendaftaran berhasil! Silakan login.'); window.location='login.html';</script>";
} else {
    echo "<script>alert('Pendaftaran gagal: ' + mysqli_error($conn)); window.history.back();</script>";
}
?>
