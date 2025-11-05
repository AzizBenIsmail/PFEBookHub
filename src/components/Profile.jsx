import React from 'react';
import { useTranslation } from 'react-i18next';
import './Profile.css';

export default function Profile() {
  const { t } = useTranslation();

  return (
    <section className="profile-section">
      <div className="profile-inner">
        <div className="profile-header">
          <div className="profile-image">
            <img src="/MedAzizBenIsmail.png" alt={t('profileImageAlt')} />
          </div>
          <div className="profile-info">
            <h1>{t('profileName')}</h1>
            <p className="profile-tagline">{t('profileTagline')}</p>
          </div>
        </div>
        
        <div className="profile-description">
          <p>{t('profileDesc1')}</p>
          <p>{t('profileDesc2')}</p>
        </div>

        <div className="profile-social">
          <a href="https://github.com/AzizBenIsmail" target="_blank" rel="noreferrer" className="social-link">
            <span>🐙</span> {t('socialGitHub')}
          </a>
          <a href="https://www.linkedin.com/in/aziz-ben-ismail-a111ba19a/" target="_blank" rel="noreferrer" className="social-link">
            <span>🔗</span> {t('socialLinkedIn')}
          </a>
          <a href="https://www.instagram.com/azizbensmail/" target="_blank" rel="noreferrer" className="social-link">
            <span>📸</span> {t('socialInstagram')}
          </a>
          <a href="https://www.facebook.com/aziz.ben.ismail.1127/" target="_blank" rel="noreferrer" className="social-link">
            <span>📘</span> {t('socialFacebook')}
          </a>
          <a href="https://www.youtube.com/@AzizBenIsmail" target="_blank" rel="noreferrer" className="social-link">
            <span>▶️</span> {t('socialYouTube')}
          </a>
          <a href="mailto:sharing.is.caring.benismail@gmail.com" className="social-link">
            <span>✉️</span> {t('socialEmail')}
          </a>
        </div>
      </div>
    </section>
  );
}