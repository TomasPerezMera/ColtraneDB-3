document.addEventListener('DOMContentLoaded', () => {
    const hamburger = document.getElementById('hamburger-btn');
    const menu = document.getElementById('navbar-menu');

    // Creamos overlay oscuro para el menú;
    const overlay = document.createElement('div');
    overlay.className = 'navbar-overlay';
    document.body.appendChild(overlay);

    // Toggle menú;
    function toggleMenu() {
        hamburger.classList.toggle('active');
        menu.classList.toggle('active');
        overlay.classList.toggle('active');

        // Prevenimos scroll cuando el menú está abierto;
        document.body.style.overflow = menu.classList.contains('active') ? 'hidden' : '';
    }

    // Escuchamos clicks al hamburger menu;
    hamburger.addEventListener('click', toggleMenu);

    // Hacer click en overlay cierra el menú;
    overlay.addEventListener('click', toggleMenu);

    // Click en cualquier link del menú lo cierra;
    menu.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            if (menu.classList.contains('active')) {
                toggleMenu();
            }
        });
    });

    // ESC key cierra el menú;
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && menu.classList.contains('active')) {
            toggleMenu();
        }
    });
});