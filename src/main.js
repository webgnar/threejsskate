import * as THREE from 'three';

// Game state
let gameState = {
    speed: 0.1,
    score: 0,
    isGameOver: false,
    isGameStarted: false,
    lanes: [-4, 0, 4],
    nugsCollected: 0,
    carsAvoided: 0,
    baseCarSpeed: 0.1,
    currentTrick: ''
};

// High Scores Management
const MAX_HIGH_SCORES = 5;
let highScores = JSON.parse(localStorage.getItem('highScores')) || [];

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 5, 10);
camera.lookAt(0, 0, 0);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// UI Elements
const titleScreen = document.getElementById('titleScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const scoreDisplay = document.getElementById('scoreDisplay');
const finalScore = document.getElementById('finalScore');
const startButton = document.getElementById('startButton');
const restartButton = document.getElementById('restartButton');
const carsAvoidedDisplay = document.createElement('div');
const trickDisplay = document.createElement('div');

// Setup new UI elements
carsAvoidedDisplay.style.position = 'absolute';
carsAvoidedDisplay.style.top = '60px';
carsAvoidedDisplay.style.left = '20px';
carsAvoidedDisplay.style.color = 'white';
carsAvoidedDisplay.style.fontFamily = 'Arial';
carsAvoidedDisplay.style.fontSize = '24px';
document.body.appendChild(carsAvoidedDisplay);

// Update trick display position and add container for flames
const trickDisplayContainer = document.createElement('div');
trickDisplayContainer.style.position = 'absolute';
trickDisplayContainer.style.top = '20px';
trickDisplayContainer.style.left = '50%';
trickDisplayContainer.style.transform = 'translateX(-50%)';
trickDisplayContainer.style.display = 'flex';
trickDisplayContainer.style.flexDirection = 'column';
trickDisplayContainer.style.alignItems = 'center';
document.body.appendChild(trickDisplayContainer);

// Flames container
const flamesContainer = document.createElement('div');
flamesContainer.style.position = 'absolute';
flamesContainer.style.width = '100%';
flamesContainer.style.height = '100%';
flamesContainer.style.zIndex = '-1';
flamesContainer.innerHTML = `
    <style>
        @keyframes flame {
            0% { transform: scale(1) rotate(0deg); opacity: 0.5; }
            25% { transform: scale(1.1) rotate(-2deg); opacity: 0.8; }
            50% { transform: scale(1) rotate(1deg); opacity: 0.6; }
            75% { transform: scale(1.2) rotate(-1deg); opacity: 0.9; }
            100% { transform: scale(1) rotate(0deg); opacity: 0.5; }
        }
        .flame {
            position: absolute;
            width: 20px;
            height: 20px;
            background: radial-gradient(circle, #ff4500, #ff8c00);
            border-radius: 50%;
            filter: blur(4px);
            animation: flame 0.5s infinite;
        }
    </style>
`;

// Create multiple flames
for (let i = 0; i < 8; i++) {
    const flame = document.createElement('div');
    flame.className = 'flame';
    flame.style.left = `${i * 30 - 10}px`;
    flame.style.animationDelay = `${i * 0.1}s`;
    flamesContainer.appendChild(flame);
}

trickDisplayContainer.appendChild(flamesContainer);

// Update trick display styling
trickDisplay.style.position = 'relative';
trickDisplay.style.padding = '10px 20px';
trickDisplay.style.color = 'white';
trickDisplay.style.fontFamily = 'Arial';
trickDisplay.style.fontSize = '32px';
trickDisplay.style.fontWeight = 'bold';
trickDisplay.style.textShadow = '0 0 10px rgba(255,255,255,0.5)';
trickDisplay.style.opacity = '0';
trickDisplay.style.transition = 'opacity 0.3s';
trickDisplayContainer.appendChild(trickDisplay);

// Additional UI Elements
const highScoresList = document.getElementById('highScoresList');
const newHighScoreDiv = document.getElementById('newHighScore');
const initialsInput = document.getElementById('initialsInput');
const submitScoreButton = document.getElementById('submitScore');
const leaderboardScreen = document.getElementById('leaderboardScreen');
const viewLeaderboardButton = document.getElementById('viewLeaderboardButton');
const gameOverLeaderboardButton = document.getElementById('gameOverLeaderboardButton');
const backToMenuButton = document.getElementById('backToMenuButton');

// Hide score display initially
scoreDisplay.classList.add('hidden');

// UI Event Listeners
startButton.addEventListener('click', startGame);
restartButton.addEventListener('click', restartGame);

// Additional UI Event Listeners
viewLeaderboardButton.addEventListener('click', showLeaderboard);
gameOverLeaderboardButton.addEventListener('click', showLeaderboard);
backToMenuButton.addEventListener('click', showTitleScreen);

// Update high scores display
function updateHighScoresDisplay() {
    highScoresList.innerHTML = highScores
        .map((score, index) => `<li>${index + 1}. ${score.initials} - ${Math.floor(score.score)}</li>`)
        .join('');
}

// Check if score is a high score
function isHighScore(score) {
    return highScores.length < MAX_HIGH_SCORES || score > highScores[highScores.length - 1].score;
}

// Add new high score
function addHighScore(score, initials) {
    const newScore = { score, initials };
    highScores.push(newScore);
    highScores.sort((a, b) => b.score - a.score);
    if (highScores.length > MAX_HIGH_SCORES) {
        highScores.pop();
    }
    localStorage.setItem('highScores', JSON.stringify(highScores));
    updateHighScoresDisplay();
}

// Submit score button handler
submitScoreButton.addEventListener('click', () => {
    const initials = initialsInput.value.toUpperCase() || 'AAA';
    addHighScore(gameState.score, initials);
    newHighScoreDiv.classList.add('hidden');
    initialsInput.value = '';
    showLeaderboard(); // Show leaderboard after submitting score
});

function startGame() {
    titleScreen.classList.add('hidden');
    scoreDisplay.classList.remove('hidden');
    gameState.isGameStarted = true;
    gameState.isGameOver = false;
    gameState.score = 0;
    updateHighScoresDisplay(); // Update high scores when game starts
}

function showGameOver() {
    gameOverScreen.classList.remove('hidden');
    scoreDisplay.classList.add('hidden');
    finalScore.textContent = `Score: ${Math.floor(gameState.score)}`;
    
    if (isHighScore(gameState.score)) {
        newHighScoreDiv.classList.remove('hidden');
        initialsInput.focus();
    } else {
        newHighScoreDiv.classList.add('hidden');
    }
}

function showLeaderboard() {
    titleScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    leaderboardScreen.classList.remove('hidden');
    updateHighScoresDisplay();
}

function showTitleScreen() {
    leaderboardScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    titleScreen.classList.remove('hidden');
}

function restartGame() {
    gameOverScreen.classList.add('hidden');
    leaderboardScreen.classList.add('hidden');
    scoreDisplay.classList.remove('hidden');
    gameState.isGameOver = false;
    gameState.score = 0;
    player.position.set(-3, 1, 0);
    playerTarget.z = 0;
    
    // Clear obstacles
    obstacles.forEach(obstacle => {
        scene.remove(obstacle);
    });
    obstacles.length = 0;
}

// Ground texture setup
const textureLoader = new THREE.TextureLoader();
const asphaltTexture = textureLoader.load('https://raw.githubusercontent.com/mrdoob/three.js/dev/examples/textures/terrain/asphalt.jpg');
asphaltTexture.wrapS = THREE.RepeatWrapping;
asphaltTexture.wrapT = THREE.RepeatWrapping;
asphaltTexture.repeat.set(2, 8);

const createGroundSegment = (position) => {
    const geometry = new THREE.BoxGeometry(SEGMENT_LENGTH, 0.5, GROUND_WIDTH);
    const material = new THREE.MeshStandardMaterial({ 
        map: asphaltTexture,
        roughness: 0.7,
        metalness: 0.1,
        color: 0x333333
    });
    const segment = new THREE.Mesh(geometry, material);
    segment.position.copy(position);
    
    // Add lane markings
    const createLaneMarking = (isYellow, zPosition, isDashed) => {
        const stripeLength = isDashed ? 2 : SEGMENT_LENGTH;
        const stripeGeometry = new THREE.PlaneGeometry(stripeLength, 0.15);
        const stripeMaterial = new THREE.MeshStandardMaterial({ 
            color: isYellow ? 0xffff00 : 0xffffff,
            emissive: isYellow ? 0x666600 : 0x666666,
            emissiveIntensity: 0.2,
            roughness: 0.5
        });
        
        if (isDashed) {
            // Create dashed yellow lines
            for (let x = -SEGMENT_LENGTH/2 + 1; x < SEGMENT_LENGTH/2; x += 4) {
                const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
                stripe.rotation.x = -Math.PI / 2;
                stripe.position.set(x, 0.26, zPosition);
                segment.add(stripe);
            }
        } else {
            // Solid white lines
            const stripe = new THREE.Mesh(stripeGeometry, stripeMaterial);
            stripe.rotation.x = -Math.PI / 2;
            stripe.position.set(0, 0.26, zPosition);
            segment.add(stripe);
        }
    };
    
    // Add lane markings for each lane
    createLaneMarking(true, 0, true);      // Center yellow dashed line
    createLaneMarking(false, -4, false);   // Right white solid line
    createLaneMarking(false, 4, false);    // Left white solid line
    
    scene.add(segment);
    return segment;
};

// Update lighting for better headlight effects
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(0, 10, 5);
scene.add(directionalLight);

// Player (Skateboard + Character)
const createPlayer = () => {
    const playerGroup = new THREE.Group();
    
    // Skateboard deck
    const boardGeometry = new THREE.BoxGeometry(1, 0.05, 0.25);
    const boardMaterial = new THREE.MeshPhongMaterial({ color: 0x4a4a4a });
    const skateboard = new THREE.Mesh(boardGeometry, boardMaterial);
    
    // Trucks (silver/metal colored)
    const createTruck = (posX) => {
        const truckGroup = new THREE.Group();
        
        // Truck base (the T-shaped metal part)
        const baseGeometry = new THREE.BoxGeometry(0.15, 0.08, 0.2);
        const truckMaterial = new THREE.MeshPhongMaterial({ color: 0xC0C0C0 });
        const base = new THREE.Mesh(baseGeometry, truckMaterial);
        
        // Truck axle
        const axleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.3, 8);
        const axle = new THREE.Mesh(axleGeometry, truckMaterial);
        axle.rotation.z = Math.PI / 2;
        
        truckGroup.add(base);
        truckGroup.add(axle);
        truckGroup.position.set(posX, -0.05, 0);
        return truckGroup;
    };
    
    // Add front and back trucks
    const frontTruck = createTruck(0.3);
    const backTruck = createTruck(-0.3);
    
    // Wheels
    const createWheel = (posX, posZ) => {
        const wheelGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.04, 16);
        const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0xFFFACD }); // Light yellow
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(posX, -0.05, posZ);
        return wheel;
    };
    
    // Add wheels
    const wheels = [
        createWheel(0.3, 0.15),
        createWheel(0.3, -0.15),
        createWheel(-0.3, 0.15),
        createWheel(-0.3, -0.15)
    ];
    
    // Group for skateboard parts
    const skateboardGroup = new THREE.Group();
    skateboardGroup.add(skateboard);
    skateboardGroup.add(frontTruck);
    skateboardGroup.add(backTruck);
    wheels.forEach(wheel => skateboardGroup.add(wheel));
    playerGroup.skateboard = skateboardGroup;
    
    // Character
    const characterGeometry = new THREE.CapsuleGeometry(0.2, 0.4, 2, 8);
    const characterMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x00ff00,
        metalness: 0.5,
        roughness: 0.2
    });
    const character = new THREE.Mesh(characterGeometry, characterMaterial);
    character.position.y = 0.4;
    playerGroup.character = character;
    
    playerGroup.add(skateboardGroup);
    playerGroup.add(character);
    return playerGroup;
};

const player = createPlayer();
player.position.y = 1;
player.position.x = -3;
scene.add(player);

// Player physics
let playerVelocityY = 0;
let playerVelocityZ = 0;
const GRAVITY = -0.008;
const JUMP_FORCE = 0.2;
const MOVE_SPEED = 0.1;
const PLAYER_MOVE_BOUNDS = 5;
const LERP_FACTOR = 0.05;
const GROUND_WIDTH = PLAYER_MOVE_BOUNDS * 3;
const TILT_FACTOR = 0.8;
const BANK_FACTOR = 0.3;
let isGrounded = false;

// Target position for lerping
const playerTarget = {
    z: 0
};

// Ground segments pool
const groundSegments = [];
const SEGMENT_LENGTH = 20;
const NUM_SEGMENTS = 4;

// Initialize ground segments
for (let i = 0; i < NUM_SEGMENTS; i++) {
    const segment = createGroundSegment(new THREE.Vector3(i * SEGMENT_LENGTH, 0, 0));
    groundSegments.push(segment);
}

// Object pools
const MAX_OBSTACLES = 20;
const MAX_PICKUPS = 10;
const objectPools = {
    obstacles: [],
    pickups: []
};

// Geometry and material caching
const CACHED_GEOMETRIES = {
    carBody: new THREE.BoxGeometry(2, 0.5, 1),
    carTop: new THREE.BoxGeometry(1, 0.4, 0.8),
    headlight: new THREE.CircleGeometry(0.1, 16),
    wheel: new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8),
    nug: new THREE.SphereGeometry(0.3, 8, 6),
    nugBump: new THREE.SphereGeometry(0.15, 6, 4),
    hair: new THREE.CylinderGeometry(0.02, 0.02, 0.2)
};

const CACHED_MATERIALS = {
    carRed: new THREE.MeshPhongMaterial({ color: 0xff0000 }),
    carBlue: new THREE.MeshPhongMaterial({ color: 0x0066ff }),
    headlight: new THREE.MeshPhongMaterial({ 
        color: 0xffffcc,
        emissive: 0xffffcc,
        emissiveIntensity: 1
    }),
    wheel: new THREE.MeshPhongMaterial({ color: 0x333333 }),
    nug: new THREE.MeshPhongMaterial({ 
        color: 0x33cc33,
        roughness: 0.8,
        metalness: 0.2
    }),
    hair: new THREE.MeshPhongMaterial({ color: 0xff6600 })
};

// Create a car mesh
const createCar = () => {
    const carGroup = new THREE.Group();

    // Car body
    const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 1);
    const bodyMaterial = new THREE.MeshPhongMaterial({ color: Math.random() > 0.5 ? 0xff0000 : 0x0066ff });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);

    // Car top
    const topGeometry = new THREE.BoxGeometry(1, 0.4, 0.8);
    const top = new THREE.Mesh(topGeometry, bodyMaterial);
    top.position.y = 0.45;
    top.position.x = -0.2;

    // Headlights
    const headlightGeometry = new THREE.CircleGeometry(0.1, 16);
    const headlightMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffcc,
        emissive: 0xffffcc,
        emissiveIntensity: 1
    });
    
    // Create left and right headlights
    const leftHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    const rightHeadlight = new THREE.Mesh(headlightGeometry, headlightMaterial);
    
    // Position headlights at front of car
    leftHeadlight.position.set(0.98, 0.1, 0.3);
    rightHeadlight.position.set(0.98, 0.1, -0.3);
    leftHeadlight.rotation.y = Math.PI / 2;
    rightHeadlight.rotation.y = Math.PI / 2;

    // Add headlight glow
    const headlightGlowGeometry = new THREE.CircleGeometry(0.15, 16);
    const headlightGlowMaterial = new THREE.MeshBasicMaterial({
        color: 0xffffcc,
        transparent: true,
        opacity: 0.5
    });
    
    const leftGlow = new THREE.Mesh(headlightGlowGeometry, headlightGlowMaterial);
    const rightGlow = new THREE.Mesh(headlightGlowGeometry, headlightGlowMaterial);
    leftGlow.position.copy(leftHeadlight.position);
    rightGlow.position.copy(rightHeadlight.position);
    leftGlow.rotation.copy(leftHeadlight.rotation);
    rightGlow.rotation.copy(rightHeadlight.rotation);

    // Wheels
    const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 8);
    const wheelMaterial = new THREE.MeshPhongMaterial({ color: 0x333333 });
    
    const wheels = [
        { x: -0.6, z: 0.6 },
        { x: 0.6, z: 0.6 },
        { x: -0.6, z: -0.6 },
        { x: 0.6, z: -0.6 }
    ].map(pos => {
        const wheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        wheel.rotation.z = Math.PI / 2;
        wheel.position.set(pos.x, -0.2, pos.z);
        return wheel;
    });

    carGroup.add(body);
    carGroup.add(top);
    carGroup.add(leftHeadlight);
    carGroup.add(rightHeadlight);
    carGroup.add(leftGlow);
    carGroup.add(rightGlow);
    wheels.forEach(wheel => carGroup.add(wheel));

    return carGroup;
};

// Add car speed variations
const CAR_SPEED_VARIATIONS = [
    { speed: 0.05, probability: 0.2 },  // Slow cars
    { speed: 0.08, probability: 0.3 },  // Medium-slow cars
    { speed: 0.12, probability: 0.3 },  // Medium cars
    { speed: 0.15, probability: 0.15 }, // Fast cars
    { speed: 0.18, probability: 0.05 }  // Very fast cars
];

// Modified createObstacle function to include speed
const createObstacle = (position) => {
    const car = createCar();
    car.position.copy(position);
    
    // Assign random speed based on probability
    let random = Math.random();
    let cumulativeProbability = 0;
    car.userData.speed = CAR_SPEED_VARIATIONS[0].speed; // Default speed
    
    for (const variation of CAR_SPEED_VARIATIONS) {
        cumulativeProbability += variation.probability;
        if (random <= cumulativeProbability) {
            car.userData.speed = variation.speed;
            break;
        }
    }
    
    scene.add(car);
    return car;
};

// Create a weed nug mesh
const createNug = () => {
    const nugGroup = new THREE.Group();

    // Base shape (slightly irregular sphere)
    const nugGeometry = new THREE.SphereGeometry(0.3, 8, 6);
    const nugMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x33cc33,
        roughness: 0.8,
        metalness: 0.2
    });
    const nugBase = new THREE.Mesh(nugGeometry, nugMaterial);
    
    // Add some bumps to make it look more organic
    const bumpPositions = [
        { x: 0.1, y: 0.1, z: 0.1 },
        { x: -0.1, y: 0.15, z: -0.1 },
        { x: 0.12, y: -0.1, z: 0.05 }
    ];

    bumpPositions.forEach(pos => {
        const bumpGeometry = new THREE.SphereGeometry(0.15, 6, 4);
        const bump = new THREE.Mesh(bumpGeometry, nugMaterial);
        bump.position.set(pos.x, pos.y, pos.z);
        nugGroup.add(bump);
    });

    // Add some orange "hairs"
    const hairMaterial = new THREE.MeshPhongMaterial({ color: 0xff6600 });
    for (let i = 0; i < 5; i++) {
        const hairGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.2);
        const hair = new THREE.Mesh(hairGeometry, hairMaterial);
        hair.position.set(
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3,
            (Math.random() - 0.5) * 0.3
        );
        hair.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        nugGroup.add(hair);
    }

    nugGroup.add(nugBase);
    
    // Add floating animation
    nugGroup.userData.floatOffset = Math.random() * Math.PI * 2;
    nugGroup.userData.rotateOffset = Math.random() * Math.PI * 2;
    
    return nugGroup;
};

// Create pickup at position
const createPickup = (position) => {
    const nug = createNug();
    nug.position.copy(position);
    scene.add(nug);
    return nug;
};

// Optimize collision detection with cached boxes
const playerBoundingBox = new THREE.Box3();
const tempBoundingBox = new THREE.Box3();

// Update the player movement to include tilt animation
const updatePlayerRotation = () => {
    // Calculate movement direction for tilt
    const movementDirection = playerTarget.z - player.position.z;
    
    // Tilt only the character when moving left/right - more pronounced lean
    const targetTilt = movementDirection * TILT_FACTOR * 1.5; // Changed sign and axis
    player.character.rotation.x = THREE.MathUtils.lerp(
        player.character.rotation.x,
        targetTilt,
        0.05
    );

    // Bank into turns - subtle forward/back lean
    const targetBank = movementDirection * BANK_FACTOR;
    player.character.rotation.z = THREE.MathUtils.lerp(
        player.character.rotation.z,
        targetBank,
        0.03
    );

    // Reduced idle sway (now on X axis for proper sideways sway)
    player.character.rotation.x += Math.sin(Date.now() * 0.002) * 0.001;
};

// Game loop
const animate = () => {
    requestAnimationFrame(animate);

    if (!gameState.isGameStarted || gameState.isGameOver) {
        renderer.render(scene, camera);
        return;
    }

    // Update player physics
    playerVelocityY += GRAVITY;
    player.position.y += playerVelocityY;

    // Update trick animation
    if (currentTrick && !isGrounded) {
        const airTime = Math.abs(2 * JUMP_FORCE / GRAVITY); // Calculate total air time
        const rotationSpeed = currentTrick.rotation.speed / airTime; // Distribute rotation over air time
        trickRotation += rotationSpeed;
        
        // Apply rotation based on trick type
        if (currentTrick.rotation.axis === 'z') {
            player.skateboard.rotation.z = trickRotation;
        } else if (currentTrick.rotation.axis === 'y') {
            player.skateboard.rotation.y = trickRotation;
        } else {
            player.skateboard.rotation.x = trickRotation;
        }
        
        // Reset trick when landing
        if (player.position.y <= 1) {
            player.skateboard.rotation.set(0, 0, 0);
            currentTrick = null;
        }
    }

    // Handle left/right movement with lerping
    if (keys.left && playerTarget.z < PLAYER_MOVE_BOUNDS) {
        playerTarget.z += MOVE_SPEED;
    }
    if (keys.right && playerTarget.z > -PLAYER_MOVE_BOUNDS) {
        playerTarget.z -= MOVE_SPEED;
    }

    // Apply lerping to player movement
    player.position.z = THREE.MathUtils.lerp(
        player.position.z,
        playerTarget.z,
        LERP_FACTOR
    );

    // Ground collision
    if (player.position.y <= 1) {
        player.position.y = 1;
        playerVelocityY = 0;
        isGrounded = true;
    }

    // Update player animations
    updatePlayerRotation();

    // Update pickups with optimized collision detection
    playerBoundingBox.setFromObject(player);

    for (let i = pickups.length - 1; i >= 0; i--) {
        const pickup = pickups[i];
        if (!pickup.visible) continue;

        pickup.position.x -= gameState.speed;
        pickup.position.y = 1.5 + Math.sin(Date.now() * 0.003 + pickup.userData.floatOffset) * 0.1;
        pickup.rotation.y = Date.now() * 0.001 + pickup.userData.rotateOffset;

        if (pickup.position.x < -15) {
            pickup.visible = false;
            pickups.splice(i, 1);
            continue;
        }

        tempBoundingBox.setFromObject(pickup);
        if (playerBoundingBox.intersectsBox(tempBoundingBox)) {
            pickup.visible = false;
            pickups.splice(i, 1);
            gameState.nugsCollected++;
            gameState.score += 100;
        }
    }

    // Add this helper function to check if a position is safe for spawning
    const isPositionSafe = (x, z, obstacles) => {
        const MIN_DISTANCE = 4; // Minimum distance between cars
        return !obstacles.some(obstacle => {
            const dx = Math.abs(obstacle.position.x - x);
            const dz = Math.abs(obstacle.position.z - z);
            return dx < MIN_DISTANCE && dz < 2; // Check both X and Z distances
        });
    };

    // Modify the ground segments update section
    groundSegments.forEach(segment => {
        segment.position.x -= gameState.speed;
        if (segment.position.x < -(SEGMENT_LENGTH * 1.5)) {
            segment.position.x += SEGMENT_LENGTH * NUM_SEGMENTS;
            
            // Add random pickups
            if (Math.random() < 0.4) {
                const randomLane = gameState.lanes[Math.floor(Math.random() * gameState.lanes.length)];
                const pickup = createPickup(new THREE.Vector3(
                    segment.position.x + Math.random() * SEGMENT_LENGTH,
                    1.5,
                    randomLane
                ));
                pickups.push(pickup);
            }
            
            // Modified car spawning with spacing checks
            const numCars = Math.floor(Math.random() * 3) + 2; // 2-4 cars per segment
            const spawnPoints = [];
            
            // Try to spawn each car
            for (let i = 0; i < numCars; i++) {
                if (Math.random() < 0.9) { // 90% spawn chance
                    let attempts = 0;
                    const maxAttempts = 10;
                    
                    while (attempts < maxAttempts) {
                        const randomLane = gameState.lanes[Math.floor(Math.random() * gameState.lanes.length)];
                        const x = segment.position.x + (Math.random() * SEGMENT_LENGTH);
                        
                        if (isPositionSafe(x, randomLane, obstacles)) {
                            const obstacle = createObstacle(new THREE.Vector3(x, 1, randomLane));
                            obstacles.push(obstacle);
                            spawnPoints.push({ x, z: randomLane });
                            break;
                        }
                        attempts++;
                    }
                }
            }
        }
    });

    // Update obstacles with optimized collision detection
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        if (!obstacle.visible) continue;

        // Use the car's individual speed
        obstacle.position.x -= (gameState.speed + obstacle.userData.speed);

        if (obstacle.position.x < -25) {
            obstacle.visible = false;
            gameState.carsAvoided++;
            obstacles.splice(i, 1);
            continue;
        }

        tempBoundingBox.setFromObject(obstacle);
        if (playerBoundingBox.intersectsBox(tempBoundingBox)) {
            gameState.isGameOver = true;
            showGameOver();
        }
    }

    // Update score
    gameState.score += gameState.speed;
    scoreDisplay.textContent = `Score: ${Math.floor(gameState.score)}`;
    carsAvoidedDisplay.textContent = `Cars Avoided: ${gameState.carsAvoided}`;

    // Update camera
    camera.position.x = player.position.x - 5;
    camera.position.y = player.position.y + 5;
    camera.position.z = 10;
    camera.lookAt(player.position);

    // Update car speed based on score
    const scoreMultiplier = Math.floor(gameState.score / 1000); // Increase speed every 1000 points
    const currentCarSpeed = gameState.baseCarSpeed * (1 + scoreMultiplier * 0.1); // 10% faster per 1000 points

    renderer.render(scene, camera);
};

// Start the animation loop
animate();

// Initialize high scores display
updateHighScoresDisplay();

// Function to display trick name
const showTrickName = (trickName) => {
    trickDisplay.textContent = trickName;
    trickDisplay.style.opacity = '1';
    flamesContainer.style.opacity = '1';
    
    // Adjust flame positions based on text width
    const textWidth = trickDisplay.offsetWidth;
    const flames = flamesContainer.querySelectorAll('.flame');
    flames.forEach((flame, i) => {
        flame.style.left = `${(textWidth / (flames.length - 1)) * i - 10}px`;
    });
    
    setTimeout(() => {
        trickDisplay.style.opacity = '0';
        flamesContainer.style.opacity = '0';
    }, 1000);
};

// Skateboard trick constants
const TRICKS = {
    KICKFLIP: { name: 'KICKFLIP', rotation: { axis: 'z', speed: Math.PI * 2 }},
    HEELFLIP: { name: 'HEELFLIP', rotation: { axis: 'z', speed: -Math.PI * 2 }},
    THREESIXTY: { name: '360 FLIP', rotation: { axis: 'y', speed: Math.PI * 2 }},
    IMPOSSIBLE: { name: 'IMPOSSIBLE', rotation: { axis: 'x', speed: Math.PI * 2 }}
};

let currentTrick = null;
let trickRotation = 0;

// Modified jump function with tricks
const jump = () => {
    if (isGrounded) {
        playerVelocityY = JUMP_FORCE;
        isGrounded = false;
        
        // Select random trick
        const trickKeys = Object.keys(TRICKS);
        currentTrick = TRICKS[trickKeys[Math.floor(Math.random() * trickKeys.length)]];
        trickRotation = 0;
        showTrickName(currentTrick.name);
    }
};

// Movement controls state
const keys = {
    left: false,
    right: false
};

// Event listeners
window.addEventListener('keydown', (e) => {
    if (e.code === 'Space') {
        jump();
    }
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keys.left = true;
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keys.right = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.code === 'ArrowLeft' || e.code === 'KeyA') {
        keys.left = false;
    }
    if (e.code === 'ArrowRight' || e.code === 'KeyD') {
        keys.right = false;
    }
});

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Obstacles pool
const obstacles = [];
const pickups = [];

// Create stylized axis helper
const createStylizedAxisHelper = () => {
    const axisGroup = new THREE.Group();
    
    // Create arrows for each axis
    const createArrow = (color, direction, label) => {
        const arrowGroup = new THREE.Group();
        
        // Arrow shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.1, 0.1, 2, 8);
        const shaftMaterial = new THREE.MeshPhongMaterial({ 
            color: color,
            emissive: color,
            emissiveIntensity: 0.5
        });
        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        
        // Arrow head
        const headGeometry = new THREE.ConeGeometry(0.2, 0.5, 8);
        const head = new THREE.Mesh(headGeometry, shaftMaterial);
        head.position.y = 1.25;
        
        arrowGroup.add(shaft);
        arrowGroup.add(head);
        
        // Position and rotate based on direction
        if (direction === 'x') {
            arrowGroup.rotation.z = -Math.PI / 2;
            arrowGroup.position.x = 1;
        } else if (direction === 'z') {
            arrowGroup.rotation.x = Math.PI / 2;
            arrowGroup.position.z = 1;
        } else {
            arrowGroup.position.y = 1;
        }
        
        return arrowGroup;
    };
    
    // Add colored arrows for each axis
    axisGroup.add(createArrow(0xff0000, 'x')); // Red for X
    axisGroup.add(createArrow(0x00ff00, 'y')); // Green for Y
    axisGroup.add(createArrow(0x0000ff, 'z')); // Blue for Z
    
    // Scale and position the axis helper
    axisGroup.scale.set(2, 2, 2);
    axisGroup.position.set(-8, 4, -8);
    
    return axisGroup;
};

// Create background buildings
const createBuilding = (x, z, height, color) => {
    const buildingGroup = new THREE.Group();
    
    // Main building body
    const bodyGeometry = new THREE.BoxGeometry(2, height, 2);
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: color,
        shininess: 50
    });
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.position.y = height / 2;
    
    // Windows
    const windowSize = 0.3;
    const windowGeometry = new THREE.PlaneGeometry(windowSize, windowSize);
    const windowMaterial = new THREE.MeshPhongMaterial({ 
        color: 0xffffcc,
        emissive: 0xffffcc,
        emissiveIntensity: 0.3
    });
    
    // Add windows to each side
    for (let y = 1; y < height; y += 1) {
        for (let i = 0; i < 4; i++) {
            const window = new THREE.Mesh(windowGeometry, windowMaterial);
            window.position.y = y;
            window.position.x = (i < 2) ? 1.01 : -1.01; // Front/back
            window.position.z = (i % 2 === 0) ? 0.5 : -0.5;
            window.rotation.y = (i < 2) ? 0 : Math.PI;
            buildingGroup.add(window);
            
            // Side windows
            const sideWindow = new THREE.Mesh(windowGeometry, windowMaterial);
            sideWindow.position.y = y;
            sideWindow.position.z = (i < 2) ? 1.01 : -1.01; // Left/right
            sideWindow.position.x = (i % 2 === 0) ? 0.5 : -0.5;
            sideWindow.rotation.y = Math.PI / 2;
            buildingGroup.add(sideWindow);
        }
    }
    
    buildingGroup.add(body);
    buildingGroup.position.set(x, 0, z);
    return buildingGroup;
};

// Modify the background buildings creation
const createBackgroundBuildings = () => {
    const buildingsGroup = new THREE.Group();
    const buildingColors = [
        0x4a156b, 0x3b1054, 0x8b30d9, 0x6922a7,  // Purple theme
        0x1a1a1a, 0x2a2a2a, 0x3a3a3a, 0x4a4a4a,  // Dark grays
        0x000066, 0x000099, 0x0000cc, 0x0000ff   // Dark blues
    ];
    
    // Create far background buildings (larger, further back)
    for (let x = -60; x <= 60; x += 8) {
        for (let z = -60; z >= -100; z -= 8) {  // Moved further back
            const height = 15 + Math.random() * 30; // Taller buildings
            const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
            buildingsGroup.add(createBuilding(x, z, height, color));
        }
    }
    
    // Create mid-distance buildings
    for (let x = -50; x <= 50; x += 6) {
        for (let z = -45; z >= -75; z -= 6) {  // Moved further back
            const height = 8 + Math.random() * 20;
            const color = buildingColors[Math.floor(Math.random() * buildingColors.length)];
            buildingsGroup.add(createBuilding(x, z, height, color));
        }
    }
    
    // Create buildings close to the road (but not between camera and road)
    for (let x = -45; x <= 45; x += 10) {
        // Left side of road (further out)
        const leftHeight = 3 + Math.random() * 8;
        const leftColor = buildingColors[Math.floor(Math.random() * buildingColors.length)];
        buildingsGroup.add(createBuilding(x, 15, leftHeight, leftColor));  // Moved further from road
        
        // Right side of road (further out)
        const rightHeight = 3 + Math.random() * 8;
        const rightColor = buildingColors[Math.floor(Math.random() * buildingColors.length)];
        buildingsGroup.add(createBuilding(x, -15, rightHeight, rightColor));  // Moved further from road
    }
    
    return buildingsGroup;
};

// Add buildings and axis helper to scene
scene.add(createBackgroundBuildings());
scene.add(createStylizedAxisHelper());