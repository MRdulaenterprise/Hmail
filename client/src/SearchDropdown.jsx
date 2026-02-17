import React, { useEffect, useRef } from 'react';
import './SearchDropdown.css';

function formatDate(sent) {
  if (!sent) return '';
  const d = new Date(sent);
  if (isNaN(d.getTime())) return sent;
  const now = new Date();
  const sameYear = d.getFullYear() === now.getFullYear();
  if (sameYear && d.getMonth() === now.getMonth() && d.getDate() === now.getDate()) {
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }
  if (sameYear) return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SearchDropdown({
  results,
  total,
  loading,
  searchQuery,
  onSelectEmail,
  onClose,
}) {
  const listRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!searchQuery || !searchQuery.trim()) return null;

  return (
    <div className="search-dropdown" role="dialog" aria-label="Search results">
      <div className="search-dropdown-inner">
        {loading ? (
          <div className="search-dropdown-loading">Searching…</div>
        ) : results.length === 0 ? (
          <div className="search-dropdown-empty">No messages match &ldquo;{searchQuery.trim()}&rdquo;</div>
        ) : (
          <>
            <ul className="search-dropdown-list" ref={listRef} role="list">
              {results.map((email) => (
                <li key={email.id}>
                  <button
                    type="button"
                    className="search-dropdown-item"
                    onClick={() => onSelectEmail(email.id)}
                  >
                    <span className="search-dropdown-from">{(email.from || '').replace(/<[^>]+>/, '').trim() || email.from || '—'}</span>
                    <span className="search-dropdown-subject">{email.subject || '(No subject)'}</span>
                    <span className="search-dropdown-date">{formatDate(email.sent)}</span>
                  </button>
                </li>
              ))}
            </ul>
            {total > results.length && (
              <div className="search-dropdown-footer">
                View all {total} results in the list below
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
