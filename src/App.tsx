import React from 'react';
import './App.css';
import { useNavigate } from 'react-router-dom';

function App() {
  const navigate = useNavigate();
  return (
    <div className="App">
      <div className="background-images-wrapper">
        <div className="background-image left" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/7eleven_svg.svg)` }}></div>
        <div className="background-image right" style={{ backgroundImage: `url(${process.env.PUBLIC_URL}/tipple_svg.svg)` }}></div>
      </div>
      <main className="content">
        <h1>Kush B🤖t</h1>
        <p>Please select what you want to do from the list below.</p>
        <nav className="navbar">
          <ul className="menu">
            <li className="menu-item"><a href="https://tipple-7eleven.s3.ap-southeast-2.amazonaws.com/index.html" target="_blank" rel="noopener noreferrer">🍩 Upload Range Refresh Files</a></li>
            <li className="menu-item"><a onClick={() => navigate('/bonus-buy')}>📁 Upload Monthly Bonus Buy File</a></li>
            <li className="menu-item"><a onClick={() => navigate('/summit')}>🏪 Upload Monthly Summit File</a></li>
            <li className="menu-item"><a onClick={() => navigate('/monthly-promo-plan')}>🏷️ Upload Monthly Promo Plan File</a></li>
          </ul>
        </nav>
      </main>
    </div>
  );
}

export default App;
