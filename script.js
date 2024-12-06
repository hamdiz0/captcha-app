// Access the necessary DOM elements
const jumper = document.querySelector('.jumper');
const container = document.querySelector('.container');
const listContainer = document.querySelector('.list-container');

const userInputDiv = document.getElementById('user-input');
const resetButton = document.getElementById('reset-button');

const optionDiv = document.getElementById('option');
const changeButton = document.getElementById('change-button');

const deleteButton = document.getElementById('delete');

// List of tips
const tips = [
    "Comme la pollution de l'air bloque les poumons, la pollution plastique empêche les océans de filtrer l'eau correctement.",
    "Comme les substances nocives affectent notre digestion, les microplastiques nuisent à la faune marine et à la santé humaine.",
    "Comme les oreilles humaines sont vitales pour entendre, le bruit empêche les animaux marins de naviguer correctement.",
    "Les reins filtrent les déchets; si surchargés, ils ne fonctionnent plus, tout comme l'eutrophisation surcharge les océans.",
    "Comme un cœur obstrué ne fonctionne plus bien, la pollution perturbe la régulation écologique des océans."
];

// Function to select a random tip
function getRandomTip() {
    const randomIndex = Math.floor(Math.random() * tips.length);
    return tips[randomIndex];
}

// Function to show the tip
function showTip() {
    const tipContainer = document.getElementById("tip-container");
    const tipElement = tipContainer.querySelector(".tip");
    tipElement.textContent = getRandomTip(); // Set a random tip
    tipContainer.style.display = "block"; // Show the tip container
}

// Function to hide the tip
function closeTip() {
    document.getElementById("tip-container").style.display = "none"; // Hide the tip container
}


function deleteLastLetter() {
    // Get the current content of the user input
    const currentText = userInputDiv.textContent;

    // If there is any text, remove the last letter
    if (currentText.length > 0) {
        userInputDiv.textContent = currentText.slice(0, -1);
    }
}

// Add event listener to the "Delete one letter" button
deleteButton.addEventListener('click', deleteLastLetter);

const images = [
    { src: './imgs/captcha/1.png', code: 'vugae' },
    { src: './imgs/captcha/2.png', code: 'oecan' },
    { src: './imgs/captcha/3.png', code: 'sbael' },
    { src: './imgs/captcha/4.png', code: 'folt' },
];

// Function to get a random image, excluding the current one
function getRandomImage(exclude = null) {
    let randomImage;
    do {
        randomImage = images[Math.floor(Math.random() * images.length)];
    } while (randomImage === exclude); // Ensure the new image is not the same as the excluded one
    return randomImage;
}

// Set a new image in the option div
let currentImage; // Tracks the current image
let currentCode;  // Stores the code of the current image
function setNewImage() {
    const newImage = getRandomImage(currentImage); // Pass the current image to exclude it
    currentImage = newImage; // Update the current image
    currentCode = newImage.code; // Update the current code
    optionDiv.style.backgroundImage = `url(${newImage.src})`; // Update the background
}

 // Initialize with a random image
currentImage = getRandomImage(); // Set the initial image
currentCode = currentImage.code; // Set the initial code
optionDiv.style.backgroundImage = `url(${currentImage.src})`;

// Event listener for "Change" button
changeButton.addEventListener('click', setNewImage);



// Game variables for jumper movement and items
let keys = {};
let isJumping = false;
let jumpHeight = 220;
let jumpSpeed = 10;
let gravity = 8;
let groundLevel = container.clientHeight - jumper.clientHeight - 510;
let isOnGround = true;
let positionX = 280;
let positionY = groundLevel;
let listItems = [];
let itemSpeed = 3;
let letters = 'abcdefghijklmnopqrstuvwxyz'.split('');
let letterIndex = 0;
let animationFrameId;

// Initialize jumper position
jumper.style.left = `${positionX}px`;
jumper.style.bottom = `${positionY}px`;

// Handle key press and release
document.addEventListener('keydown', (event) => {
    // Prevent the default behavior for both Space and ArrowUp
    if (event.code === 'Space' || event.code === 'ArrowUp') {
        event.preventDefault();
    }
    // Mark the key as pressed
    keys[event.code] = true;
});

document.addEventListener('keyup', (event) => {
    // Mark the key as released
    keys[event.code] = false;
});

// reset the game 
function resetGame() {
    // Reset positions and any other game variables
    userInputDiv.textContent = '';
    positionX = 280;
    positionY = groundLevel;
    jumper.style.left = `${positionX}px`;
    jumper.style.bottom = `${positionY}px`;

    listItems = [];
    document.querySelectorAll('.list-item').forEach(item => item.remove());

    isJumping = false;
    isOnGround = true;

    // Cancel any ongoing animation
    cancelAnimationFrame(animationFrameId);

    // Reset speed (if you're doubling it somewhere)
    itemSpeed = 3; // Reset speed to original value
    gameLoop(); // Restart the game loop
}

// Reset button functionality
resetButton.addEventListener('click', resetGame);

// Main game loop
function gameLoop() {
    handleJumperMovement();
    moveListItems();
    detectCollisions();
    animationFrameId = requestAnimationFrame(gameLoop);
}

function changeJumperImage(image) {
    jumper.style.backgroundImage = `url(${image})`;
}
// Change jumper's background image based on collisions or events
// Handle jumper movement
function handleJumperMovement() {
    if (keys['ArrowLeft']) {
        positionX = Math.max(positionX - 5, 0);
    }
    if (keys['ArrowRight']) {
        positionX = Math.min(positionX + 5, container.clientWidth - jumper.clientWidth);
    }

    // Handle jumping with Space or ArrowUp key
    if ((keys['Space'] || keys['ArrowUp']) && isOnGround && !isJumping) {
        isJumping = true;
        isOnGround = false;
    }

    if (isJumping) {
        positionY += jumpSpeed;
        if (positionY >= groundLevel + jumpHeight) {
            isJumping = false;
        }
    } else if (positionY > groundLevel) {
        positionY -= gravity;
    } else {
        positionY = groundLevel;
        isOnGround = true;
        changeJumperImage('./imgs/dol-up.png');
    }

    jumper.style.left = `${positionX}px`;
    jumper.style.bottom = `${positionY}px`;
}
// Create and spawn list items
function createListItem() {
    const item = document.createElement('div');
    item.classList.add('list-item');
    item.textContent = letters[letterIndex];
    
    // Set the initial position (start at right side)
    item.style.position = 'absolute';
    item.style.left = `${container.clientWidth}px`;
    item.style.top = '0px'; // Start from the top

    listContainer.appendChild(item);
    listItems.push({ element: item, letter: letters[letterIndex] });
    letterIndex = (letterIndex + 1) % letters.length;

    // Animate the letter along a circular path
    moveItemInArc(item);
}

// Move list items across the screen in a smaller half-circle arc (top-left to top-right)
function moveItemInArc(item) {
    let startX = -20; // Start at the left
    let startY = 0; // Start at the top
    
    // Adjust the radius of the arc to make it shorter (e.g., reduce the radius to 150px)
    let radius = container.clientWidth / 2;  // This reduces the arc height, adjust as needed

    // Calculate the total time for the animation
    let duration = 4000; // milliseconds (2 seconds)

    // Track the current time in the animation
    let startTime = Date.now();

    // Animation loop
    const moveInterval = setInterval(() => {
        let elapsedTime = Date.now() - startTime; // Time passed since the start of the animation
        let progress = elapsedTime / duration; // Progress as a value between 0 and 1

        if (progress > 1) progress = 1; // Ensure it doesn't exceed 1

        // Calculate the current X and Y using sine and cosine for a half-circle path
        let angle = Math.PI * progress; // Angle ranges from 0 to pi (half circle)
        let currentX = startX + radius * (1 - Math.cos(angle)); // X-coordinate (moves from left to right)
        let currentY = startY + radius * Math.sin(angle); // Y-coordinate (moves from top to bottom)

        // Update the position of the item
        item.style.left = `${currentX}px`;
        item.style.top = `${currentY}px`;

        // Stop the animation once the item reaches the right end
        if (progress === 1) {
            clearInterval(moveInterval); // Stop the animation
            // Remove the item once it's out of the screen
            item.remove();
        }
    }, 16); // Use a small interval for smooth animation
}



// Move list items across the screen
function moveListItems() {
    listItems.forEach((item, index) => {
        const currentLeft = parseInt(item.element.style.left);
        if (currentLeft <= -40) {
            listContainer.removeChild(item.element);
            listItems.splice(index, 1);
        }
    });
}

function checkUserInput() {
    if (userInputDiv.textContent === currentCode) {
        showTip(); // Show the tip
        resetGame(); // Reset the game
    }
}

// Detect collisions between jumper and list items
function detectCollisions() {
    listItems.forEach((item) => {
        const itemRect = item.element.getBoundingClientRect();
        const jumperRect = jumper.getBoundingClientRect();

        if (
            jumperRect.left < itemRect.right &&
            jumperRect.right > itemRect.left &&
            jumperRect.top < itemRect.bottom &&
            jumperRect.bottom > itemRect.top
        ) {
            changeJumperImage('./imgs/dol-down.png');
            userInputDiv.textContent += item.letter;
            listContainer.removeChild(item.element);
            listItems = listItems.filter(i => i !== item);
            checkUserInput();
        }
    });
}

// Spawn items at regular intervals
setInterval(createListItem, 600);

// Start the game loop
gameLoop();
