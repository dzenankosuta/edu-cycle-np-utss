import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { LogIn, Mail, Lock, AlertCircle } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import './styles/admin.css';

export function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError, user, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user && isAdmin) {
      navigate('/admin', { replace: true });
    }
  }, [user, isAdmin, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();

    if (!email.trim() || !password.trim()) {
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate('/admin', { replace: true });
    }
  };

  return (
    <div className="admin-login-page">
      <motion.div
        className="admin-login-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="admin-login-header">
          <h1>Admin Panel</h1>
          <p>Prijavite se da biste pristupili admin panelu</p>
        </div>

        <form onSubmit={handleSubmit} className="admin-login-form">
          {error && (
            <motion.div
              className="admin-login-error"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <AlertCircle size={20} />
              <span>{error}</span>
            </motion.div>
          )}

          <div className="admin-form-group">
            <label htmlFor="email">Email</label>
            <div className="admin-input-wrapper">
              <Mail size={20} />
              <input
                type="email"
                id="email"
                className="admin-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@skola.rs"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <div className="admin-form-group">
            <label htmlFor="password">Lozinka</label>
            <div className="admin-input-wrapper">
              <Lock size={20} />
              <input
                type="password"
                id="password"
                className="admin-input"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Unesite lozinku"
                disabled={isLoading}
                required
              />
            </div>
          </div>

          <button
            type="submit"
            className="admin-btn admin-btn--primary admin-btn--full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <div className="admin-btn-loader"></div>
                <span>Prijavljivanje...</span>
              </>
            ) : (
              <>
                <LogIn size={20} />
                <span>Prijavi se</span>
              </>
            )}
          </button>
        </form>

        <div className="admin-login-footer">
          <a href="/">← Nazad na glavni ekran</a>
        </div>
      </motion.div>
    </div>
  );
}
