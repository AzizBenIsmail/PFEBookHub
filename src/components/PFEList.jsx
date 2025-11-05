import React, { useEffect, useState, useCallback, useMemo } from 'react';
import './PFEList.css';

/**
 * PFEList
 * Strategies to list PDFs placed in public/PFE:
 * 1) Try fetching /PFE/files.json (recommended: generated manifest)
 * 2) Fallback: fetch directory index /PFE/ and parse HTML for .pdf links (works on some static servers)
 * 3) If both fail, show instructions to generate manifest using the included Node script.
 */
export default function PFEList() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function loadManifest() {
      setLoading(true);
      setError(null);

      // 1) Try manifest
      try {
        const res = await fetch('/PFE/files.json', { cache: 'no-cache' });
        if (res.ok) {
          const data = await res.json();
          if (!cancelled) {
            setFiles(Array.isArray(data) ? data : []);
            setLoading(false);
            return;
          }
        }
      } catch (err) {
        // ignore and try next strategy
      }

      // 2) Try to fetch directory index and parse for .pdf links
      try {
        const res = await fetch('/PFE/', { cache: 'no-cache' });
        if (res.ok) {
          const text = await res.text();
          // find href="...pdf" or href='...pdf'
          const regex = /href=["']([^"']+\.pdf)["']/gi;
          const found = [];
          let m;
          while ((m = regex.exec(text)) !== null) {
            // avoid infinite loops with zero-width matches
            if (m.index === regex.lastIndex) regex.lastIndex++;
            let href = m[1];
            // Convert relative paths to absolute under /PFE/
            if (!href.startsWith('/') && !href.match(/^https?:\/\//i)) {
              // remove leading ./ if present
              href = href.replace(/^\.\//, '');
              href = '/PFE/' + href;
            }
            if (href.toLowerCase().endsWith('.pdf')) {
              const name = decodeURIComponent(href.split('/').pop());
              found.push({ name, url: href });
            }
          }

          if (found.length) {
            if (!cancelled) {
              setFiles(found);
              setLoading(false);
              return;
            }
          }
        }
      } catch (err) {
        // ignore
      }

      if (!cancelled) {
        setError('Aucun fichier trouvé automatiquement. Ajoutez manuellement `public/PFE/files.json` ou exécutez le script pour le générer.');
        setLoading(false);
      }
    }

    loadManifest();

    return () => {
      cancelled = true;
    };
  }, []);

  const [modalUrl, setModalUrl] = useState(null);
  const [modalTitle, setModalTitle] = useState('');
  const [query, setQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(true);

  const openInModal = useCallback((url, title) => {
    setModalUrl(url);
    setModalTitle(title || 'PDF Viewer');
    // prevent background scroll
    document.body.style.overflow = 'hidden';
  }, []);

  const closeModal = useCallback(() => {
    setModalUrl(null);
    setModalTitle('');
    document.body.style.overflow = '';
  }, []);

  // close on Escape
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') closeModal();
    }
    if (modalUrl) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [modalUrl, closeModal]);

  function filenameToTitle(filename) {
    // Simple title conversion: remove extension and replace dashes/underscores
    return filename.replace(/\.pdf$/i, '').replace(/[-_]+/g, ' ');
  }

  return (
    <div className="pfe-container">
      <div className="pfe-header">
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem'}}>
          <div>
            <h2 className="pfe-title">PFE Books</h2>
            <p className="pfe-sub">Tous les PDFs trouvés dans <code>/public/PFE</code></p>
          </div>
          <div className="pfe-controls">
            <input className="pfe-search" placeholder="Rechercher un PFE..." value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className="pfe-sort" onClick={() => setSortAsc(s => !s)} title="Trier">{sortAsc ? 'A→Z' : 'Z→A'}</button>
          </div>
        </div>
      </div>

      {loading && <div className="pfe-loading">Chargement…</div>}

      {error && (
        <div className="pfe-error">
          <p>{error}</p>
          <p>
            Pour générer automatiquement le fichier manifest, exécutez :
            <code>npm run generate:pfe-manifest</code>
          </p>
        </div>
      )}

      {!loading && files && files.length === 0 && !error && (
        <div className="pfe-empty">Aucun fichier PDF trouvé dans <code>/public/PFE</code>.</div>
      )}

      <div className="pfe-meta">
        <div>{files.length} fichier(s)</div>
        {query && <div>Filtré par "{query}"</div>}
      </div>

      <div className="pfe-grid">
        {useMemo(() => {
          const list = (files || []).slice();
          list.sort((a,b) => {
            const an = (a.name || a.url || '').toString().toLowerCase();
            const bn = (b.name || b.url || '').toString().toLowerCase();
            return sortAsc ? an.localeCompare(bn) : bn.localeCompare(an);
          });
          return list.filter((f) => {
            if (!query) return true;
            const t = (f.title || f.name || f.url || '').toString().toLowerCase();
            return t.includes(query.toLowerCase());
          });
        }, [files, query, sortAsc]).map((f, idx) => {
          const title = f.title || filenameToTitle(f.name || (f.url || '').split('/').pop());
          const url = f.url || `/PFE/${encodeURIComponent(f.name)}`;
          return (
            <div key={idx} className="pfe-card">
              <div className="pfe-card-body">
                <div style={{display:'flex', gap:'0.75rem', alignItems:'center'}}>
                  <div className="pfe-icon" aria-hidden>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M6 2h7l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 2v6a1 1 0 0 0 1 1h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div>
                    <div className="pfe-card-title">{title}</div>
                    <div className="pfe-card-meta">{(f.name || url.split('/').pop())}</div>
                  </div>
                </div>
              </div>
              <div className="pfe-card-actions">
                <button className="pfe-btn open" onClick={() => openInModal(url, title)} aria-label={`Ouvrir ${title}`}>
                  Ouvrir
                </button>
                <a className="pfe-btn download" href={url} download target="_blank" rel="noopener noreferrer" aria-label={`Télécharger ${title}`}>
                  Télécharger
                </a>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pfe-footer">
        <small>Astuce : placer un fichier <code>public/PFE/files.json</code> avec une liste JSON de fichiers accélère le chargement.</small>
      </div>

      {/* Modal for PDF preview */}
      {modalUrl && (
        <div className="pfe-modal" role="dialog" aria-modal="true" aria-label={modalTitle} onClick={(e) => { if (e.target.classList.contains('pfe-modal')) closeModal(); }}>
          <div className="pfe-modal-content">
            <div className="pfe-modal-header">
              <div className="pfe-modal-title">{modalTitle}</div>
              <button className="pfe-modal-close" onClick={closeModal} aria-label="Fermer">✕</button>
            </div>
            <div className="pfe-modal-body">
              <iframe src={modalUrl} title={modalTitle} className="pfe-pdf-frame" frameBorder="0" />
            </div>
            <div className="pfe-modal-actions">
              <a className="pfe-btn download" href={modalUrl} download target="_blank" rel="noopener noreferrer">Télécharger</a>
              <button className="pfe-btn" onClick={closeModal}>Fermer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
