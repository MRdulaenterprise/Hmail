import React, { useEffect } from 'react';
import './WhatIsThisModal.css';

export default function WhatIsThisModal({ onClose }) {
  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby="what-is-this-title">
      <div className="modal-dialog" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>
        </button>
        <h2 id="what-is-this-title" className="modal-title">What is this?</h2>
        <p className="modal-lead">You're browsing Hillary Clinton's Private Email Inbox.</p>
        <p className="modal-body">
          Data was compiled from (FBI seizure + State Department/FOIA releases) and later repackaging by sites like WikiLeaks. No new leaks, hacks, or private data beyond official releases are included.
        </p>
        <div className="modal-sources">
          <p className="modal-sources-intro">This resource includes only the files from the <strong>August 31 release</strong>.</p>
          <p className="modal-sources-links">
            Source files: <a href="https://archive.org/download/hillary-clinton-emails-august-31-release" target="_blank" rel="noopener noreferrer">Internet Archive (August 31 release)</a>. The full record is in the <a href="https://foia.state.gov/FOIALIBRARY/SearchResults.aspx?collection=Clinton_Email*,HRC*,Litigation_HRC*,Litigation_F-2015-07895*,Powell_9-23-2016,Nov03_2016,Nov04_2016,FOIA_Jan2020,FOIA_Feb2020,FOIA_L_May2023_1" target="_blank" rel="noopener noreferrer">U.S. Department of State FOIA Library</a>.
          </p>
          <p className="modal-contribute">
            To contribute or get in touch, contact me on X: <a href="https://x.com/RealMRDula" target="_blank" rel="noopener noreferrer">@RealMRDula</a>.
          </p>
        </div>
        <p className="modal-made-by">
          Made by The Dula Dispatch.{' '}
          <a href="https://mrdula.substack.com/" target="_blank" rel="noopener noreferrer">Learn more →</a>
        </p>
        <p className="modal-parsing">
          <span className="modal-doc-icon" aria-hidden>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 14H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z"/></svg>
          </span>
          {' '}Document parsing powered by{' '}
          <a href="https://reducto.ai" target="_blank" rel="noopener noreferrer">reducto</a>.
        </p>
        <p className="modal-support">
          <a href="https://mrdula.substack.com/subscribe" target="_blank" rel="noopener noreferrer">Support the project →</a>
        </p>
        <div className="modal-switch-section">
          <p className="modal-switch-label">Wanna switch to:</p>
          <ul className="modal-switch-list">
            <li><a href="https://jmail.world" target="_blank" rel="noopener noreferrer">Jeffrey Epstein emails</a></li>
            <li><a href="https://marcopolo501c3.substack.com/api/v1/file/cb705062-3426-42e2-a682-3c34ead8dac0.pdf" target="_blank" rel="noopener noreferrer">Report on the Biden Laptop</a></li>
          </ul>
        </div>
        <div className="modal-legal">
          <h3 className="modal-legal-title">Legal</h3>
          <p className="modal-legal-text">
            The Hmail Suite&apos;s visual resemblance to Google, Amazon, Apple iMessage, Spotify, Reddit, Facebook, and other brands is parody, protected under fair use (17 U.S.C. § 107). This project is not affiliated with, endorsed by, or sponsored by Google, Amazon, Apple, Spotify, Reddit, Meta, or any other company whose products are parodied. All trademarks belong to their respective owners. All information was sourced directly from official Government releases and have not been edited, changed, or altered outside of any errors or omissions from the use of AI.
          </p>
        </div>
      </div>
    </div>
  );
}
