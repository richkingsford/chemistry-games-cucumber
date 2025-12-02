const sources = [
    {
        id: 'ocean',
        name: 'Ocean Water',
        icon: '🌊',
        desc: 'High salinity. Needs desalination.',
        fact: 'Reverse Osmosis forces water through a semi-permeable membrane to remove salt.',
        link: 'https://en.wikipedia.org/wiki/Reverse_osmosis',
        value: 50
    },
    {
        id: 'river',
        name: 'River Water',
        icon: '🏞️',
        desc: 'Contains sediment and bacteria.',
        fact: 'Sedimentation allows heavy particles to settle before filtration.',
        link: 'https://en.wikipedia.org/wiki/Water_purification#Sedimentation',
        value: 30
    },
    {
        id: 'sludge',
        name: 'Toxic Sludge',
        icon: '☣️',
        desc: 'Highly contaminated. Requires intensive processing.',
        fact: 'Activated carbon filters are effective at removing organic contaminants.',
        link: 'https://en.wikipedia.org/wiki/Carbon_filtering',
        value: 100
    }
];

let selectedSource = null;
let currentStage = 0; // 0: Idle, 1: Filtering, 2: Distilling, 3: UV, 4: Ready
let purity = 0;

// DOM Elements
const sourceList = document.getElementById('source-list');
const feedbackMsg = document.getElementById('feedback-msg');
const processBtn = document.getElementById('process-btn');
const bottleBtn = document.getElementById('bottle-btn');
const factText = document.getElementById('fact-text');
const learnLink = document.querySelector('.learn-link');
const purityDisplay = document.getElementById('purity-display');
const valueDisplay = document.getElementById('value-display');
const tankInput = document.querySelector('#tank-input .water');
const tankOutput = document.querySelector('#tank-output .water');
const processors = {
    filter: document.getElementById('proc-filter'),
    distill: document.getElementById('proc-distill'),
    uv: document.getElementById('proc-uv')
};
const pipes = document.querySelectorAll('.pipe');
const bottleIcon = document.querySelector('.bottle-icon');
const bottleLabel = document.querySelector('.bottle-label');
const modal = document.getElementById('success-modal');
const closeModal = document.querySelector('.close-modal');
const continueBtn = document.getElementById('continue-btn');

// Initialize
function init() {
    renderSources();
    setupListeners();
}

function renderSources() {
    sourceList.innerHTML = '';
    sources.forEach(source => {
        const btn = document.createElement('div');
        btn.className = 'source-btn';
        btn.innerHTML = `
            <span>${source.name}</span>
            <span class="source-icon">${source.icon}</span>
        `;
        btn.onclick = () => selectSource(source, btn);
        sourceList.appendChild(btn);
    });
}

function selectSource(source, btn) {
    if (currentStage > 0) return; // Lock selection during process

    selectedSource = source;

    // UI Update
    document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // Feedback
    feedbackMsg.textContent = `Source: ${source.name}. Ready to process.`;
    factText.textContent = source.fact;
    learnLink.href = source.link;
    learnLink.style.display = 'inline-block';

    // Fill Input Tank
    tankInput.style.height = '80%';
    tankOutput.style.height = '0%';

    // Enable Process
    processBtn.disabled = false;
    processBtn.textContent = "START PROCESS";
}

function startProcess() {
    if (!selectedSource) return;

    processBtn.disabled = true;
    currentStage = 1;
    purity = 0;
    updatePurity(0);

    runStage('filter', 2000, 33, "Filtering particulates...", () => {
        runStage('distill', 2500, 66, "Distilling impurities...", () => {
            runStage('uv', 1500, 99.9, "UV Disinfection...", () => {
                finishProcess();
            });
        });
    });
}

function runStage(id, duration, purityTarget, msg, callback) {
    const proc = processors[id];
    const pipeIdx = id === 'filter' ? 0 : id === 'distill' ? 1 : 2;

    feedbackMsg.textContent = msg;
    proc.classList.add('active');
    pipes[pipeIdx].classList.add('flowing');

    // Animate Tank Levels
    if (id === 'filter') tankInput.style.height = '60%';
    if (id === 'distill') tankInput.style.height = '30%';
    if (id === 'uv') tankInput.style.height = '0%';

    setTimeout(() => {
        proc.classList.remove('active');
        pipes[pipeIdx].classList.remove('flowing');
        updatePurity(purityTarget);
        callback();
    }, duration);
}

function updatePurity(val) {
    purity = val;
    purityDisplay.textContent = `${val}%`;
}

function finishProcess() {
    currentStage = 4;
    feedbackMsg.textContent = "Purification Complete. Ready to bottle.";
    tankOutput.style.height = '80%';
    bottleBtn.disabled = false;
}

function bottleIt() {
    bottleBtn.disabled = true;
    bottleIcon.classList.add('filled');
    bottleLabel.textContent = "Premium Water";

    setTimeout(() => {
        showSuccess();
    }, 1000);
}

function showSuccess() {
    modal.style.display = 'flex';
    document.getElementById('result-reward').textContent = `Value: $${selectedSource.value}.00`;
    valueDisplay.textContent = `$${selectedSource.value}.00`;
}

function resetSystem() {
    selectedSource = null;
    currentStage = 0;
    purity = 0;
    updatePurity(0);

    tankInput.style.height = '0%';
    tankOutput.style.height = '0%';

    processBtn.disabled = true;
    bottleBtn.disabled = true;

    bottleIcon.classList.remove('filled');
    bottleLabel.textContent = "Empty";

    document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('selected'));
    feedbackMsg.textContent = "Select a water source...";
    factText.textContent = "Select a water source to begin purification.";
    learnLink.style.display = 'none';
}

function setupListeners() {
    processBtn.onclick = startProcess;
    bottleBtn.onclick = bottleIt;
    document.getElementById('reset-btn').onclick = resetSystem;

    closeModal.onclick = () => modal.style.display = 'none';
    continueBtn.onclick = () => {
        modal.style.display = 'none';
        resetSystem();
    };

    window.onclick = (e) => {
        if (e.target == modal) modal.style.display = 'none';
    };
}

init();
