// Footer.tsx

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="border-t bg-gradient-to-br from-darkStart to-darkEnd border-borderColor/60 py-6">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between text-sm text-primary">
        <span>© 2025 - Hedera Starter</span>
        <a href="#" className="hover:text-foreground">Terms of use</a>
      </div>
    </footer>
  );
};

export default Footer;
