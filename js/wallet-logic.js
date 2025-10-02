// js/wallet-logic.js
// This file handles all client-side wallet interactions using ethers.js.

document.addEventListener('DOMContentLoaded', () => {
    // UI Elements
    const createWalletBtn = document.getElementById('create-wallet-btn');
    const importWalletBtn = document.getElementById('import-wallet-btn');
    const lockWalletBtn = document.getElementById('lock-wallet-btn');
    const walletSetupDiv = document.getElementById('wallet-setup');
    const walletDashboardDiv = document.getElementById('wallet-dashboard');
    const walletAddressEl = document.getElementById('wallet-address');
    const walletBalanceEl = document.getElementById('wallet-balance');

    // Modals
    const modalBackdrop = document.getElementById('modal-backdrop');
    const mnemonicModal = document.getElementById('mnemonic-modal');
    const passwordModal = document.getElementById('password-modal');
    const importModal = document.getElementById('import-modal');

    // Modal Controls
    const mnemonicPhraseEl = document.getElementById('mnemonic-phrase');
    const mnemonicConfirmBtn = document.getElementById('mnemonic-confirm-btn');
    const passwordModalTitle = document.getElementById('password-modal-title');
    const passwordModalPrompt = document.getElementById('password-modal-prompt');
    const passwordInput = document.getElementById('password-input');
    const passwordCancelBtn = document.getElementById('password-cancel-btn');
    const passwordConfirmBtn = document.getElementById('password-confirm-btn');
    const importMnemonicInput = document.getElementById('import-mnemonic-input');
    const importCancelBtn = document.getElementById('import-cancel-btn');
    const importConfirmBtn = document.getElementById('import-confirm-btn');

    // Ethers.js provider
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161'); // Using a public Infura endpoint
    let currentWallet;
    let resolvePassword; // To handle password promise

    // --- Main Logic ---

    // Check for an existing wallet on page load
    checkForExistingWallet();

    // --- Event Listeners ---

    createWalletBtn.addEventListener('click', handleCreateWallet);
    importWalletBtn.addEventListener('click', showImportModal);
    lockWalletBtn.addEventListener('click', lockWallet);

    // Close modals when backdrop is clicked or with cancel buttons
    modalBackdrop.addEventListener('click', () => {
        hideAllModals();
        if (resolvePassword) resolvePassword(null); // Cancel password entry
    });
    importCancelBtn.addEventListener('click', hideAllModals);
    importConfirmBtn.addEventListener('click', handleImportWallet);


    // --- Functions ---

    function checkForExistingWallet() {
        const encryptedWalletJSON = localStorage.getItem('encryptedWallet');
        if (encryptedWalletJSON) {
            showUnlockWallet();
        }
    }

    async function showUnlockWallet() {
        const title = "Unlock Wallet";
        const prompt = "Please enter your password to unlock your wallet.";
        const password = await getPassword(title, prompt);

        if (password) {
            try {
                const encryptedJSON = localStorage.getItem('encryptedWallet');
                currentWallet = await ethers.Wallet.fromEncryptedJson(encryptedJSON, password);
                currentWallet = currentWallet.connect(provider);
                console.log("Wallet unlocked successfully.");
                showDashboard();
            } catch (err) {
                console.error("Failed to unlock wallet:", err);
                alert("Wrong password or corrupted wallet file.");
                localStorage.removeItem('encryptedWallet'); // Clear corrupted wallet
                showSetup();
            }
        }
    }

    async function handleCreateWallet() {
        try {
            const newWallet = ethers.Wallet.createRandom();
            showMnemonicModal(newWallet.mnemonic.phrase);
            mnemonicConfirmBtn.onclick = async () => {
                hideAllModals();
                const password = await getPassword("Create Password", "Create a password to encrypt your new wallet.");
                if (password) {
                    const encryptedJson = await newWallet.encrypt(password);
                    localStorage.setItem('encryptedWallet', encryptedJson);
                    currentWallet = newWallet.connect(provider);
                    console.log("Wallet created and encrypted successfully.");
                    showDashboard();
                }
            };
        } catch (error) {
            console.error("Error creating wallet:", error);
            alert("An error occurred while creating the wallet. Please try again.");
        }
    }

    async function handleImportWallet() {
        const mnemonic = importMnemonicInput.value.trim();
        if (!ethers.utils.isValidMnemonic(mnemonic)) {
            alert("Invalid recovery phrase. Please check your words and try again.");
            return;
        }

        const importedWallet = ethers.Wallet.fromMnemonic(mnemonic);
        hideAllModals();

        const password = await getPassword("Create Password", "Create a password to encrypt your imported wallet.");
        if (password) {
            const encryptedJson = await importedWallet.encrypt(password);
            localStorage.setItem('encryptedWallet', encryptedJson);
            currentWallet = importedWallet.connect(provider);
            console.log("Wallet imported and encrypted successfully.");
            showDashboard();
        }
    }

    function lockWallet() {
        currentWallet = null;
        showSetup();
        console.log("Wallet locked.");
    }

    async function showDashboard() {
        if (!currentWallet) return;

        walletSetupDiv.classList.add('hidden');
        walletDashboardDiv.classList.remove('hidden');
        walletAddressEl.innerText = currentWallet.address;

        try {
            const balance = await currentWallet.getBalance();
            walletBalanceEl.innerText = `${ethers.utils.formatEther(balance)} ETH`;
        } catch (error) {
            console.error("Could not fetch balance:", error);
            walletBalanceEl.innerText = "Error fetching balance";
        }
    }

    function showSetup() {
        walletDashboardDiv.classList.add('hidden');
        walletSetupDiv.classList.remove('hidden');
        walletAddressEl.innerText = "";
        walletBalanceEl.innerText = "";
    }

    // --- Modal Management ---

    function showImportModal() {
        importMnemonicInput.value = "";
        modalBackdrop.classList.remove('hidden');
        importModal.classList.remove('hidden');
    }

    function showMnemonicModal(phrase) {
        mnemonicPhraseEl.innerText = phrase;
        modalBackdrop.classList.remove('hidden');
        mnemonicModal.classList.remove('hidden');
    }

    function getPassword(title, prompt) {
        return new Promise(resolve => {
            resolvePassword = resolve;
            passwordModalTitle.innerText = title;
            passwordModalPrompt.innerText = prompt;
            passwordInput.value = "";

            modalBackdrop.classList.remove('hidden');
            passwordModal.classList.remove('hidden');
            passwordInput.focus();

            passwordConfirmBtn.onclick = () => {
                hideAllModals();
                resolve(passwordInput.value);
            };

            passwordCancelBtn.onclick = () => {
                hideAllModals();
                resolve(null);
            };
        });
    }

    function hideAllModals() {
        modalBackdrop.classList.add('hidden');
        mnemonicModal.classList.add('hidden');
        passwordModal.classList.add('hidden');
        importModal.classList.add('hidden');
    }
});