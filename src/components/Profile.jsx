import React from 'react';
import './Profile.css';

export default function Profile() {
  return (
    <section className="profile-section">
      <div className="profile-inner">
        <div className="profile-header">
          <div className="profile-image">
            <img src="/MedAzizBenIsmail.png" alt="Mohamed Aziz Ben Ismail" />
          </div>
          <div className="profile-info">
            <h1>Mohamed Aziz Ben Ismail</h1>
            <p className="profile-tagline">"Sharing is caring"</p>
          </div>
        </div>
        
        <div className="profile-description">
          <p>Je suis ingénieur en informatique, spécialisé dans le développement Web2 et Web3, ainsi que formateur agréé en Web2 et Web3 par l'État Tunisien. Avec 3 ans d'expérience, j'accompagne des équipes et des apprenants dans la conception d'applications modernes, sécurisées et évolutives.</p>
          <p>Ma vision : démocratiser l'accès aux compétences numériques, tirer parti des technologies Web3 quand elles apportent de la valeur, et promouvoir l'open source comme moteur d'innovation et de partage.</p>
        </div>

        <div className="profile-social">
          <a href="https://github.com/AzizBenIsmail" target="_blank" rel="noreferrer" className="social-link">
            <span>🐙</span> GitHub
          </a>
          <a href="https://www.linkedin.com/in/aziz-ben-ismail-a111ba19a/" target="_blank" rel="noreferrer" className="social-link">
            <span>🔗</span> LinkedIn
          </a>
          <a href="https://www.instagram.com/azizbensmail/" target="_blank" rel="noreferrer" className="social-link">
            <span>📸</span> Instagram
          </a>
          <a href="https://www.facebook.com/aziz.ben.ismail.1127/" target="_blank" rel="noreferrer" className="social-link">
            <span>📘</span> Facebook
          </a>
          <a href="https://www.youtube.com/@AzizBenIsmail" target="_blank" rel="noreferrer" className="social-link">
            <span>▶️</span> YouTube
          </a>
          <a href="mailto:sharing.is.caring.benismail@gmail.com" className="social-link">
            <span>✉️</span> sharing.is.caring.benismail@gmail.com
          </a>
        </div>
      </div>
    </section>
  );
}