document.addEventListener('DOMContentLoaded', () => {
    // ANTI-THEFT IMAGE PROTECTION DIRECT SYSTEM
    document.addEventListener('contextmenu', (e) => {
        if (e.target.tagName === 'IMG' || e.target.closest('.product-image-box')) {
            e.preventDefault();
        }
    });

    document.addEventListener('dragstart', (e) => {
        if (e.target.tagName === 'IMG') {
            e.preventDefault();
        }
    });
});