<?php
include "db.php"; // koneksi ke database

$email = $_POST['email'];
$password = $_POST['password'];

// cari user berdasarkan email
$sql = "SELECT * FROM users WHERE email='$email'";
$result = mysqli_query($conn, $sql);

if (mysqli_num_rows($result) > 0) {
    $row = mysqli_fetch_assoc($result);

    // cek apakah password cocok
    if (password_verify($password, $row['password'])) {
        echo "<script>alert('Login berhasil!'); window.location='welcome.html';</script>";
    } else {
        echo "<script>alert('Password salah!'); window.history.back();</script>";
    }
} else {
    echo "<script>alert('Email tidak ditemukan!'); window.history.back();</script>";
}
?>
