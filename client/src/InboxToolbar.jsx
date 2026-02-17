import React, { useState, useRef, useEffect } from 'react';
import './InboxToolbar.css';

export default function InboxToolbar({
  total,
  page,
  totalPages,
  start,
  end,
  onPageChange,
  onRefresh,
  onRandomPage,
  onGoToPeople,
  onGoToStarred,
  onAllAccounts,
  onAboutReleases,
  onDateSort,
  sort = 'date',
  showPagination,
  listRefreshing,
}) {
  const [releasesOpen, setReleasesOpen] = useState(false);
  const [dateOpen, setDateOpen] = useState(false);
  const releasesRef = useRef(null);
  const dateRef = useRef(null);

  useEffect(() => {
    const close = (e) => {
      if (releasesRef.current && !releasesRef.current.contains(e.target)) setReleasesOpen(false);
      if (dateRef.current && !dateRef.current.contains(e.target)) setDateOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const goFirst = () => onPageChange(1);
  const goPrev = () => onPageChange((p) => Math.max(1, p - 1));
  const goNext = () => onPageChange((p) => Math.min(totalPages, p + 1));
  const goLast = () => onPageChange(totalPages);

  return (
    <div className="inbox-toolbar">
      <div className="inbox-toolbar-overview-bar">
        <div className="inbox-toolbar-overview-header">
          <span className="inbox-toolbar-ai-icon" aria-hidden>✦</span>
          <h2 className="inbox-toolbar-ai-title">AI Overview</h2>
        </div>
        <p className="inbox-toolbar-overview-text">
          You&apos;re browsing Hillary Clinton&apos;s emails from the State Department release. Explore by{' '}
          <button type="button" className="inbox-toolbar-link" onClick={onGoToPeople}>name</button>, use the search bar,{' '}
          <button type="button" className="inbox-toolbar-link" onClick={onRandomPage}>visit a random page</button>, contribute to the{' '}
          <button type="button" className="inbox-toolbar-link" onClick={onGoToStarred}>starred list</button>, or open Daily Activity for the heatmap.
        </p>
      </div>
      <div className="inbox-toolbar-actions-bar">
        <div className="inbox-toolbar-actions-left">
          <button type="button" className="inbox-toolbar-btn" onClick={onRefresh} disabled={listRefreshing} aria-label="Refresh">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>
          </button>
          <button type="button" className="inbox-toolbar-btn inbox-toolbar-btn-labeled" onClick={onRandomPage}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
            Random Page
          </button>
          <button type="button" className="inbox-toolbar-btn inbox-toolbar-btn-labeled" onClick={onAllAccounts} title="Show all mail">
            All accounts <span className="inbox-toolbar-caret">▼</span>
          </button>
          <div className="inbox-toolbar-dropdown-wrap" ref={releasesRef}>
            <button
              type="button"
              className="inbox-toolbar-btn inbox-toolbar-btn-labeled"
              onClick={() => setReleasesOpen((o) => !o)}
              title="Releases"
              aria-expanded={releasesOpen}
            >
              Old releases <span className="inbox-toolbar-caret">▼</span>
            </button>
            {releasesOpen && (
              <div className="inbox-toolbar-dropdown">
                <button type="button" className="inbox-toolbar-dropdown-item" onClick={() => setReleasesOpen(false)}>
                  Current release
                </button>
                <button type="button" className="inbox-toolbar-dropdown-item" onClick={() => { onAboutReleases?.(); setReleasesOpen(false); }}>
                  About this release
                </button>
              </div>
            )}
          </div>
          <div className="inbox-toolbar-dropdown-wrap" ref={dateRef}>
            <button
              type="button"
              className="inbox-toolbar-btn inbox-toolbar-btn-labeled"
              onClick={() => setDateOpen((o) => !o)}
              title="Sort by date"
              aria-expanded={dateOpen}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/></svg>
              Date <span className="inbox-toolbar-caret">▼</span>
            </button>
            {dateOpen && (
              <div className="inbox-toolbar-dropdown">
                <button
                  type="button"
                  className={`inbox-toolbar-dropdown-item ${sort === 'date' ? 'active' : ''}`}
                  onClick={() => { onDateSort?.('date'); setDateOpen(false); }}
                >
                  Newest first
                </button>
                <button
                  type="button"
                  className={`inbox-toolbar-dropdown-item ${sort === 'date_asc' ? 'active' : ''}`}
                  onClick={() => { onDateSort?.('date_asc'); setDateOpen(false); }}
                >
                  Oldest first
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="inbox-toolbar-actions-right">
          {showPagination && (
            <>
              <span className="inbox-toolbar-range">{start}-{end} of {total}</span>
              <div className="inbox-toolbar-pagination">
                <button type="button" className="inbox-toolbar-page-btn" onClick={goFirst} disabled={page <= 1} aria-label="First page">‹‹</button>
                <button type="button" className="inbox-toolbar-page-btn" onClick={goPrev} disabled={page <= 1} aria-label="Previous page">‹</button>
                <span className="inbox-toolbar-page-num">{page} of {totalPages}</span>
                <button type="button" className="inbox-toolbar-page-btn" onClick={goNext} disabled={page >= totalPages} aria-label="Next page">›</button>
                <button type="button" className="inbox-toolbar-page-btn" onClick={goLast} disabled={page >= totalPages} aria-label="Last page">››</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
