import React from 'react';
import SubscribeEmbed from './SubscribeEmbed';
import './EmailDetail.css';

function getInitial(nameOrEmail) {
  const str = (nameOrEmail || '').trim();
  if (!str) return '?';
  const namePart = str.replace(/<[^>]+>/, '').trim();
  const first = namePart.match(/^[A-Za-z]/);
  if (first) return first[0].toUpperCase();
  if (str.includes('@')) return str[0].toUpperCase();
  return '?';
}

function formatDetailDate(sent) {
  if (!sent) return '';
  const d = new Date(sent);
  if (isNaN(d.getTime())) return sent;
  return d.toLocaleString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function DetailSkeleton({ fullPage }) {
  return (
    <div className={`email-detail detail-skeleton${fullPage ? ' full-page' : ''}`} aria-busy="true">
      <div className="email-detail-toolbar">
        <div className="skeleton-detail-btn" />
        <span className="toolbar-spacer" />
        <div className="skeleton-detail-btn" />
      </div>
      <div className="email-detail-subject-row">
        <div className="skeleton-line subject" />
      </div>
      <div className="email-detail-from-row">
        <div className="skeleton-avatar" />
        <div className="email-detail-from-info">
          <div className="skeleton-line from" />
          <div className="skeleton-line to" />
          <div className="skeleton-line date" />
        </div>
      </div>
      <div className="email-detail-body">
        <div className="skeleton-line body" />
        <div className="skeleton-line body short" />
        <div className="skeleton-line body" />
        <div className="skeleton-line body medium" />
      </div>
    </div>
  );
}

export default function EmailDetail({ email, loadingDetail, onClose, indexInPage, totalOnPage, onPrev, onNext, starredIds, onToggleStar, fullPage }) {
  if (loadingDetail) {
    return <DetailSkeleton fullPage={fullPage} />;
  }
  if (!email) {
    return (
      <div className="email-detail empty">
        <p>Select an email</p>
      </div>
    );
  }

  const fromDisplay = (email.from || '').replace(/<[^>]+>/, (m) => ` ${m}`).trim() || email.from || '—';
  const toDisplay = email.to || '—';
  const initial = getInitial(email.from || email.to);

  return (
    <div className={`email-detail gmail-style${fullPage ? ' full-page' : ''}`}>
      <div className="email-detail-toolbar">
        <button type="button" className="toolbar-btn back" onClick={onClose} aria-label="Back to list">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
        </button>
        <span className="toolbar-spacer" />
        {totalOnPage > 1 && (
          <div className="toolbar-pagination">
            <button type="button" onClick={onPrev} aria-label="Previous" disabled={!onPrev}>‹</button>
            <span>{indexInPage} of {totalOnPage}</span>
            <button type="button" onClick={onNext} aria-label="Next" disabled={!onNext}>›</button>
          </div>
        )}
        <button type="button" className="toolbar-btn close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" aria-hidden><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
      </div>

      <div className="email-detail-subject-row">
        <h1 className="email-detail-subject">{email.subject || '(No subject)'}</h1>
      </div>

      <div className="email-detail-from-row">
        <div className="email-avatar" aria-hidden>
          {initial}
        </div>
        <div className="email-detail-from-info">
          <div className="email-detail-from-top">
            <span className="email-detail-from-name">{fromDisplay}</span>
            <span className="email-detail-meta-right">
              <button
                type="button"
                className="star-btn-detail"
                onClick={() => onToggleStar && onToggleStar(email.id, email)}
                aria-label={starredIds && starredIds.has(email.id) ? 'Unstar' : 'Star'}
                title={starredIds && starredIds.has(email.id) ? 'Unstar' : 'Star'}
              >
                {starredIds && starredIds.has(email.id) ? '★' : '☆'}
              </button>
            </span>
          </div>
          <div className="email-detail-to-line">
            to <span className="email-detail-to-inline">{toDisplay}</span>
          </div>
          <div className="email-detail-date-line">
            {formatDetailDate(email.sent)}
          </div>
        </div>
      </div>

      <div className="email-detail-body">
        {email.body ? (
          <div className="email-body-text">{email.body}</div>
        ) : (
          <p className="no-body">No body content.</p>
        )}
        <SubscribeEmbed />
      </div>

      <div className="email-detail-actions">
        <span className="read-only-note">Read-only archive — reply and forward are not available.</span>
      </div>
    </div>
  );
}
