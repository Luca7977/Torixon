import { useState, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { sanitizeInput } from '../utils/sanitizeInput';
import { validateEmail, validatePassword } from '../utils/validateInput';
import useRateLimit from '../hooks/useRateLimit';

const supabase = createClient(process.env.REACT_APP_SUPABASE_URL, process.env.REACT_APP_SUPABASE_ANON_KEY);

const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { isLocked, incrementAttempt } = useRateLimit(5, 60000);
  const isRequesting = useRef(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    if (isLocked) {
      setError('Quá nhiều lần thử, vui lòng đợi 1 phút');
      return;
    }

    if (!navigator.onLine) {
      setError('Không có kết nối mạng');
      return;
    }

    if (isRequesting.current) return;
    isRequesting.current = true;

    const cleanEmail = sanitizeInput(email);
    const cleanPassword = sanitizeInput(password);

    if (!validateEmail(cleanEmail)) {
      setError('Email không hợp lệ');
      isRequesting.current = false;
      return;
    }
    if (!validatePassword(cleanPassword)) {
      setError('Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt');
      isRequesting.current = false;
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password: cleanPassword,
      });

      if (error) {
        incrementAttempt();
        setError(error.message.includes('too many requests') 
          ? 'Quá nhiều lần thử đăng nhập. Vui lòng đợi 1 phút.' 
          : 'Sai email hoặc mật khẩu');
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err) {
      setError('Lỗi hệ thống, vui lòng thử lại');
    } finally {
      setLoading(false);
      isRequesting.current = false;
    }
  };

  return (
    <div className="login-container">
      <h2>Đăng nhập</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email"
            required
          />
        </div>
        <div>
          <label>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            required
          />
          <p className="password-requirements">
            Mật khẩu phải có ít nhất 8 ký tự, chữ hoa, chữ thường, số và ký tự đặc biệt.
          </p>
        </div>
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={loading || isLocked}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
        </button>
      </form>
      <a href="/forgot-password">Quên mật khẩu?</a>
      <a href="/register">Đăng ký</a>
    </div>
  );
};

export default LoginForm;