export default function runParticleCanvas(canvas) {
    const ctx = canvas.getContext('2d');
    
    function generateImagePaths(folder, prefix, start, end, pad = 0) {
        const paths = [];
        for (let i = start; i <= end; i++) {
            const num = pad > 0 ? i.toString().padStart(pad, '0') : i;
            paths.push(`${folder}/${prefix}${num}.png`);
        }
        return paths;
    }

    const cashImagePaths2 = generateImagePaths(
        '/static/img/cash',
        '',
        1,
        7
    );
	//红包雨
	// const cashImagePaths1 = generateImagePaths(
	//     '/static/img/cash',
	//     'money-',
	//     2,
	//     8,
	//     2 // pad with 0, e.g., "02"
	// );
	// const allImagePaths = [...cashImagePaths1, ...cashImagePaths2];
    
    const allImagePaths = [...cashImagePaths2];
    const images = [];
    let loadedImages = 0;

    let effect = null;
    let animationId = null;
    let isRunning = false;
    
    // 加载所有图片资源
    allImagePaths.forEach((src, index) => {
        const img = new Image();
        img.src = src;
        img.onload = () => {
            loadedImages++;
            images[index] = img;
            
            if (loadedImages === allImagePaths.length) {
                startAnimation();
            }
        };
        img.onerror = () => {
            console.error(`Failed to load image: ${src}`);
            loadedImages++;
            if (loadedImages === allImagePaths.length) {
                startAnimation();
            }
        };
    });

    function startAnimation() {
        if (!effect && canvas.isConnected) {
            effect = new Effect(canvas, images.filter(img => img));
            isRunning = true;
            animate();
        }
    }

    class Particle {
        constructor(effect, images) {
            this.effect = effect;
            this.images = images;
            this.reset();
        }
        
        reset() {
            this.x = Math.random() * this.effect.width;
            this.y = -Math.random() * this.effect.height * 0.5;
            this.vy = 2 + Math.random() * 5;
            this.image = this.images[Math.floor(Math.random() * this.images.length)];
            this.decimate = Math.random() * 3 + 3;
            this.imageWidth = this.image ? this.image.width / this.decimate : 30;
            this.imageHeight = this.image ? this.image.height / this.decimate : 30;
            this.startScreenY = (-this.imageHeight * 2);
            this.endScreenY = (this.effect.height + this.imageHeight * 2);
            this.angle = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.05;
            this.opacity = 0.8 + Math.random() * 0.2;
        }
        
        draw(context) {
            if (!this.image) return;
            
            context.save();
            context.globalAlpha = this.opacity;
            context.translate(this.x, this.y);
            context.rotate(this.angle);
            context.drawImage(
                this.image, 
                -this.imageWidth / 2, 
                -this.imageHeight / 2, 
                this.imageWidth, 
                this.imageHeight
            );
            context.restore();
        }
        
        update() {
            this.y += this.vy;
            this.angle += this.rotationSpeed;

            if (this.y >= this.endScreenY) {
                this.reset();
                this.y = this.startScreenY;
                this.x = Math.random() * this.effect.width;
            }
        }
    }

    class Effect {
        constructor(canvas, images) {
            this.canvas = canvas;
            this.width = canvas.width;
            this.height = canvas.height;
            this.particles = [];
            this.numberOfParticles = 100;
            this.images = images;
            this.createParticles();
        }
        
        createParticles() {
            for (let i = 0; i < this.numberOfParticles; i++) {
                this.particles.push(new Particle(this, this.images));
            }
        }
        
        handleParticles(context) {
            this.particles.forEach(particle => {
                particle.draw(context);
                particle.update();
            });
        }
    }

    function animate() {
        if (!isRunning) return;
        console.log("animate start")
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (effect) {
            effect.handleParticles(ctx);
        }
        animationId = requestAnimationFrame(animate);
    }

    function stopAnimation() {
        isRunning = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }
        effect = null;
    }

    // 监听canvas是否从DOM移除
    const observer = new MutationObserver(() => {
        if (!canvas.isConnected) {
            stopAnimation();
            observer.disconnect();
        }
    });
    
    observer.observe(canvas.parentNode, { childList: true });

    return stopAnimation;
}