const canvas = document.getElementById('weaving-canvas');
const ctx = canvas.getContext('2d');
const configBtns = document.querySelectorAll('.config-btn');
const weaveBtn = document.getElementById('weave-btn');
const resetBtn = document.getElementById('reset-btn');
const feedbackMsg = document.getElementById('feedback-msg');
const scanLine = document.getElementById('scan-line');
const integrityDisplay = document.getElementById('integrity-display');
const strengthDisplay = document.getElementById('strength-display');
const weightDisplay = document.getElementById('weight-display');
const flexDisplay = document.getElementById('flex-display');
const logConsole = document.getElementById('system-log');
const modal = document.getElementById('success-modal');
const closeModal = document.querySelector('.close-modal');
const continueBtn = document.getElementById('continue-btn');

let selectedType = 'hexagonal';
let isWeaving = false;
let integrity = 0;
let strength = 0;

const facts = [
    "Graphene is 200 times stronger than steel by weight.",
    "Carbon Nanotubes are rolled-up sheets of graphene.",
    "Hexagonal lattices disperse force evenly across the structure.",
    "Kevlar uses hydrogen bonds; Graphene uses covalent bonds (stronger!).",
    "A 1m² sheet of graphene weighs only 0.77 milligrams."
];

let factIndex = 0;
const factText = document.getElementById('fact-text');

function init() {
    setupListeners();
    drawGrid();
    startFactRotation();
}

function startFactRotation() {
    setInterval(() => {
        factIndex = (factIndex + 1) % facts.length;
        // Fade out
        factText.style.opacity = 0;
        setTimeout(() => {
            factText.textContent = facts[factIndex];
            // Fade in
            factText.style.opacity = 1;
        }, 500);
    }, 10000);
}

function setupListeners() {
    configBtns.forEach(btn => {
        btn.onclick = () => {
            if (isWeaving) return;
            configBtns.forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedType = btn.dataset.type;
            drawGrid();
            log(`Configuration changed to: ${selectedType.toUpperCase()}`);
        };
    });

    weaveBtn.onclick = startWeave;
    resetBtn.onclick = reset;

    closeModal.onclick = () => modal.style.display = 'none';
    continueBtn.onclick = () => {
        modal.style.display = 'none';
        reset();
    };
}

function drawGrid() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#0066ff';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'rgba(0, 243, 255, 0.1)';

    const size = 30;
    const offsetX = 20;
    const offsetY = 20;

    if (selectedType === 'hexagonal') {
        drawHexGrid(size, offsetX, offsetY);
    } else if (selectedType === 'pentagonal') {
        drawPolyGrid(5, size, offsetX, offsetY);
    } else {
        drawPolyGrid(7, size, offsetX, offsetY);
    }
}

function drawHexGrid(r, ox, oy) {
    const w = Math.sqrt(3) * r;
    const h = 2 * r;
    const hDist = w;
    const vDist = h * 0.75;

    for (let row = 0; row < 10; row++) {
        for (let col = 0; col < 10; col++) {
            const x = ox + col * hDist + (row % 2) * (hDist / 2);
            const y = oy + row * vDist;
            drawPoly(x, y, 6, r);
        }
    }
}

function drawPolyGrid(sides, r, ox, oy) {
    // Simplified grid for non-hex (just to show difference)
    const dist = r * 2.5;
    for (let row = 0; row < 6; row++) {
        for (let col = 0; col < 6; col++) {
            const x = ox + col * dist + (row % 2) * (dist / 2);
            const y = oy + row * dist;
            drawPoly(x, y, sides, r);
        }
    }
}

function drawPoly(x, y, sides, r) {
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle);
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();

    // Draw nodes
    for (let i = 0; i < sides; i++) {
        const angle = (Math.PI * 2 * i) / sides - Math.PI / 2;
        const px = x + r * Math.cos(angle);
        const py = y + r * Math.sin(angle);
        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = '#00f3ff';
        ctx.fill();
    }
    ctx.fillStyle = 'rgba(0, 243, 255, 0.1)'; // Reset fill
}

function startWeave() {
    if (isWeaving) return;
    isWeaving = true;
    weaveBtn.disabled = true;
    configBtns.forEach(b => b.disabled = true);

    log("Initiating Nanobot Assembly Swarm...");
    feedbackMsg.textContent = "Weaving in progress... Stabilizing bonds...";
    scanLine.classList.add('scanning');

    let progress = 0;
    const interval = setInterval(() => {
        progress += 2;
        integrity = Math.min(100, progress);

        // Calculate Strength based on type
        let maxStrength = 0;
        if (selectedType === 'hexagonal') maxStrength = 130; // GPa (Graphene is ~130)
        else if (selectedType === 'pentagonal') maxStrength = 80; // Unstable
        else maxStrength = 60; // Heptagonal (warped)

        strength = Math.round((progress / 100) * maxStrength);

        integrityDisplay.textContent = `${integrity}%`;
        strengthDisplay.textContent = `${strength} GPa`;

        // Random log updates
        if (progress % 20 === 0) {
            log(`Lattice density: ${progress}%`);
        }

        if (progress >= 100) {
            clearInterval(interval);
            completeWeave();
        }
    }, 50);
}

function completeWeave() {
    scanLine.classList.remove('scanning');
    isWeaving = false;
    weaveBtn.disabled = false;
    configBtns.forEach(b => b.disabled = false);

    if (selectedType === 'hexagonal') {
        feedbackMsg.textContent = "Fabrication Successful. Material Stable.";
        weightDisplay.textContent = "0.77 mg";
        flexDisplay.textContent = "High";
        log("Analysis: Perfect Hexagonal Lattice.");
        setTimeout(() => showSuccess(), 1000);
    } else {
        feedbackMsg.textContent = "Fabrication Failed. Structure Unstable.";
        weightDisplay.textContent = "ERR";
        flexDisplay.textContent = "Brittle";
        log("Analysis: Non-hexagonal geometry detected. Structural failure.");
        integrityDisplay.style.color = "red";
    }
}

function showSuccess() {
    modal.style.display = 'flex';
}

function reset() {
    isWeaving = false;
    integrity = 0;
    strength = 0;
    integrityDisplay.textContent = "0%";
    strengthDisplay.textContent = "0 GPa";
    weightDisplay.textContent = "--";
    flexDisplay.textContent = "--";
    integrityDisplay.style.color = "#fff";

    feedbackMsg.textContent = "Select lattice pattern and initiate weave...";
    logConsole.innerHTML = '<div class="log-line">System initialized...</div>';

    drawGrid();
}

function log(msg) {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = `> ${msg}`;
    logConsole.prepend(line);
}

init();
