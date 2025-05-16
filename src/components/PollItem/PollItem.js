import React, { useState, useEffect } from 'react';
import styles from './PollItem.module.css';

const PollItem = ({ question, options, totalVotes, onVote }) => {
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [showAnimation, setShowAnimation] = useState(false);

  const handleOptionSelect = (index) => {
    if (!hasVoted) {
      setSelectedOption(index);
    }
  };

  const handleVote = () => {
    if (selectedOption !== null) {
      setShowAnimation(true);
      // Небольшая задержка перед отображением результатов для анимации
      setTimeout(() => {
        setHasVoted(true);
        onVote(selectedOption);
      }, 500);
    }
  };

  const handleShowResults = () => {
    setHasVoted(true);
  };

  return (
    <div className={styles.pollItem}>
      <h3 className={styles.pollQuestion}>{question}</h3>
      <p className={styles.pollDescription}>
        {hasVoted ? 'Результаты голосования:' : 'Выберите один из вариантов ответа'}
      </p>
      
      <div className={`${styles.optionsContainer} ${showAnimation ? styles.voting : ''}`}>
        {options.map((option, index) => (
          <div 
            key={index} 
            className={`${styles.optionItem} ${selectedOption === index ? styles.selected : ''} ${hasVoted && selectedOption === index ? styles.votedOption : ''}`}
            onClick={() => handleOptionSelect(index)}
          >
            <div className={styles.optionIconContainer} style={{ backgroundColor: option.color }}>
              {option.icon}
            </div>
            <div className={styles.optionContent}>
              <div className={styles.optionHeader}>
                <span className={styles.optionText}>{option.text}</span>
                {hasVoted && (
                  <span className={styles.optionPercentage}>{option.percentage}%</span>
                )}
              </div>
              {hasVoted ? (
                <div className={styles.progressBarContainer}>
                  <div 
                    className={styles.progressBar} 
                    style={{ 
                      width: `${option.percentage}%`, 
                      backgroundColor: option.color
                    }}
                  ></div>
                </div>
              ) : (
                <div className={styles.optionSelector}>
                  <div 
                    className={`${styles.radioButton} ${selectedOption === index ? styles.radioSelected : ''}`}
                  ></div>
                </div>
              )}
              {hasVoted && (
                <div className={styles.optionFooter}>
                  <span className={styles.optionStats}>{option.votes} голосов</span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div className={styles.pollFooter}>
        {!hasVoted ? (
          <>
            <button 
              className={`${styles.voteButton} ${showAnimation ? styles.voting : ''}`}
              onClick={handleVote}
              disabled={selectedOption === null || showAnimation}
            >
              {showAnimation ? 'ГОЛОСОВАНИЕ...' : 'ГОЛОСОВАТЬ'}
            </button>
            <button 
              className={styles.resultsButton}
              onClick={handleShowResults}
              disabled={showAnimation}
            >
              РЕЗУЛЬТАТЫ
            </button>
          </>
        ) : (
          <button 
            className={styles.newVoteButton}
            onClick={() => window.location.reload()}
          >
            НОВЫЙ ОПРОС
          </button>
        )}
      </div>
    </div>
  );
};

export default PollItem; 