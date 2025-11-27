
let objects = [];
let historyEntries = []; // Array to store history entries


const clickArea = document.querySelector(".click-area");
const plank = document.querySelector(".plank");

let nextWeight = generateNextWeight(); //Weight for the next object

const colorPalette = [
    '#FF0000',
    '#0000FF', 
    '#FFA500', 
    '#008000', 
    '#800080', 
    '#FFFF00', 
    '#00FFFF', 
    '#FF00FF', 
    '#000000', 
    '#ffc0cb',
    '#FF4500', 
    '#000080', 
    '#006400', 
    '#8B0000', 
    '#2F4F4F'  
];

// Load saved state on page load
window.addEventListener('load', function() {
    loadFromLocalStorage();
    loadHistoryFromStorage();
    updateNextWeightDisplay();
    updateUI(0, 0, 0);
});

// Function to get a random color from the palette
function getRandomColor() {
    return colorPalette[Math.floor(Math.random() * colorPalette.length)];
}

//Randomly decide the weight between 1-10
function generateNextWeight() {
    return Math.floor(Math.random() * 10) + 1;
}

// Showing the upcoming weight
function updateNextWeightDisplay() {
    document.getElementById('nextWeight').textContent = nextWeight + ' kg';
}

// Function to add entry to history logs
function addHistoryEntry(message) {
    const log = document.getElementById('history');
    const entry = document.createElement('div');
    entry.classList.add('history-entry');
    entry.textContent = message;
    
    log.insertBefore(entry, log.firstChild);
    historyEntries.unshift(message);
    saveHistoryToStorage();
    console.log("History:", message);
}

function saveHistoryToStorage() {
    localStorage.setItem('seesawHistory', JSON.stringify(historyEntries));
}

// Load History from Local Storage
function loadHistoryFromStorage() {
    const savedHistory = localStorage.getItem('seesawHistory');
    if (savedHistory) {
        try {
            historyEntries = JSON.parse(savedHistory);
            // Load history entries (newest to oldest)
            historyEntries.forEach(entry => {
                const log = document.getElementById('history');
                const historyEntry = document.createElement('div');
                historyEntry.classList.add('history-entry');
                historyEntry.textContent = entry;
                log.appendChild(historyEntry);
            });
            console.log("History loaded:", historyEntries.length + " entries");
        } catch (error) {
            console.error("History loading error:", error);
            localStorage.removeItem('seesawHistory');
        }
    }
}

clickArea.addEventListener("click", (event) => {

    if (!clickArea || !plank){
        console.error("Required elements not found");
        return;
    }

    // Getting the X position of the click and keep it within -200 to +200 from the center
    const offsetX = event.offsetX;
    const normalizedX = Math.max(-200, Math.min(200, offsetX - 250));

    console.log("Clicked X:", offsetX);
    console.log("Normalized X:", normalizedX);

    // Random weight between 1 and 10 kg
    const weight = nextWeight;

    //Creating the object
    const object = document.createElement("div");
    object.classList.add("object");
    object.innerText = weight + "kg";

    const size = 30 + weight * 2; // heavier objects are bigger
    object.style.width = size + "px";
    object.style.height = size + "px";
    const color = getRandomColor();
    object.style.backgroundColor = color; 

    // Putting the object on the plank at the right position
    plank.appendChild(object);
    object.style.position = 'absolute';
    object.style.left = (normalizedX + 200 - size / 2) + 'px';
    object.style.top = (-size / 2) + 'px';

    //Storing the object data
    const newObject = {
        element: object,
        weight: weight,
        distance: normalizedX,
        color: color
    };

    objects.push(newObject);

    saveToLocalStorage();

    const side = normalizedX < 0 ? "left" : "right";
    const distanceFromCenter = Math.abs(normalizedX);
    addHistoryEntry(`📦 ${weight}kg dropped on ${side} side at ${distanceFromCenter}px from center`);

    nextWeight = generateNextWeight();
    updateNextWeightDisplay();
    
    calculateTorque();

    console.log(`Object created: ${weight}kg at ${normalizedX}px from center`);


});

// Function to calculate torque and rotate the plank
function calculateTorque() {
    let leftTorque = 0;
    let rightTorque = 0;
    let leftWeight = 0;
    let rightWeight = 0;
    
    objects.forEach(obj => {
        if (obj.distance < 0) {
            leftTorque += obj.weight * Math.abs(obj.distance);
            leftWeight += obj.weight;
        } else if (obj.distance > 0) {
            rightTorque += obj.weight * obj.distance;
            rightWeight += obj.weight;
        }
    });
    
    const netTorque = rightTorque - leftTorque;
    
    // Rotation angle calculation
    let angle = 0;
    if (netTorque !== 0) {
        // -30 to +30 degrees based on torque
        const maxPossibleTorque = 10 * 200; // 2000
        angle = (netTorque / maxPossibleTorque) * 30;
        angle = Math.max(-30, Math.min(30, angle));
    }
    
    //Apply rotation to plank
    rotatePlank(angle);

    updateUI(leftWeight, rightWeight, angle);
    
    console.log("=== TORQUE CALCULATION ===");
    console.log("Left Side - Weight:", leftWeight + "kg", "Torque:", leftTorque);
    console.log("Right Side - Weight:", rightWeight + "kg", "Torque:", rightTorque);
    console.log("Net Torque:", netTorque);
    console.log("Calculated Angle:", angle + "°");
    console.log("Total Object Count:", objects.length);
    
    return { netTorque, leftWeight, rightWeight, angle };
}

// UI updating
function updateUI(leftWeight, rightWeight, angle) {
    document.getElementById('leftWeight').textContent = leftWeight.toFixed(1) + ' kg';
    document.getElementById('rightWeight').textContent = rightWeight.toFixed(1) + ' kg';
    document.getElementById('tiltAngle').textContent = angle.toFixed(1) + '°';
}

// Rotate the plank based on the calculated angle
function rotatePlank(angle) {
    const plank = document.querySelector(".plank");
    plank.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
}

// Function to save the current state to Local Storage
function saveToLocalStorage() {
    const saveData = objects.map(obj => ({
        weight: obj.weight,
        distance: obj.distance,
        color:obj.color
    }));
    localStorage.setItem('seesawState', JSON.stringify(saveData));
    console.log("Saved to Local Storage:", saveData.length + " objects");
}

// Function to load the state from Local Storage
function loadFromLocalStorage() {
    const saved = localStorage.getItem('seesawState');
    if (saved) {
        try {
            const savedObjects = JSON.parse(saved);
            console.log("Loading from Local Storage:", savedObjects.length + " objects");
            
            // Recreate each saved object
            savedObjects.forEach(objData => {
                createObjectFromSavedData(objData);
            });
            
            // Recalculate torque after loading
            if (objects.length > 0) {
                calculateTorque();
            }
            
        } catch (error) {
            console.error("Local Storage loading error:", error);
            localStorage.removeItem('seesawState');
        }
    }
}

// Function to create object from saved data
function createObjectFromSavedData(objData) {
    const object = document.createElement("div");
    object.classList.add("object");
    object.innerText = objData.weight + "kg";

    const size = 30 + objData.weight * 2;
    object.style.width = size + "px";
    object.style.height = size + "px";
    const color = objData.color || getRandomColor();
    object.style.backgroundColor = color;

    plank.appendChild(object);
    object.style.position = 'absolute';
    object.style.left = (objData.distance + 200 - size / 2) + 'px';
    object.style.top = (-size / 2) + 'px';

    objects.push({
        element: object,
        weight: objData.weight,
        distance: objData.distance,
        color: color
    });
}
// Reset button setup - calls resetSeesaw when clicked
document.getElementById('btnReset').addEventListener('click', function() {
    resetSeesaw();
});

// Start over - clear everything and balance the seesaw
function resetSeesaw() {
     // Removing all the objects 
    objects.forEach(obj => {
        if (obj.element && obj.element.parentNode) {
            obj.element.parentNode.removeChild(obj.element);
        }
    });
    
    objects = [];
    nextWeight = generateNextWeight();
    updateNextWeightDisplay();
    localStorage.removeItem('seesawState');
    localStorage.removeItem('seesawHistory');
    rotatePlank(0);
    updateUI(0, 0, 0);
    clearHistoryPanel();

    historyEntries = [];

    console.log("Seesaw reset");
}

// Clear all entries from the history panel
function clearHistoryPanel() {
    const log = document.getElementById('history');
    log.innerHTML = '';
}
