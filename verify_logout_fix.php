<?php
// verify_logout_fix.php
// This script tests the CSRF protection on logout.php.

// --- Configuration ---
$base_url = 'http://localhost'; // This will be simulated
$logout_url = 'logout.php'; // The script to test
$cookie_jar = tempnam(sys_get_temp_dir(), 'cookie');

// --- Helper Functions ---
function perform_curl_request($url, $post_data = null, $headers = [], $follow_redirect = false) {
    global $cookie_jar;
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HEADER, true); // Include headers in the output
    curl_setopt($ch, CURLOPT_COOKIEJAR, $cookie_jar);
    curl_setopt($ch, CURLOPT_COOKIEFILE, $cookie_jar);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, $follow_redirect);

    if ($post_data !== null) {
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query($post_data));
    }

    if (!empty($headers)) {
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
    }

    $response = curl_exec($ch);
    $error = curl_error($ch);
    curl_close($ch);

    if ($error) {
        return "cURL Error: " . $error;
    }
    return $response;
}

echo "Starting CSRF vulnerability verification for logout.php...\n\n";

// --- Test Case 1: Simulate a CSRF attack (POST without a token) ---
echo "--- Test Case 1: Simulating CSRF attack ---\n";
// We need to simulate a logged-in session for the attack to be relevant.
// We'll first establish a session by hitting a page that uses one, like logout.php itself.
perform_curl_request($logout_url);

// Now, make a POST request without a token, using the established session.
$attack_response = perform_curl_request($logout_url, ['logout' => '1']); // Invalid POST data

if (strpos($attack_response, 'CSRF token validation failed.') !== false) {
    echo "Result: PASS - The script correctly terminated with a CSRF validation error.\n";
} else {
    echo "Result: FAIL - The script did not block the request. CSRF vulnerability may still exist.\n";
    echo "Response received:\n" . $attack_response . "\n";
}
echo "-------------------------------------------\n\n";


// --- Test Case 2: Simulate a legitimate logout ---
echo "--- Test Case 2: Simulating legitimate logout ---\n";
// Step 1: Make a GET request to get a valid CSRF token from the form.
$get_response = perform_curl_request($logout_url);

// Step 2: Extract the CSRF token from the HTML response.
$doc = new DOMDocument();
@$doc->loadHTML($get_response);
$token_input = $doc->getElementsByTagName('input');
$csrf_token = '';
foreach ($token_input as $input) {
    if ($input->getAttribute('name') === '_token') {
        $csrf_token = $input->getAttribute('value');
        break;
    }
}

if (empty($csrf_token)) {
    echo "Result: FAIL - Could not find the CSRF token in the logout form.\n";
} else {
    echo "Found CSRF token: " . $csrf_token . "\n";

    // Step 3: Make a POST request with the valid token.
    $legitimate_response = perform_curl_request($logout_url, ['_token' => $csrf_token]);

    // Step 4: Check for a redirect to login.php
    if (strpos($legitimate_response, 'Location: login.php') !== false) {
        echo "Result: PASS - The script correctly processed the valid logout request and redirected.\n";
    } else {
        echo "Result: FAIL - The script did not redirect to login.php after a valid logout request.\n";
        echo "Response received:\n" . $legitimate_response . "\n";
    }
}
echo "-------------------------------------------\n";

// Clean up the cookie jar file
unlink($cookie_jar);

?>