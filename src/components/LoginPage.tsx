import React, { useRef, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { getUserAccess, saveUserProfile } from '../lib/api';
import { getFirebaseAuth, isFirebaseConfigured } from '../lib/firebase';

const adminEmail = (import.meta.env.VITE_ADMIN_EMAIL || 'avonhousingadmin2026@gmail.com').toLowerCase();

const getAuthErrorMessage = (error: unknown) => {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';

  if (code.includes('auth/invalid-credential') || code.includes('auth/wrong-password') || code.includes('auth/user-not-found')) {
    return 'Invalid email or password.';
  }

  if (code.includes('auth/invalid-email')) {
    return 'Please enter a valid email address.';
  }

  if (code.includes('auth/email-already-in-use')) {
    return 'An account already exists with this email. Please login instead.';
  }

  if (code.includes('auth/weak-password')) {
    return 'Password should be at least 6 characters.';
  }

  if (code.includes('auth/too-many-requests')) {
    return 'Too many attempts. Please wait a little and try again.';
  }

  if (code.includes('auth/invalid-phone-number')) {
    return 'Enter a valid mobile number.';
  }

  if (code.includes('auth/network-request-failed')) {
    return 'Network error. Please check your connection and try again.';
  }

  if (code.includes('auth/popup-closed-by-user')) {
    return 'Google sign in was closed before it finished.';
  }

  if (error instanceof Error && error.message === 'Firebase is not configured yet.') {
    return 'Firebase is not configured yet. Add your Firebase environment variables to enable login.';
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'Something went wrong. Please try again.';
};

const navigateTo = (path: string) => {
  window.history.pushState({}, '', path);
  window.dispatchEvent(new PopStateEvent('popstate'));
  window.scrollTo({ top: 0, behavior: 'auto' });
};

const resolvePostLoginPath = async (userEmail: string | null) => {
  const normalizedEmail = (userEmail || '').toLowerCase().trim();
  if (!normalizedEmail) {
    return '/';
  }

  if (normalizedEmail === adminEmail) {
    return '/admin';
  }

  try {
    const access = await getUserAccess(normalizedEmail);
    return access.isAdmin ? '/admin' : '/';
  } catch {
    return '/';
  }
};

const normalizeMobileNumber = (value: string) => {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (trimmed.startsWith('+')) {
    return trimmed.replace(/[^\d+]/g, '');
  }

  const digits = trimmed.replace(/\D/g, '');

  if (digits.length === 10) {
    return `+91${digits}`;
  }

  if (digits.length === 12 && digits.startsWith('91')) {
    return `+${digits}`;
  }

  return digits ? `+${digits}` : '';
};

const syncUserProfile = async (
  user: Parameters<typeof saveUserProfile>[0],
  profile?: Parameters<typeof saveUserProfile>[1],
) => {
  try {
    await saveUserProfile(user, profile);
  } catch (error) {
    console.warn('User profile sync failed after authentication.', error);
  }
};

const LoginPage: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [loadingAction, setLoadingAction] = useState<'email' | 'google' | 'reset' | null>(null);
  const [adminIntent, setAdminIntent] = useState(false);
  const logoTapCount = useRef(0);
  const logoTapTimer = useRef<number | null>(null);

  const isLoading = loadingAction !== null;

  const resetSignupFields = () => {
    setFullName('');
    setMobileNumber('');
    setPassword('');
    setConfirmPassword('');
  };

  const resetMessages = () => {
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleLogoTap = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    logoTapCount.current += 1;

    if (logoTapTimer.current) {
      window.clearTimeout(logoTapTimer.current);
    }

    if (logoTapCount.current >= 5) {
      logoTapCount.current = 0;
      setAdminIntent(true);
      setAuthMode('login');
      resetSignupFields();
      resetMessages();
      setSuccessMessage('Admin sign in unlocked.');
      return;
    }

    logoTapTimer.current = window.setTimeout(() => {
      logoTapCount.current = 0;
      logoTapTimer.current = null;
    }, 1400);
  };

  const exitAdminMode = () => {
    setAdminIntent(false);
    resetMessages();
  };

  const handleEmailLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    resetMessages();
    setLoadingAction('email');

    try {
      const auth = getFirebaseAuth();
      let credential;

      if (authMode === 'signup') {
        const normalizedMobileNumber = normalizeMobileNumber(mobileNumber);

        if (!fullName.trim()) {
          throw new Error('Enter your full name.');
        }

        if (!normalizedMobileNumber) {
          throw new Error('Enter a valid mobile number, for example +919876543210.');
        }

        if (password.length < 6) {
          throw new Error('Password should be at least 6 characters.');
        }

        if (password !== confirmPassword) {
          throw new Error('Password and confirm password must match.');
        }

        credential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(credential.user, { displayName: fullName.trim() });
        await syncUserProfile(credential.user, {
          fullName: fullName.trim(),
          mobileNumber: normalizedMobileNumber,
        });
        resetSignupFields();
      } else {
        credential = await signInWithEmailAndPassword(auth, email, password);
        if (adminIntent) {
          const emailAddress = (credential.user.email || '').toLowerCase();
          const access = emailAddress === adminEmail ? { isAdmin: true } : await getUserAccess(emailAddress);

          if (!access.isAdmin) {
            await signOut(auth);
            throw new Error('This account does not have admin access.');
          }
        }
        await syncUserProfile(credential.user);
      }

      const nextPath = await resolvePostLoginPath(credential.user.email);
      navigateTo(nextPath);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleGoogleLogin = async () => {
    resetMessages();
    setLoadingAction('google');

    try {
      const auth = getFirebaseAuth();
      const credential = await signInWithPopup(auth, new GoogleAuthProvider());
      if (adminIntent) {
        const emailAddress = (credential.user.email || '').toLowerCase();
        const access = emailAddress === adminEmail ? { isAdmin: true } : await getUserAccess(emailAddress);

        if (!access.isAdmin) {
          await signOut(auth);
          throw new Error('This account does not have admin access.');
        }
      }
      await syncUserProfile(credential.user);
      const nextPath = await resolvePostLoginPath(credential.user.email);
      navigateTo(nextPath);
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleForgotPassword = async () => {
    resetMessages();

    if (!email) {
      setErrorMessage('Enter your email address first.');
      return;
    }

    setLoadingAction('reset');

    try {
      const auth = getFirebaseAuth();
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage('Password reset link sent to your email.');
    } catch (error) {
      setErrorMessage(getAuthErrorMessage(error));
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <section className="login-page">
      <div className="container login-container">
        <div className="login-panel">
          <header className="login-branding">
            <a href="/" className="nav-logo" onClick={handleLogoTap}>
              Avon<span>.</span>
            </a>
            <p>Find your perfect home in the Western Suburbs</p>
          </header>

          <div className="login-copy">
            <h1>
              {adminIntent
                ? 'Admin Access'
                : authMode === 'signup'
                  ? 'Create Account'
                  : 'Welcome Back'}
            </h1>
            <p>
              {adminIntent
                ? 'Login with your administrator account to manage the platform.'
                : authMode === 'signup'
                  ? 'Sign up to continue'
                  : 'Login to continue'}
            </p>
          </div>

          {!isFirebaseConfigured && (
            <div className="login-message error" role="alert">
              Firebase is not configured yet.
            </div>
          )}

          {errorMessage && (
            <div className="login-message error" role="alert">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="login-message success" role="status">
              {successMessage}
            </div>
          )}

          <form className="login-form" onSubmit={handleEmailLogin}>
            {!adminIntent && authMode === 'signup' && (
              <label>
                Full Name
                <input
                  type="text"
                  value={fullName}
                  onChange={event => setFullName(event.target.value)}
                  autoComplete="name"
                  required={authMode === 'signup'}
                />
              </label>
            )}

            {!adminIntent && authMode === 'signup' && (
              <>
                <label>
                  Email
                  <input
                    type="email"
                    value={email}
                    onChange={event => setEmail(event.target.value)}
                    autoComplete="email"
                    required
                  />
                </label>

                <label>
                  Mobile Number
                  <div className="login-phone-field">
                    <span className="login-phone-code" aria-hidden="true">+91</span>
                    <input
                      type="tel"
                      value={mobileNumber}
                      onChange={event => setMobileNumber(event.target.value.replace(/\D/g, '').slice(0, 10))}
                      autoComplete="tel-national"
                      inputMode="numeric"
                      pattern="[0-9]{10}"
                      required={authMode === 'signup'}
                    />
                  </div>
                </label>
              </>
            )}

            {authMode === 'login' && (
              <label>
                Email
                <input
                  type="email"
                  value={email}
                  onChange={event => setEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
            )}

            <label>
              Password
              <span className="password-field">
                <button
                  type="button"
                  className="password-toggle"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword(current => !current)}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    {showPassword ? (
                      <>
                        <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12a18.45 18.45 0 0 1 5.06-6.94" />
                        <path d="M9.9 4.24A10.8 10.8 0 0 1 12 4c5 0 9.27 3.11 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
                        <path d="M1 1l22 22" />
                      </>
                    ) : (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    )}
                  </svg>
                </button>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={event => setPassword(event.target.value)}
                  autoComplete={authMode === 'signup' ? 'new-password' : 'current-password'}
                  required
                />
              </span>
            </label>

            {!adminIntent && authMode === 'signup' && (
              <label>
                Confirm Password
                <span className="password-field">
                  <button
                    type="button"
                    className="password-toggle"
                    aria-label={showConfirmPassword ? 'Hide confirm password' : 'Show confirm password'}
                    onClick={() => setShowConfirmPassword(current => !current)}
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      {showConfirmPassword ? (
                        <>
                          <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20C7 20 2.73 16.89 1 12a18.45 18.45 0 0 1 5.06-6.94" />
                          <path d="M9.9 4.24A10.8 10.8 0 0 1 12 4c5 0 9.27 3.11 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <path d="M14.12 14.12A3 3 0 0 1 9.88 9.88" />
                          <path d="M1 1l22 22" />
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={event => setConfirmPassword(event.target.value)}
                    autoComplete="new-password"
                    required={authMode === 'signup'}
                  />
                </span>
              </label>
            )}

            <div className="login-actions">
              <button type="submit" className="btn-primary login-submit" disabled={isLoading}>
                {loadingAction === 'email' ? <span className="login-spinner" aria-hidden="true" /> : null}
                {authMode === 'signup' ? 'Sign Up' : 'Login'}
              </button>
              {authMode === 'login' && (
                <button type="button" className="login-text-button" onClick={handleForgotPassword} disabled={isLoading}>
                  Forgot Password?
                </button>
              )}
            </div>
          </form>

          <div className="login-signup">
            {adminIntent ? (
              <>
                Member account?
                <button
                  type="button"
                  className="login-mode-button"
                  onClick={exitAdminMode}
                >
                  Return to member sign in
                </button>
              </>
            ) : (
              <>
                {authMode === 'signup' ? 'Already have an account? ' : 'Don\'t have an account? '}
                <button
                  type="button"
                  className="login-mode-button"
                  onClick={() => {
                    setAuthMode(current => (current === 'login' ? 'signup' : 'login'));
                    resetSignupFields();
                    resetMessages();
                  }}
                >
                  {authMode === 'signup' ? 'Login' : 'Sign Up'}
                </button>
              </>
            )}
          </div>

          <div className="login-divider">
            <span>OR</span>
          </div>

          <button type="button" className="google-login-button" onClick={handleGoogleLogin} disabled={isLoading}>
            {loadingAction === 'google' ? <span className="login-spinner" aria-hidden="true" /> : null}
            {adminIntent ? 'Continue as Admin' : 'Continue with Google'}
          </button>

          <p className="login-terms">
            By continuing, you agree to our <a href="/privacy-policy">Terms &amp; Privacy Policy</a>
          </p>
        </div>

        <aside className="login-info-panel" aria-label="Why sign in">
          <div className="login-info-content">
            <div className="login-info-copy">
              <span className="about-eyebrow">Why sign in?</span>
              <ul>
                <li>Get instant consultation</li>
                <li>Track your inquiries</li>
              </ul>
            </div>

            <div className="login-floating-card">
              <span className="rating-mark" aria-hidden="true">&#9733;</span>
              <strong>4.8 Rating</strong>
              <p>200+ Happy Clients</p>
              <p>Properties across 10+ Western Suburb locations</p>
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
};

export default LoginPage;
