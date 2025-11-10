import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import './PFEList.css';

/**
 * PFEList
 * Strategies to list PDFs placed in public/PFE:
 * 1) Try fetching /PFE/files.json (recommended: generated manifest)
 * 2) Fallback: fetch directory index /PFE/ and parse HTML for .pdf links (works on some static servers)
 * 3) If both fail, show instructions to generate manifest using the included Node script.
 */
export default function PFEList() {
  const { t } = useTranslation();
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
  const [modalFallback, setModalFallback] = useState(false);
  const [query, setQuery] = useState('');
  const [sortAsc, setSortAsc] = useState(true);
  const [copied, setCopied] = useState(false);
  const thumbnailCacheRef = useRef(new Map());

  const openInModal = useCallback((url, title) => {
    // Detect mobile / touch-like devices or narrow screens where iframe PDF often fails
    const isTouch = typeof window !== 'undefined' && (
      window.innerWidth <= 720 ||
      (navigator.userAgent && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) ||
      (window.matchMedia && window.matchMedia('(pointer:coarse)').matches)
    );

    if (isTouch) {
      // Try to open directly in a new tab (more reliable on mobile)
      try {
        const opened = window.open(url, '_blank', 'noopener,noreferrer');
        if (!opened) {
          // Popup blocked: fall back to modal with an explicit open link
          setModalUrl(url);
          setModalTitle(title || 'PDF Viewer');
          setModalFallback(true);
          setIsFullscreen(false);
          try { document.body.style.overflow = 'hidden'; document.documentElement.style.overflow = 'hidden'; } catch (e) {}
        }
      } catch (e) {
        // On any error, fallback to modal
        setModalUrl(url);
        setModalTitle(title || 'PDF Viewer');
        setModalFallback(true);
        setIsFullscreen(false);
        try { document.body.style.overflow = 'hidden'; document.documentElement.style.overflow = 'hidden'; } catch (e) {}
      }
      return;
    }

    // Desktop / large screens: open in modal with iframe
    setModalFallback(false);
    setModalUrl(url);
    setModalTitle(title || 'PDF Viewer');
    setIsFullscreen(false);
    try {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } catch (e) {}
  }, []);

  const closeModal = useCallback(() => {
    setModalUrl(null);
    setModalTitle('');
    setModalFallback(false);
    try {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    } catch (e) {}
    // exit fullscreen if active
    try {
      if (document.fullscreenElement) {
        document.exitFullscreen?.();
      }
    } catch (e) {}
  }, []);

  const modalContentRef = useRef(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = useCallback(async () => {
    try {
      if (!modalContentRef.current) return;
      if (!document.fullscreenElement) {
        // request fullscreen on the modal content
        const el = modalContentRef.current;
        if (el.requestFullscreen) await el.requestFullscreen();
        else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
        else if (el.mozRequestFullScreen) el.mozRequestFullScreen();
        setIsFullscreen(true);
      } else {
        if (document.exitFullscreen) await document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.mozCancelFullScreen) document.mozCancelFullScreen();
        setIsFullscreen(false);
      }
    } catch (e) {
      // ignore
    }
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

  /* Thumbnail component: renders first page of a PDF to a data URL using PDF.js (loaded from CDN).
     Caches results in memory for the session. If a manifest provides a `thumbnail` property, that will
     be used by the card directly and the generator skipped. */
  function Thumbnail({ url, alt, width = 64, height = 64 }) {
    const [src, setSrc] = useState(null);
    const [loadingThumb, setLoadingThumb] = useState(false);

    useEffect(() => {
      let cancelled = false;
      if (!url) return;
      const cached = thumbnailCacheRef.current.get(url);
      if (cached) {
        setSrc(cached);
        return;
      }

      async function ensurePdfJs() {
        if (window.pdfjsLib) return window.pdfjsLib;
        // load pdfjs from unpkg CDN
        return new Promise((resolve, reject) => {
          const s = document.createElement('script');
          s.src = 'https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.min.js';
          s.onload = () => resolve(window.pdfjsLib);
          s.onerror = reject;
          document.head.appendChild(s);
        });
      }

      async function renderThumb() {
        setLoadingThumb(true);
  // reset
        try {
          const pdfjs = await ensurePdfJs();
          // set worker
          try {
            pdfjs.GlobalWorkerOptions.workerSrc = 'https://unpkg.com/pdfjs-dist@2.16.105/build/pdf.worker.min.js';
          } catch (e) {}

          // fetch PDF as arrayBuffer
          const resp = await fetch(url, { cache: 'no-cache' });
          if (!resp.ok) throw new Error('fetch failed');
          const buffer = await resp.arrayBuffer();
          const loadingTask = pdfjs.getDocument({ data: buffer });
          const pdf = await loadingTask.promise;
          const page = await pdf.getPage(1);
          const viewport = page.getViewport({ scale: 1 });
          const scale = Math.min(width / viewport.width, height / viewport.height, 1);
          const scaled = page.getViewport({ scale });
          const canvas = document.createElement('canvas');
          canvas.width = Math.round(scaled.width);
          canvas.height = Math.round(scaled.height);
          const ctx = canvas.getContext('2d');
          const renderContext = { canvasContext: ctx, viewport: scaled };
          await page.render(renderContext).promise;
          const dataUrl = canvas.toDataURL('image/png');
          thumbnailCacheRef.current.set(url, dataUrl);
          if (!cancelled) setSrc(dataUrl);
        } catch (e) {
          // failure -> leave fallback
        } finally {
          if (!cancelled) setLoadingThumb(false);
        }
      }

      renderThumb();

      return () => { cancelled = true; };
    }, [url, width, height]);

    if (src) return <img className="pfe-thumb" src={src} alt={alt} width={width} height={height} />;
    if (loadingThumb) return <div className="pfe-thumb pfe-thumb-loading" aria-hidden />;
    return <div className="pfe-thumb pfe-thumb-fallback" aria-hidden />;
  }

  // copy the manifest generation command to clipboard (helpful when no files are found)
  const copyCommand = useCallback(() => {
    const cmd = 'npm run generate:pfe-manifest';
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(cmd).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }).catch(() => {
        alert(`Veuillez copier manuellement : ${cmd}`);
      });
    } else {
      try {
        // fallback
        const ta = document.createElement('textarea');
        ta.value = cmd;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      } catch (e) {
        alert(`Veuillez copier manuellement : ${cmd}`);
      }
    }
  }, []);

  return (
    <div className="pfe-container">
      <div className="pfe-header">
        <div style={{display:'flex', alignItems:'center', justifyContent:'space-between', gap:'1rem'}}>
          <div>
            <h2 className="pfe-title">{t('pfeTitle')}</h2>
            <p className="pfe-sub">{t('pfeSub', { path: '/public/PFE' })}</p>
          </div>
          <div className="pfe-controls">
            <input className="pfe-search" placeholder={t('searchPlaceholder')} value={query} onChange={(e) => setQuery(e.target.value)} />
            <button className="pfe-sort" onClick={() => setSortAsc(s => !s)} title="Trier">{sortAsc ? 'A→Z' : 'Z→A'}</button>
          </div>
        </div>
      </div>

  {loading && <div className="pfe-loading" role="status" aria-live="polite">{t('loading')}</div>}

      {error && (
        <div className="pfe-error" role="alert" aria-live="assertive">
          <p>{error}</p>
          <p>
            {t('manifestHint')}
            <code>npm run generate:pfe-manifest</code>
          </p>
        </div>
      )}

      {!loading && files && files.length === 0 && !error && (
        <div className="pfe-empty" role="status" aria-live="polite">
          <div className="pfe-empty-illustration" aria-hidden>
            {/* simple inline SVG illustration */}
            <svg width="160" height="120" viewBox="0 0 160 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="2" y="18" width="120" height="84" rx="8" fill="#f8fafc" stroke="#e6edf8" />
              <path d="M10 28h100" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
              <path d="M10 46h80" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
              <path d="M10 64h60" stroke="#e2e8f0" strokeWidth="2" strokeLinecap="round" />
              <path d="M84 0v22l22 22V22h18v60H84V0z" fill="#e6f0ff" opacity="0.9" />
            </svg>
          </div>
          <p style={{marginTop:8, marginBottom:8}}>{t('noFiles', { path: '/public/PFE' })}</p>
          <div style={{display:'flex', gap:8, marginTop:6}}>
            <button className="pfe-btn open" onClick={copyCommand} aria-label="Copier commande">
              {/* copy icon */}
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <path d="M16 1H4a2 2 0 0 0-2 2v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <rect x="8" y="5" width="13" height="13" rx="2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span style={{marginLeft:8}}>{copied ? 'Copié ✓' : 'Copier la commande'}</span>
            </button>
            <a className="pfe-btn download" href="/PFE/files.json" target="_blank" rel="noopener noreferrer" aria-label="Voir files.json">Voir files.json</a>
          </div>
        </div>
      )}

      <div className="pfe-meta">
        <div className="pfe-count">{t('filesCount', { count: files.length })}</div>
        {query && <div className="pfe-filtered">{t('filteredBy', { query })}</div>}
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
          const stableKey = f.url || f.name || idx;
          return (
            <div key={stableKey} className="pfe-card" role="button" tabIndex={0} title={title} onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openInModal(url, title); }
            }}>
              <div className="pfe-card-body">
                <div style={{display:'flex', gap:'0.75rem', alignItems:'center'}}>
                  <div aria-hidden>
                    {f.thumbnail ? (
                      <img className="pfe-thumb" src={f.thumbnail} alt={title} width={64} height={64} />
                    ) : (
                      <Thumbnail url={url} alt={title} width={64} height={64} />
                    )}
                  </div>
                  <div>
                    <div className="pfe-card-title">{title}</div>
                    <div className="pfe-card-meta">{(f.name || url.split('/').pop())}</div>
                  </div>
                </div>
              </div>
              <div className="pfe-card-actions">
                <button className="pfe-btn open" onClick={() => openInModal(url, title)} aria-label={`${t('open')} ${title}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M8 17l8-10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M16 17H8v-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{marginLeft:8}}>{t('open')}</span>
                </button>
                <a className="pfe-btn download" href={url} download target="_blank" rel="noopener noreferrer" aria-label={`${t('download')} ${title}`}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 10l5 5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M12 15V3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span style={{marginLeft:8}}>{t('download')}</span>
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
        <div className="pfe-modal" role="dialog" aria-modal="true" aria-label={modalTitle} onClick={closeModal}>
          <div className="pfe-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="pfe-modal-header">
              <div className="pfe-modal-title">{modalTitle}</div>
              <div className="pfe-header-actions">
                <a className="pfe-modal-action-btn" href={modalUrl} target="_blank" rel="noopener noreferrer" title={t('openNewTab')} aria-label={t('openNewTab')}>🔗</a>
                <button className="pfe-modal-action-btn" onClick={toggleFullscreen} title={isFullscreen ? t('close') : 'Fullscreen'} aria-label="Basculer plein écran">{isFullscreen ? '🞬' : '⤢'}</button>
                <button className="pfe-modal-close" onClick={closeModal} aria-label={t('close')}>✕</button>
              </div>
            </div>
            <div className="pfe-modal-body" ref={modalContentRef}>
              {modalFallback ? (
                <div className="pfe-modal-fallback">
                  <p>Impossible d'afficher le PDF dans la popup sur cet appareil. Ouvrez le PDF dans un nouvel onglet :</p>
                  <a className="pfe-btn open" href={modalUrl} target="_blank" rel="noopener noreferrer">Ouvrir dans un nouvel onglet</a>
                </div>
              ) : (
                <iframe src={modalUrl} title={modalTitle} className="pfe-pdf-frame" frameBorder="0" allowFullScreen allow="fullscreen" />
              )}
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
