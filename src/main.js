import './styles/variables.css';
import './styles/main.css';
import App from './App.js';

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
    const app = new App();
    await app.init();
});
