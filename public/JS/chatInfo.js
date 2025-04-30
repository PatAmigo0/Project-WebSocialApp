const panel = document.getElementById('panel');
const toggleButton = document.getElementById('toggle-button');
const closeButton = document.getElementById('close-button');

toggleButton.addEventListener('click', () => {
    panel.style.right = panel.style.right === '0px' ? '-300px' : '0px';
});

closeButton.addEventListener('click', () => {
    if (window.matchMedia('(max-width: 1000px)').matches) {
        panel.style.right = '-1000px';
    } else {
        panel.style.right = '-1000px';
    }
});