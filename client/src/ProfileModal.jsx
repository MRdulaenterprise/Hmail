import React, { useEffect, useRef } from 'react';
import './ProfileModal.css';

export default function ProfileModal({ profileImageUrl, onClose }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    const handleEscape = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    if (rect.top < 0 || rect.bottom > window.innerHeight) {
      el.style.alignSelf = 'center';
    }
  }, []);

  return (
    <div className="profile-modal-overlay" onClick={onClose} role="dialog" aria-modal="true" aria-label="Account">
      <div className="profile-modal-dialog" ref={dialogRef} onClick={(e) => e.stopPropagation()}>
        <p className="profile-modal-email">hdr22@clintonemail.com</p>
        <div className="profile-modal-avatar-wrap">
          <img src={profileImageUrl} alt="" className="profile-modal-avatar" />
        </div>
        <p className="profile-modal-greeting">Hillary Clinton&apos;s Emails</p>
        <p className="profile-modal-signin">
          <button type="button" className="profile-modal-signin-link" onClick={onClose}>
            Sign in to Hmail
          </button>
        </p>
      </div>
    </div>
  );
}
