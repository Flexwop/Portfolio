document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let gameStarted = false;
    let score = 0;

    // Set canvas size
    function resizeGameCanvas() {
        const container = canvas.parentElement;
        canvas.width = container.clientWidth - 20; // Account for padding
        canvas.height = Math.min(400, container.clientWidth * 0.6);
    }

    window.addEventListener('resize', resizeGameCanvas);
    resizeGameCanvas();

    // Player ship
    const player = {
        x: canvas.width / 2,
        y: canvas.height - 30,
        width: 30,
        height: 30,
        speed: 5,
        color: '#3B82F6' // Blue
    };

    // Game objects
    let bullets = [];
    let enemies = [];
    let particles = [];

    // Controls
    const keys = {
        ArrowLeft: false,
        ArrowRight: false,
        Space: false
    };

    // Event listeners
    document.addEventListener('keydown', (e) => {
        if (keys.hasOwnProperty(e.code)) {
            keys[e.code] = true;
            if (e.code === 'Space') {
                if (!gameStarted) {
                    gameStarted = true;
                    animate();
                } else {
                    // Reset the game if it has ended
                    resetGame();
                }
            }
        }
    });

    document.addEventListener('keyup', (e) => {
        if (keys.hasOwnProperty(e.code)) {
            keys[e.code] = false;
        }
    });

    // Mobile controls
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!gameStarted) {
            gameStarted = true;
            animate();
            return;
        }
        const touch = e.touches[0];
        const rect = canvas.getBoundingClientRect();
        const touchX = touch.clientX - rect.left;
        
        if (touchX < canvas.width / 2) {
            keys.ArrowLeft = true;
            keys.ArrowRight = false;
        } else {
            keys.ArrowLeft = false;
            keys.ArrowRight = true;
        }
        keys.Space = true;
    });

    canvas.addEventListener('touchend', () => {
        keys.ArrowLeft = false;
        keys.ArrowRight = false;
        keys.Space = false;
    });

    // Game functions
    function createEnemy() {
        if (Math.random() < 0.03) {
            enemies.push({
                x: Math.random() * (canvas.width - 20),
                y: 0,
                width: 20,
                height: 20,
                speed: 2,
                color: '#EF4444' // Red
            });
        }
    }

    function createParticles(x, y, color) {
        for (let i = 0; i < 5; i++) {
            particles.push({
                x,
                y,
                size: Math.random() * 3 + 1,
                speedX: (Math.random() - 0.5) * 5,
                speedY: (Math.random() - 0.5) * 5,
                color,
                life: 1
            });
        }
    }

    function updateParticles() {
        for (let i = particles.length - 1; i >= 0; i--) {
            const particle = particles[i];
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            particle.life -= 0.02;
            
            if (particle.life <= 0) {
                particles.splice(i, 1);
            }
        }
    }

    function shoot() {
        if (keys.Space) {
            bullets.push({
                x: player.x + player.width / 2 - 2,
                y: player.y,
                width: 4,
                height: 10,
                speed: 7,
                color: '#10B981' // Green
            });
        }
    }

    function checkCollisions() {
        for (let i = bullets.length - 1; i >= 0; i--) {
            for (let j = enemies.length - 1; j >= 0; j--) {
                const bullet = bullets[i];
                const enemy = enemies[j];
                
                if (bullet && enemy &&
                    bullet.x < enemy.x + enemy.width &&
                    bullet.x + bullet.width > enemy.x &&
                    bullet.y < enemy.y + enemy.height &&
                    bullet.y + bullet.height > enemy.y) {
                    
                    createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '255, 68, 68');
                    bullets.splice(i, 1);
                    enemies.splice(j, 1);
                    score += 10;
                    break;
                }
            }
        }

        // Check player collision with enemies
        for (let i = enemies.length - 1; i >= 0; i--) {
            const enemy = enemies[i];
            if (player.x < enemy.x + enemy.width &&
                player.x + player.width > enemy.x &&
                player.y < enemy.y + enemy.height &&
                player.y + player.height > enemy.y) {
                
                gameStarted = false;
                createParticles(player.x + player.width / 2, player.y + player.height / 2, '59, 130, 246');
                break;
            }
        }
    }

    function update() {
        // Update player position
        if (keys.ArrowLeft) player.x = Math.max(0, player.x - player.speed);
        if (keys.ArrowRight) player.x = Math.min(canvas.width - player.width, player.x + player.speed);

        // Update bullets
        bullets = bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > 0;
        });

        // Update enemies
        enemies = enemies.filter(enemy => {
            enemy.y += enemy.speed;
            return enemy.y < canvas.height;
        });

        createEnemy();
        checkCollisions();
        updateParticles();
    }

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        if (!gameStarted) {
            // Draw start screen
            ctx.fillStyle = '#FFFFFF';
            ctx.font = '20px Poppins';
            ctx.textAlign = 'center';
            ctx.fillText('Press SPACE or Touch to Start', canvas.width / 2, canvas.height / 2);
            ctx.font = '16px Poppins';
            ctx.fillText('Score: ' + score, canvas.width / 2, canvas.height / 2 + 30);
            return;
        }

        // Draw score
        ctx.fillStyle = '#FFFFFF';
        ctx.font = '16px Poppins';
        ctx.textAlign = 'left';
        ctx.fillText('Score: ' + score, 10, 25);

        // Draw player
        ctx.fillStyle = player.color;
        ctx.beginPath();
        ctx.moveTo(player.x + player.width / 2, player.y);
        ctx.lineTo(player.x + player.width, player.y + player.height);
        ctx.lineTo(player.x, player.y + player.height);
        ctx.closePath();
        ctx.fill();

        // Draw bullets
        bullets.forEach(bullet => {
            ctx.fillStyle = bullet.color;
            ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });

        // Draw enemies
        enemies.forEach(enemy => {
            ctx.fillStyle = enemy.color;
            ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        });

        // Draw particles
        drawParticles();
    }

    function animate() {
        if (!gameStarted) {
            draw();
            return;
        }

        update();
        draw();
        shoot();
        animationFrameId = requestAnimationFrame(animate);
    }

    function resetGame() {
        // Reset game state
        gameStarted = false;
        score = 0;
        bullets = [];
        enemies = [];
        particles = [];
        draw(); // Draw the initial start screen
    }

    // Start the game loop
    draw(); // Draw initial start screen
});
