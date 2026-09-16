function toggleTheme() {
    const nextTheme = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = nextTheme;
    localStorage.setItem('cutmaster-theme', nextTheme);
    const themeToggle = document.querySelector('.theme-toggle');
    if (themeToggle) {
        themeToggle.setAttribute('aria-label', nextTheme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
    }
}

const themeToggle = document.querySelector('.theme-toggle');
if (themeToggle) {
    themeToggle.setAttribute('aria-label', document.documentElement.dataset.theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro');
}

if (window.lucide) {
    lucide.createIcons();
}
