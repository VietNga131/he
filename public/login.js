// public/login.js
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginErrorMessage = document.getElementById('login-error-message');
  
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
  
        const username = document.getElementById('login-username').value;
        const password = document.getElementById('login-password').value;
  
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });
  
            const result = await response.json();
  
            if (result.success) {
                window.location.href = result.redirect || '/search';
            } else {
                loginErrorMessage.textContent = result.message;
            }
        } catch (error) {
            loginErrorMessage.textContent = 'Có lỗi xảy ra. Vui lòng thử lại.';
        }
    });
  });