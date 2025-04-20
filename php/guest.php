<?php
// Set the cookie
setcookie("auth_user", "guest", time() + (86400), "/"); 
session_start();
$_SESSION['user'] = 'guest';
header('Location: https://cenai.cse.uconn.edu/index/hr.html'); 
exit();
