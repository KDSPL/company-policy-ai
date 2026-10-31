import React from "react";
import logo from "@/public/companyLogo.png";
import styles from "./HomeWelcomeSection.module.scss";


const WelcomeSection: React.FC = () => {
  return (
    <section className={styles.welcomeSection}>
      <a href="/" className={styles.logoImg}>
        <img
          src={logo.src}
          width={150}
          height={34}
          alt="logo"
        />
      </a>
      <p className={styles.title}>Company Policy AI Bot</p>
      <h1 className={styles.chatTitle}>
        Hi! How can I help you?
      </h1>
    </section>
  );
}

export default WelcomeSection;