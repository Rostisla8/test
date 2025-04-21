// Это пример изменения для демонстрации деплоя на GitHub Pages
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage/HomePage';
import MovieSchedulePage from './pages/MovieSchedulePage/MovieSchedulePage';
import NewsPage from './pages/NewsPage/NewsPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
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
            <ProfilePage />
            <BottomNavigation activeTab="profile" />
          </>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
