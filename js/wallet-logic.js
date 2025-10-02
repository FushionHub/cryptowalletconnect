// js/wallet-logic.js
// This file handles all client-side wallet interactions using ethers.js.

document.addEventListener('DOMContentLoaded', () => {
    const createWalletBtn = document.getElementById('create-wallet-btn');
    const walletSetupDiv = document.getElementById('wallet-setup');
    const walletDashboardDiv = document.getElementById('wallet-dashboard');
    const walletAddressEl = document.getElementById('wallet-address');
    const walletBalanceEl = document.getElementById('wallet-balance');

    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'); // Using a public Infura endpoint
    let currentWallet;

    // Check if a wallet is already stored in localStorage
    const encryptedWalletJSON = localStorage.getItem('encryptedWallet');
    if (encryptedWalletJSON) {
        // If a wallet exists, prompt for password to unlock
        const password = prompt('Please enter your password to unlock your wallet:');
        if (password) {
            ethers.Wallet.fromEncryptedJson(encryptedWalletJSON, password)
                .then(wallet => {
                    currentWallet = wallet.connect(provider);
                    console.log("Wallet unlocked successfully.");
                    showDashboard();
                })
                .catch(err => {
                    console.error("Failed to unlock wallet:", err);
                    alert("Wrong password or corrupted wallet file.");
                    localStorage.removeItem('encryptedWallet'); // Clear corrupted wallet
                });
        }
    }

    // Event listener for creating a new wallet
    createWalletBtn.addEventListener('click', async () => {
        try {
            // 1. Generate a new random wallet
            const newWallet = ethers.Wallet.createRandom();
            currentWallet = newWallet.connect(provider);

            // 2. Display the mnemonic phrase and warn the user
            alert("IMPORTANT: Please write down this recovery phrase and store it securely. This is the only way to recover your wallet.");
            prompt("Your Recovery Phrase (Mnemonic):", newWallet.mnemonic.phrase);

            const userConfirmation = confirm("Have you securely stored your recovery phrase?");
            if (!userConfirmation) {
                alert("Please store your recovery phrase before proceeding.");
                return;
            }

            // 3. Get a password to encrypt the wallet
            const password = prompt("Create a password to encrypt your new wallet. This password will be required to unlock your wallet in the future.");
            if (!password) {
                alert("Password is required to secure your wallet.");
                return;
            }

            // 4. Encrypt the wallet and store it in localStorage
            const encryptedJson = await newWallet.encrypt(password);
            localStorage.setItem('encryptedWallet', encryptedJson);

            console.log("Wallet created and encrypted successfully.");

            // 5. Show the dashboard
            showDashboard();

        } catch (error) {
            console.error("Error creating wallet:", error);
            alert("An error occurred while creating the wallet. Please try again.");
        }
    });

    async function showDashboard() {
        if (!currentWallet) return;

        // Update UI
        walletSetupDiv.classList.add('hidden');
        walletDashboardDiv.classList.remove('hidden');
        walletAddressEl.innerText = currentWallet.address;

        // Fetch and display balance
        try {
            const balance = await currentWallet.getBalance();
            walletBalanceEl.innerText = `${ethers.utils.formatEther(balance)} ETH`;
        } catch (error) {
            console.error("Could not fetch balance:", error);
            walletBalanceEl.innerText = "Error fetching balance";
        }
    }
});