import React from 'react';
import InboxToolbar from './InboxToolbar';
import './EmailList.css';

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

function SkeletonRow() {
  return (
    <li className="email-row email-row-skeleton" aria-hidden>
      <div className="skeleton-checkbox" />
      <div className="skeleton-star" />
      <div className="skeleton-view" />
      <div className="skeleton-line short" />
      <div className="skeleton-line medium" />
      <div className="skeleton-line date" />
    </li>
  );
}

export default function EmailList({
  emails,
  total,
  page,
  limit,
  onPageChange,
  selectedId,
  onSelect,
  loading,
  listRefreshing,
  starredIds,
  onToggleStar,
  folder,
  searchQuery,
  viewCounts = {},
  onRefresh,
  onRandomPage,
  onGoToPeople,
  onGoToStarred,
  onAllAccounts,
  onAboutReleases,
  onDateSort,
  sort = 'date',
}) {
  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const showPagination = folder !== 'starred' && total > limit;
  const showSkeleton = loading && emails.length === 0;
  const isSearchEmpty = !loading && emails.length === 0 && (searchQuery || '').trim().length > 0;

  return (
    <div className="email-list-container">
      <InboxToolbar
        total={total}
        page={page}
        totalPages={totalPages}
        start={total === 0 ? 0 : start}
        end={end}
        onPageChange={onPageChange}
        onRefresh={onRefresh}
        onRandomPage={onRandomPage}
        onGoToPeople={onGoToPeople}
        onGoToStarred={onGoToStarred}
        onAllAccounts={onAllAccounts}
        onAboutReleases={onAboutReleases}
        onDateSort={onDateSort}
        sort={sort}
        showPagination={showPagination}
        listRefreshing={listRefreshing}
      />
      {isSearchEmpty && (
        <div className="email-list-search-hint-bar">No results for &ldquo;{(searchQuery || '').trim()}&rdquo;</div>
      )}
      {showSkeleton ? (
        <ul className="email-list" role="list" aria-busy="true">
          {Array.from({ length: 10 }, (_, i) => <SkeletonRow key={i} />)}
        </ul>
      ) : (
        <ul className="email-list" role="list">
          {emails.map((email) => (
            <li
              key={email.id}
              className={`email-row ${selectedId === email.id ? 'selected' : ''}`}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(email.id)}
              onKeyDown={(e) => e.key === 'Enter' && onSelect(email.id)}
            >
              <span className="email-row-checkbox" aria-hidden>
                <input type="checkbox" className="email-row-checkbox-input" onClick={(e) => e.stopPropagation()} aria-label="Select" />
              </span>
              <div className="email-row-star-cell">
                <button
                  type="button"
                  className="star-btn"
                  onClick={(e) => { e.stopPropagation(); onToggleStar(email.id, email); }}
                  aria-label={starredIds.has(email.id) ? 'Unstar' : 'Star'}
                >
                  {starredIds.has(email.id) ? '★' : '☆'}
                </button>
                <span className="email-row-count" aria-hidden>{starredIds.has(email.id) ? 1 : 0}</span>
              </div>
              <div className="email-row-view-cell">
                <span className="email-row-view-icon" aria-hidden>
                  <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>
                </span>
                <span className="email-row-count">{viewCounts[email.id] ?? 0}</span>
              </div>
              <div className="email-row-from">{(email.from || '').replace(/<[^>]+>/, '').trim() || email.from}</div>
              <div className="email-row-subject">{email.subject || '(No subject)'}</div>
              <div className="email-row-date">{formatDate(email.sent)}</div>
            </li>
          ))}
        </ul>
      )}
      {!loading && emails.length === 0 && (
        <div className="email-list-empty">
          {isSearchEmpty ? (
            <>No messages match your search. Try different keywords or check the spelling.</>
          ) : (
            <>No emails in this view.</>
          )}
        </div>
      )}
    </div>
  );
}
