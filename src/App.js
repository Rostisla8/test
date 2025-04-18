// Это пример изменения для демонстрации деплоя на GitHub Pages
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage/HomePage';
import MovieSchedulePage from './pages/MovieSchedulePage/MovieSchedulePage';
import NewsPage from './pages/NewsPage/NewsPage';
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
          <Route path="/news" element={<>
            <NewsPage />
            <BottomNavigation activeTab="news" />
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
