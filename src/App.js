// Это пример изменения для демонстрации деплоя на GitHub Pages
import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import HomePage from './pages/HomePage/HomePage';
import MovieSchedulePage from './pages/MovieSchedulePage/MovieSchedulePage';
import NewsPage from './pages/NewsPage/NewsPage';
import TrendsPage from './pages/TrendsPage/TrendsPage';
import ProfilePage from './pages/ProfilePage/ProfilePage';
import PollsPage from './pages/PollsPage/PollsPage';
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
          <Route path="/polls" element={<PollsPage />} />
          <Route path="/news" element={<>
            <NewsPage />
            <BottomNavigation activeTab="news" />
          </>} />
          <Route path="/trends" element={<>
            <TrendsPage />
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
