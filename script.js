const canvas = document.getElementById("bg");
const ctx = canvas.getContext("2d");
let width, height;
let scrollProgress = 0;
let animationFrame;

function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
}
window.addEventListener("resize", resize);
resize();

// Circle configurations for background animation
const circles = [
    { cx: 0, cy: 0, baseRadius: 400, start: 0, end: Math.PI/2, dots: 3, factor: 0.3, dir: 1 },
    { cx: () => width, cy: 0, baseRadius: 350, start: Math.PI/2, end: Math.PI, dots: 2, factor: -0.2, dir: -1 },
    { cx: () => width, cy: () => height, baseRadius: 500, start: Math.PI, end: 1.5*Math.PI, dots: 4, factor: 0.4, dir: 1 },
    { cx: 0, cy: () => height, baseRadius: 250, start: -Math.PI/2, end: 0, dots: 1, factor: -0.15, dir: -1 },
];

// Animated lines configuration - horizontal and vertical under the first album
const animatedLines = [
    {
        // Horizontal line - positioned below the album
        startX: () => width * 0.40,   
        startY: () => height * 0.71,  
        endX: () => width * 0.60,     
        endY: () => height * 0.71,    
        dots: 2,
        baseColor: "255, 200, 0" // Store RGB values separately for opacity control
    },
    {
        // Vertical line - positioned to the right and below
        startX: () => width * 0.6,    
        startY: () => height * 0.32,   
        endX: () => width * 0.6,      
        endY: () => height * 0.71,    
        dots: 2,
        baseColor: "255, 200, 0"
    }
];

function draw() {
    ctx.clearRect(0, 0, width, height);

    // Use continuous animation based on scroll
    const animationSpeed = scrollProgress * 0.01;

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = "rgba(0, 0, 0, 0.2)";
    
    circles.forEach((c, i) => {
        let cx = typeof c.cx === "function" ? c.cx() : c.cx;
        let cy = typeof c.cy === "function" ? c.cy() : c.cy;
        let radius = c.baseRadius + scrollProgress * c.factor * 0.1;

        // Draw arc
        ctx.beginPath();
        ctx.arc(cx, cy, radius, c.start, c.end);
        ctx.stroke();

        // Animated dots - continuous movement
        for(let j = 0; j < c.dots; j++) {
            let progress = (animationSpeed * c.dir + j / c.dots) % 1;
            let angle = c.start + (c.end - c.start) * progress;
            let x = cx + radius * Math.cos(angle);
            let y = cy + radius * Math.sin(angle);

            let dotSize = 4 + Math.sin(progress * 2 * Math.PI + j) * 1.5;

            // Main dot
            ctx.beginPath();
            ctx.fillStyle = "rgba(100, 100, 100, 0.4)";
            ctx.arc(x, y, dotSize, 0, Math.PI * 2);
            ctx.fill();

            // Halo
            ctx.beginPath();
            ctx.fillStyle = "rgba(100, 100, 100, 0.08)";
            ctx.arc(x, y, dotSize + 4, 0, Math.PI * 2);
            ctx.fill();

            // Trail
            let trailAngle = angle - 0.1 * c.dir;
            let tx = cx + radius * Math.cos(trailAngle);
            let ty = cy + radius * Math.sin(trailAngle);
            ctx.beginPath();
            ctx.fillStyle = "rgba(100, 100, 100, 0.2)";
            ctx.arc(tx, ty, dotSize * 0.6, 0, Math.PI * 2);
            ctx.fill();
        }
    });

    // Calculate opacity for animated lines based on scroll
    // Lines start fading at 100px and completely disappear at 300px
    let lineOpacity = 1;
    if (scrollProgress > 100) {
        lineOpacity = Math.max(0, 1 - (scrollProgress - 100) / 200);
    }

    // Only draw animated lines if they have some opacity
    if (lineOpacity > 0) {
        animatedLines.forEach((line, lineIndex) => {
            const lineStartX = line.startX();
            const lineStartY = line.startY();
            const lineEndX = line.endX();
            const lineEndY = line.endY();

            // Draw the line with fading opacity
            ctx.beginPath();
            ctx.strokeStyle = `rgba(${line.baseColor}, ${0.8 * lineOpacity})`;
            ctx.lineWidth = 2;
            ctx.moveTo(lineStartX, lineStartY);
            ctx.lineTo(lineEndX, lineEndY);
            ctx.stroke();

            // Draw animated dots on the line
            for(let i = 0; i < line.dots; i++) {
                // Offset animation for each line
                let progress = (animationSpeed * 0.5 + i / line.dots + lineIndex * 0.5) % 1;
                let x = lineStartX + (lineEndX - lineStartX) * progress;
                let y = lineStartY + (lineEndY - lineStartY) * progress;

                // Pulsing effect
                let dotSize = 6 + Math.sin(animationSpeed * 2 + i * Math.PI + lineIndex) * 2;

                // Outer glow with fading opacity
                ctx.beginPath();
                ctx.fillStyle = `rgba(${line.baseColor}, ${0.2 * lineOpacity})`;
                ctx.arc(x, y, dotSize + 6, 0, Math.PI * 2);
                ctx.fill();

                // Main dot with fading opacity
                ctx.beginPath();
                ctx.fillStyle = `rgba(${line.baseColor}, ${0.8 * lineOpacity})`;
                ctx.arc(x, y, dotSize, 0, Math.PI * 2);
                ctx.fill();

                // Inner highlight with fading opacity
                ctx.beginPath();
                ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * lineOpacity})`;
                ctx.arc(x, y, dotSize * 0.3, 0, Math.PI * 2);
                ctx.fill();
            }
        });
    }

    // Continue animation
    animationFrame = requestAnimationFrame(draw);
}

// Album animation logic
const albums = document.querySelectorAll('.album');
const container = document.querySelector('.container');

// Array of images for the first album
const firstAlbumImages = [
    'images/album6.jpg',
    'images/album3.png',  // Add your second image path
    'images/album4.jpg',  // Add your third image path
    'images/album2.png',  // Add your fourth image path
    'images/album6.jpg'   // Add your fifth image path
];

function animateAlbums() {
    const scrollY = window.scrollY;
    
    // Update scroll progress for continuous animation
    scrollProgress = scrollY;
    
    // Handle first album image cycling
    const firstAlbum = albums[0];
    const firstAlbumImg = firstAlbum.querySelector('img');
    
    // Change image based on scroll position (every 50px of scroll changes image)
    const imageIndex = Math.min(Math.floor(scrollY / 50), firstAlbumImages.length - 1);
    
    // Only change image if it's different from current
    if (firstAlbumImg.dataset.currentIndex !== String(imageIndex)) {
        firstAlbumImg.src = firstAlbumImages[imageIndex];
        firstAlbumImg.dataset.currentIndex = imageIndex;
    }
    
    // Show/hide albums based on scroll position
    // Increased thresholds to give time for image cycling
    const scrollThresholds = [0, 250, 350, 450, 550];
    
    albums.forEach((album, index) => {
        if (index === 0) {
            // First album: show in cascade after cycling through images
            if (scrollY > 250) {
                album.classList.add('show');
            } else {
                album.classList.remove('show');
            }
        } else {
            // Other albums: show/hide based on threshold
            if (scrollY > scrollThresholds[index]) {
                album.classList.add('show');
            } else {
                album.classList.remove('show');
            }
        }
    });
}

// Scroll event for updating scroll progress and album animation
window.addEventListener("scroll", () => {
    animateAlbums();
});

// Start continuous animation
draw();
animateAlbums();