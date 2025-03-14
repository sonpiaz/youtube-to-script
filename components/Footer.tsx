import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="footer">
      <p>© {new Date().getFullYear()} YouTube Transcript Generator | Developed by Son Piaz</p>
    </footer>
  );
};

export default Footer; 