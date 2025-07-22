import React, { useEffect, useState, useRef } from "react";
import "./MemoryGame.scss";

const EMOJIS = ['🥔', '🍒', '🥑', '🌽', '🥕', '🍇', '🍉', '🍌', '🥭', '🍍'];
const BOARD_DIM = 4; // 4x4 board

function pickRandom(array, items) {
  const arr = [...array];
  const picks = [];
  for (let i = 0; i < items; i++) {
    const idx = Math.floor(Math.random() * arr.length);
    picks.push(arr[idx]);
    arr.splice(idx, 1);
  }
  return picks;
}

function shuffle(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const generateBoard = (dimension = BOARD_DIM) => {
  if (dimension % 2 !== 0) throw new Error("Board dimension must be even");
  const picks = pickRandom(EMOJIS, (dimension * dimension) / 2);
  const cards = shuffle([...picks, ...picks]).map((emoji, idx) => ({
    id: idx + "-" + emoji,
    emoji,
    flipped: false,
    matched: false,
  }));
  return cards;
};

export default function MemoryGame() {
  const [cards, setCards] = useState(() => generateBoard(BOARD_DIM));
  const [flippedIdxs, setFlippedIdxs] = useState([]);
  const [moves, setMoves] = useState(0);
  const [time, setTime] = useState(0);
  const [gameStarted, setGameStarted] = useState(false);
  const [win, setWin] = useState(false);
  const timerRef = useRef(null);

  // Timer effect
  useEffect(() => {
    if (gameStarted && !win) {
      timerRef.current = setInterval(() => setTime((t) => t + 1), 1000);
    }
    return () => clearInterval(timerRef.current);
  }, [gameStarted, win]);

  // Handle flip logic
  useEffect(() => {
    if (flippedIdxs.length === 2) {
      const [i, j] = flippedIdxs;
      if (cards[i].emoji === cards[j].emoji) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card, idx) =>
              idx === i || idx === j ? { ...card, matched: true } : card
            )
          );
          setFlippedIdxs([]);
        }, 600);
      } else {
        setTimeout(() => setFlippedIdxs([]), 1000);
      }
      setMoves((m) => m + 1);
    }
  }, [flippedIdxs, cards]);

  // Win condition
  useEffect(() => {
    if (cards.every((c) => c.matched)) {
      setGameStarted(false);
      setWin(true);
      clearInterval(timerRef.current);
    }
  }, [cards]);

  const handleCardClick = (idx) => {
    if (win || flippedIdxs.includes(idx) || cards[idx].matched || flippedIdxs.length === 2) return;
    if (!gameStarted) setGameStarted(true);
    setFlippedIdxs((prev) => [...prev, idx]);
  };

  const handleRestart = () => {
    setCards(generateBoard(BOARD_DIM));
    setFlippedIdxs([]);
    setMoves(0);
    setTime(0);
    setGameStarted(false);
    setWin(false);
    clearInterval(timerRef.current);
  };

  return (
    <div className="board-container">
      <div
        className="board"
        style={{
          gridTemplateColumns: `repeat(${BOARD_DIM}, 100px)`,
          gridTemplateRows: `repeat(${BOARD_DIM}, 100px)`
        }}
      >
        {cards.map((card, idx) => {
          const flipped = flippedIdxs.includes(idx) || card.matched;
          return (
            <div
              className={`card${flipped ? " flipped" : ""}`}
              key={card.id}
              onClick={() => handleCardClick(idx)}
            >
              <div className="card-front"></div>
              <div className="card-back">{card.emoji}</div>
            </div>
          );
        })}
      </div>
      <div className="controls">
        <button onClick={handleRestart}>Restart</button>
      </div>
      <div className="stats">
        <span className="moves">{moves} moves</span> |{" "}
        <span className="timer">Time: {time} sec</span>
      </div>
      <div className={`win${win ? " show" : ""}`}>
        <span className="win-text">
          You won!<br />
          with <span className="highlight">{moves}</span> moves<br />
          under <span className="highlight">{time}</span> seconds
        </span>
      </div>
    </div>
  );
}