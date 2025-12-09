console.log('SCRIPT.JS LOADED - VERSION 3');
const GAME_DURATION = 180; // 3 minutes
// Educational Data: Functional Groups & Properties
const PROPERTIES = {
    POSITIVE: { id: 'pos', name: 'Positive Charge (+)', color: 'prop-positive', icon: '+' },
    NEGATIVE: { id: 'neg', name: 'Negative Charge (-)', color: 'prop-negative', icon: '-' },
    HYDROPHOBIC: { id: 'hydro', name: 'Hydrophobic (Greasy)', color: 'prop-hydrophobic', icon: '⬢' },
    POLAR: { id: 'polar', name: 'Polar (Sticky)', color: 'prop-polar', icon: '💧' }
};

// Rules of Attraction (Simplified Intermolecular Forces)
// Key: Target Property -> Value: Matching Drug Property
const MATCHING_RULES = {
    'pos': 'neg',    // + attracts -
    'neg': 'pos',    // - attracts +
    'hydro': 'hydro', // Greasy likes Greasy
    'polar': 'polar'  // Sticky likes Sticky (H-bonds)
};

const FUNCTIONAL_GROUPS = [
    { id: 'amine', name: 'Amine', prop: PROPERTIES.POSITIVE, icon: 'NH₃⁺' },
    { id: 'carboxyl', name: 'Carboxyl', prop: PROPERTIES.NEGATIVE, icon: 'COO⁻' },
    { id: 'methyl', name: 'Methyl', prop: PROPERTIES.HYDROPHOBIC, icon: 'CH₃' },
    { id: 'hydroxyl', name: 'Hydroxyl', prop: PROPERTIES.POLAR, icon: 'OH' }
];

const LEARNING_CONTENT = {
    OBJECTIVE: {
        title: "Drug Discovery Basics",
        body: `
            <p>In drug discovery, scientists aim to design molecules that fit perfectly into specific "pockets" on a virus or protein. This is like finding the right key for a lock. The better the fit, the more effective the drug will be at stopping the virus.</p>
            <p>It's not just about shape, though. The chemical properties must also match. We use "Functional Groups"—small clusters of atoms—to give the drug specific traits like charge or stickiness. These groups interact with the target environment.</p>
            <p>Your goal is to analyze the target pocket's properties and attach the complementary functional groups to your drug scaffold. If the target is negative, you need a positive group. If it's greasy, you need a greasy group.</p>
        `
    },
    TEST_READY: {
        title: "Binding Affinity & Docking",
        body: `
            <p>When you click "Test Candidate", you are simulating a process called "Molecular Docking". This is a computational method used to predict how well a drug molecule binds to its target. High affinity means a strong, stable bond.</p>
            <p>We look for two main things: <b>Complementarity</b> (do the properties match?) and <b>Steric Fit</b> (is there room?). In this game, we focus on complementarity. A perfect match creates a stable complex that can inhibit the virus's function.</p>
            <p>Be careful of "Clashes" or "Repulsion". If you put two like charges together (e.g., positive near positive), they will push each other away with significant force. This makes the drug ineffective and unstable.</p>
        `
    },
    FAILURE_REPULSION: {
        title: "Electrostatic Repulsion",
        body: `
            <p>You encountered a "Repulsion"! This happens when two similar charges are brought close together. Just like trying to push the north poles of two magnets together, they resist and push apart.</p>
            <p>In chemistry, this is governed by Coulomb's Law. Positive repels Positive, and Negative repels Negative. This force is very strong and prevents the drug from sitting comfortably in the binding pocket.</p>
            <p>To fix this, you need to swap the functional group. If the target is Positive, remove your Positive group and replace it with a Negative one to create an attractive force instead.</p>
        `
    },
    FAILURE_WEAK: {
        title: "Weak Binding Affinity",
        body: `
            <p>Your drug had "Weak Binding". This usually means the functional groups you chose didn't actively clash, but they didn't help either. It's like using a key that fits in the hole but doesn't turn the lock.</p>
            <p>Drugs rely on specific interactions to stay attached to their target. Without strong forces like Electrostatic Attraction or Hydrogen Bonding, the drug will simply float away due to thermal motion.</p>
            <p>Check the "Target Analysis" panel again. Look for the specific property required (e.g., "Required: Polar") and ensure you have added a group that provides exactly that property.</p>
        `
    },
    SUCCESS_ELECTROSTATIC: {
        title: "Electrostatic Attraction",
        body: `
            <p>Success! You utilized <b>Electrostatic Attraction</b>. This is the strong force between opposite charges—Positive and Negative. It's one of the most powerful tools in drug design.</p>
            <p>Many proteins and viral structures have charged areas. By placing an oppositely charged group on your drug, you create a "salt bridge". This acts like a strong magnet, locking the drug into place.</p>
            <p>This type of bond is very specific and directional, which helps ensure the drug only binds to its intended target and not to other random proteins in the body.</p>
        `
    },
    SUCCESS_HYDROPHOBIC: {
        title: "The Hydrophobic Effect",
        body: `
            <p>Great job! You leveraged the <b>Hydrophobic Effect</b>. "Hydrophobic" means "water-fearing". These groups (like Methyl) hate water and prefer to stick to other greasy, oily substances.</p>
            <p>The inside of a protein pocket is often "greasy" or hydrophobic. When you place a hydrophobic drug group there, it's not actually "attracted" to the pocket so much as it is being pushed there by the surrounding water molecules, which want to stick to each other.</p>
            <p>This entropy-driven effect is a major driving force in how drugs bind. It's like oil droplets merging in water to minimize their surface area.</p>
        `
    },
    SUCCESS_HBOND: {
        title: "Hydrogen Bonding",
        body: `
            <p>Excellent! You formed a <b>Hydrogen Bond</b>. This is a special type of attraction between "Polar" groups. It's the same force that holds water molecules together and gives water its unique properties.</p>
            <p>In drug design, we call this "Sticky likes Sticky". Groups like Hydroxyl (-OH) act as molecular velcro. They have a slight charge separation that allows them to bridge with specific atoms in the target.</p>
            <p>Hydrogen bonds are weaker than full ionic charges but are highly specific. They are crucial for fine-tuning the fit of a drug and ensuring it binds in exactly the right orientation.</p>
        `
    }
};

class Game {
    constructor() {
        this.score = 0;
        this.timeLeft = GAME_DURATION;
        this.timerInterval = null;
        this.isPlaying = false;
        this.level = 1;
        this.currentTarget = null; // The active binding pocket on the virus
        this.builtMolecule = { center: null };

        // DOM Elements
        this.timerEl = document.getElementById('timer');
        this.scoreEl = document.getElementById('score');
        this.targetsEl = document.getElementById('targets-left');
        this.virusContainer = document.getElementById('virus-container');
        this.groupTray = document.getElementById('group-tray');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreEl = document.getElementById('final-score');
        this.targetInfoPanel = document.getElementById('target-pocket-info');
        this.targetDesc = document.getElementById('target-desc');
        this.assistantText = document.getElementById('assistant-text');
        console.log('Game initialized. assistantText found:', !!this.assistantText);

        // Modal Elements
        this.modal = document.getElementById('edu-modal');
        this.modalTitle = document.getElementById('edu-title');
        this.modalBody = document.getElementById('edu-body');
        this.closeModalBtn = document.getElementById('close-modal-btn');

        // Bind buttons
        document.getElementById('start-btn').addEventListener('click', () => this.start());
        document.getElementById('restart-btn').addEventListener('click', () => this.reset());
        const launchBtn = document.getElementById('launch-btn');
        launchBtn.addEventListener('click', () => this.testCandidate());
        launchBtn.addEventListener('mouseenter', () => this.updateAssistant("Ready to test? We are looking for a <span style='color:var(--neon-green)'>High Affinity</span> match (Green) and NO repulsion (Red).", "TEST_READY"));
        launchBtn.addEventListener('mouseleave', () => this.resetAssistant());

        if (this.closeModalBtn) {
            this.closeModalBtn.addEventListener('click', () => this.hideModal());
        }

        // Event delegation for Learn More button
        this.assistantText.addEventListener('click', (e) => {
            console.log('Assistant text clicked', e.target);
            if (e.target.classList.contains('learn-more-btn')) {
                const key = e.target.dataset.key;
                console.log('Learn more button clicked, key:', key);
                this.showModal(key);
            }
        });

        this.initSlots();
    }

    initSlots() {
        const slots = document.querySelectorAll('.slot');
        slots.forEach(slot => {
            slot.addEventListener('dragover', (e) => {
                e.preventDefault();
                slot.classList.add('hovered');
            });
            slot.addEventListener('dragleave', () => {
                slot.classList.remove('hovered');
            });
            slot.addEventListener('drop', (e) => {
                e.preventDefault();
                slot.classList.remove('hovered');
                const groupId = e.dataTransfer.getData('text/plain');
                this.equipGroup(slot, groupId);
                this.updateAssistant("Group attached! Is this the right property to bind to the target?", "OBJECTIVE");
            });
            // Click to remove
            slot.addEventListener('click', () => {
                if (slot.dataset.groupId) {
                    this.unequipGroup(slot);
                    this.updateAssistant("Group removed. Try a different one.", "OBJECTIVE");
                }
            });

            // Hover help
            slot.addEventListener('mouseenter', () => {
                if (!slot.dataset.groupId) {
                    this.updateAssistant("Drag a Functional Group here to modify the drug's chemical properties.", "OBJECTIVE");
                }
            });
            slot.addEventListener('mouseleave', () => this.resetAssistant());
        });
    }

    start() {
        this.isPlaying = true;
        this.score = 0;
        this.timeLeft = GAME_DURATION;
        this.level = 1;

        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');

        this.updateHUD();
        this.startTimer();
        this.generateToolkit();
        this.startLevel();
    }

    reset() {
        this.start();
    }

    startTimer() {
        clearInterval(this.timerInterval);
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimerDisplay();

            if (this.timeLeft <= 0) {
                this.gameOver();
            }
        }, 1000);
    }

    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        this.timerEl.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }

    updateHUD() {
        this.scoreEl.textContent = this.score;
        this.targetsEl.textContent = this.level; // Using level as "Targets Cleared" count
    }

    generateToolkit() {
        const tray = document.getElementById('group-tray');
        if (!tray) return;

        tray.innerHTML = '';
        FUNCTIONAL_GROUPS.forEach(group => {
            const el = document.createElement('div');
            el.classList.add('func-group', group.prop.color);
            el.textContent = group.icon;
            el.draggable = true;

            el.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', group.id);
                this.updateAssistant(`Dragging <b>${group.name}</b>. Property: <b>${group.prop.name}</b>. <br>Use this to match with ${MATCHING_RULES[group.prop.id] === 'pos' ? 'Negative' : MATCHING_RULES[group.prop.id] === 'neg' ? 'Positive' : MATCHING_RULES[group.prop.id] === 'hydro' ? 'Hydrophobic' : 'Polar'} targets.`, "OBJECTIVE");
            });

            el.addEventListener('dragend', () => this.resetAssistant());

            // Hover help
            el.addEventListener('mouseenter', () => {
                this.updateAssistant(`<b>${group.name}</b> (${group.icon}): Has <b>${group.prop.name}</b> property.`, "OBJECTIVE");
            });
            el.addEventListener('mouseleave', () => this.resetAssistant());

            tray.appendChild(el);
        });
    }

    startLevel() {
        // Clear previous pockets
        document.querySelectorAll('.binding-pocket').forEach(p => p.remove());
        this.clearWorkbench();

        // Create a new Target Pocket on the Virus
        this.createTargetPocket();
        this.resetAssistant();
    }

    createTargetPocket() {
        const pocket = document.createElement('div');
        pocket.classList.add('binding-pocket', 'active-target');

        // Randomly assign requirements
        const props = Object.values(PROPERTIES);
        const targetProp = props[Math.floor(Math.random() * props.length)];

        pocket.dataset.targetProp = targetProp.id;
        pocket.textContent = '?';

        // Position randomly around core
        const angle = Math.random() * 2 * Math.PI;
        const radius = 100;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        // Centering logic
        pocket.style.top = '50%';
        pocket.style.left = '50%';
        pocket.style.marginTop = '-25px';
        pocket.style.marginLeft = '-25px';
        pocket.style.transform = `translate(${x}px, ${y}px)`;

        this.virusContainer.appendChild(pocket);
        this.currentTarget = pocket;

        // Show Info
        this.targetInfoPanel.classList.remove('hidden');
        const needed = MATCHING_RULES[targetProp.id];
        const neededProp = Object.values(PROPERTIES).find(p => p.id === needed);

        this.targetDesc.innerHTML = `Target Environment: <span style="color:var(--neon-pink)">${targetProp.name}</span><br>
                                     Required Drug Property: <span style="color:var(--neon-green)">${neededProp.name}</span>`;
    }

    equipGroup(slot, groupId) {
        const group = FUNCTIONAL_GROUPS.find(g => g.id === groupId);
        if (!group) return;

        // Visuals
        slot.textContent = group.icon;
        // Keep 'scaffold' class so layout remains correct, remove others first
        slot.className = `slot scaffold ${slot.dataset.pos} ${group.prop.color}`;
        slot.dataset.groupId = groupId;

        // Logic
        this.builtMolecule[slot.dataset.pos] = group;
    }

    unequipGroup(slot) {
        slot.innerHTML = 'DRUG<br>CORE';
        slot.className = `slot scaffold ${slot.dataset.pos}`;
        delete slot.dataset.groupId;
        this.builtMolecule[slot.dataset.pos] = null;
    }

    clearWorkbench() {
        const slots = document.querySelectorAll('.slot');
        slots.forEach(s => this.unequipGroup(s));
    }

    testCandidate() {
        if (!this.currentTarget) return;

        const targetPropId = this.currentTarget.dataset.targetProp;
        const neededPropId = MATCHING_RULES[targetPropId];

        let hasMatch = false;
        let hasClash = false;

        const group = this.builtMolecule.center;
        if (group) {
            if (group.prop.id === neededPropId) hasMatch = true;
            if (group.prop.id === targetPropId && targetPropId !== 'hydro' && targetPropId !== 'polar') {
                hasClash = true;
            }
        }

        if (hasMatch && !hasClash) {
            this.success();
        } else {
            this.failure(hasClash);
        }
    }

    success() {
        const targetPropId = this.currentTarget.dataset.targetProp;
        let explanation = "";
        let learnKey = "";

        switch (targetPropId) {
            case 'pos':
                explanation = "Success! <span style='color:var(--neon-blue)'>Positive</span> attracts <span style='color:var(--neon-pink)'>Negative</span>. Electrostatic forces at work!";
                learnKey = "SUCCESS_ELECTROSTATIC";
                break;
            case 'neg':
                explanation = "Success! <span style='color:var(--neon-pink)'>Negative</span> attracts <span style='color:var(--neon-blue)'>Positive</span>. Electrostatic forces at work!";
                learnKey = "SUCCESS_ELECTROSTATIC";
                break;
            case 'hydro':
                explanation = "Success! <span style='color:var(--neon-yellow)'>Hydrophobic</span> groups clump together to avoid water (Entropy effect).";
                learnKey = "SUCCESS_HYDROPHOBIC";
                break;
            case 'polar':
                explanation = "Success! <span style='color:var(--neon-green)'>Polar</span> groups form Hydrogen Bonds. Sticky likes Sticky!";
                learnKey = "SUCCESS_HBOND";
                break;
        }

        this.updateAssistant(explanation, learnKey);

        this.currentTarget.classList.remove('active-target');
        this.currentTarget.classList.add('filled');
        this.currentTarget.style.borderColor = 'var(--neon-green)';
        this.currentTarget.style.background = 'rgba(0, 255, 65, 0.2)';
        this.currentTarget.textContent = '✔';

        this.createParticles(this.currentTarget, '✨');

        this.score += 500;
        this.level++;
        this.updateHUD();

        setTimeout(() => {
            this.startLevel();
        }, 6000);
    }

    failure(isClash) {
        const workbench = document.getElementById('workbench-container');
        workbench.classList.add('shake');
        setTimeout(() => workbench.classList.remove('shake'), 500);

        let learnKey = "FAILURE_WEAK";
        if (isClash) {
            this.targetDesc.innerHTML = `<span style="color:red">REPULSION DETECTED!</span><br>Like charges repel!`;
            this.updateAssistant("Repulsion! Like charges repel each other. Try the opposite charge.", "FAILURE_REPULSION");
        } else {
            this.targetDesc.innerHTML = `<span style="color:orange">WEAK BINDING!</span><br>Add the correct group.`;
            this.updateAssistant("Weak binding. The drug isn't sticking. Check the target requirements.", "FAILURE_WEAK");
        }

        this.score = Math.max(0, this.score - 50);
        this.updateHUD();
    }

    createParticles(element, char) {
        const rect = element.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.classList.add('particle');
            particle.textContent = char;
            particle.style.left = `${centerX + (Math.random() - 0.5) * 60}px`;
            particle.style.top = `${centerY + (Math.random() - 0.5) * 60}px`;
            document.body.appendChild(particle);

            setTimeout(() => particle.remove(), 1000);
        }
    }

    gameOver() {
        this.isPlaying = false;
        clearInterval(this.timerInterval);
        this.finalScoreEl.textContent = this.score;
        this.gameOverScreen.classList.remove('hidden');
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
});
