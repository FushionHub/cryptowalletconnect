<?php
// wallet.php
// This file will be the main interface for the non-custodial wallet.
// All key management, transaction signing, and balance fetching will be handled
// on the client-side using JavaScript libraries like ethers.js or web3.js.

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Ensure the user is logged in before proceeding.
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

// Include header or any common UI elements if necessary.
// For now, we will keep it self-contained.
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>My Wallet</title>
    <script src="https://cdn.ethers.io/lib/ethers-5.2.umd.min.js" type="application/javascript"></script>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        /* Basic styling for the wallet interface */
        .wallet-container { max-width: 800px; margin: auto; }
        .hidden { display: none; }
        /* Modal styles */
        .modal-backdrop {
            transition: background-color 0.2s ease-in-out;
        }
    </style>
</head>
<body class="bg-gray-100 p-8">

    <div class="wallet-container bg-white p-6 rounded-lg shadow-md relative">
        <h1 class="text-2xl font-bold mb-4">Non-Custodial Wallet</h1>

        <!-- Wallet Setup View -->
        <div id="wallet-setup">
            <h2 class="text-xl mb-4">Welcome! Let's get started.</h2>
            <div class="flex space-x-4">
                <button id="create-wallet-btn" class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Create a New Wallet
                </button>
                <button id="import-wallet-btn" class="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
                    Import Existing Wallet
                </button>
            </div>
            <p class="text-sm text-gray-600 mt-4">
                Your private keys will be generated and stored securely on your device. We will never have access to them.
            </p>
        </div>

        <!-- Wallet Dashboard View -->
        <div id="wallet-dashboard" class="hidden">
            <div class="flex justify-between items-center mb-4">
                <h2 class="text-xl">My Wallet Dashboard</h2>
                <button id="lock-wallet-btn" class="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">Lock Wallet</button>
            </div>

            <div class="bg-gray-200 p-4 rounded mb-4">
                <p class="text-sm">My Address: <strong id="wallet-address" class="break-all"><!-- JS will populate this --></strong></p>
                <p class="text-lg">Total Balance: <strong id="wallet-balance"><!-- JS will populate this --></strong></p>
            </div>

            <div class="flex space-x-4 mb-4">
                <button id="send-btn" class="bg-green-500 text-white px-4 py-2 rounded">Send</button>
                <button id="receive-btn" class="bg-yellow-500 text-white px-4 py-2 rounded">Receive</button>
            </div>

            <div>
                <h3 class="font-bold mb-2">My Assets</h3>
                <ul id="asset-list" class="divide-y divide-gray-200">
                    <li class="py-2"><p>This is a placeholder. Asset list will be dynamically generated here.</p></li>
                </ul>
            </div>
        </div>
    </div>

    <!-- =================================================================== -->
    <!-- Modals for Wallet Interaction -->
    <!-- =================================================================== -->

    <!-- Modal Backdrop -->
    <div id="modal-backdrop" class="fixed inset-0 bg-black bg-opacity-50 hidden z-0"></div>

    <!-- Mnemonic Display Modal -->
    <div id="mnemonic-modal" class="hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-10 w-11/12 md:w-1/3">
        <h3 class="text-xl font-bold mb-4">Your Recovery Phrase</h3>
        <p class="text-red-600 mb-4">Write this down and store it securely. This is the only way to recover your wallet.</p>
        <div id="mnemonic-phrase" class="bg-gray-200 p-4 rounded mb-4 text-center font-mono break-words">
            <!-- Mnemonic phrase will be inserted here by JS -->
        </div>
        <div class="flex justify-end">
            <button id="mnemonic-confirm-btn" class="bg-blue-500 text-white px-4 py-2 rounded">I've Saved It</button>
        </div>
    </div>

    <!-- Password Modal -->
    <div id="password-modal" class="hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-10 w-11/12 md:w-1/3">
        <h3 class="text-xl font-bold mb-4" id="password-modal-title">Create Password</h3>
        <p class="mb-4" id="password-modal-prompt">Create a password to encrypt your new wallet.</p>
        <input type="password" id="password-input" class="w-full border p-2 rounded mb-4" placeholder="Enter password">
        <div class="flex justify-end space-x-2">
            <button id="password-cancel-btn" class="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
            <button id="password-confirm-btn" class="bg-blue-500 text-white px-4 py-2 rounded">Confirm</button>
        </div>
    </div>

    <!-- Import Mnemonic Modal -->
    <div id="import-modal" class="hidden fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white p-6 rounded-lg shadow-lg z-10 w-11/12 md:w-1/3">
        <h3 class="text-xl font-bold mb-4">Import Wallet</h3>
        <p class="mb-4">Enter your 12-word recovery phrase below.</p>
        <textarea id="import-mnemonic-input" class="w-full border p-2 rounded mb-4" rows="3" placeholder="word1 word2 word3 ..."></textarea>
        <div class="flex justify-end space-x-2">
            <button id="import-cancel-btn" class="bg-gray-400 text-white px-4 py-2 rounded">Cancel</button>
            <button id="import-confirm-btn" class="bg-blue-500 text-white px-4 py-2 rounded">Import</button>
        </div>
    </div>

    <script src="js/wallet-logic.js"></script>
</body>
</html>