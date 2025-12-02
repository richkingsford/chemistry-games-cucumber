const state = {
    money: 1000,
    reputation: "Novice",
    currentMix: [],
    mixStats: { top: 0, mid: 0, base: 0 }
};

const ingredients = {
    esters: [
        { id: 'isoamyl_acetate', name: 'Isoamyl Acetate', note: 'top', desc: 'Banana / Pear', cost: 50, type: 'Ester', link: 'https://en.wikipedia.org/wiki/Isoamyl_acetate' },
        { id: 'ethyl_butyrate', name: 'Ethyl Butyrate', note: 'top', desc: 'Pineapple', cost: 60, type: 'Ester', link: 'https://en.wikipedia.org/wiki/Ethyl_butyrate' },
        { id: 'benzyl_acetate', name: 'Benzyl Acetate', note: 'mid', desc: 'Jasmine / Floral', cost: 120, type: 'Ester', link: 'https://en.wikipedia.org/wiki/Benzyl_acetate' }
    ],
    aldehydes: [
        { id: 'c8_aldehyde', name: 'Octanal (C8)', note: 'top', desc: 'Waxy / Citrus', cost: 80, type: 'Aldehyde', link: 'https://en.wikipedia.org/wiki/Octanal' },
        { id: 'c10_aldehyde', name: 'Decanal (C10)', note: 'top', desc: 'Orange Peel', cost: 90, type: 'Aldehyde', link: 'https://en.wikipedia.org/wiki/Decanal' },
        { id: 'c12_aldehyde', name: 'Lauric Aldehyde', note: 'mid', desc: 'Fresh / Metallic', cost: 150, type: 'Aldehyde', link: 'https://en.wikipedia.org/wiki/Dodecanal' }
    ],
    terpenes: [
        { id: 'limonene', name: 'Limonene', note: 'top', desc: 'Lemon / Citrus', cost: 40, type: 'Terpene', link: 'https://en.wikipedia.org/wiki/Limonene' },
        { id: 'linalool', name: 'Linalool', note: 'mid', desc: 'Lavender / Spice', cost: 100, type: 'Terpene', link: 'https://en.wikipedia.org/wiki/Linalool' },
        { id: 'santalol', name: 'Santalol', note: 'base', desc: 'Sandalwood', cost: 300, type: 'Terpene', link: 'https://en.wikipedia.org/wiki/Santalol' },
        { id: 'vanillin', name: 'Vanillin', note: 'base', desc: 'Vanilla', cost: 200, type: 'Aldehyde', link: 'https://en.wikipedia.org/wiki/Vanillin' }
    ]
};

const facts = [
    "Esters are often responsible for the pleasant smells of fruits.",
    "Aldehydes were made famous by Chanel No. 5 in 1921.",
    "Top notes evaporate quickly, while base notes can last for days.",
    "Musk was originally harvested from deer, but is now synthetic.",
    "Olfactory receptors in your nose detect specific molecular shapes."
];

// DOM Elements
const el = {
    money: document.getElementById('money-display'),
    rep: document.getElementById('rep-display'),
    mixBtn: document.getElementById('mix-btn'),
    resetBtn: document.getElementById('reset-btn'),
    feedback: document.getElementById('feedback-msg'),
    mixName: document.getElementById('mix-name'),
    barTop: document.getElementById('bar-top'),
    barMid: document.getElementById('bar-mid'),
    barBase: document.getElementById('bar-base'),
    descTop: document.getElementById('desc-top'),
    descMid: document.getElementById('desc-mid'),
    descBase: document.getElementById('desc-base'),
    modal: document.getElementById('review-modal'),
    closeModal: document.querySelector('.close-modal'),
    continueBtn: document.getElementById('continue-btn'),
    factText: document.getElementById('fact-text')
};

function init() {
    renderIngredients();
    updateDisplay();

    el.resetBtn.addEventListener('click', resetMix);
    el.mixBtn.addEventListener('click', synthesizeMix);
    el.closeModal.addEventListener('click', () => el.modal.style.display = 'none');
    el.continueBtn.addEventListener('click', () => el.modal.style.display = 'none');

    setInterval(rotateFact, 15000);
}

function renderIngredients() {
    renderCategory('list-esters', ingredients.esters);
    renderCategory('list-aldehydes', ingredients.aldehydes);
    renderCategory('list-terpenes', ingredients.terpenes);
}

function renderCategory(id, items) {
    const container = document.getElementById(id);
    container.innerHTML = '';
    items.forEach(item => {
        const btn = document.createElement('div');
        btn.className = 'chem-btn';
        btn.innerHTML = `
            <div class="chem-info">
                <span>${item.name}</span>
                <span class="chem-cost">$${item.cost}</span>
            </div>
            <a href="${item.link}" target="_blank" class="learn-icon" title="Learn more about ${item.name}">📜</a>
        `;
        btn.onclick = (e) => {
            if (e.target.tagName !== 'A') {
                toggleIngredient(item, btn);
            }
        };
        container.appendChild(btn);
    });
}

function toggleIngredient(item, btn) {
    const idx = state.currentMix.findIndex(i => i.id === item.id);
    if (idx > -1) {
        state.currentMix.splice(idx, 1);
        btn.classList.remove('selected');
    } else {
        if (state.currentMix.length >= 5) {
            el.feedback.innerText = "Mix is full! Remove an ingredient.";
            return;
        }
        state.currentMix.push(item);
        btn.classList.add('selected');
    }
    updateMixStats();
}

function updateMixStats() {
    state.mixStats = { top: 0, mid: 0, base: 0 };
    const notes = { top: [], mid: [], base: [] };

    state.currentMix.forEach(i => {
        state.mixStats[i.note] += 20; // 5 items max = 100%
        notes[i.note].push(i.desc);
    });

    // Update Bars
    el.barTop.style.width = state.mixStats.top + '%';
    el.barMid.style.width = state.mixStats.mid + '%';
    el.barBase.style.width = state.mixStats.base + '%';

    // Update Text
    el.descTop.innerText = notes.top.join(', ') || 'Empty';
    el.descMid.innerText = notes.mid.join(', ') || 'Empty';
    el.descBase.innerText = notes.base.join(', ') || 'Empty';

    // Enable Button
    el.mixBtn.disabled = state.currentMix.length < 3;

    // Feedback
    if (state.currentMix.length === 0) el.feedback.innerText = "Select ingredients...";
    else el.feedback.innerText = `Current Blend: ${state.currentMix.length}/5 ingredients`;
}

function resetMix() {
    state.currentMix = [];
    document.querySelectorAll('.chem-btn').forEach(b => b.classList.remove('selected'));
    updateMixStats();
}

function synthesizeMix() {
    // Determine quality
    let score = 0;
    const hasTop = state.mixStats.top > 0;
    const hasMid = state.mixStats.mid > 0;
    const hasBase = state.mixStats.base > 0;

    if (hasTop && hasMid && hasBase) score += 50; // Balanced
    if (state.currentMix.length === 5) score += 20; // Complex

    // Random market factor
    score += Math.floor(Math.random() * 30);

    showReview(score);
}

function showReview(score) {
    let stars = '';
    let text = '';
    let reward = 0;

    if (score > 80) {
        stars = '⭐⭐⭐⭐⭐';
        text = '"A timeless classic! The balance of notes is exquisite."';
        reward = 1000;
    } else if (score > 50) {
        stars = '⭐⭐⭐';
        text = '"A decent effort, though it lacks a certain je ne sais quoi."';
        reward = 300;
    } else {
        stars = '⭐';
        text = '"Smells like a chemistry lab accident. Back to the drawing board."';
        reward = 50;
    }

    document.getElementById('review-stars').innerText = stars;
    document.getElementById('review-text').innerText = text;
    document.getElementById('review-reward').innerText = `Brand Value +$${reward}`;

    state.money += reward;
    updateDisplay();

    el.modal.style.display = 'flex';
    resetMix();
}

function updateDisplay() {
    el.money.innerText = '$' + state.money;
    if (state.money > 5000) el.rep.innerText = "Master Perfumer";
    else if (state.money > 2000) el.rep.innerText = "Rising Star";
    else el.rep.innerText = "Novice";
}

function rotateFact() {
    const fact = facts[Math.floor(Math.random() * facts.length)];
    el.factText.innerText = fact;
}

init();
