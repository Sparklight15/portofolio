/**
 * File: assets/js/main.js
 * Fungsi: Interaksi/animasi sederhana menggunakan Vanilla JS
 */

document.addEventListener('DOMContentLoaded', function () {

    // 1. Smooth scroll untuk link navbar (fallback jika CSS scroll-behavior tidak didukung)
    const navLinks = document.querySelectorAll('a[href^="#"]');
    navLinks.forEach(function (link) {
        link.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            const targetEl = document.querySelector(targetId);
            if (targetEl) {
                e.preventDefault();
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // 2. Efek fade-in saat card muncul di viewport (menggunakan Intersection Observer)
    const cards = document.querySelectorAll('.card');
    cards.forEach(function (card) {
        card.classList.add('fade-in');
    });

    const observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    cards.forEach(function (card) {
        observer.observe(card);
    });

    // 3. Efek shadow pada navbar saat halaman di-scroll
    const navbar = document.querySelector('.navbar');
    window.addEventListener('scroll', function () {
        if (window.scrollY > 10) {
            navbar.style.boxShadow = '0 2px 10px rgba(0,0,0,0.06)';
        } else {
            navbar.style.boxShadow = 'none';
        }
    });

});
