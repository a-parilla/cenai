<?php
// Ignore for now
// Allow cross-origin requests from localhost:3000
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type, Authorization");

session_start(); // Start the session

// Import the phpCAS Library
require_once '../vendor/autoload.php';

// Initialize phpCAS
phpCAS::client(SAML_VERSION_1_1, 'login.uconn.edu', 443, 'cas', '//cenai.cse.uconn.edu');
phpCAS::setNoCasServerValidation(); 

// Force the user to authenticate (will redirect if not logged in)
phpCAS::forceAuthentication();

// Get the NetID after authentication
$netid = phpCAS::getUser();

// If no NetID, send an error response
if (!$netid) {
    header("HTTP/1.1 401 Unauthorized");
    echo json_encode(["error" => "NetID not found"]);
    exit();
}

// Save the NetID in a cookie for future access
setcookie("auth_user", $netid, time() + 3600, "/", "cenai.cse.uconn.edu", false, true); // Expires in 1 hour

// Return the netid as a JSON response
header('Content-Type: application/json');
echo json_encode(["netid" => $netid]);
?>
