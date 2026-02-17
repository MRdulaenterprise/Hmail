import React, { useState, useMemo } from 'react';
import './People.css';

export default function People({ people, onBack, onSelectPerson }) {
  const [filter, setFilter] = useState('');

  const filtered = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return people;
    return people.filter(
      (p) =>
        (p.display && p.display.toLowerCase().includes(q)) ||
        (p.name && p.name.toLowerCase().includes(q))
    );
  }, [people, filter]);

  return (
    <div className="people-page">
      <div className="people-toolbar">
        <button type="button" className="people-back" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
            <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" />
          </svg>
          Back to inbox
        </button>
      </div>
      <h1 className="people-title">People</h1>
      <p className="people-intro">
        People who appear in the archive. Click a name to view their emails in your inbox.
      </p>
      <div className="people-search-wrap">
        <input
          type="search"
          className="people-search"
          placeholder="Search people…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          aria-label="Search people"
        />
      </div>
      <div className="people-list-wrap">
        {filtered.length === 0 ? (
          <p className="people-empty">
            {filter.trim() ? 'No people match your search.' : 'No people loaded.'}
          </p>
        ) : (
          <ul className="people-list" role="list">
            {filtered.map((p) => {
              const name = (p.display || p.name || '').trim() || 'Unknown';
              return (
                <li key={name.slice(0, 80)}>
                  <button
                    type="button"
                    className="people-item"
                    onClick={() => onSelectPerson(name)}
                  >
                    <span className="people-item-name">{name}</span>
                    {p.count != null && <span className="people-item-count">{p.count}</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
