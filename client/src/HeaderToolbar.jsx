import React, { useState, useRef, useEffect } from 'react';
import SearchBar from './SearchBar';
import SearchDropdown from './SearchDropdown';
import './HeaderToolbar.css';

export default function HeaderToolbar({
  searchValue,
  onSearchChange,
  searchDropdownResults = [],
  searchDropdownTotal = 0,
  searchDropdownLoading = false,
  onSelectSearchResult,
  onHelpClick,
  onProfileClick,
  onMenuClick,
  profileImageUrl,
}) {
  const [searchFocused, setSearchFocused] = useState(false);
  const searchWrapRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchWrapRef.current && !searchWrapRef.current.contains(e.target)) {
        setSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const showDropdown = searchFocused && (searchValue || '').trim().length > 0;

  const handleSelectEmail = (id) => {
    onSelectSearchResult?.(id);
    setSearchFocused(false);
  };

  return (
    <header className="app-header">
      <div className="header-left">
        <button
          type="button"
          className="header-menu-btn"
          aria-label="Menu"
          onClick={onMenuClick}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24" aria-hidden><path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"/></svg>
        </button>
      </div>
      <div className="header-center">
        <div className="search-wrap" ref={searchWrapRef}>
          <SearchBar
            value={searchValue}
            onChange={onSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 150)}
          />
          {showDropdown && (
            <SearchDropdown
              results={searchDropdownResults}
              total={searchDropdownTotal}
              loading={searchDropdownLoading}
              searchQuery={searchValue}
              onSelectEmail={handleSelectEmail}
              onClose={() => setSearchFocused(false)}
            />
          )}
        </div>
      </div>
      <div className="header-right">
        <button type="button" className="header-icon-btn" aria-label="Chat" title="Chat">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm0 14H6l-2 2V4h16v12z"/></svg>
        </button>
        <button type="button" className="header-icon-btn" aria-label="Help" title="What is this?" onClick={onHelpClick}>
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"/></svg>
        </button>
        <button type="button" className="header-icon-btn" aria-label="Settings" title="Settings">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M19.14 12.94c.04-.31.06-.63.06-.94 0-.31-.02-.63-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.04.31-.06.63-.06.94s.02.63.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z"/></svg>
        </button>
        <button type="button" className="header-icon-btn" aria-label="Google apps" title="Apps">
          <svg viewBox="0 0 24 24" fill="currentColor" width="20" height="20"><path d="M4 8h4V4H4v4zm6 12h4v-4h-4v4zm-6 0h4v-4H4v4zm0-6h4v-4H4v4zm6 0h4v-4h-4v4zm6-10v4h4V4h-4zm-6 4h4V4h-4v4zm6 6h4v-4h-4v4zm0-6h4V4h-4v4z"/></svg>
        </button>
        <button type="button" className="header-profile-btn" onClick={onProfileClick} aria-label="Account">
          <img src={profileImageUrl} alt="" className="header-profile-img" />
        </button>
      </div>
    </header>
  );
}
