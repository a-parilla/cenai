<?php
//NEW DEPENDENCIES php, composer, composer require jasig/phpcas, npm install cookie-parser

session_start();
// Enable error reporting for debugging
ini_set('output_buffering', 'off');
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include the phpCAS library
require_once '../vendor/autoload.php';

phpCAS::setLogger();
phpCAS::setVerbose(true);

// Initialize phpCAS
phpCAS::client(SAML_VERSION_1_1, 'login.uconn.edu', 443, 'cas', 'https://cenai.cse.uconn.edu/');
phpCAS::setNoCasServerValidation();
phpCAS::forceAuthentication();

// Get the authenticated user's username
$user = phpCAS::getUser();
echo "Authenticated user: " . $user . "\n";

// Set a session cookie for authentication
setcookie("auth_user", $user, time() + 3600, "/", "cenai.cse.uconn.edu", true, false);

// Redirect to homepage after successful login
header('Location: https://cenai.cse.uconn.edu/index/hr.html');
exit();
?>
