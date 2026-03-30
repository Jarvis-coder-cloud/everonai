document.addEventListener('DOMContentLoaded', () => {

    // 1. --- SCROLL REVEAL ---
    const reveals = document.querySelectorAll('.reveal');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('active');
        });
    }, { threshold: 0.1 });
    reveals.forEach(reveal => observer.observe(reveal));
    setTimeout(() => {
        reveals.forEach(reveal => {
            const rect = reveal.getBoundingClientRect();
            if (rect.top <= window.innerHeight) reveal.classList.add('active');
        });
    }, 100);

    // 2. --- SUPABASE SETUP ---
    let supabaseClient = null;
    try {
        if (window.supabase) {
            const SUPABASE_URL = 'https://wtkbvdtftkylkypjxrbg.supabase.co';
            const SUPABASE_ANON_KEY = 'sb_publishable_5mil21rFs6YyaL1KY5CURg_1DekHN6i';
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            
            async function updateCounter() {
                try {
                    const { count, error } = await supabaseClient.from('waitlist').select('*', { count: 'exact', head: true });
                    if (!error && count !== null) {
                        const counterEl = document.querySelector('.counter-number');
                        if (counterEl) counterEl.innerText = (3241 + count).toLocaleString();
                    }
                } catch (e) {}
            }
            updateCounter();

            document.querySelectorAll('.waitlist-form').forEach(form => {
                form.addEventListener('submit', async (e) => {
                    e.preventDefault();
                    const btn = form.querySelector('button');
                    const btnText = btn.querySelector('.btn-text');
                    const input = form.querySelector('input');
                    const feedback = form.nextElementSibling;
                    const slider = btn.querySelector('.fill-slider');
                    
                    btn.classList.add('loading');
                    btnText.innerText = 'UPLOADING...';
                    feedback.className = 'form-feedback';
                    feedback.innerText = '';

                    try {
                        const { error } = await supabaseClient.from('waitlist').insert([{ email: input.value }]);
                        if (error) throw (error.code === '23505' ? new Error('DATA ALREADY PRESENT.') : error);
                        btn.classList.remove('loading');
                        btnText.innerText = 'DOCUMENTATION COMPLETE';
                        input.value = '';
                        feedback.classList.add('success');
                        feedback.innerText = '[SYS.UPDATE] NODE ALLOCATED SUCCESSFULLY.';
                        if(slider) slider.style.left = '0';
                        updateCounter();
                        setTimeout(() => {
                            btnText.innerText = 'PRESERVE MY SOUL';
                            feedback.innerText = '';
                            if(slider) slider.style.left = '-100%';
                        }, 5000);
                    } catch (err) {
                        btn.classList.remove('loading');
                        btnText.innerText = 'ERROR';
                        feedback.classList.add('error');
                        feedback.innerText = err.message || '[ERR_500] FAILED.';
                    }
                });
            });
        }
    } catch(err) { console.error(err); }

    // 3. --- GLOBAL NODE MAP ---
    initGlobalMap();

    // 4. --- NEURAL VOICE LAB ---
    initVoiceLab();

    // 5. --- FAQ ACCORDION ---
    document.querySelectorAll('.faq-header').forEach(header => {
        header.addEventListener('click', () => {
            const item = header.parentElement;
            const isActive = item.classList.contains('active');
            document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('active'));
            if (!isActive) item.classList.add('active');
        });
    });

    // 6. --- BACKGROUND PARTICLES ---
    initParticles();
});

// --- MAP LOGIC ---
function initGlobalMap() {
    const canvas = document.getElementById('global-map');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height;
    
    const nodes = [
        { id: 'SVALBARD ARC', x: 0.52, y: 0.15, status: 'ENCRYPTED', lat: '12ms', storage: '1.28 PB', color: '#fff' },
        { id: 'ZURICH NODE', x: 0.51, y: 0.32, status: 'ONLINE', lat: '8ms', storage: '840 TB', color: '#fff' },
        { id: 'TEXAS ARRAY', x: 0.22, y: 0.42, status: 'ENCRYPTED', lat: '15ms', storage: '2.1 PB', color: '#fff' },
        { id: 'BANGALORE HUB', x: 0.72, y: 0.52, status: 'ONLINE', lat: '22ms', storage: '920 TB', color: '#fff' },
        { id: 'TOKYO NODE', x: 0.88, y: 0.40, status: 'ONLINE', lat: '18ms', storage: '1.5 PB', color: '#fff' },
        { id: 'MARS ALPHA', x: 0.90, y: 0.10, status: 'ISOLATED', lat: '480MS', storage: '64 TB', color: '#888' }
    ];

    function resize() {
        width = canvas.parentElement.offsetWidth;
        height = canvas.parentElement.offsetHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    let hoveredNode = null;
    const handleMove = (mx, my) => {
        let found = null;
        nodes.forEach(node => {
            const nx = node.x * width;
            const ny = node.y * height;
            const dist = Math.sqrt((mx - nx)**2 + (my - ny)**2);
            if (dist < 25) found = node; // Increased hit area for touch
        });

        if (found !== hoveredNode) {
            hoveredNode = found;
            if (found) {
                document.getElementById('node-loc').innerText = found.id;
                document.getElementById('node-status').innerText = found.status;
                document.getElementById('node-lat').innerText = found.lat;
                document.getElementById('node-storage').innerText = found.storage;
            }
        }
    };

    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        handleMove(e.clientX - rect.left, e.clientY - rect.top);
    });

    canvas.addEventListener('touchstart', (e) => {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        handleMove(touch.clientX - rect.left, touch.clientY - rect.top);
    }, { passive: true });

    function draw() {
        ctx.clearRect(0, 0, width, height);

        // Draw dotted map (Simulated)
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        for (let i = 0; i < width; i += 15) {
            for (let j = 0; j < height; j += 15) {
                ctx.beginPath();
                ctx.arc(i, j, 1, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        // Draw Nodes
        nodes.forEach(node => {
            const nx = node.x * width;
            const ny = node.y * height;
            const isHovered = hoveredNode === node;
            
            // Pulse
            const pulse = 1 + Math.sin(Date.now() / 300) * 0.2;
            
            ctx.shadowBlur = isHovered ? 15 : 5;
            ctx.shadowColor = node.color;
            ctx.fillStyle = node.color;
            
            ctx.beginPath();
            ctx.arc(nx, ny, (isHovered ? 6 : 4) * pulse, 0, Math.PI * 2);
            ctx.fill();
            
            if (isHovered) {
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(255,255,255,0.3)';
                ctx.beginPath();
                ctx.arc(nx, ny, 15, 0, Math.PI * 2);
                ctx.stroke();
            }
        });

        requestAnimationFrame(draw);
    }
    draw();
}

// --- AUDIO LOGIC ---
function initVoiceLab() {
    const playBtn = document.getElementById('playback-btn');
    const visualizer = document.getElementById('audio-visualizer');
    if (!playBtn || !visualizer) return;
    
    const ctx = visualizer.getContext('2d');
    let audioCtx, analyzer, source, dataArray;
    let isPlaying = false;
    
    // Using a high-quality electronic hum/synth sample for proof of concept
    const audio = new Audio('https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3'); 
    audio.crossOrigin = "anonymous";

    playBtn.addEventListener('click', () => {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            analyzer = audioCtx.createAnalyser();
            source = audioCtx.createMediaElementSource(audio);
            source.connect(analyzer);
            analyzer.connect(audioCtx.destination);
            analyzer.fftSize = 64;
            dataArray = new Uint8Array(analyzer.frequencyBinCount);
        }

        // Sync canvas resolution with display size
        const resizeVis = () => {
            visualizer.width = visualizer.offsetWidth;
            visualizer.height = visualizer.offsetHeight;
        };
        window.addEventListener('resize', resizeVis);
        resizeVis();

        if (isPlaying) {
            audio.pause();
            document.getElementById('play-icon').innerText = '▶';
            document.getElementById('audio-status').innerText = 'PAUSED';
        } else {
            audioCtx.resume();
            audio.play();
            document.getElementById('play-icon').innerText = '■';
            document.getElementById('audio-status').innerText = 'STREAMING_RECONSTRUCTION';
            animateVisualizer();
        }
        isPlaying = !isPlaying;
    });

    function animateVisualizer() {
        if (!isPlaying) return;
        requestAnimationFrame(animateVisualizer);
        analyzer.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, visualizer.width, visualizer.height);
        const barWidth = (visualizer.width / dataArray.length) * 2;
        let x = 0;

        for (let i = 0; i < dataArray.length; i++) {
            const barHeight = (dataArray[i] / 255) * visualizer.height;
            ctx.fillStyle = `rgba(255,255,255,${dataArray[i]/255})`;
            ctx.fillRect(x, visualizer.height - barHeight, barWidth - 2, barHeight);
            x += barWidth;
        }
    }
}

// --- PARTICLE LOGIC (Existing preserved) ---
function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let width, height, particles = [];

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    class Particle {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 1.5 + 0.5;
            this.speedX = (Math.random() - 0.5) * 0.1;
            this.speedY = (Math.random() - 0.5) * 0.1;
            this.opacity = Math.random() * 0.3 + 0.1;
            this.fadingIn = Math.random() > 0.5;
        }
        update() {
            this.x += this.speedX; this.y += this.speedY;
            if (this.x < 0) this.x = width; if (this.x > width) this.x = 0;
            if (this.y < 0) this.y = height; if (this.y > height) this.y = 0;
            if(this.fadingIn) { this.opacity += 0.002; if(this.opacity >= 0.6) this.fadingIn = false; }
            else { this.opacity -= 0.002; if(this.opacity <= 0.1) this.fadingIn = true; }
        }
        draw() {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
            ctx.beginPath(); ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2); ctx.fill();
        }
    }

    for (let i = 0; i < 100; i++) particles.push(new Particle());

    function animate() {
        ctx.clearRect(0, 0, width, height);
        particles.forEach(p => { p.update(); p.draw(); });
        requestAnimationFrame(animate);
    }
    animate();
}
