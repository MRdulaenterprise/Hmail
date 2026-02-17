import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchEmails, fetchEmail, searchEmails, fetchPeople } from './api';
import { useDebounce } from './useDebounce';
import Sidebar from './Sidebar';
import EmailList from './EmailList';
import EmailDetail from './EmailDetail';
import HeaderToolbar from './HeaderToolbar';
import WhatIsThisModal from './WhatIsThisModal';
import ProfileModal from './ProfileModal';
import Activity from './Activity';
import People from './People';
import './App.css';

const STARRED_KEY = 'hmail-starred';
const VIEW_COUNTS_KEY = 'hmail-view-counts';

function getStarred() {
  try {
    const raw = localStorage.getItem(STARRED_KEY);
    if (!raw) return { ids: new Set(), meta: {} };
    const arr = JSON.parse(raw);
    const ids = new Set(arr.map((e) => e.id));
    const meta = {};
    arr.forEach((e) => (meta[e.id] = e));
    return { ids, meta };
  } catch {
    return { ids: new Set(), meta: {} };
  }
}

function saveStarred(ids, meta) {
  try {
    const arr = [...ids].map((id) => meta[id] || { id }).filter((e) => e.from !== undefined || e.subject !== undefined || e.id);
    localStorage.setItem(STARRED_KEY, JSON.stringify(arr));
  } catch (_) {}
}

function getViewCounts() {
  try {
    const raw = localStorage.getItem(VIEW_COUNTS_KEY);
    if (!raw) return {};
    const obj = JSON.parse(raw);
    return typeof obj === 'object' && obj !== null ? obj : {};
  } catch {
    return {};
  }
}

function saveViewCounts(counts) {
  try {
    localStorage.setItem(VIEW_COUNTS_KEY, JSON.stringify(counts));
  } catch (_) {}
}

export default function App() {
  const [folder, setFolder] = useState('inbox');
  const [person, setPerson] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [sort, setSort] = useState('date');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [inboxTotal, setInboxTotal] = useState(0);
  const [sentTotal, setSentTotal] = useState(null);
  const [emails, setEmails] = useState([]);
  const [selectRandomAfterLoad, setSelectRandomAfterLoad] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(true);
  const emailCacheRef = useRef({});
  const [people, setPeople] = useState([]);
  const [starred, setStarredState] = useState(getStarred);
  const starredIds = starred.ids;
  const starredMeta = starred.meta;
  const [viewCounts, setViewCounts] = useState(getViewCounts);
  const limit = 50;

  const recordView = useCallback((id) => {
    if (!id) return;
    setViewCounts((prev) => {
      const next = { ...prev, [id]: (prev[id] || 0) + 1 };
      saveViewCounts(next);
      return next;
    });
  }, []);

  const loadList = useCallback(async () => {
    if (folder === 'starred' || folder === 'activity' || folder === 'people') {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      let data;
      if (debouncedSearch.trim()) {
        data = await searchEmails(debouncedSearch.trim(), { page, limit });
      } else {
        data = await fetchEmails({ page, limit, folder, person, sort });
      }
      setEmails(data.emails);
      setTotal(data.total);
      if (folder === 'inbox' && !person && !debouncedSearch.trim()) setInboxTotal(data.total);
      if (folder === 'sent') setSentTotal(data.total);
    } catch (e) {
      console.error(e);
      setEmails([]);
      setTotal(0);
      if (folder === 'inbox') setInboxTotal(0);
      if (folder === 'sent') setSentTotal(0);
    } finally {
      setLoading(false);
    }
  }, [folder, person, debouncedSearch, page, limit, sort]);

  useEffect(() => {
    setPage(1);
  }, [folder, person, debouncedSearch, sort]);

  useEffect(() => {
    if (folder === 'inbox' || folder === 'starred' || folder === 'sent' || folder === 'people') {
      setSelectedId(null);
    }
  }, [folder]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    fetchPeople().then(setPeople).catch(() => setPeople([]));
  }, []);

  useEffect(() => {
    fetchEmails({ page: 1, limit: 1, folder: 'sent' })
      .then((data) => setSentTotal(data.total))
      .catch(() => setSentTotal(0));
  }, []);

  const handleSelectEmail = async (id) => {
    setSelectedId(id);
    recordView(id);
    const cached = emailCacheRef.current[id];
    if (cached) {
      setSelectedEmail(cached);
      return;
    }
    setSelectedEmail(null);
    try {
      const email = await fetchEmail(id);
      emailCacheRef.current[id] = email;
      setSelectedEmail(email);
    } catch (e) {
      console.error(e);
    }
  };

  const toggleStar = (id, emailMeta) => {
    const nextIds = new Set(starredIds);
    const nextMeta = { ...starred.meta };
    if (nextIds.has(id)) {
      nextIds.delete(id);
      delete nextMeta[id];
    } else {
      nextIds.add(id);
      if (emailMeta) nextMeta[id] = emailMeta;
    }
    setStarredState({ ids: nextIds, meta: nextMeta });
    saveStarred(nextIds, nextMeta);
  };

  useEffect(() => {
    if (!selectRandomAfterLoad || loading || emails.length === 0) return;
    const idx = Math.floor(Math.random() * emails.length);
    handleSelectEmail(emails[idx].id);
    setSelectRandomAfterLoad(false);
  }, [selectRandomAfterLoad, loading, emails]);

  const inboxCount = inboxTotal;
  const sentCount = sentTotal;
  const starredCount = starredIds.size;
  const [showWhatIsThisModal, setShowWhatIsThisModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const profileImageUrl = '/hillary_clinton.jpg';

  useEffect(() => {
    if (sidebarOpen && typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches) {
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = ''; };
    }
  }, [sidebarOpen]);

  return (
    <div className="app">
      {showWhatIsThisModal && (
        <WhatIsThisModal onClose={() => setShowWhatIsThisModal(false)} />
      )}
      {showProfileModal && (
        <ProfileModal profileImageUrl={profileImageUrl} onClose={() => setShowProfileModal(false)} />
      )}
      <div className="app-body">
        {sidebarOpen && (
          <div
            className="sidebar-overlay"
            onClick={() => setSidebarOpen(false)}
            onKeyDown={(e) => e.key === 'Escape' && setSidebarOpen(false)}
            role="button"
            tabIndex={0}
            aria-label="Close menu"
          />
        )}
        <Sidebar
          folder={folder}
          setFolder={setFolder}
          person={person}
          setPerson={setPerson}
          setSearchQuery={setSearchQuery}
          people={people}
          inboxCount={inboxCount}
          sentCount={sentCount}
          starredCount={starredCount}
          mobileOpen={sidebarOpen}
          onCloseSidebar={() => setSidebarOpen(false)}
        />
        <div className="app-main-column">
          <HeaderToolbar
            searchValue={searchQuery}
            onSearchChange={setSearchQuery}
            searchDropdownResults={debouncedSearch.trim() ? emails.slice(0, 8) : []}
            searchDropdownTotal={debouncedSearch.trim() ? total : 0}
            searchDropdownLoading={searchQuery.trim() !== '' && (loading || searchQuery.trim() !== debouncedSearch.trim())}
            onSelectSearchResult={handleSelectEmail}
            onHelpClick={() => setShowWhatIsThisModal(true)}
            onProfileClick={() => setShowProfileModal(true)}
            onMenuClick={() => setSidebarOpen(true)}
            profileImageUrl={profileImageUrl}
          />
          <main className="main">
          <div className="main-content">
          {selectedId != null ? (
            <EmailDetail
              email={selectedEmail}
              loadingDetail={selectedEmail == null}
              onClose={() => setSelectedId(null)}
              indexInPage={(() => {
                const idx = emails.findIndex((e) => e.id === selectedId);
                return idx >= 0 ? idx + 1 : 0;
              })()}
              totalOnPage={emails.length}
              onPrev={
                (() => {
                  const idx = emails.findIndex((e) => e.id === selectedId);
                  if (idx <= 0) return undefined;
                  return () => handleSelectEmail(emails[idx - 1].id);
                })()
              }
              onNext={
                (() => {
                  const idx = emails.findIndex((e) => e.id === selectedId);
                  if (idx < 0 || idx >= emails.length - 1) return undefined;
                  return () => handleSelectEmail(emails[idx + 1].id);
                })()
              }
              starredIds={starredIds}
              onToggleStar={toggleStar}
              fullPage
            />
          ) : folder === 'activity' ? (
            <Activity
              onBack={() => setFolder('inbox')}
              onSelectEmail={handleSelectEmail}
              starredIds={starredIds}
              onToggleStar={toggleStar}
            />
          ) : folder === 'people' ? (
            <People
              people={people}
              onBack={() => setFolder('inbox')}
              onSelectPerson={(name) => { setPerson(name); setFolder('inbox'); }}
            />
          ) : (
            <EmailList
              emails={folder === 'starred' ? [...starredIds].map((id) => starredMeta[id]).filter((e) => e && (e.from != null || e.subject != null)) : emails}
              total={folder === 'starred' ? starredIds.size : total}
              page={folder === 'starred' ? 1 : page}
              limit={folder === 'starred' ? starredIds.size : limit}
              onPageChange={setPage}
              selectedId={null}
              onSelect={handleSelectEmail}
              loading={folder === 'starred' ? false : loading}
              listRefreshing={loading && emails.length > 0}
              starredIds={starredIds}
              onToggleStar={toggleStar}
              folder={folder}
              searchQuery={searchQuery}
              viewCounts={viewCounts}
              onRefresh={loadList}
              onAllAccounts={() => { setFolder('inbox'); setPerson(''); setSearchQuery(''); }}
              onAboutReleases={() => setShowWhatIsThisModal(true)}
              onDateSort={setSort}
              sort={sort}
              onRandomPage={() => {
                if (folder === 'starred' || folder === 'activity') return;
                const tp = Math.max(1, Math.ceil(total / limit));
                const randomPage = tp <= 1 ? 1 : Math.floor(Math.random() * tp) + 1;
                setPage(randomPage);
                setSelectRandomAfterLoad(true);
              }}
              onGoToPeople={() => { setFolder('inbox'); setPerson(''); }}
              onGoToStarred={() => setFolder('starred')}
            />
          )}
          </div>
        </main>
        </div>
      </div>
      <div className="app-banner">
        Hillary Clinton emails — State Dept release. Read-only archive.
      </div>
    </div>
  );
}
