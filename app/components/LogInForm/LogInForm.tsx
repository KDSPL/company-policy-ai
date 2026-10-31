"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import ThemeToggle from '../ThemeToggle/ThemeToggle';

import styles from "./LoginForm.module.scss";
import logo from "@/public/companyLogo.png";
import ForgotPassword from "@/app/components/ForgetPassword/ForgetPassword";
import GoogleSignInButton from "../GoogleSignInButton/GoogleSignInButton";

const LogInForm: React.FC = () => {
  const router = useRouter();

  const [showForgotPassword, setShowForgotPassword] =
    useState(false);

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);

    const email = String(
      formData.get("email") ?? ""
    ).trim();

    const password = String(
      formData.get("password") ?? ""
    );

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password.");
        return;
      }

      router.push("/chat");
      router.refresh();
    } catch (error) {
      console.error("Login error:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.loginForm}>
      <div className={styles.titleBlock}>
        <img
          src={logo.src}
          alt="Logo"
          className={`companyLogo ${styles.logo}`}
          width={200}
          height={70}
        />

        <h2 className={styles.title}>
          Sign In
        </h2>

        <p className={styles.description}>
          Use your email and password to sign in
        </p>
      </div>

      <form
        className={styles.form}
        onSubmit={handleSubmit}
      >
        <label htmlFor="email">
          Email
        </label>

        <input
          type="email"
          id="email"
          name="email"
          required
        />

        <label htmlFor="password">
          Password
        </label>

        <input
          type="password"
          id="password"
          name="password"
          required
        />

        <button
          type="button"
          className={styles.passwordText}
          onClick={() => setShowForgotPassword(true)}
        >
          Forgot password?
        </button>

        {error && (
          <p className={styles.error}>
            {error}
          </p>
        )}

        <button
          type="submit"
          className={styles.submitBtn}
          disabled={loading}
        >
          {loading ? "Signing In..." : "Sign In"}
        </button>

        <p className={styles.text}>
          Don't have an account?{" "}
          <a
            href="/signup"
            className={styles.boldText}
          >
            Sign Up
          </a>
        </p>
        <GoogleSignInButton label="Sign in with Google" />
      </form>
      <ThemeToggle />
      {showForgotPassword && (
        <ForgotPassword
          onClose={() => setShowForgotPassword(false)}
        />
      )}
    </div>

  );
};

export default LogInForm;