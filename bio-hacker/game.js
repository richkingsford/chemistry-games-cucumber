const traits = [
    {
        id: 'biolum',
        name: 'Bioluminescence',
        icon: '💡',
        desc: 'Insert genes from jellyfish to make crops glow.',
        fact: 'Green Fluorescent Protein (GFP) is often used as a marker in genetic engineering.',
        link: 'https://en.wikipedia.org/wiki/Green_fluorescent_protein',
        result: 'Glowing Crop',
        reward: 'Yield +15%'
    },
    {
        id: 'drought',
        name: 'Drought Resistance',
        icon: '🌵',
        desc: 'Edit stomata regulation for water conservation.',
        fact: 'Abscisic acid pathways regulate how plants respond to water stress.',
        link: 'https://en.wikipedia.org/wiki/Drought_tolerance',
        result: 'Desert-Hardy Crop',
        reward: 'Resilience: High'
    },
    {
        id: 'flavor',
        name: 'Flavor Enhancer',
        icon: '🍬',
        desc: 'Boost terpene production for candy-like taste.',
        fact: 'Terpenes are aromatic compounds that give plants their scent and flavor.',
        link: 'https://en.wikipedia.org/wiki/Terpene',
        result: 'Sweet-Berry Crop',
        reward: 'Value +50%'
    }
];

let selectedTrait = null;
let isSpliced = false;

// DOM Elements
const traitList = document.getElementById('trait-list');
const dnaHelix = document.getElementById('dna-helix');
const feedbackMsg = document.getElementById('feedback-msg');
const spliceBtn = document.getElementById('splice-btn');
const factText = document.getElementById('fact-text');
const learnLink = document.querySelector('.learn-link');
const logContainer = document.getElementById('analysis-log');
const cropIcon = document.querySelector('.crop-icon');
const cropStatus = document.querySelector('.crop-status');
const modal = document.getElementById('success-modal');
const closeModal = document.querySelector('.close-modal');
const continueBtn = document.getElementById('continue-btn');

// Initialize
function init() {
    renderTraits();
    generateDNA();
    setupListeners();
}

function renderTraits() {
    traitList.innerHTML = '';
    traits.forEach(trait => {
        const btn = document.createElement('div');
        btn.className = 'trait-btn';
        btn.innerHTML = `
            <span>${trait.name}</span>
            <span class="trait-icon">${trait.icon}</span>
        `;
        btn.onclick = () => selectTrait(trait, btn);
        traitList.appendChild(btn);
    });
}

function generateDNA() {
    dnaHelix.innerHTML = '';
    for (let i = 0; i < 20; i++) {
        const rung = document.createElement('div');
        rung.className = 'dna-rung';
        rung.style.top = `${i * 20}px`;
        rung.style.transform = `translateX(-50%) rotateY(${i * 18}deg)`;
        dnaHelix.appendChild(rung);
    }
}

function selectTrait(trait, btn) {
    selectedTrait = trait;

    // UI Update
    document.querySelectorAll('.trait-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');

    // Feedback
    feedbackMsg.textContent = `Target: ${trait.name}. Ready to splice.`;
    factText.textContent = trait.fact;
    learnLink.href = trait.link;

    // Enable Splice
    spliceBtn.disabled = false;

    log(`Selected target vector: ${trait.name}`);
}

function spliceGene() {
    if (!selectedTrait) return;

    isSpliced = true;
    spliceBtn.disabled = true;
    feedbackMsg.textContent = "Splicing gene sequence... CRISPR-Cas9 active.";

    // Animation
    const rungs = document.querySelectorAll('.dna-rung');
    const targetRung = rungs[10]; // Middle rung

    targetRung.classList.add('modified');
    log("Cas9 enzyme deployed. DNA strand cut.");

    setTimeout(() => {
        log("New genetic material inserted.");
        feedbackMsg.textContent = "Sequence integrated. Stabilizing...";

        setTimeout(() => {
            showSuccess();
        }, 1500);
    }, 1000);
}

function showSuccess() {
    modal.style.display = 'flex';
    document.getElementById('result-text').textContent = `Success! You created a ${selectedTrait.result}.`;
    document.getElementById('result-reward').textContent = selectedTrait.reward;

    // Update Preview
    cropIcon.textContent = selectedTrait.icon;
    cropStatus.textContent = selectedTrait.result;
    cropIcon.style.filter = `drop-shadow(0 0 20px ${selectedTrait.id === 'biolum' ? '#39ff14' : '#00ffff'})`;
}

function log(msg) {
    const entry = document.createElement('div');
    entry.className = 'log-entry';
    entry.textContent = `> ${msg}`;
    logContainer.prepend(entry);
}

function setupListeners() {
    spliceBtn.onclick = spliceGene;

    document.getElementById('reset-btn').onclick = () => {
        selectedTrait = null;
        isSpliced = false;
        spliceBtn.disabled = true;
        feedbackMsg.textContent = "Select a desired trait to begin...";
        document.querySelectorAll('.trait-btn').forEach(b => b.classList.remove('selected'));
        generateDNA(); // Reset visuals
        cropIcon.textContent = '🌱';
        cropStatus.textContent = 'Standard Crop';
        cropIcon.style.filter = '';
        log("Sequence reset.");
    };

    closeModal.onclick = () => modal.style.display = 'none';
    continueBtn.onclick = () => {
        modal.style.display = 'none';
        document.getElementById('reset-btn').click();
    };

    window.onclick = (e) => {
        if (e.target == modal) modal.style.display = 'none';
    };
}

init();
