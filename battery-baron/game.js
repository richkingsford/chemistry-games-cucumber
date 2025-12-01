const GAME_DURATION = 180; // 3 minutes

// --- CHEMISTRY DATA ---
// Real-world(ish) values for educational purposes.
const COMPONENTS = {
    cathode: [
        { 
            id: 'lco', name: 'LCO (Lithium Cobalt Oxide)', cost: 300, 
            stats: { energy: 9, safety: 3, voltage: 3.9 },
            desc: "High energy density, but expensive and prone to thermal runaway.",
            learn: "LCO is common in smartphones but uses Cobalt, which is scarce and expensive. It can release oxygen when overheated, causing fires."
        },
        { 
            id: 'lfp', name: 'LFP (Lithium Iron Phosphate)', cost: 100, 
            stats: { energy: 5, safety: 9, voltage: 3.2 },
            desc: "Very safe and cheap, but lower energy density.",
            learn: "LFP uses abundant Iron. It's extremely stable and won't catch fire easily, making it perfect for EVs where safety is paramount."
        },
        { 
            id: 'nmc', name: 'NMC (Nickel Manganese Cobalt)', cost: 200, 
            stats: { energy: 8, safety: 5, voltage: 3.7 },
            desc: "A balanced choice. Good energy, moderate safety.",
            learn: "NMC blends the best of both worlds. Nickel gives energy, Manganese gives stability. It's the standard for modern long-range EVs."
        }
    ],
    electrolyte: [
        { 
            id: 'liquid', name: 'Liquid Organic', cost: 50, 
            stats: { energy: 5, safety: 4, voltage: 0 }, // Voltage modifier 0
            desc: "Standard industry electrolyte. Flammable.",
            learn: "Liquid electrolytes move ions fast (high power) but are made of organic solvents that burn easily if the battery is punctured."
        },
        { 
            id: 'solid', name: 'Solid State (Ceramic)', cost: 400, 
            stats: { energy: 7, safety: 10, voltage: 0.2 }, // Boosts voltage slightly due to stability
            desc: "The future tech. Non-flammable and dense.",
            learn: "Solid State batteries replace the liquid with a solid ceramic or polymer. They are virtually fireproof and allow for denser anodes."
        }
    ],
    anode: [
        { 
            id: 'graphite', name: 'Graphite', cost: 50, 
            stats: { energy: 5, safety: 7, voltage: 0.1 },
            desc: "Reliable, standard carbon anode.",
            learn: "Graphite is just layers of carbon (like pencil lead). It's stable and cheap, hosting Lithium ions between its sheets (intercalation)."
        },
        { 
            id: 'silicon', name: 'Silicon', cost: 250, 
            stats: { energy: 10, safety: 2, voltage: 0 },
            desc: "Massive capacity, but swells and cracks.",
            learn: "Silicon can hold 10x more Lithium than Graphite! But it swells by 300% when charged, which can destroy the battery quickly without special engineering."
        }
    ]
};

const CONTRACTS = [
    {
        id: 'phone', title: "Smartphone Battery",
        desc: "We need a battery for our new flagship phone. It must last all day!",
        reqs: { minEnergy: 18, minSafety: 10 }, // Sum of parts
        payout: 800,
        hint: "Phones need high energy in a small space. Safety is important, but capacity is king."
    },
    {
        id: 'ev', title: "Budget EV Pack",
        desc: "Building an affordable city car. Needs to be cheap and very safe.",
        reqs: { minSafety: 20, maxCost: 300 },
        payout: 1200,
        hint: "For budget EVs, cost and safety are more important than raw range. LFP is a strong candidate."
    },
    {
        id: 'grid', title: "Grid Storage",
        desc: "Massive stationary storage for a solar farm. Safety is the ONLY priority.",
        reqs: { minSafety: 24 },
        payout: 1500,
        hint: "Stationary batteries don't move, so weight doesn't matter. They must never, ever catch fire."
    },
    {
        id: 'drone', title: "Racing Drone",
        desc: "High performance needed. Cost is no object.",
        reqs: { minEnergy: 22 },
        payout: 2000,
        hint: "Racing drones need maximum power density. Push the chemistry to the limit."
    }
];

class Game {
    constructor() {
        this.funds = 1000;
        this.reputation = 50;
        this.timeLeft = GAME_DURATION;
        this.timerInterval = null;
        this.currentContract = null;
        this.selected = { cathode: null, electrolyte: null, anode: null };
        
        this.ui = {
            funds: document.getElementById('funds'),
            rep: document.getElementById('reputation'),
            timer: document.getElementById('timer'),
            contractTitle: document.querySelector('.contract-header'),
            contractDesc: document.getElementById('contract-desc'),
            contractReqs: document.getElementById('contract-reqs'),
            assistant: document.getElementById('assistant-text'),
            buildBtn: document.getElementById('build-btn'),
            lists: {
                cathode: document.getElementById('list-cathode'),
                electrolyte: document.getElementById('list-electrolyte'),
                anode: document.getElementById('list-anode')
            },
            previews: {
                cathode: document.getElementById('preview-cathode'),
                electrolyte: document.getElementById('preview-electrolyte'),
                anode: document.getElementById('preview-anode')
            },
            modal: {
                el: document.getElementById('edu-modal'),
                title: document.getElementById('modal-title'),
                body: document.getElementById('modal-body'),
                close: document.getElementById('modal-close')
            }
        };

        this.init();
    }

    init() {
        this.renderComponents();
        this.startTimer();
        this.newContract();
        
        this.ui.buildBtn.addEventListener('click', () => this.manufacture());
        this.ui.modal.close.addEventListener('click', () => this.hideModal());
        
        // Close modal on outside click
        this.ui.modal.el.addEventListener('click', (e) => {
            if (e.target === this.ui.modal.el) this.hideModal();
        });
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            const m = Math.floor(this.timeLeft / 60);
            const s = this.timeLeft % 60;
            this.ui.timer.textContent = `${m.toString().padStart(2,'0')}:${s.toString().padStart(2,'0')}`;
            
            if (this.timeLeft <= 0) this.gameOver();
        }, 1000);
    }

    renderComponents() {
        ['cathode', 'electrolyte', 'anode'].forEach(type => {
            this.ui.lists[type].innerHTML = '';
            COMPONENTS[type].forEach(comp => {
                const btn = document.createElement('div');
                btn.className = 'component-btn';
                btn.innerHTML = `
                    <div>
                        <div style="font-weight:bold">${comp.name}</div>
                        <div style="font-size:0.7rem; color:#888">${comp.desc}</div>
                    </div>
                    <div class="component-cost">$${comp.cost}</div>
                `;
                btn.addEventListener('click', () => this.selectComponent(type, comp));
                
                // Add learn more link (stop propagation to avoid selecting)
                const learn = document.createElement('span');
                learn.className = 'learn-link';
                learn.textContent = '[?]';
                learn.title = "Learn more about this chemistry";
                learn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showModal(comp.name, comp.learn);
                });
                btn.querySelector('div').appendChild(learn);

                this.ui.lists[type].appendChild(btn);
            });
        });
    }

    selectComponent(type, comp) {
        this.selected[type] = comp;
        
        // Update UI
        const list = this.ui.lists[type];
        Array.from(list.children).forEach(child => child.classList.remove('selected'));
        // Find the button we just clicked (simple way)
        const index = COMPONENTS[type].indexOf(comp);
        list.children[index].classList.add('selected');

        // Update Preview
        const preview = this.ui.previews[type];
        preview.textContent = comp.name;
        preview.style.background = type === 'cathode' ? '#4a2c2c' : type === 'anode' ? '#2c2c34' : '#2c4a4a';
        preview.style.color = '#fff';

        // Check if ready
        const ready = this.selected.cathode && this.selected.electrolyte && this.selected.anode;
        this.ui.buildBtn.disabled = !ready;

        // Assistant Hint
        this.ui.assistant.innerHTML = `${comp.desc} <span class="learn-link" onclick="game.showModal('${comp.name}', '${comp.learn.replace(/'/g, "\\'")}')">Read More</span>`;
    }

    newContract() {
        this.currentContract = CONTRACTS[Math.floor(Math.random() * CONTRACTS.length)];
        
        this.ui.contractTitle.textContent = this.currentContract.title;
        this.ui.contractDesc.textContent = this.currentContract.desc;
        
        let reqHtml = '';
        if (this.currentContract.reqs.minEnergy) reqHtml += `<div class="req-item"><span class="req-icon">⚡</span> Min Energy: ${this.currentContract.reqs.minEnergy}</div>`;
        if (this.currentContract.reqs.minSafety) reqHtml += `<div class="req-item"><span class="req-icon">🛡️</span> Min Safety: ${this.currentContract.reqs.minSafety}</div>`;
        if (this.currentContract.reqs.maxCost) reqHtml += `<div class="req-item"><span class="req-icon">💰</span> Max Cost: $${this.currentContract.reqs.maxCost}</div>`;
        
        this.ui.contractReqs.innerHTML = reqHtml;
        this.ui.assistant.textContent = this.currentContract.hint;
        
        // Reset selection visual
        this.selected = { cathode: null, electrolyte: null, anode: null };
        this.ui.buildBtn.disabled = true;
        document.querySelectorAll('.component-btn').forEach(b => b.classList.remove('selected'));
        ['cathode', 'electrolyte', 'anode'].forEach(t => {
            this.ui.previews[t].textContent = t.charAt(0).toUpperCase() + t.slice(1);
            this.ui.previews[t].style.background = '';
        });
    }

    manufacture() {
        const c = this.selected.cathode;
        const e = this.selected.electrolyte;
        const a = this.selected.anode;
        
        const totalCost = c.cost + e.cost + a.cost;
        const totalEnergy = c.stats.energy + e.stats.energy + a.stats.energy;
        const totalSafety = c.stats.safety + e.stats.safety + a.stats.safety;
        
        // Check requirements
        const reqs = this.currentContract.reqs;
        let success = true;
        let failReason = "";

        if (this.funds < totalCost) {
            success = false;
            failReason = "Insufficient funds to build!";
        } else if (reqs.minEnergy && totalEnergy < reqs.minEnergy) {
            success = false;
            failReason = `Energy too low (${totalEnergy}/${reqs.minEnergy}). Try Silicon anode or LCO cathode.`;
        } else if (reqs.minSafety && totalSafety < reqs.minSafety) {
            success = false;
            failReason = `Safety too low (${totalSafety}/${reqs.minSafety}). Try LFP or Solid State.`;
        } else if (reqs.maxCost && totalCost > reqs.maxCost) {
            success = false;
            failReason = `Too expensive ($${totalCost}/$${reqs.maxCost}). Try cheaper materials.`;
        }

        if (success) {
            this.funds += this.currentContract.payout - totalCost;
            this.reputation = Math.min(100, this.reputation + 10);
            this.ui.assistant.innerHTML = `<span style="color:var(--neon-green)">SUCCESS!</span> Battery delivered. Profit: $${this.currentContract.payout - totalCost}.`;
            this.flash(true);
            setTimeout(() => this.newContract(), 2000);
        } else {
            this.funds -= totalCost; // Still pay for materials
            this.reputation = Math.max(0, this.reputation - 10);
            this.ui.assistant.innerHTML = `<span style="color:var(--neon-red)">FAILURE:</span> ${failReason}`;
            this.flash(false);
        }

        this.updateHUD();
        
        if (this.funds <= 0) {
            alert("Bankrupt! Game Over.");
            location.reload();
        }
    }

    updateHUD() {
        this.ui.funds.textContent = `$${this.funds}`;
        this.ui.rep.textContent = `${this.reputation}%`;
    }

    flash(success) {
        const wb = document.getElementById('workbench');
        wb.className = 'panel-center ' + (success ? 'flash-success' : 'flash-fail');
        setTimeout(() => wb.className = 'panel-center', 500);
    }

    showModal(title, body) {
        this.ui.modal.title.textContent = title;
        this.ui.modal.body.textContent = body;
        this.ui.modal.el.classList.add('visible');
    }

    hideModal() {
        this.ui.modal.el.classList.remove('visible');
    }

    gameOver() {
        clearInterval(this.timerInterval);
        alert(`Time's up! Final Funds: $${this.funds}`);
        location.reload();
    }
}

// Make game instance global for inline onclick handlers
window.game = new Game();
