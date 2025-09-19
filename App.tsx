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
} from './constants';
import type { TileType, Position, Bomb, Enemy, GameState, FlyerParticle } from './types';
import { TileType as TileEnum } from './types';

const App: React.FC = () => {
  const [board, setBoard] = useState<TileType[][]>(LEVEL_1_MAP);
  const [playerPos, setPlayerPos] = useState<Position>(PLAYER_START_POS);
  const [enemies, setEnemies] = useState<Enemy[]>(INITIAL_ENEMIES);
  const [bombs, setBombs] = useState<Bomb[]>([]);
  const [explosions, setExplosions] = useState<Position[]>([]);
  const [flyerParticles, setFlyerParticles] = useState<FlyerParticle[]>([]);
  const [gameState, setGameState] = useState<GameState>('start');
  const [score, setScore] = useState(0);
  const [isShaking, setIsShaking] = useState(false);

  const resetGame = () => {
    setBoard(LEVEL_1_MAP.map(row => [...row]));
    setPlayerPos(PLAYER_START_POS);
    setEnemies(INITIAL_ENEMIES);
    setBombs([]);
    setExplosions([]);
    setFlyerParticles([]);
    setScore(0);
    setGameState('playing');
  };

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
        if (!bombs.some(b => b.position.x === prevPos.x && b.position.y === prevPos.y)) {
          setBombs(prevBombs => [...prevBombs, { position: prevPos, timer: Date.now() + BOMB_TIMER, range: 2 }]);
        }
        return prevPos;
      }

      return isWalkable(newPos, board) ? newPos : prevPos;
    });
  }, [gameState, board, bombs]);

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
  
  // Bomb and explosion logic
  useEffect(() => {
    if (gameState !== 'playing') return;

    const bombTick = setTimeout(() => {
        const now = Date.now();
        const explodingBombs = bombs.filter(b => now >= b.timer);
        if (explodingBombs.length > 0) {
            let newExplosions: Position[] = [];
            let newBoard = [...board.map(row => [...row])];
            
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
            
            const defeatedEnemies: Enemy[] = [];
            const nextEnemies = enemies.filter(enemy => {
                const isHit = newExplosions.some(exp => exp.x === enemy.position.x && exp.y === enemy.position.y);
                if (isHit) {
                    setScore(s => s + 100);
                    defeatedEnemies.push(enemy);
                }
                return !isHit;
            });
            
            // Create flyer particles for defeated enemies
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
  }, [bombs, board, playerPos, enemies, gameState]);
  
  // Player-enemy collision check
  useEffect(() => {
      if (gameState === 'playing' && enemies.some(e => e.position.x === playerPos.x && e.position.y === playerPos.y)) {
          setGameState('gameOver');
      }
  }, [playerPos, enemies, gameState]);

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
  
  if (gameState === 'gameOver' || gameState === 'levelClear') {
      return (
         <div className="text-center">
            <h1 className="text-5xl font-bold mb-4 text-cyan-400">{gameState === 'gameOver' ? 'Game Over' : 'Level Clear!'}</h1>
            <p className="text-2xl mb-6">Score: {score}</p>
            <button onClick={resetGame} className="px-8 py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg text-xl shadow-lg">
              もう一度プレイ (Play Again)
            </button>
        </div>
      );
  }

  return (
    <div className="flex flex-col items-center">
        <div className="w-full flex justify-between items-center mb-4 px-2" style={{ width: BOARD_WIDTH * TILE_SIZE }}>
            <h1 className="text-lg sm:text-xl font-bold text-cyan-400">Office Bomber</h1>
            <div className="text-md sm:text-lg">Score: {score}</div>
            <div className="text-md sm:text-lg">Enemies: {enemies.length}</div>
        </div>
      <div
        className={isShaking ? 'shake' : ''}
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${BOARD_WIDTH}, ${TILE_SIZE}px)`,
          position: 'relative',
          width: BOARD_WIDTH * TILE_SIZE,
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
        <div
          className="character-container"
          style={{
            position: 'absolute',
            left: playerPos.x * TILE_SIZE,
            top: playerPos.y * TILE_SIZE,
            width: TILE_SIZE,
            height: TILE_SIZE,
            transition: 'left 0.1s linear, top 0.1s linear',
            zIndex: 10,
          }}
        >
          <div className="player">
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
        {bombs.map((bomb, i) => (
          <div
            key={`bomb-${i}`}
            className="bomb"
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
        ))}
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
      </div>
    </div>
  );
};

export default App;