import React, { useState, useEffect, useCallback } from 'react';
import { fetchActivity, fetchEmailsByDate } from './api';
import EmailList from './EmailList';
import './Activity.css';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function getDaysInYear(y) {
  return (y % 4 === 0 && (y % 100 !== 0 || y % 400 === 0)) ? 366 : 365;
}

function dateKey(y, m, d) {
  const mm = String(m + 1).padStart(2, '0');
  const dd = String(d).padStart(2, '0');
  return `${y}-${mm}-${dd}`;
}

function formatDayHeader(dateStr) {
  const d = new Date(dateStr + 'T12:00:00');
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString([], { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
}

export default function Activity({ onBack, onSelectEmail, starredIds, onToggleStar }) {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(2010);
  const [selectedDate, setSelectedDate] = useState(null);
  const [activity, setActivity] = useState({ counts: {}, total: 0 });
  const [activityLoading, setActivityLoading] = useState(true);
  const [dayEmails, setDayEmails] = useState([]);
  const [dayTotal, setDayTotal] = useState(0);
  const [dayLoading, setDayLoading] = useState(false);

  const loadActivity = useCallback(async () => {
    setActivityLoading(true);
    try {
      const data = await fetchActivity(year);
      setActivity(data);
    } catch (e) {
      console.error(e);
      setActivity({ counts: {}, total: 0 });
    } finally {
      setActivityLoading(false);
    }
  }, [year]);

  useEffect(() => {
    loadActivity();
  }, [loadActivity]);

  useEffect(() => {
    if (!selectedDate) {
      setDayEmails([]);
      setDayTotal(0);
      return;
    }
    setDayLoading(true);
    fetchEmailsByDate(selectedDate, { page: 1, limit: 100 })
      .then((data) => {
        setDayEmails(data.emails);
        setDayTotal(data.total);
      })
      .catch(() => {
        setDayEmails([]);
        setDayTotal(0);
      })
      .finally(() => setDayLoading(false));
  }, [selectedDate]);

  const daysInYear = getDaysInYear(year);
  const countsList = Object.values(activity.counts);
  const maxCount = Math.max(1, ...countsList);
  const jan1Weekday = new Date(year, 0, 1).getDay();

  const yearRange = [];
  for (let y = currentYear; y >= 1998; y--) yearRange.push(y);

  const heatmapCells = [];
  for (let dayOfYear = 0; dayOfYear < daysInYear; dayOfYear++) {
    const d = new Date(year, 0, 1 + dayOfYear);
    const key = dateKey(d.getFullYear(), d.getMonth(), d.getDate());
    const count = activity.counts[key] || 0;
    const row = (jan1Weekday + dayOfYear) % 7;
    const col = Math.floor((jan1Weekday + dayOfYear) / 7);
    heatmapCells.push({ key, count, row, col });
  }

  const monthlyTotals = [];
  for (let m = 0; m < 12; m++) {
    let sum = 0;
    const prefix = `${year}-${String(m + 1).padStart(2, '0')}-`;
    Object.entries(activity.counts).forEach(([k, v]) => {
      if (k.startsWith(prefix)) sum += v;
    });
    monthlyTotals.push({ month: MONTHS[m], count: sum });
  }
  const maxMonthly = Math.max(1, ...monthlyTotals.map((x) => x.count));

  const busiestDay = Object.entries(activity.counts).reduce(
    (best, [key, count]) => (count > (best?.count ?? 0) ? { key, count } : best),
    null
  );
  const avgPerDay = daysInYear > 0 ? (activity.total / daysInYear).toFixed(1) : '0';

  const levelRanges = [];
  if (maxCount > 0) {
    const q = Math.ceil(maxCount / 4);
    levelRanges.push('0');
    levelRanges.push('1–' + Math.min(q, maxCount));
    if (maxCount > q) levelRanges.push((q + 1) + '–' + Math.min(2 * q, maxCount));
    if (maxCount > 2 * q) levelRanges.push(2 * q + 1 + '–' + Math.min(3 * q, maxCount));
    if (maxCount > 3 * q) levelRanges.push(3 * q + 1 + '+');
  } else {
    levelRanges.push('0');
  }

  return (
    <div className="activity-page">
      <div className="activity-toolbar">
        <button type="button" className="activity-back" onClick={onBack}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/></svg>
          Back to inbox
        </button>
      </div>
      <h1 className="activity-title">Activity</h1>

      <div className="activity-year-row">
        <label htmlFor="activity-year" className="activity-year-label">Year:</label>
        <select
          id="activity-year"
          className="activity-year-select"
          value={year}
          onChange={(e) => setYear(Number(e.target.value))}
        >
          {yearRange.map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
      </div>

      {activityLoading ? (
        <p className="activity-loading">Loading activity…</p>
      ) : activity.total === 0 ? (
        <div className="activity-empty">
          <p className="activity-empty-text">No emails in {year}.</p>
          <p className="activity-empty-hint">Select another year above to view activity.</p>
        </div>
      ) : (
        <>
          <div className="activity-stats-row">
            <p className="activity-summary">
              <strong>{activity.total.toLocaleString()}</strong> messages in {year}
              {avgPerDay !== '0' && (
                <span className="activity-avg"> · {avgPerDay} per day on average</span>
              )}
            </p>
            {busiestDay && (
              <p className="activity-busiest">
                Busiest day: <strong>{formatDayHeader(busiestDay.key)}</strong> ({busiestDay.count} email{busiestDay.count !== 1 ? 's' : ''})
              </p>
            )}
          </div>

          <div className="activity-monthly-wrap">
            <h3 className="activity-monthly-title">Messages by month</h3>
            <div className="activity-monthly-bars">
              {monthlyTotals.map(({ month, count }) => (
                <div key={month} className="activity-monthly-bar-wrap" title={`${month}: ${count}`}>
                  <div
                    className="activity-monthly-bar"
                    style={{ height: maxMonthly > 0 ? `${(count / maxMonthly) * 100}%` : 0 }}
                  />
                  <span className="activity-monthly-label">{month}</span>
                  <span className="activity-monthly-count">{count}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="activity-heatmap-wrap">
            <div className="activity-heatmap-legend">
              <span className="activity-legend-label">Emails per day:</span>
              <div className="activity-legend-bar" />
              <span className="activity-legend-ranges">{levelRanges.join(' · ')}</span>
            </div>
            <div className="activity-heatmap-grid" role="img" aria-label={`Email activity for ${year}`}>
              <div className="activity-heatmap-weekdays">
                {WEEKDAYS.map((wd) => (
                  <span key={wd} className="activity-weekday-label">{wd}</span>
                ))}
              </div>
              <div className="activity-heatmap-cells">
                {heatmapCells.map(({ key, count, row, col }) => {
                  const intensity = maxCount > 0 ? count / maxCount : 0;
                  const level = count === 0 ? 0 : Math.min(4, Math.ceil(intensity * 4) || 1);
                  return (
                    <button
                      key={key}
                      type="button"
                      className={`activity-cell level-${level}`}
                      style={{ gridColumn: col + 1, gridRow: row + 1 }}
                      title={`${key}: ${count} email${count !== 1 ? 's' : ''}`}
                      onClick={() => setSelectedDate(selectedDate === key ? null : key)}
                    >
                      <span className="sr-only">{key} {count} emails</span>
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="activity-heatmap-months">
              {MONTHS.map((m, i) => (
                <span key={m} className="activity-month-label" style={{ gridColumn: Math.floor((i / 12) * 53) + 1 }}>{m}</span>
              ))}
            </div>
          </div>

          {selectedDate && (
            <div className="activity-day-section">
              <div className="activity-day-header">
                <h2 className="activity-day-title">{formatDayHeader(selectedDate)}</h2>
                <button type="button" className="activity-day-close" onClick={() => setSelectedDate(null)} aria-label="Clear date">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
                </button>
              </div>
              <p className="activity-day-count">{dayTotal} EMAIL{(dayTotal !== 1) ? 'S' : ''}</p>
              {dayLoading ? (
                <p className="activity-day-loading">Loading…</p>
              ) : (
                <ul className="activity-day-list">
                  {dayEmails.map((email) => (
                    <li key={email.id} className="activity-day-item">
                      <button
                        type="button"
                        className="activity-day-item-btn"
                        onClick={() => onSelectEmail(email.id)}
                      >
                        <span className="activity-day-from">{(email.from || '').replace(/<[^>]+>/, '').trim() || email.from || '—'}</span>
                        <span className="activity-day-subject">{email.subject || '(No subject)'}</span>
                        <span className="activity-day-time">
                          {(() => {
                            const d = new Date(email.sent);
                            return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                          })()}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
