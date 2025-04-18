// public/signup.js
document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.getElementById('signupForm');
    const signupErrorMessage = document.getElementById('signup-error-message');
    const passwordInput = document.getElementById('signup-password');
    const passwordWarning = document.querySelector('.password-warning');

    // 🔹 Show/Hide Password Warning (Blur Effect)
    passwordInput.addEventListener('input', () => {
        if (passwordInput.value.length < 6) {
            passwordWarning.style.visibility = 'visible';
        } else {
            passwordWarning.style.visibility = 'hidden';
        }
    });

    // 🔹 Handle Signup Form Submission
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        const username = document.getElementById('signup-username').value;
        const password = passwordInput.value;

        if (password.length < 6) {
            signupErrorMessage.textContent = 'Mật khẩu phải có ít nhất 6 ký tự!';
            return;
        }

        try {
            const response = await fetch('/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (result.success) {
                alert('Đăng ký thành công! Bây giờ bạn có thể đăng nhập.');
                window.location.href = 'login.html';
            } else {
                signupErrorMessage.textContent = result.message;
            }
        } catch (error) {
            signupErrorMessage.textContent = 'Có lỗi xảy ra. Vui lòng thử lại.';
        }
    });
});
