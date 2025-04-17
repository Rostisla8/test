import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage/HomePage';
import MovieSchedulePage from './pages/MovieSchedulePage/MovieSchedulePage';
import BottomNavigation from './components/BottomNavigation/BottomNavigation';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<>
            <HomePage />
            <BottomNavigation activeTab="home" />
          </>} />
          <Route path="/schedule" element={<>
            <MovieSchedulePage />
            <BottomNavigation activeTab="schedule" />
          </>} />
          <Route path="/chat" element={<>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h2>Чат</h2>
              <p>Страница в разработке</p>
            </div>
            <BottomNavigation activeTab="chat" />
          </>} />
          <Route path="/profile" element={<>
            <div style={{ padding: '20px', textAlign: 'center' }}>
              <h2>Профиль</h2>
              <p>Страница в разработке</p>
            </div>
            <BottomNavigation activeTab="profile" />
          </>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
