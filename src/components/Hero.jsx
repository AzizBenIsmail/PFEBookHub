import React from 'react';
import './Hero.css';

export default function Hero() {
  return (
    <section className="ph-hero" role="region" aria-label="Présentation">
      <div className="ph-hero-inner">
        <h1 className="ph-hero-title">
          Un seul endroit pour tous les
          <br />
          <span className="ph-hero-accent">PFE Books</span>
          <span className="ph-hero-year">2026</span>
        </h1>

        <p className="ph-hero-sub">
          Découvrez les PFE 2026 proposés par différentes entreprises. Parcourez
          les projets, comparez les offres et trouvez votre stage de fin d'études.
        </p>

        <div className="ph-hero-actions">
          <button className="ph-hero-cta" type="button">Explorer →</button>
        </div>

        <div className="ph-hero-badges" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="ph-badge"> 
              <span className="ph-badge-dot" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
