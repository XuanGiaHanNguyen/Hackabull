import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';

function Header() {
  return (
    <header className="header">
      <div className="container">
        <Link to="/" className="logo">
          <h1>ProductCompare</h1>
        </Link>
      </div>
    </header>
  );
}

export default Header;