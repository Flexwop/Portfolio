document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('backgroundCanvas');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const numberOfParticles = 50;
    let connections = [];
    let animationFrameId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });

    resizeCanvas();

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 2;
            this.speedX = (Math.random() - 0.5) * 1.5;
            this.speedY = (Math.random() - 0.5) * 1.5;
            this.color = `hsla(${Math.random() * 60 + 200}, 100%, 70%, 0.5)`;
        }

        update() {
            // Update position
            this.x += this.speedX;
            this.y += this.speedY;

            // Bounce off edges
            if (this.x > canvas.width || this.x < 0) this.speedX *= -1;
            if (this.y > canvas.height || this.y < 0) this.speedY *= -1;

            // Keep particles within bounds
            this.x = Math.max(0, Math.min(this.x, canvas.width));
            this.y = Math.max(0, Math.min(this.y, canvas.height));
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();

            // Add glow effect
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.color;
        }
    }

    function initParticles() {
        particles = [];
        for (let i = 0; i < numberOfParticles; i++) {
            particles.push(new Particle());
        }
    }

    function connectParticles() {
        connections = [];
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < 150) {
                    connections.push({
                        start: particles[i],
                        end: particles[j],
                        opacity: 1 - (distance / 150)
                    });
                }
            }
        }
    }

    function drawConnections() {
        connections.forEach(connection => {
            ctx.beginPath();
            ctx.moveTo(connection.start.x, connection.start.y);
            ctx.lineTo(connection.end.x, connection.end.y);
            ctx.strokeStyle = `rgba(147, 197, 253, ${connection.opacity * 0.5})`; // Blue-ish color
            ctx.lineWidth = 1;
            ctx.stroke();
        });
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Update and draw connections
        connectParticles();
        drawConnections();

        // Add subtle mouse interaction
        if (mousePos) {
            particles.forEach(particle => {
                const dx = mousePos.x - particle.x;
                const dy = mousePos.y - particle.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const force = (100 - distance) / 100;
                    particle.x -= dx * force * 0.03;
                    particle.y -= dy * force * 0.03;
                }
            });
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    // Mouse interaction
    let mousePos = null;
    canvas.addEventListener('mousemove', (e) => {
        mousePos = {
            x: e.clientX,
            y: e.clientY
        };
    });

    canvas.addEventListener('mouseleave', () => {
        mousePos = null;
    });

    // Start the animation
    initParticles();
    animate();

    // Cleanup function
    return () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    };
});
