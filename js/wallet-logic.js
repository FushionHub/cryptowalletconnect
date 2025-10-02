// js/wallet-logic.js
// This file handles all client-side wallet interactions using ethers.js.

document.addEventListener('DOMContentLoaded', () => {
    // --- Constants ---
    const supportedTokens = [
        { address: '0xdAC17F958D2ee523a2206206994597C13D831ec7', symbol: 'USDT', decimals: 6 },
        { address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48', symbol: 'USDC', decimals: 6 },
        { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', symbol: 'DAI', decimals: 18 },
        { address: '0x95aD61b0a150d79219dCF64E1E6Cc01f0B64C4cE', symbol: 'SHIB', decimals: 18 },
        { address: '0x7D1AfA7B718fb893dB30A3aBc0C4c608Ac40f80', symbol: 'MATIC', decimals: 18 }
    ];
    const erc20Abi = [
        "function balanceOf(address owner) view returns (uint256)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)"
    ];
    const provider = new ethers.providers.JsonRpcProvider('https://mainnet.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161');

    // --- UI Elements ---
    const createWalletBtn = document.getElementById('create-wallet-btn');
    const importWalletBtn = document.getElementById('import-wallet-btn');
    const lockWalletBtn = document.getElementById('lock-wallet-btn');
    const walletSetupDiv = document.getElementById('wallet-setup');
    const walletDashboardDiv = document.getElementById('wallet-dashboard');
    const walletAddressEl = document.getElementById('wallet-address');
    const walletBalanceEl = document.getElementById('wallet-balance');
    const assetListUl = document.getElementById('asset-list');

    // --- Modals ---
    const modalBackdrop = document.getElementById('modal-backdrop');
    const mnemonicModal = document.getElementById('mnemonic-modal');
    const passwordModal = document.getElementById('password-modal');
    const importModal = document.getElementById('import-modal');

    // --- Modal Controls ---
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

    // --- State ---
    let currentWallet;
    let resolvePassword;

    // --- Main Logic ---
    checkForExistingWallet();

    // --- Event Listeners ---
    createWalletBtn.addEventListener('click', handleCreateWallet);
    importWalletBtn.addEventListener('click', showImportModal);
    lockWalletBtn.addEventListener('click', lockWallet);
    modalBackdrop.addEventListener('click', () => {
        hideAllModals();
        if (resolvePassword) resolvePassword(null);
    });
    importCancelBtn.addEventListener('click', hideAllModals);
    importConfirmBtn.addEventListener('click', handleImportWallet);

    // --- Functions ---
    function checkForExistingWallet() {
        if (localStorage.getItem('encryptedWallet')) {
            showUnlockWallet();
        }
    }

    async function showUnlockWallet() {
        const password = await getPassword("Unlock Wallet", "Please enter your password to unlock your wallet.");
        if (password) {
            try {
                const encryptedJSON = localStorage.getItem('encryptedWallet');
                currentWallet = await ethers.Wallet.fromEncryptedJson(encryptedJSON, password);
                currentWallet = currentWallet.connect(provider);
                showDashboard();
            } catch (err) {
                alert("Wrong password or corrupted wallet file.");
                localStorage.removeItem('encryptedWallet');
                showSetup();
            }
        }
    }

    async function handleCreateWallet() {
        const newWallet = ethers.Wallet.createRandom();
        showMnemonicModal(newWallet.mnemonic.phrase);
        mnemonicConfirmBtn.onclick = async () => {
            hideAllModals();
            const password = await getPassword("Create Password", "Create a password to encrypt your new wallet.");
            if (password) {
                const encryptedJson = await newWallet.encrypt(password);
                localStorage.setItem('encryptedWallet', encryptedJson);
                currentWallet = newWallet.connect(provider);
                showDashboard();
            }
        };
    }

    async function handleImportWallet() {
        const mnemonic = importMnemonicInput.value.trim();
        if (!ethers.utils.isValidMnemonic(mnemonic)) {
            return alert("Invalid recovery phrase.");
        }
        const importedWallet = ethers.Wallet.fromMnemonic(mnemonic);
        hideAllModals();
        const password = await getPassword("Create Password", "Create a password to encrypt your imported wallet.");
        if (password) {
            const encryptedJson = await importedWallet.encrypt(password);
            localStorage.setItem('encryptedWallet', encryptedJson);
            currentWallet = importedWallet.connect(provider);
            showDashboard();
        }
    }

    function lockWallet() {
        currentWallet = null;
        showSetup();
    }

    async function showDashboard() {
        if (!currentWallet) return;
        walletSetupDiv.classList.add('hidden');
        walletDashboardDiv.classList.remove('hidden');
        walletAddressEl.innerText = currentWallet.address;
        try {
            const balance = await currentWallet.getBalance();
            walletBalanceEl.innerText = `${ethers.utils.formatEther(balance)} ETH`;
            updateTokenBalances(); // Fetch and display token balances
        } catch (error) {
            walletBalanceEl.innerText = "Error fetching balance";
        }
    }

    async function updateTokenBalances() {
        if (!currentWallet) return;
        assetListUl.innerHTML = '<li>Loading token balances...</li>'; // Show loading state
        let balancesFound = false;

        const balancePromises = supportedTokens.map(async (token) => {
            try {
                const tokenContract = new ethers.Contract(token.address, erc20Abi, provider);
                const balance = await tokenContract.balanceOf(currentWallet.address);
                if (balance.gt(0)) {
                    balancesFound = true;
                    const formattedBalance = ethers.utils.formatUnits(balance, token.decimals);
                    return `<li class="py-2 flex justify-between items-center"><span>${token.symbol}</span><span class="font-mono">${Number(formattedBalance).toFixed(4)}</span></li>`;
                }
                return null;
            } catch (error) {
                console.error(`Could not fetch balance for ${token.symbol}:`, error);
                return null;
            }
        });

        const results = await Promise.all(balancePromises);
        const validResults = results.filter(r => r !== null);

        if (validResults.length > 0) {
            assetListUl.innerHTML = validResults.join('');
        } else {
            assetListUl.innerHTML = '<li class="py-2 text-gray-500">No token balances found.</li>';
        }
    }

    function showSetup() {
        walletDashboardDiv.classList.add('hidden');
        walletSetupDiv.classList.remove('hidden');
        walletAddressEl.innerText = "";
        walletBalanceEl.innerText = "";
        assetListUl.innerHTML = '<li class="py-2"><p>This is a placeholder. Asset list will be dynamically generated here.</p></li>';
    }

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