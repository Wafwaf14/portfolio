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

const animatedLines = [
    {
        // Horizontal line - responsive positioning
        startX: () => {
            if (window.innerWidth <= 480) {
                // Mobile: centered
                return width * 0.23;
            } else if (window.innerWidth <= 768) {
                // Tablet
                return width * 0.38;
            } else {
                // Desktop: original position
                return width * 0.40;
            }
        },
        startY: () => {
            if (window.innerWidth <= 480) {
                // Mobile: centered vertically
                return height * 0.64;
            } else {
                // Desktop/Tablet: below albums
                return height * 0.71;
            }
        },
        endX: () => {
            if (window.innerWidth <= 480) {
                // Mobile: centered
                return width * 0.78;
            } else if (window.innerWidth <= 768) {
                // Tablet
                return width * 0.62;
            } else {
                // Desktop: original position
                return width * 0.60;
            }
        },
        endY: () => {
            if (window.innerWidth <= 480) {
                // Mobile: centered vertically
                return height * 0.64;
            } else {
                // Desktop/Tablet: below albums
                return height * 0.71;
            }
        },
        dots: 2,
        baseColor: "255, 200, 0"
    },
    {
        // Vertical line - responsive positioning
        startX: () => {
            if (window.innerWidth <= 480) {
                // Mobile: centered horizontally
                return width * 0.78;
            } else {
                // Desktop/Tablet: right side
                return width * 0.6;
            }
        },
        startY: () => {
            if (window.innerWidth <= 480) {
                // Mobile: start higher
                return height * 0.38;
            } else {
                // Desktop/Tablet: original position
                return height * 0.32;
            }
        },
        endX: () => {
            if (window.innerWidth <= 480) {
                // Mobile: centered horizontally
                return width * 0.78;
            } else {
                // Desktop/Tablet: right side
                return width * 0.6;
            }
        },
        endY: () => {
            if (window.innerWidth <= 480) {
                // Mobile: end lower
                return height * 0.64;
            } else {
                // Desktop/Tablet: original position
                return height * 0.71;
            }
        },
        dots: 2,
        baseColor: "255, 200, 0"
    }
];
function draw() {
    ctx.clearRect(0, 0, width, height);

    // Use continuous animation based on scroll
    const animationSpeed = scrollProgress * 0.01;

    ctx.lineWidth = 1;
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


    let lineOpacity = 1;
    if (scrollProgress > 100) {
        lineOpacity = Math.max(0, 1 - (scrollProgress - 100) / 200);
    }

 
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
    'images/album3.png',
    'images/album4.jpg',
    'images/album2.png',
    'images/album6.jpg'
];

// SOLUTION 1: Preload all images to avoid loading delay
function preloadImages() {
    firstAlbumImages.forEach(src => {
        const img = new Image();
        img.src = src;
    });
}

// Configuration for image transition
const IMAGE_TRANSITION_CONFIG = {
    pixelsPerImage: 100,  // Images change every 100px of scroll
    fadeInDuration: 300,  // Duration of fade-in effect in milliseconds
    smoothTransition: true // Enable smooth transition between images
};

// Track current image for smooth transitions
let currentImageIndex = 0;
let isTransitioning = false;

// SOLUTION 2: Dynamic spacer height based on screen size
function setDynamicSpacerHeight() {
    const spacer = document.querySelector('.spacer');
    if (spacer) {
        // Calculate based on viewport height and required scroll distance
        const viewportHeight = window.innerHeight;
        const numberOfImages = firstAlbumImages.length;
        const scrollForImages = numberOfImages * IMAGE_TRANSITION_CONFIG.pixelsPerImage;
        const scrollForAlbums = 800; // Additional scroll for album cascade effect
        
        // Set minimum height based on screen size
        let spacerHeight;
        if (window.innerWidth <= 480) {
            // Mobile phones
            spacerHeight = Math.max(1200, viewportHeight + scrollForImages + scrollForAlbums);
        } else if (window.innerWidth <= 768) {
            // Tablets
            spacerHeight = Math.max(1500, viewportHeight + scrollForImages + scrollForAlbums);
        } else if (window.innerWidth <= 1366) {
            // Small laptops
            spacerHeight = Math.max(1800, viewportHeight + scrollForImages + scrollForAlbums);
        } else {
            // Desktop
            spacerHeight = Math.max(2000, viewportHeight + scrollForImages + scrollForAlbums);
        }
        
        spacer.style.height = spacerHeight + 'px';
        
        console.log('Spacer height set to:', spacerHeight, 'px for viewport:', viewportHeight, 'px');
    }
}

// Initialize first album image immediately (don't wait for scroll)
function initializeFirstAlbum() {
    const firstAlbum = albums[0];
    const firstAlbumImg = firstAlbum?.querySelector('img');
    
    if (firstAlbumImg && firstAlbumImages[0]) {
        firstAlbumImg.src = firstAlbumImages[0];
        firstAlbumImg.dataset.currentIndex = '0';
        // Make first album visible immediately
        firstAlbum.style.opacity = '1';
       // firstAlbum.style.transform = 'translate(-50%, -50%) scale(1)';
    }
}

function animateAlbums() {
    const scrollY = window.scrollY;
    
    // Update scroll progress for continuous animation
    scrollProgress = scrollY;
    
    // Handle first album image cycling with slower transition
    const firstAlbum = albums[0];
    const firstAlbumImg = firstAlbum?.querySelector('img');
    
    if (firstAlbumImg) {
        // Calculate image index with configurable scroll distance
        const newImageIndex = Math.min(
            Math.floor(scrollY / IMAGE_TRANSITION_CONFIG.pixelsPerImage), 
            firstAlbumImages.length - 1
        );
        
        // Only change image if it's different from current and not already transitioning
        if (newImageIndex !== currentImageIndex && !isTransitioning) {
            currentImageIndex = newImageIndex;
            
            if (IMAGE_TRANSITION_CONFIG.smoothTransition) {
                // Add smooth transition effect
                isTransitioning = true;
                
                // Fade out current image
                firstAlbumImg.style.opacity = '0.7';
                firstAlbumImg.style.transition = `opacity ${IMAGE_TRANSITION_CONFIG.fadeInDuration / 2}ms ease`;
                
                setTimeout(() => {
                    // Change image source
                    firstAlbumImg.src = firstAlbumImages[currentImageIndex];
                    firstAlbumImg.dataset.currentIndex = currentImageIndex;
                    
                    // Fade in new image
                    setTimeout(() => {
                        firstAlbumImg.style.opacity = '1';
                        setTimeout(() => {
                            isTransitioning = false;
                        }, IMAGE_TRANSITION_CONFIG.fadeInDuration / 2);
                    }, 50);
                }, IMAGE_TRANSITION_CONFIG.fadeInDuration / 2);
            } else {
                // Direct image change without transition
                firstAlbumImg.src = firstAlbumImages[currentImageIndex];
                firstAlbumImg.dataset.currentIndex = currentImageIndex;
            }
        }
    }
    
    // Show/hide albums based on scroll position
    // Adjusted thresholds to account for slower image transitions
    const scrollThresholds = [0, 500, 600, 700, 800];
    
    albums.forEach((album, index) => {
        if (index === 0) {
            // First album: show in cascade after cycling through images
            if (scrollY > scrollThresholds[1]) {
                album.classList.add('show');
            } else if (scrollY <= 250) {
                // Keep first album centered when not scrolling
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

// Update spacer height on window resize
window.addEventListener('resize', () => {
    resize();
    setDynamicSpacerHeight();
});

// Scroll event for updating scroll progress and album animation
window.addEventListener("scroll", () => {
    animateAlbums();
});

// Initialize everything when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    preloadImages();
    initializeFirstAlbum();
    setDynamicSpacerHeight();
    draw();
    animateAlbums();
});

// Also initialize if script runs after DOM load
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    preloadImages();
    initializeFirstAlbum();
    setDynamicSpacerHeight();
    draw();
    animateAlbums();
}