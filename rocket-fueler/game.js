const mixSlider = document.getElementById('mix-slider');
const oxidizerVal = document.getElementById('oxidizer-val');
const fuelVal = document.getElementById('fuel-val');
const igniteBtn = document.getElementById('ignite-btn');
const resetBtn = document.getElementById('reset-btn');
const feedbackMsg = document.getElementById('feedback-msg');
const flame = document.getElementById('flame');
const thrustDisplay = document.getElementById('thrust-display');
const velocityDisplay = document.getElementById('velocity-display');
const altDisplay = document.getElementById('alt-display');
const statusDisplay = document.getElementById('status-display');
const logConsole = document.getElementById('mission-log');
const modal = document.getElementById('success-modal');
const closeModal = document.querySelector('.close-modal');
const continueBtn = document.getElementById('continue-btn');

let isLaunched = false;
let altitude = 0;
let velocity = 0;
let thrust = 0;
let interval = null;

// Ideal Ratio: 2.56 (Oxidizer to Fuel for LOX/RP-1 approx)
// Simplified for game: 70% Ox, 30% Fuel
const IDEAL_OX = 70;
const IDEAL_FUEL = 30;
const TOLERANCE = 5;

const facts = [
    "Stoichiometric ratio ensures complete combustion for maximum efficiency.",
    "Liquid Oxygen (LOX) boils at -183°C (-297°F). Cryogenic!",
    "RP-1 is a highly refined form of kerosene used in rockets.",
    "Specific Impulse (Isp) measures how effectively a rocket uses propellant.",
    "Hypergolic propellants ignite spontaneously upon contact.",
    "The Saturn V used LOX and RP-1 for its massive first stage."
];

let factIndex = 0;
const factText = document.getElementById('fact-text');

function init() {
    setupListeners();
    updateSliders();
    startFactRotation();
}

function startFactRotation() {
    setInterval(() => {
        factIndex = (factIndex + 1) % facts.length;
        factText.textContent = facts[factIndex];
    }, 12000); // 12 seconds
}

function setupListeners() {
    mixSlider.oninput = () => {
        const val = mixSlider.value;
        oxidizerVal.textContent = `${val}%`;
        fuelVal.textContent = `${100 - val}%`;
    };

    igniteBtn.onclick = ignite;
    resetBtn.onclick = reset;

    closeModal.onclick = () => modal.style.display = 'none';
    continueBtn.onclick = () => {
        modal.style.display = 'none';
        reset();
    };

    window.onclick = (e) => {
        if (e.target == modal) modal.style.display = 'none';
    };
}

function updateSliders() {
    const val = mixSlider.value;
    oxidizerVal.textContent = `${val}%`;
    fuelVal.textContent = `${100 - val}%`;
}

function ignite() {
    if (isLaunched) return;

    const ox = parseInt(mixSlider.value);
    const fuel = 100 - ox;

    /*
    // Check Total Volume - Not needed for single slider
    if (ox + fuel > 100) { ... }
    if (ox + fuel < 50) { ... }
    */

    isLaunched = true;
    igniteBtn.disabled = true;
    mixSlider.disabled = true;

    // Calculate Efficiency
    const oxDiff = Math.abs(ox - IDEAL_OX);
    const fuelDiff = Math.abs(fuel - IDEAL_FUEL);
    const totalError = oxDiff + fuelDiff;

    let efficiency = 0;
    if (totalError <= TOLERANCE) {
        efficiency = 100 - totalError;
        launchSuccess(efficiency);
    } else {
        launchFail(totalError);
    }
}

function launchSuccess(eff) {
    log("Ignition Sequence Start...");
    feedbackMsg.textContent = "Main Engine Start... Liftoff!";
    flame.classList.add('active');
    document.body.classList.add('shake');
    statusDisplay.textContent = "In Flight";
    statusDisplay.style.color = "#39ff14";

    let t = 0;
    interval = setInterval(() => {
        t++;
        thrust = 7500 * (eff / 100);
        velocity += (thrust / 1000) * 0.5; // Simplified physics
        altitude += velocity * 0.1;

        thrustDisplay.textContent = `${Math.round(thrust)} kN`;
        velocityDisplay.textContent = `${Math.round(velocity)} m/s`;
        altDisplay.textContent = `${Math.round(altitude)} km`;

        if (t % 10 === 0) log(`T+${t}s: Altitude ${Math.round(altitude)}km`);

        if (altitude > 200) {
            clearInterval(interval);
            missionComplete(eff);
        }
    }, 100);
}

function launchFail(error) {
    log("Ignition Sequence Start...");
    flame.classList.add('active');
    flame.style.height = '50px'; // Weak flame
    flame.style.background = 'linear-gradient(to bottom, #555, #333)'; // Smoky

    setTimeout(() => {
        log("CRITICAL: Thrust Instability detected.");
        feedbackMsg.textContent = "Engine Stall! Mixture Imbalanced.";
        statusDisplay.textContent = "ABORTED";
        statusDisplay.style.color = "red";
        flame.classList.remove('active');
        isLaunched = false;
        igniteBtn.disabled = false;
        mixSlider.disabled = false;
    }, 2000);
}

function missionComplete(eff) {
    document.body.classList.remove('shake');
    flame.classList.remove('active');
    statusDisplay.textContent = "Orbit Stable";
    feedbackMsg.textContent = "Mission Success! Payload Delivered.";
    log("Orbit achieved. SECO (Second Engine Cutoff).");

    setTimeout(() => {
        showSuccess(eff);
    }, 1000);
}

function showSuccess(eff) {
    modal.style.display = 'flex';
    document.getElementById('result-reward').textContent = `Efficiency: ${eff}%`;
}

function reset() {
    clearInterval(interval);
    isLaunched = false;
    altitude = 0;
    velocity = 0;
    thrust = 0;

    thrustDisplay.textContent = "0 kN";
    velocityDisplay.textContent = "0 m/s";
    altDisplay.textContent = "0 km";
    statusDisplay.textContent = "Grounded";
    statusDisplay.style.color = "var(--neon-orange)";

    feedbackMsg.textContent = "Adjust mixture and ignite...";
    logConsole.innerHTML = '<div class="log-line">System initialized...</div>';

    flame.classList.remove('active');
    document.body.classList.remove('shake');

    igniteBtn.disabled = false;
    mixSlider.disabled = false;

    // Reset sliders to default
    mixSlider.value = 50;
    updateSliders();
}

function log(msg) {
    const line = document.createElement('div');
    line.className = 'log-line';
    line.textContent = msg;
    logConsole.prepend(line);
}

init();
