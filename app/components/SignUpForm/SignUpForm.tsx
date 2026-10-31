'use client';

import React, { useState } from 'react';
import styles from './SignUpForm.module.scss';
import logo from '@/public/companyLogo.png';
import ThemeToggle from '../ThemeToggle/ThemeToggle';
import { createUser } from '@/app/actions/userActions';
import GoogleSignInButton from '../GoogleSignInButton/GoogleSignInButton';

const SignUpForm: React.FC = () => {
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError(null);
    setMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      const result = await createUser(formData);
    
      if (!result.success) {
        setError(result.message);
        return;
      }
    
      setMessage(result.message);
    } catch {
      setError('Something went wrong. Please try again.');
    }
  }

  return (
    <div className={styles.signupForm}>
      <div className={styles.titleBlock}>
        <img
          src={logo.src}
          alt="Logo"
          className={`companyLogo ${styles.logo}`}
          width={200}
          height={70}
        />

        <h2 className={styles.title}>Sign Up</h2>

        <p className={styles.description}>
          Use your email and password to sign up
        </p>
      </div>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          name="email"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          id="password"
          name="password"
          required
        />

        {error && (
          <p className={styles.error}>{error}</p>
        )}

        {message && (
          <p className={styles.message}>{message}</p>
        )}

        <button
          type="submit"
          className={styles.submitBtn}
        >
          Confirm
        </button>

        <p className={styles.text}>
          Already have an account?{" "}
          <a
            href="/signin"
            className={styles.boldText}
          >
            Sign in
          </a>
        </p>

        <GoogleSignInButton />
      </form>

      <ThemeToggle />
    </div>
  );
};

export default SignUpForm;