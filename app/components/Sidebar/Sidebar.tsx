
"use client";

import React from "react";
import { useSession, signOut } from "next-auth/react";
import kplogo from '@/public/kp-logo.png';
import styles from "./Sidebar.module.scss";
import NewChatIcon from "@/public/new-chat-icon.png";
import DocumentIcon from "@/public/document-icon.png";
import ThemeToggle from "../ThemeToggle/ThemeToggle";
import SignOutIcon from "@/public/log-out-icon.png";
import chatIcon from "@/public/chat-history.png";

type SidebarProps = {
  onClose?: () => void;
};

const Sidebar: React.FC<SidebarProps> = ({ onClose }) => {
  const [isSettingOpen, setIsSettingOpen] =
    React.useState(false);

  const { data: session, status } = useSession();

  const isLoggedIn = status === "authenticated";

  // ==========================================
  // Check admin access
  // ==========================================

  const role = (session?.user as { role?: string } | undefined)?.role;
  const isAdmin = role === "HR_ADMIN";

  // ==========================================
  // Sign out
  // ==========================================

  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/signin",
    });
  };

  // ==========================================
  // Profile popup
  // ==========================================

  const handleProfileBtn = () => {
    setIsSettingOpen((prev) => !prev);
  };

  return (
    <div className={styles.sidebar}>
      {/* ======================================
          Sidebar Header
      ====================================== */}

      <div className={styles.sidebarTitle}>
        <span className={styles.kpLogoWrapper}>
          <img
            src={kplogo.src}
            alt="Kraftpixel Logo"
            className={`companyLogo ${styles.logo}`}
            width={37}
            height={33}
          />
        </span>

        <p>AI Bot</p>
        
        <button
          className={styles.closeButton}
          onClick={onClose}
          aria-label="Close sidebar"
        >
          ×
        </button>
      </div>

      {/* ======================================
          Sidebar Menu
      ====================================== */}

      <div className={styles.sidebarDetails}>
        {/* New Chat */}

        <a
          href="/chat"
          className={styles.newChat}
        >
          <img
            src={NewChatIcon.src}
            width={25}
            height={25}
            alt="new-chat-icon"
          />

          <span>New Chat</span>
        </a>

        {/* Documents
            Only HR_ADMIN can see this */}

        {isAdmin && (
          <a
            href="/admin"
            className={styles.documentManagement}
          >
            <img
              src={DocumentIcon.src}
              width={25}
              height={25}
              alt="document-icon"
            />

            Documents
          </a>
        )}

        {/* Chat History */}

        <a
          href="/chat-history"
          className={styles.recentBtn}
        >
          <img
            src={chatIcon.src}
            width={25}
            height={25}
            alt="chat history icon"
            className={`companyLogo ${styles.logo}`}
          />

          Chat History
        </a>
      </div>

      {/* ======================================
          User Profile
          Show only when logged in
      ====================================== */}

      {isLoggedIn && (
        <div className={styles.profileAndToggle}>
          {/* Profile Popup */}

          {isSettingOpen && (
            <div
              className={styles.themeToggleBtn}
            >
              <div
                className={styles.togglePopup}
              >
                {/* Theme */}

                <div className={styles.theme}>
                  <span>Theme</span>

                  <ThemeToggle />
                </div>

                {/* Sign Out */}

                <button
                  className={styles.signout}
                  onClick={handleSignOut}
                >
                  <img
                    src={SignOutIcon.src}
                    width={20}
                    height={20}
                    alt="log-out-icon"
                  />

                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}

          {/* User Profile */}

          <div
            className={styles.userProfile}
            onClick={handleProfileBtn}
          >
            <span className={styles.userName}>
              User Profile
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

