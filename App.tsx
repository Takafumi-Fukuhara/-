import React, { useState, useEffect, useCallback } from 'react';
import {
  BOARD_HEIGHT,
  BOARD_WIDTH,
  LEVEL_1_MAP,
  PLAYER_START_POS,
  TILE_SIZE,
  BOMB_TIMER,
  EXPLOSION_TIMER,
  INITIAL_ENEMIES,
  ENEMY_MOVE_INTERVAL,
  LEVEL_TIME,
  INITIAL_PLAYER_STATS,
  POWERUP_DROP_CHANCE
} from './constants';
import type { TileType, Position, Bomb, Enemy, GameState, FlyerParticle, GameOverReason, PowerUp, PlayerStats, FeedbackMessage } from './types';
import { TileType as TileEnum, PowerUpType } from './types';

const App: React.FC = () => {
  const [board, setBoard] = useState<TileType[][]>(LEVEL_1_MAP);
  const [playerPos, setPlayerPos] = useState<Position>(PLAYER_START_POS);
  const [playerStats, setPlayerStats] = useState<PlayerStats>(INITIAL_PLAYER_STATS);
  const [isPlayerGlowing, setIsPlayerGlowing] = useState(false);
  const [enemies, setEnemies] = useState<Enemy[]>(INITIAL_ENEMIES);
  const [bombs, setBombs] = useState<Bomb[]>([]);
  const [explosions, setExplosions] = useState<Position[]>([]);
  const [powerUps, setPowerUps] = useState<PowerUp[]>([]);
  const [flyerParticles, setFlyerParticles] = useState<FlyerParticle[]>([]);
  const [feedbackMessages, setFeedbackMessages] = useState<FeedbackMessage[]>([]);
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [isShaking, setIsShaking] = useState(false);
  const [timeLeft, setTimeLeft] = useState(LEVEL_TIME);
  const [gameOverReason, setGameOverReason] = useState<GameOverReason | null>(null);

  const resetGame = () => {
    setBoard(LEVEL_1_MAP.map(row => [...row]));
    setPlayerPos(PLAYER_START_POS);
    setPlayerStats(INITIAL_PLAYER_STATS);
    setEnemies(INITIAL_ENEMIES);
    setBombs([]);
    setExplosions([]);
    setPowerUps([]);
    setFlyerParticles([]);
    setFeedbackMessages([]);
    setScore(0);
    setTimeLeft(LEVEL_TIME);
    setGameOverReason(null);
    setGameState('ready');
  };
  
  // Transition from ready to playing to prevent race conditions
  useEffect(() => {
    if (gameState === 'ready') {
      const timer = setTimeout(() => setGameState('playing'), 50);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  const isWalkable = (pos: Position, currentBoard: TileType[][]) => {
    if (pos.x < 0 || pos.x >= BOARD_WIDTH || pos.y < 0 || pos.y >= BOARD_HEIGHT) {
      return false;
    }
    const tile = currentBoard[pos.y][pos.x];
    return tile === TileEnum.FLOOR;
  };

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (gameState !== 'playing') return;

    setPlayerPos(prevPos => {
      let newPos = { ...prevPos };
      if (e.key === 'ArrowUp') newPos.y -= 1;
      else if (e.key === 'ArrowDown') newPos.y += 1;
      else if (e.key === 'ArrowLeft') newPos.x -= 1;
      else if (e.key === 'ArrowRight') newPos.x += 1;
      else if (e.key === ' ') {
        e.preventDefault();
        if (bombs.length < playerStats.maxBombs && !bombs.some(b => b.position.x === prevPos.x && b.position.y === prevPos.y)) {
          setBombs(prevBombs => [...prevBombs, { position: prevPos, timer: Date.now() + BOMB_TIMER, range: playerStats.bombRange }]);
        }
        return prevPos;
      }

      return isWalkable(newPos, board) ? newPos : prevPos;
    });
  }, [gameState, board, bombs, playerStats]);

  // Game loop for enemies
  useEffect(() => {
    if (gameState !== 'playing') return;

    const enemyInterval = setInterval(() => {
      setEnemies(prevEnemies =>
        prevEnemies.map(enemy => {
          const directions = [{ x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 }];
          const randomDir = directions[Math.floor(Math.random() * directions.length)];
          const newPos = { x: enemy.position.x + randomDir.x, y: enemy.position.y + randomDir.y };

          if (isWalkable(newPos, board)) {
            return { ...enemy, position: newPos };
          }
          return enemy;
        })
      );
    }, ENEMY_MOVE_INTERVAL);

    return () => clearInterval(enemyInterval);
  }, [gameState, board]);
  
  // Game Timer
  useEffect(() => {
    if (gameState !== 'playing') return;

    if (timeLeft <= 0) {
      setGameState('gameOver');
      setGameOverReason('timeUp');
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timerId);
  }, [gameState, timeLeft]);

  // Bomb and explosion logic
  useEffect(() => {
    if (gameState !== 'playing') return;

    const bombTick = setTimeout(() => {
        const now = Date.now();
        const explodingBombs = bombs.filter(b => now >= b.timer);
        if (explodingBombs.length > 0) {
            let newExplosions: Position[] = [];
            let newBoard = [...board.map(row => [...row])];
            let newPowerUps: PowerUp[] = [];
            
            explodingBombs.forEach(bomb => {
                newExplosions.push(bomb.position);
                const directions = [{ x: 0, y: 1 }, { x: 0, y: -1 }, { x: 1, y: 0 }, { x: -1, y: 0 }];

                directions.forEach(dir => {
                    for (let i = 1; i <= bomb.range; i++) {
                        const pos = { x: bomb.position.x + dir.x * i, y: bomb.position.y + dir.y * i };
                        if (pos.x < 0 || pos.x >= BOARD_WIDTH || pos.y < 0 || pos.y >= BOARD_HEIGHT) break;
                        
                        const tile = newBoard[pos.y][pos.x];
                        if (tile === TileEnum.WALL) break;

                        newExplosions.push(pos);
                        
                        if (tile === TileEnum.PARTITION) {
                            newBoard[pos.y][pos.x] = TileEnum.FLOOR;
                            setScore(s => s + 10);
                            if (Math.random() < POWERUP_DROP_CHANCE) {
                                const powerUpTypes = Object.values(PowerUpType).filter(v => !isNaN(Number(v))) as PowerUpType[];
                                const randomType = powerUpTypes[Math.floor(Math.random() * powerUpTypes.length)];
                                if (!powerUps.some(p => p.position.x === pos.x && p.position.y === pos.y)) {
                                    newPowerUps.push({ position: pos, type: randomType });
                                }
                            }
                            break;
                        }
                    }
                });
            });
            
            if (newExplosions.length > 0) {
                setIsShaking(true);
                setTimeout(() => setIsShaking(false), 300);
            }

            setExplosions(prev => [...prev, ...newExplosions]);
            if (newPowerUps.length > 0) {
                setPowerUps(prev => [...prev, ...newPowerUps]);
            }
            
            const defeatedEnemies: Enemy[] = [];
            const nextEnemies = enemies.filter(enemy => {
                const isHit = newExplosions.some(exp => exp.x === enemy.position.x && exp.y === enemy.position.y);
                if (isHit) {
                    setScore(s => s + 100);
                    defeatedEnemies.push(enemy);
                }
                return !isHit;
            });
            
            if (defeatedEnemies.length > 0) {
                const newParticles: FlyerParticle[] = [];
                defeatedEnemies.forEach(enemy => {
                    for (let i = 0; i < 5; i++) {
                        newParticles.push({
                            id: `flyer-${enemy.id}-${Date.now()}-${i}`,
                            pos: enemy.position,
                            style: { transform: 'translate(0, 0) rotate(0)', opacity: 1 },
                        });
                    }
                });
                setFlyerParticles(current => [...current, ...newParticles]);

                setTimeout(() => {
                    setFlyerParticles(current => current.map(p => {
                        const isNew = newParticles.find(np => np.id === p.id);
                        if (isNew) {
                            const angle = Math.random() * 2 * Math.PI;
                            const distance = 40 + Math.random() * 40;
                            const rotation = Math.random() * 720 - 360;
                            return {
                                ...p,
                                style: {
                                    transform: `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) rotate(${rotation}deg)`,
                                    opacity: 0,
                                }
                            };
                        }
                        return p;
                    }));
                }, 50);

                setTimeout(() => {
                    setFlyerParticles(current => current.filter(p => !newParticles.some(np => np.id === p.id)));
                }, 1050);
            }

            if (newExplosions.some(exp => exp.x === playerPos.x && exp.y === playerPos.y)) {
                setGameState('gameOver');
                setGameOverReason('hit');
            } else if (nextEnemies.length === 0) {
                setGameState('levelClear');
            }
            
            setEnemies(nextEnemies);
            setBoard(newBoard);
            setBombs(currentBombs => currentBombs.filter(b => !explodingBombs.some(eb => eb.position.x === b.position.x && eb.position.y === b.position.y)));

            setTimeout(() => {
                setExplosions(currentExplosions => currentExplosions.filter(exp => !newExplosions.some(newExp => newExp.x === exp.x && newExp.y === exp.y)));
            }, EXPLOSION_TIMER);
        }
    }, 100);

    return () => clearTimeout(bombTick);
  }, [bombs, board, playerPos, enemies, gameState, powerUps]);
  
  // Player-enemy collision check
  useEffect(() => {
      if (gameState === 'playing' && enemies.some(e => e.position.x === playerPos.x && e.position.y === playerPos.y)) {
          setGameState('gameOver');
          setGameOverReason('hit');
      }
  }, [playerPos, enemies, gameState]);
  
  // Player-powerup collision check
  useEffect(() => {
    if (gameState !== 'playing') return;
    const collectedPowerUp = powerUps.find(p => p.position.x === playerPos.x && p.position.y === playerPos.y);
    if (collectedPowerUp) {
      let message = '';
      setPlayerStats(stats => {
        const newStats = { ...stats };
        switch (collectedPowerUp.type) {
          case PowerUpType.Flame:
            newStats.bombRange++;
            message = '+1 Flame!';
            break;
          case PowerUpType.Bomb:
            newStats.maxBombs++;
            message = '+1 Bomb!';
            break;
          case PowerUpType.Speed:
            newStats.speed = Math.max(0.05, stats.speed - 0.02);
            message = 'Speed Up!';
            break;
        }
        return newStats;
      });
      
      const messageId = `feedback-${Date.now()}`;
      setFeedbackMessages(prev => [...prev, {id: messageId, text: message, position: playerPos}]);
      setTimeout(() => {
        setFeedbackMessages(prev => prev.filter(m => m.id !== messageId));
      }, 1500);

      setIsPlayerGlowing(true);
      setTimeout(() => setIsPlayerGlowing(false), 400);

      setPowerUps(prev => prev.filter(p => p !== collectedPowerUp));
    }
  }, [playerPos, powerUps, gameState]);


  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  const getTileClass = (tile: TileType) => {
    switch (tile) {
      case TileEnum.WALL: return 'wall';
      case TileEnum.PARTITION: return 'partition';
      default: return 'floor';
    }
  };
  
  const getPowerUpIcon = (type: PowerUpType) => {
    switch (type) {
        case PowerUpType.Flame: return '🔥';
        case PowerUpType.Bomb: return '💣';
        case PowerUpType.Speed: return '👟';
    }
  }

  if (gameState === 'start') {
    return (
      <div className="text-center">
        <h1 className="text-4xl sm:text-5xl font-bold mb-2 text-cyan-400">オフィス爆弾戦士！</h1>
        <h2 className="text-xl sm:text-2xl mb-8 text-gray-300">ビッグサイト大作戦</h2>
        <p className="mb-4">操作方法: [矢印キー]で移動、[スペース]で爆弾設置</p>
        <button onClick={resetGame} className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xl shadow-lg">
          ゲーム開始 (Start Game)
        </button>
      </div>
    );
  }
  
  const getGameOverMessage = () => {
    if (gameState === 'levelClear') return 'Level Clear!';
    if (gameOverReason === 'timeUp') return "Time's Up!";
    return 'Game Over';
  };

  if (gameState === 'gameOver' || gameState === 'levelClear') {
      return (
         <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-cyan-400">{getGameOverMessage()}</h1>
            <p className="text-2xl mb-6">Score: {score}</p>
            <button onClick={resetGame} className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xl shadow-lg">
              もう一度プレイ (Play Again)
            </button>
        </div>
      );
  }

  return (
    <div className="flex flex-col items-center">
        <div className="hud" style={{ width: BOARD_WIDTH * TILE_SIZE }}>
            <div className="hud-item">
                <div>Score:</div> <div className="hud-value">{score}</div>
            </div>
            <div className="hud-item stats">
                <span>💣<span className="hud-value">{playerStats.maxBombs}</span></span>
                <span>🔥<span className="hud-value">{playerStats.bombRange}</span></span>
                <span>👟<span className="hud-value">{(1/playerStats.speed).toFixed(1)}</span></span>
            </div>
            <div className={`hud-item timer ${timeLeft <= 10 ? 'timer-warning' : ''}`}>
                <div>Time:</div><div className="hud-value">{Math.floor(timeLeft / 60)}:{('0' + (timeLeft % 60)).slice(-2)}</div>
            </div>
        </div>
      <div
        className={isShaking ? 'shake' : ''}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${TILE_SIZE}px)`,
          position: 'relative',
          width: BOARD_WIDTH * TILE_SIZE,
          boxShadow: '0 0 20px rgba(0, 200, 255, 0.4)',
          border: '2px solid rgba(0, 200, 255, 0.2)',
        }}
      >
        {board.map((row, y) =>
          row.map((tile, x) => (
            <div
              key={`${x}-${y}`}
              className={`tile ${getTileClass(tile)}`}
              style={{ width: TILE_SIZE, height: TILE_SIZE }}
            />
          ))
        )}

        {powerUps.map((powerUp, i) => (
            <div key={`powerup-${i}`} className="powerup" style={{
                position: 'absolute',
                left: powerUp.position.x * TILE_SIZE,
                top: powerUp.position.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                zIndex: 5
            }}>
                <div className={
                    powerUp.type === PowerUpType.Flame ? 'powerup-flame' :
                    powerUp.type === PowerUpType.Bomb ? 'powerup-bomb' : 'powerup-speed'
                }>
                    {getPowerUpIcon(powerUp.type)}
                </div>
            </div>
        ))}

        <div
          className="character-container"
          style={{
            position: 'absolute',
            left: playerPos.x * TILE_SIZE,
            top: playerPos.y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
            transition: `left ${playerStats.speed}s linear, top ${playerStats.speed}s linear`,
            zIndex: 10,
          }}
        >
          <div className={`player ${isPlayerGlowing ? 'glow' : ''}`}>
            <div className="head" />
            <div className="body suit" />
            <div className="tie" />
            <div className="arm left" />
            <div className="arm right" />
          </div>
        </div>
        {enemies.map(enemy => (
           <div
            key={enemy.id}
            className="character-container"
            style={{
              position: 'absolute',
              left: enemy.position.x * TILE_SIZE,
              top: enemy.position.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              transition: 'left 0.5s linear, top 0.5s linear',
              zIndex: 9,
            }}
          >
            <div className="enemy">
              <div className="head" />
              <div className="body t-shirt" />
              <div className="arm left" />
              <div className="arm right" />
              <div className="flyer-hand" />
            </div>
          </div>
        ))}
        {bombs.map((bomb, i) => {
          const timeRemaining = bomb.timer - Date.now();
          const fusePercentage = (BOMB_TIMER - timeRemaining) / BOMB_TIMER;
          let fuseClass = 'fuse-slow';
          if (fusePercentage > 0.85) {
            fuseClass = 'fuse-critical';
          } else if (fusePercentage > 0.6) {
            fuseClass = 'fuse-fast';
          }
          
          return (
            <div
              key={`bomb-${i}`}
              className={`bomb ${fuseClass}`}
              style={{
                position: 'absolute',
                left: bomb.position.x * TILE_SIZE,
                top: bomb.position.y * TILE_SIZE,
                width: TILE_SIZE,
                height: TILE_SIZE,
                zIndex: 8,
              }}
            >
              VIP
            </div>
          );
        })}
        {explosions.map((pos, i) => (
           <div
            key={`exp-${i}`}
            className="explosion"
            style={{
              position: 'absolute',
              left: pos.x * TILE_SIZE,
              top: pos.y * TILE_SIZE,
              width: TILE_SIZE,
              height: TILE_SIZE,
              zIndex: 20,
            }}
          />
        ))}
        {flyerParticles.map((particle) => (
          <div
            key={particle.id}
            className="flyer-particle"
            style={{
                left: particle.pos.x * TILE_SIZE + (TILE_SIZE / 2 - 5), // Center particle
                top: particle.pos.y * TILE_SIZE + (TILE_SIZE / 2 - 7),
                zIndex: 30,
                ...particle.style,
            }}
           />
        ))}
        {feedbackMessages.map(msg => (
          <div key={msg.id} className="feedback-message" style={{
            left: msg.position.x * TILE_SIZE,
            top: msg.position.y * TILE_SIZE,
          }}>
            {msg.text}
          </div>
        ))}
      </div>
    </div>
  );
};

export default App;