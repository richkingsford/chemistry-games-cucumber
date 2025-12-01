const GAME_DURATION = 180; // 3 minutes

// --- CHEMISTRY DATA ---
const INGREDIENTS = {
    substrate: [
        {
            id: 'milk', name: 'Milk (Lactose)',
            desc: "Rich in lactose sugar and proteins.",
            learn: "Milk contains lactose (milk sugar). Bacteria eat this sugar and poop out lactic acid, which thickens the proteins into yogurt or cheese."
        },
        {
            id: 'cabbage', name: 'Cabbage (Fiber/Sugar)',
            desc: "Crunchy vegetable with natural sugars.",
            learn: "Vegetables have natural sugars locked in their cells. Salt helps draw out water and sugars via osmosis so bacteria can reach them."
        },
        {
            id: 'flour', name: 'Flour (Starch)',
            desc: "Complex carbs and gluten proteins.",
            learn: "Flour is mostly starch (chains of sugar). Enzymes break starch into simple sugars that yeast can eat to create gas bubbles (rising)."
        }
    ],
    microbe: [
        {
            id: 'lacto', name: 'Lactobacillus',
            type: 'bacteria', optimalTemp: 40, tolerance: 10, // 30-50C range
            desc: "The 'Sour' bacteria. Loves warm milk.",
            learn: "Lactobacillus creates Lactic Acid. This acid lowers pH, preserving food by making it too acidic for bad bacteria to survive."
        },
        {
            id: 'yeast', name: 'Saccharomyces (Yeast)',
            type: 'fungus', optimalTemp: 25, tolerance: 10, // 15-35C range
            desc: "The 'Gas' maker. Loves room temp.",
            learn: "Yeast performs alcoholic fermentation. It turns sugar into Ethanol (alcohol) and CO2 (bubbles). It's used for bread, beer, and wine."
        },
        {
            id: 'aceto', name: 'Acetobacter',
            type: 'bacteria', optimalTemp: 30, tolerance: 10,
            desc: "The 'Vinegar' maker. Needs oxygen.",
            learn: "Acetobacter eats alcohol and turns it into Acetic Acid (Vinegar). It needs plenty of oxygen to work."
        }
    ],
    additive: [
        {
            id: 'salt', name: 'Salt (NaCl)',
            effect: 'preservative',
            desc: "Inhibits bad bacteria via osmosis.",
            learn: "Salt creates a hypertonic environment. It sucks water out of bacterial cells (osmosis). Good bacteria like Lactobacillus are salt-tolerant, but pathogens die."
        },
        {
            id: 'sugar', name: 'Sugar (Sucrose)',
            effect: 'fuel',
            desc: "Extra food for the microbes.",
            learn: "Adding sugar speeds up fermentation by giving microbes an easy energy source. Too much can cause a population explosion!"
        },
        {
            id: 'none', name: 'Nothing',
            effect: 'neutral',
            desc: "Just the basics.",
            learn: "Sometimes simple is best. Wild fermentation relies only on what's naturally present."
        }
    ]
};

const ORDERS = [
    {
        id: 'yogurt', title: "Perfect Yogurt",
        desc: "I need a smooth, tart yogurt. Not too runny!",
        reqs: { substrate: 'milk', microbe: 'lacto', temp: 40 },
        hint: "Yogurt needs Milk and Lactobacillus. Keep it warm (around 40°C) so the bacteria thrive."
    },
    {
        id: 'kimchi', title: "Spicy Kimchi",
        desc: "Make me some preserved cabbage. Needs to be safe to eat.",
        reqs: { substrate: 'cabbage', microbe: 'lacto', additive: 'salt' },
        hint: "Kimchi uses Cabbage and Lactobacillus. Crucially, you need SALT to kill the bad bugs via osmosis."
    },
    {
        id: 'sourdough', title: "Sourdough Starter",
        desc: "I need a bubbly starter for bread.",
        reqs: { substrate: 'flour', microbe: 'yeast', temp: 25 },
        hint: "Bread needs Flour and Yeast. Yeast likes room temperature (around 25°C). Too hot and you'll kill it!"
    },
    {
        id: 'vinegar', title: "Apple Cider Vinegar",
        desc: "Turn this old cider into vinegar.",
        reqs: { substrate: 'cabbage', microbe: 'aceto', temp: 30 }, // Simplified: Cabbage represents "plant matter/sugar" here for game simplicity, or we could add Cider. Let's stick to existing inputs but maybe imply cider via text. Actually, let's just use 'flour' as a generic carb source or stick to the logic. Let's use 'flour' + 'aceto' as a 'Malt Vinegar' proxy to keep it simple.
        // Correction: Let's stick to the 3 inputs. Let's say "Malt Vinegar" -> Flour + Acetobacter.
        reqs: { substrate: 'flour', microbe: 'aceto', temp: 30 },
        hint: "Malt vinegar comes from grains (Flour). Acetobacter needs a warm environment to turn alcohol into acid."
    }
];

class Game {
    constructor() {
        this.reputation = 50;
        this.timeLeft = GAME_DURATION;
        this.timerInterval = null;
        this.currentOrder = null;
        this.selected = { substrate: null, microbe: null, additive: null };
        this.temp = 20;

        this.ui = {
            rep: document.getElementById('reputation'),
            timer: document.getElementById('timer'),
            orderTitle: document.querySelector('.order-header'),
            orderDesc: document.getElementById('order-desc'),
            assistant: document.getElementById('assistant-text'),
            hintText: document.getElementById('next-step-text'),
            fermentBtn: document.getElementById('ferment-btn'),
            tempSlider: document.getElementById('temp-slider'),
            tempVal: document.getElementById('temp-val'),
            jarLiquid: document.getElementById('jar-liquid'),
            jarLabel: document.getElementById('jar-label'),
            lists: {
                substrate: document.getElementById('list-substrate'),
                microbe: document.getElementById('list-microbe'),
                additive: document.getElementById('list-additive')
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
        this.renderIngredients();
        this.startTimer();
        this.newOrder();

        this.ui.fermentBtn.addEventListener('click', () => this.ferment());
        this.ui.tempSlider.addEventListener('input', (e) => {
            this.temp = parseInt(e.target.value);
            this.ui.tempVal.textContent = this.temp;
            this.updateJarVisuals();
        });

        this.ui.modal.close.addEventListener('click', () => this.hideModal());
        this.ui.modal.el.addEventListener('click', (e) => {
            if (e.target === this.ui.modal.el) this.hideModal();
        });
    }

    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            const m = Math.floor(this.timeLeft / 60);
            const s = this.timeLeft % 60;
            this.ui.timer.textContent = `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;

            if (this.timeLeft <= 0) this.gameOver();
        }, 1000);
    }

    renderIngredients() {
        ['substrate', 'microbe', 'additive'].forEach(type => {
            this.ui.lists[type].innerHTML = '';
            INGREDIENTS[type].forEach(ing => {
                const btn = document.createElement('div');
                btn.className = 'ingredient-btn';
                btn.innerHTML = `
                    <div>
                        <div class="ingredient-name">${ing.name}</div>
                        <div class="ingredient-desc">${ing.desc}</div>
                    </div>
                `;
                btn.addEventListener('click', () => this.selectIngredient(type, ing));

                const learn = document.createElement('span');
                learn.className = 'learn-link';
                learn.textContent = '[?]';
                learn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    this.showModal(ing.name, ing.learn);
                });
                btn.querySelector('div').appendChild(learn);

                this.ui.lists[type].appendChild(btn);
            });
        });
    }

    selectIngredient(type, ing) {
        this.selected[type] = ing;

        const list = this.ui.lists[type];
        Array.from(list.children).forEach(child => child.classList.remove('selected'));
        const index = INGREDIENTS[type].indexOf(ing);
        list.children[index].classList.add('selected');

        this.updateJarVisuals();

        const ready = this.selected.substrate && this.selected.microbe && this.selected.additive;
        this.ui.fermentBtn.disabled = !ready;

        this.ui.assistant.innerHTML = `${ing.desc} <span class="learn-link" onclick="game.showModal('${ing.name}', '${ing.learn.replace(/'/g, "\\'")}')">Read More</span>`;
        this.updateHint();
    }

    updateJarVisuals() {
        const s = this.selected.substrate;
        const m = this.selected.microbe;

        if (s) {
            this.ui.jarLiquid.style.height = '80%';
            this.ui.jarLiquid.style.backgroundColor = s.id === 'milk' ? '#f0f0f0' : s.id === 'cabbage' ? '#90ee90' : '#eec';
            this.ui.jarLabel.style.color = s.id === 'milk' ? '#000' : '#fff';
            this.ui.jarLabel.textContent = s.name;
        } else {
            this.ui.jarLiquid.style.height = '0%';
        }
    }

    newOrder() {
        this.currentOrder = ORDERS[Math.floor(Math.random() * ORDERS.length)];
        this.ui.orderTitle.textContent = this.currentOrder.title;
        this.ui.orderDesc.textContent = this.currentOrder.desc;
        this.ui.assistant.textContent = this.currentOrder.hint;

        this.selected = { substrate: null, microbe: null, additive: null };
        this.ui.fermentBtn.disabled = true;
        document.querySelectorAll('.ingredient-btn').forEach(b => b.classList.remove('selected'));
        this.updateJarVisuals();
        this.updateHint();
    }

    updateHint() {
        if (!this.selected.substrate) {
            this.ui.hintText.textContent = "Select a SUBSTRATE (Base ingredient).";
        } else if (!this.selected.microbe) {
            this.ui.hintText.textContent = "Select a MICROBE to start fermentation.";
        } else if (!this.selected.additive) {
            this.ui.hintText.textContent = "Select an ADDITIVE (Salt/Sugar).";
        } else {
            this.ui.hintText.textContent = "Adjust TEMP if needed, then FERMENT!";
        }
    }

    ferment() {
        const s = this.selected.substrate;
        const m = this.selected.microbe;
        const a = this.selected.additive;
        const t = this.temp;
        const reqs = this.currentOrder.reqs;

        let success = true;
        let failReason = "";

        // Check Ingredients
        if (reqs.substrate && s.id !== reqs.substrate) {
            success = false;
            failReason = `Wrong base! Expected ${reqs.substrate}.`;
        } else if (reqs.microbe && m.id !== reqs.microbe) {
            success = false;
            failReason = `Wrong microbe! Expected ${reqs.microbe}.`;
        } else if (reqs.additive && a.id !== reqs.additive) {
            success = false;
            failReason = `Missing additive! Expected ${reqs.additive}.`;
        }

        // Check Temperature (Chemistry Logic)
        if (success) {
            const minTemp = m.optimalTemp - m.tolerance;
            const maxTemp = m.optimalTemp + m.tolerance;

            if (t < minTemp) {
                success = false;
                failReason = `Too cold! The microbes are dormant. Need ~${m.optimalTemp}°C.`;
            } else if (t > maxTemp) {
                success = false;
                failReason = `Too hot! You killed the microbes. Need ~${m.optimalTemp}°C.`;
            }
        }

        if (success) {
            this.reputation = Math.min(100, this.reputation + 10);
            this.ui.assistant.innerHTML = `<span style="color:var(--bio-green)">DELICIOUS!</span> Perfect fermentation.`;
            this.createBubbles();
            this.flash(true);
            setTimeout(() => this.newOrder(), 2000);
        } else {
            this.reputation = Math.max(0, this.reputation - 10);
            this.ui.assistant.innerHTML = `<span style="color:var(--danger-red)">SPOILED!</span> ${failReason}`;
            this.flash(false);
        }

        this.ui.rep.textContent = `${this.reputation}%`;

        if (this.reputation <= 0) {
            alert("Kitchen Closed! Reputation 0.");
            location.reload();
        }
    }

    createBubbles() {
        for (let i = 0; i < 10; i++) {
            const b = document.createElement('div');
            b.className = 'bubble';
            b.style.width = Math.random() * 20 + 10 + 'px';
            b.style.height = b.style.width;
            b.style.left = Math.random() * 100 + '%';
            b.style.bottom = '0';
            this.ui.jarLiquid.appendChild(b);
            setTimeout(() => b.remove(), 2000);
        }
    }

    flash(success) {
        const chamber = document.getElementById('chamber');
        chamber.className = 'panel-center ' + (success ? 'flash-success' : 'flash-fail');
        setTimeout(() => chamber.className = 'panel-center', 500);
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
        alert(`Shift Over! Final Reputation: ${this.reputation}%`);
        location.reload();
    }
}

window.game = new Game();
