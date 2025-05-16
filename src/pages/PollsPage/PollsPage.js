import React, { useState } from 'react';
import styles from './PollsPage.module.css';
import Header from '../../components/Header/Header';
import PollItem from '../../components/PollItem/PollItem';
import BottomNavigation from '../../components/BottomNavigation/BottomNavigation';
import { FaFireAlt, FaTheaterMasks, FaFilm, FaMusic, FaChevronLeft, FaChevronRight, FaShareAlt } from 'react-icons/fa';

const PollsPage = () => {
  // Состояние для текущего активного опроса
  const [currentPollIndex, setCurrentPollIndex] = useState(0);

  // Моковые данные для опросов
  const [polls, setPolls] = useState([
    {
      id: 1,
      question: 'Что следует организовать для Дня Города?',
      options: [
        { 
          text: 'Ярмарка фейерверков', 
          votes: 200, 
          percentage: 29, 
          color: '#4EAAEA', 
          icon: <FaFireAlt color="#fff" size={18} /> 
        },
        { 
          text: 'Фейерверк-шоу', 
          votes: 270, 
          percentage: 39, 
          color: '#FF6B6B', 
          icon: <FaTheaterMasks color="#fff" size={18} /> 
        },
        { 
          text: 'Кино под открытым небом', 
          votes: 270, 
          percentage: 39, 
          color: '#1A91DA', 
          icon: <FaFilm color="#fff" size={18} /> 
        },
        { 
          text: 'Живая музыка', 
          votes: 130, 
          percentage: 19, 
          color: '#6C757D', 
          icon: <FaMusic color="#fff" size={18} /> 
        }
      ],
      totalVotes: 870
    },
    {
      id: 2,
      question: 'Какое направление следует развивать в городском парке?',
      options: [
        { 
          text: 'Спортивная площадка', 
          votes: 150, 
          percentage: 30, 
          color: '#4EAAEA', 
          icon: <FaFireAlt color="#fff" size={18} /> 
        },
        { 
          text: 'Детская игровая зона', 
          votes: 180, 
          percentage: 36, 
          color: '#FF6B6B', 
          icon: <FaTheaterMasks color="#fff" size={18} /> 
        },
        { 
          text: 'Зона для пикников', 
          votes: 120, 
          percentage: 24, 
          color: '#1A91DA', 
          icon: <FaFilm color="#fff" size={18} /> 
        },
        { 
          text: 'Сцена для мероприятий', 
          votes: 50, 
          percentage: 10, 
          color: '#6C757D', 
          icon: <FaMusic color="#fff" size={18} /> 
        }
      ],
      totalVotes: 500
    }
  ]);

  // Обработчики для переключения опросов
  const goToNextPoll = () => {
    if (currentPollIndex < polls.length - 1) {
      setCurrentPollIndex(currentPollIndex + 1);
    }
  };

  const goToPrevPoll = () => {
    if (currentPollIndex > 0) {
      setCurrentPollIndex(currentPollIndex - 1);
    }
  };

  const handleVote = (pollId, optionIndex) => {
    // В реальном приложении здесь будет запрос к API
    console.log(`Проголосовал за опрос ${pollId}, вариант ${optionIndex}`);
    
    // Обновляем статистику голосования для тестирования
    setPolls(prevPolls => {
      return prevPolls.map(poll => {
        if (poll.id === pollId) {
          // Увеличиваем количество голосов для выбранного варианта
          const updatedOptions = poll.options.map((option, idx) => {
            if (idx === optionIndex) {
              const votes = option.votes + 1;
              const totalVotes = poll.totalVotes + 1;
              return {
                ...option,
                votes,
                percentage: Math.round((votes / totalVotes) * 100)
              };
            }
            // Перерасчет процентов для других вариантов
            const totalVotes = poll.totalVotes + 1;
            return {
              ...option,
              percentage: Math.round((option.votes / totalVotes) * 100)
            };
          });
          
          return {
            ...poll,
            options: updatedOptions,
            totalVotes: poll.totalVotes + 1
          };
        }
        return poll;
      });
    });
  };

  // Текущий опрос для отображения
  const currentPoll = polls[currentPollIndex];

  // Форматирование номера текущего опроса для отображения (01, 02, etc.)
  const formattedCurrentIndex = (currentPollIndex + 1).toString().padStart(2, '0');
  const formattedTotalPolls = polls.length.toString().padStart(2, '0');

  // Функция для кнопки "Поделиться"
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentPoll.question,
        text: `Примите участие в опросе: ${currentPoll.question}`,
        url: window.location.href
      })
        .then(() => console.log('Успешно поделились'))
        .catch((error) => console.log('Ошибка при попытке поделиться:', error));
    } else {
      // Если Web Share API не поддерживается
      alert('Функция "Поделиться" не поддерживается в вашем браузере');
    }
  };

  return (
    <div className={`${styles.pollsPage} font-montserrat`}>
      <Header />
      
      <div className={styles.pageHeader}>
        <div className={styles.cityInfo}>
          <h1 className={styles.cityName}>City Day</h1>
          <div className={styles.cityStats}>
            <span className={styles.percentage}>2%</span>
          </div>
        </div>
        
        <div className={styles.cityImageContainer}>
          <div className={styles.cityImageBackground}></div>
        </div>
      </div>
      
      <div className={styles.content}>
        <div className={styles.pollHeader}>
          <h2 className={styles.title}>{currentPoll.question}</h2>
          <div className={styles.pollControls}>
            <button 
              className={styles.controlButton} 
              onClick={goToPrevPoll}
              disabled={currentPollIndex === 0}
            >
              <FaChevronLeft />
            </button>
            <div className={styles.pagination}>
              <span className={styles.currentPage}>{formattedCurrentIndex}</span>
              <span className={styles.totalPages}>/ {formattedTotalPolls}</span>
            </div>
            <button 
              className={styles.controlButton} 
              onClick={goToNextPoll}
              disabled={currentPollIndex === polls.length - 1}
            >
              <FaChevronRight />
            </button>
            <button 
              className={styles.shareButton} 
              onClick={handleShare}
            >
              <FaShareAlt />
            </button>
          </div>
        </div>
        
        <div className={styles.pollsContainer}>
          <div className={styles.activePoll}>
            <PollItem 
              key={currentPoll.id}
              question={currentPoll.question}
              options={currentPoll.options}
              totalVotes={currentPoll.totalVotes}
              onVote={(optionIndex) => handleVote(currentPoll.id, optionIndex)}
            />
          </div>
        </div>
      </div>
      <BottomNavigation activeTab="polls" />
    </div>
  );
};

export default PollsPage; 