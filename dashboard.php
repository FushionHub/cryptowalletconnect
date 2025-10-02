<?php
// Start the session to access session variables.
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Check if the user is logged in. If not, redirect to the login page.
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

// Get the logged-in user's username from the session.
$username = $_SESSION['username'] ?? 'User';

// The old database logic for fetching user_assets is removed as it's part of the deprecated custodial model.
// The new non-custodial wallet manages assets on the client-side.

include 'includes/header.php';
?>

<body class="bg-dark text-gray-100 antialiased font-sans">

    <div id="userMenu" class="hidden fixed inset-0 z-50">
        <div class="absolute inset-0 bg-black/20 backdrop-blur-sm" id="userMenuBackdrop"></div>
        <div
            class="absolute transform right-4 top-16 w-[calc(100%-2rem)] sm:w-80 md:w-96 bg-dark-medium rounded-lg shadow-lg py-1 ring-1 ring-white/10 mx-4 sm:mx-0">
            <ul class="divide-y divide-dark-lighter">
                <li>
                    <a href="/profile"
                        class="block px-4 py-2.5 text-sm text-gray-300 hover:text-primary hover:bg-dark-lighter transition-colors">
                        My Profile
                    </a>
                </li>
                <li>
                    <a href="logout.php" onclick="event.preventDefault(); document.getElementById('logout-form').submit();"
                        class="block px-4 py-2.5 text-sm text-gray-300 hover:text-primary hover:bg-dark-lighter transition-colors">
                        Logout
                    </a>
                </li>
            </ul>
            <form id="logout-form" action="logout.php" method="POST" class="hidden">
                <input type="hidden" name="_token" value="<?= htmlspecialchars($_SESSION['csrf_token'] ?? '', ENT_QUOTES, 'UTF-8') ?>" autocomplete="off">
            </form>
        </div>
    </div>

    <div class="min-h-screen bg-dark">
        <div class="bg-dark-medium border-b border-dark-lighter">
            <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <div class="flex justify-between items-center">
                    <a href="wallet.php"
                        class="hover:text-indigo-400 transition-colors font-medium" style="color: rgb(255, 120, 95)">
                        My Wallet
                    </a>
                    <div class="flex items-center space-x-4">
                        <div class="text-right">
                            <p class="text-sm font-medium">Hi, <?= htmlspecialchars($username) ?></p>
                        </div>
                        <button id="userMenuToggle" class="p-2 hover:bg-dark-lighter rounded-full transition-colors focus:outline-none">
                            <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                            </svg>
                        </button>
                    </div>
                </div>

                <div class="mt-6 text-center">
                    <h1 class="text-2xl font-bold mb-2">Welcome to Your Dashboard</h1>
                    <div class="inline-block px-3 py-1 bg-dark rounded-lg text-xs text-gray-400">
                        Your secure, non-custodial wallet is ready.
                    </div>
                </div>
            </div>
        </div>

        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div class="text-center p-8 bg-dark-medium rounded-lg">
                <h2 class="text-xl font-semibold mb-2">Manage Your Assets</h2>
                <p class="text-gray-400 mb-4">You are in full control of your keys and assets.</p>
                <a href="wallet.php" class="inline-block bg-blue-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-blue-600 transition-colors">
                    Go to My Wallet
                </a>
            </div>
        </div>
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', function() {
            const userMenu = document.getElementById('userMenu');
            const userMenuToggle = document.getElementById('userMenuToggle');
            const userMenuBackdrop = document.getElementById('userMenuBackdrop');

            const showUserMenu = () => {
                userMenu.classList.remove('hidden');
                userMenu.classList.add('flex', 'justify-end');
            };

            const hideUserMenu = () => {
                userMenu.classList.remove('flex', 'justify-end');
                userMenu.classList.add('hidden');
            };

            userMenuToggle.addEventListener('click', (e) => {
                e.stopPropagation();
                if (userMenu.classList.contains('hidden')) {
                    showUserMenu();
                } else {
                    hideUserMenu();
                }
            });

            document.addEventListener('click', (e) => {
                if (!userMenu.contains(e.target) && e.target !== userMenuToggle) {
                    hideUserMenu();
                }
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && !userMenu.classList.contains('hidden')) {
                    hideUserMenu();
                }
            });
        });

        function googleTranslateElementInit() {
            new google.translate.TranslateElement({
                pageLanguage: 'en'
            }, 'google_translate_element');
        }
    </script>
    <script src="https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit"></script>
</body>

</html>