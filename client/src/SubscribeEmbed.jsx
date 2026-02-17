import React from 'react';
import './SubscribeEmbed.css';

export default function SubscribeEmbed() {
  return (
    <div className="subscribe-embed-wrap">
      <p className="subscribe-embed-brought-by">Brought to you by</p>
      <div className="subscribe-embed-iframe-wrap">
        <iframe
          src="https://mrdula.substack.com/embed"
          width="480"
          height="320"
          frameBorder="0"
          scrolling="no"
          title="Subscribe to The Dula Dispatch"
          className="subscribe-embed-iframe"
        />
      </div>
    </div>
  );
}
