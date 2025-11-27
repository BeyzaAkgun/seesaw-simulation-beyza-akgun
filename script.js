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
    const seesawWrapper = document.getElementById('seesawWrapper');
    const scale = createScale();
    seesawWrapper.appendChild(scale);


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
    //Click event listener
    clickArea.addEventListener("click", async (event) => {
      if (!clickArea || !plank) {
        console.error("Required elements not found");
        return;
      }
      // Getting the X position of the click and keep it within -200 to +200 from the center
      const offsetX = event.offsetX;
      const normalizedX = (offsetX / 500) * 400 - 200;

      console.log("Clicked X:", offsetX);
      console.log("Normalized X:", normalizedX);

      const weight = nextWeight;
      const color = getRandomColor();

      // Create animated object
      const object = await createAnimatedObject(weight, normalizedX, color);

      // Storing the object data
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
    
    // Get current angle
    const currentTransform = plank.style.transform;
    const currentAngle = currentTransform.includes('rotate') ? parseFloat(currentTransform.match(/rotate\(([^)]+)deg\)/)[1]) : 0;
    
    // Bounce animation
    plank.style.setProperty('--initial-angle', currentAngle + 'deg');
    plank.style.setProperty('--final-angle', angle + 'deg');
    
    // Smooth rotation
    plank.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;
}


function createAnimatedObject(weight, normalizedX, color) {
    return new Promise((resolve) => {
        const object = document.createElement("div");
        object.classList.add("object");
        object.innerText = weight + "kg";

        const size = 30 + weight * 2;
        object.style.width = size + "px";
        object.style.height = size + "px";
        object.style.backgroundColor = color;

        // Starting position
        object.style.left = (normalizedX + 200 - size/2) + 'px';
        object.style.top = '-100px'; // start from the top
        
        plank.appendChild(object);

        //When the animation is finished, place it in the real position
        setTimeout(() => {
            object.style.top = (-size/2) + 'px';
            
            // resolve when animation done
            setTimeout(() => {
                resolve(object);
            }, 600);
        }, 50);
    });
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
    objects.forEach((obj, index) => {
        setTimeout(() => {
            if (obj.element && obj.element.parentNode) {
                // Fade out animation
                obj.element.style.transition = 'all 0.3s ease';
                obj.element.style.transform = 'scale(0)';
                obj.element.style.opacity = '0';
                
                setTimeout(() => {
                    obj.element.parentNode.removeChild(obj.element);
                }, 300);
            }
        }, index * 50); 
    });
    
    objects = [];
    nextWeight = generateNextWeight();
    updateNextWeightDisplay();
    localStorage.removeItem('seesawState');
    localStorage.removeItem('seesawHistory');
    
    // Smooth reset rotation
    const plank = document.querySelector(".plank");
    plank.style.transition = 'transform 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
    plank.style.transform = `translate(-50%, -50%) rotate(0deg)`;
    
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

// Function to create the scale/ruler
function createScale() {
  const scale = document.createElement('div');
  scale.className = 'scale';
  
  // Main scale line
  const scaleLine = document.createElement('div');
  scaleLine.className = 'scale-line';
  scale.appendChild(scaleLine);
  
  // Create ticks and labels
  const positions = [-200, -150, -100, -50, 0, 50, 100, 150, 200];
  
  positions.forEach(pos => {
    // Tick mark
    const tick = document.createElement('div');
    tick.className = 'scale-tick';
    
    if (pos === 0) {
      tick.classList.add('center');
    } else if (Math.abs(pos) % 100 === 0) {
      tick.classList.add('major');
    }
    
    tick.style.left = `${pos + 200}px`; // Converting to pixel position (0-400 range)
    scale.appendChild(tick);
    
    // Label
    const label = document.createElement('div');
    label.className = 'scale-label';
    if (pos === 0) {
      label.classList.add('center');
      label.textContent = '0';
    } else {
      label.textContent = Math.abs(pos);
    }
    
    label.style.left = `${pos + 200}px`;
    scale.appendChild(label);
  });
  
  return scale;
}