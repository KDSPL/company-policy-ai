"use client";

import React, { useState } from "react";
import styles from "./ForgetPassword.module.scss";

interface ForgotPasswordProps {
  onClose: () => void;
}

const ForgotPassword: React.FC<ForgotPasswordProps> = ({
  onClose,
}) => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);


  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setError("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    const emailRegex =
      /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Validate email
    if (!emailRegex.test(email)) {
      setError("Email address is invalid.");
      return;
    }

    try {
      // Loading state
      setLoading(true);

      const response = await fetch("/api/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.toLowerCase(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(
          data.message || "Something went wrong. Please try again."
        );
        return;
      }

      console.log("Forgot password response:", data);

      setSuccess(true);
    } catch (error) {
      console.error("Forgot password error:", error);

      setError(
        "Unable to process your request. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };



  return (
    <div
      className={styles.overlay}
      onClick={onClose}
    >
      <div
        className={styles.modal}
        onClick={(event) => event.stopPropagation()}
      >
        {!success ? (
          <>
            <h2 className={styles.title}>
              FORGOT PASSWORD
            </h2>

            <p className={styles.description}>
              Enter your account email to receive a
              password reset link.
            </p>

            <form
              className={styles.form}
              onSubmit={handleSubmit}
            >
              <label htmlFor="forgot-email">
                Email:
              </label>

              <input
                type="email"
                id="forgot-email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError("");
                }}
                disabled={loading}
                autoFocus
              />

              {error && (
                <p className={styles.error}>
                  {error}
                </p>
              )}

              <button
                type="submit"
                className={styles.sendButton}
                disabled={loading}
              >
                {loading
                  ? " Processing..."
                  : "Send Reset Link"}
              </button>
            </form>

            <button
              type="button"
              className={styles.backButton}
              onClick={onClose}
              disabled={loading}
            >
              Back to Sign In
            </button>
          </>
        ) : (
          <>
            <h2 className={styles.title}>
              CHECK YOUR EMAIL
            </h2>

            <p className={styles.description}>
              If an account exists with this email address,
              you will receive a password reset link.
              Please check your inbox.
            </p>

            <div className={styles.emailIcon}>
              ✉
            </div>

            <button
              type="button"
              className={styles.sendButton}
              onClick={onClose}
            >
              Done / Back to Sign In
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;