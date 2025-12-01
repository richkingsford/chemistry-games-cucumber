const state = {
    co2: 0,
    money: 0,
    temp: 1.5,
    clickPower: 1,
    autoRate: 0,
    lastTick: Date.now()
};

const upgrades = [
    {
        id: 'fan',
        name: 'Industrial Fan',
        baseCost: 15,
        costMultiplier: 1.5,
        rate: 1, // kg/sec
        count: 0,
        desc: 'Basic air movement.'
    },
    {
        id: 'filter',
        name: 'Sorbent Filter',
        baseCost: 100,
        costMultiplier: 1.4,
        rate: 5,
        count: 0,
        desc: 'Chemical sponge for CO2.'
    },
    {
        id: 'compressor',
        name: 'High-Pressure Pump',
        baseCost: 500,
        costMultiplier: 1.3,
        rate: 20,
        count: 0,
        desc: 'Liquefies CO2 for storage.'
    },
    {
        id: 'reactor',
        name: 'Diamond Reactor',
        baseCost: 2000,
        costMultiplier: 1.4,
        rate: 100,
        count: 0,
        desc: 'Turns carbon into bling.'
    }
];

const facts = [
    { text: "Direct Air Capture (DAC) machines act like artificial trees.", link: "https://www.iea.org/energy-system/carbon-capture-utilisation-and-storage/direct-air-capture" },
    { text: "Captured CO2 can be stored underground in basalt rock formations.", link: "https://www.carbfix.com/" },
    { text: "CO2 can be converted into synthetic fuels for airplanes.", link: "https://www.energy.gov/eere/bioenergy/sustainable-aviation-fuel" },
    { text: "Diamonds are just pressurized carbon lattices.", link: "https://en.wikipedia.org/wiki/Synthetic_diamond" },
    { text: "We need to remove gigatons of CO2 to stop warming.", link: "https://www.ipcc.ch/" }
];

// DOM Elements
const el = {
    co2: document.getElementById('co2-display'),
    money: document.getElementById('money-display'),
    temp: document.getElementById('temp-display'),
    captureBtn: document.getElementById('capture-btn'),
    convertBtn: document.getElementById('convert-btn'),
    upgradesList: document.getElementById('upgrades-list'),
    cloud: document.getElementById('co2-cloud'),
    diamond: document.getElementById('diamond-output'),
    factText: document.getElementById('fact-text'),
    factLink: document.getElementById('learn-more-link')
};

function init() {
    renderUpgrades();
    el.captureBtn.addEventListener('click', manualCapture);
    el.convertBtn.addEventListener('click', convertToDiamond);

    // Game Loop
    setInterval(tick, 100);

    // Fact rotation
    setInterval(rotateFact, 10000);
}

function manualCapture() {
    addCO2(state.clickPower);
    animateCapture();
}

function addCO2(amount) {
    state.co2 += amount;
    updateDisplay();
}

function convertToDiamond() {
    const cost = 100; // 100kg CO2 -> 1 Diamond ($100)
    if (state.co2 >= cost) {
        state.co2 -= cost;
        state.money += 100;
        animateDiamond();
        updateDisplay();
    }
}

function tick() {
    const now = Date.now();
    const dt = (now - state.lastTick) / 1000;
    state.lastTick = now;

    if (state.autoRate > 0) {
        addCO2(state.autoRate * dt);
    }

    // Temp reduction logic (visual only for now)
    if (state.co2 > 1000) {
        state.temp = Math.max(1.0, 1.5 - (state.co2 / 100000));
    }
}

function updateDisplay() {
    el.co2.innerText = Math.floor(state.co2) + ' kg';
    el.money.innerText = '$' + Math.floor(state.money);
    el.temp.innerText = '+' + state.temp.toFixed(2) + '°C';

    // Enable/Disable Convert Button
    el.convertBtn.disabled = state.co2 < 100;

    // Update Upgrade Buttons
    upgrades.forEach(u => {
        const btn = document.getElementById(`btn-${u.id}`);
        if (btn) {
            const cost = Math.floor(u.baseCost * Math.pow(u.costMultiplier, u.count));
            if (state.money >= cost) {
                btn.classList.remove('disabled');
            } else {
                btn.classList.add('disabled');
            }
        }
    });
}

function renderUpgrades() {
    el.upgradesList.innerHTML = '';
    upgrades.forEach(u => {
        const div = document.createElement('div');
        div.className = 'upgrade-item disabled';
        div.id = `btn-${u.id}`;
        div.innerHTML = `
            <div class="upgrade-info">
                <span class="upgrade-name">${u.name}</span>
                <span class="upgrade-cost" id="cost-${u.id}">$${u.baseCost}</span>
            </div>
            <span class="upgrade-count" id="count-${u.id}">0</span>
        `;
        div.addEventListener('click', () => buyUpgrade(u));
        el.upgradesList.appendChild(div);
    });
}

function buyUpgrade(u) {
    const cost = Math.floor(u.baseCost * Math.pow(u.costMultiplier, u.count));
    if (state.money >= cost) {
        state.money -= cost;
        u.count++;
        state.autoRate += u.rate;

        // Update UI
        document.getElementById(`count-${u.id}`).innerText = u.count;
        const newCost = Math.floor(u.baseCost * Math.pow(u.costMultiplier, u.count));
        document.getElementById(`cost-${u.id}`).innerText = '$' + newCost;

        updateDisplay();
    }
}

function animateCapture() {
    // Reset animation
    el.cloud.style.animation = 'none';
    el.cloud.offsetHeight; /* trigger reflow */
    el.cloud.style.animation = 'suckIn 0.5s forwards';
}

function animateDiamond() {
    el.diamond.innerText = '💎';
    el.diamond.style.animation = 'none';
    el.diamond.offsetHeight;
    el.diamond.style.animation = 'popOut 1s forwards';
}

function rotateFact() {
    const fact = facts[Math.floor(Math.random() * facts.length)];
    el.factText.innerText = fact.text;
    el.factLink.href = fact.link;
}

init();
