import React, { useState } from 'react';
import './Sidebar.css';

const IconInbox = () => (
  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);
const IconStar = () => (
  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/>
  </svg>
);
const IconSend = () => (
  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
  </svg>
);
const IconLabel = () => (
  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h11c.67 0 1.27-.33 1.63-.84l3.96-5.58a.99.99 0 0 0 0-1.16l-3.96-5.58z"/>
  </svg>
);
const IconPerson = () => (
  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/>
  </svg>
);
const IconActivity = () => (
  <svg className="nav-item-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
    <path d="M19 4h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2z"/>
  </svg>
);

const TOPIC_LABELS = [
  { id: 'state', label: 'State Dept' },
  { id: 'policy', label: 'Policy' },
  { id: 'travel', label: 'Travel' },
  { id: 'schedule', label: 'Schedule' },
  { id: 'media', label: 'Media' },
  { id: 'advice', label: 'Asking for advice' },
  { id: 'intros', label: 'Introductions' },
  { id: 'diplomacy', label: 'Diplomacy' },
  { id: 'security', label: 'Security' },
  { id: 'foia', label: 'FOIA / Release' },
];

const TOPIC_SEARCH = {
  state: 'State Dept',
  policy: 'policy',
  travel: 'travel',
  schedule: 'schedule',
  media: 'media',
  advice: 'advice',
  intros: 'introduction',
  diplomacy: 'diplomacy',
  security: 'security',
  foia: 'FOIA release',
};

export default function Sidebar({
  folder,
  setFolder,
  person,
  setPerson,
  setSearchQuery,
  people,
  inboxCount,
  sentCount,
  starredCount,
  mobileOpen = false,
  onCloseSidebar,
}) {
  const [peopleOpen, setPeopleOpen] = useState(true);
  const [topicsOpen, setTopicsOpen] = useState(true);

  const handleNav = (fn) => {
    if (typeof fn === 'function') fn();
    onCloseSidebar?.();
  };

  return (
    <aside className={`sidebar ${mobileOpen ? 'sidebar-drawer-open' : ''}`} aria-hidden={mobileOpen ? false : undefined}>
      <div className="sidebar-header">
        <button
          type="button"
          className="sidebar-menu-btn"
          aria-label={mobileOpen ? 'Close menu' : 'Menu'}
          onClick={onCloseSidebar || undefined}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
        </button>
        <img src="/favicon.svg" alt="" className="sidebar-favicon" />
        <span className="sidebar-logo">Hmail</span>
      </div>
      <button type="button" className="sidebar-compose" disabled title="Read-only archive — compose not available">
        <svg className="sidebar-compose-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>
        Compose
      </button>
      <div className="sidebar-drawer-body">
      <nav className="sidebar-nav">
        <button
          className={`nav-item ${folder === 'inbox' && !person ? 'active' : ''}`}
          onClick={() => handleNav(() => { setFolder('inbox'); setPerson(''); })}
        >
          <IconInbox />
          <span className="nav-label">Inbox</span>
          {inboxCount != null && <span className="nav-count">({inboxCount})</span>}
        </button>
        <button
          className={`nav-item ${folder === 'starred' ? 'active' : ''}`}
          onClick={() => handleNav(() => setFolder('starred'))}
        >
          <IconStar />
          <span className="nav-label">Starred</span>
          {starredCount != null && <span className="nav-count">({starredCount})</span>}
        </button>
        <button
          className={`nav-item ${folder === 'sent' ? 'active' : ''}`}
          onClick={() => handleNav(() => { setFolder('sent'); setPerson(''); })}
        >
          <IconSend />
          <span className="nav-label">Sent</span>
          {sentCount != null && folder === 'sent' && <span className="nav-count">({sentCount})</span>}
        </button>
        <button
          className={`nav-item ${folder === 'activity' ? 'active' : ''}`}
          onClick={() => handleNav(() => { setFolder('activity'); setPerson(''); })}
        >
          <IconActivity />
          <span className="nav-label">Daily Activity</span>
        </button>
      </nav>

      <div className="sidebar-section">
        <button className="section-header" onClick={() => setTopicsOpen(!topicsOpen)}>
          <IconLabel />
          <span>Topics</span>
          <span className="section-toggle">{topicsOpen ? '▼' : '▶'}</span>
        </button>
        {topicsOpen && (
          <div className="topics-list">
            {TOPIC_LABELS.map((t) => (
              <button
                key={t.id}
                type="button"
                className="topic-item"
                onClick={() => handleNav(() => {
                  setFolder('inbox');
                  setPerson('');
                  setSearchQuery?.(TOPIC_SEARCH[t.id] ?? t.label);
                })}
                title={`Search for "${TOPIC_SEARCH[t.id] ?? t.label}"`}
              >
                <span className="topic-label">{t.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-section sidebar-section-people">
        <button className="section-header" onClick={() => setPeopleOpen(!peopleOpen)}>
          <IconPerson />
          <span>People</span>
          <span className="section-toggle">{peopleOpen ? '▼' : '▶'}</span>
        </button>
        {peopleOpen && (
          <div className="people-list-wrapper">
          <div className="people-list">
            <button type="button" className="people-browse-link" onClick={() => handleNav(() => { setPerson(''); setFolder('people'); })}>Browse all people →</button>
            {people.slice(0, 250).map((p) => (
              <button
                key={(p.display || p.name || '').slice(0, 50)}
                className={`people-item ${person && (p.display || p.name || '').trim() === person.trim() ? 'active' : ''}`}
                onClick={() => handleNav(() => {
                  setPerson(p.display || p.name || '');
                  setFolder('inbox');
                })}
              >
                <span className="people-name">{(p.display || p.name || '').slice(0, 40)}</span>
                {p.count != null && <span className="people-count">{p.count}</span>}
              </button>
            ))}
          </div>
          </div>
        )}
      </div>
      </div>
    </aside>
  );
}
