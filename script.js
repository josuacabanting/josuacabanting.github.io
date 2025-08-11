// Placeholder JavaScript for future enhancements
console.log("Portfolio Loaded");

const tabButtons = document.querySelectorAll('.tab-button');
const tabPanels = document.querySelectorAll('.tab-panel');

tabButtons.forEach((button, index) => {
  button.addEventListener('click', () => {
    // Remove active classes
    tabButtons.forEach(btn => btn.classList.remove('active'));
    tabPanels.forEach(panel => panel.classList.remove('active'));

    // Add active to clicked
    button.classList.add('active');
    tabPanels[index].classList.add('active');
  });
});






