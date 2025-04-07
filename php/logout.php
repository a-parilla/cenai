<?php

session_start();

// Enable error reporting for debugging
ini_set('output_buffering', 'off');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

//Include the phpCAS library
require_once '../vendor/autoload.php';

//Initialize phpCAS
phpCAS::client(SAML_VERSION_1_1, 'login.uconn.edu', 443, 'cas', 'https://cenai.cse.uconn.edu/');
phpCAS::setNoCasServerValidation();

// Clear authentication cookies
setcookie("auth_user", "", time() - 3600, "/", "cenai.cse.uconn.edu", true, false); // Clear auth_user cookie
setcookie("authenticated", "", time() - 3600, "/", "cenai.cse.uconn.edu", true, false); // Clear authenticated cookie

phpCAS::forceAuthentication();

// Perform CAS logout
try {
    phpCAS::logout([
        'url' => 'http://cenai.cse.uconn.edu/index/hr.html' 
    ]);
} catch (Exception $e) {
    echo "Logout failed: " . $e->getMessage();
}

//Destroy the session
session_destroy();
//Expire the authentication cookie
setcookie("authenticated", "", time() - 3600, "/"); // Expire the authentication cookie

exit();

?>
