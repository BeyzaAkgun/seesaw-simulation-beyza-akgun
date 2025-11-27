let objects = [];

const clickArea = document.querySelector(".click-area");
const plank = document.querySelector(".plank");

// ADIM 5: Sayfa yüklendiğinde kayıtlı verileri yükle
window.addEventListener('load', function() {
    loadFromLocalStorage();
});


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
    const weight = Math.floor(Math.random() * 10) + 1;

    //Creating the object
    const object = document.createElement("div");
    object.classList.add("object");
    object.innerText = weight + "kg";

    const size = 30 + weight * 2; // heavier objects are bigger
    object.style.width = size + "px";
    object.style.height = size + "px";
    object.style.backgroundColor = "#FF6B6B"; 

    // Putting the object on the plank at the right position
    plank.appendChild(object);
    object.style.position = 'absolute';
    object.style.left = (normalizedX + 200 - size / 2) + 'px';
    object.style.top = (-size / 2) + 'px';

    //Storing the object data
    const newObject = {
        element: object,
        weight: weight,
        distance: normalizedX
    };

    objects.push(newObject);

    saveToLocalStorage();
    
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
    
    console.log("=== TORQUE CALCULATION ===");
    console.log("Left Side - Weight:", leftWeight + "kg", "Torque:", leftTorque);
    console.log("Right Side - Weight:", rightWeight + "kg", "Torque:", rightTorque);
    console.log("Net Torque:", netTorque);
    console.log("Calculated Angle:", angle + "°");
    console.log("Total Object Count:", objects.length);
    
    return { netTorque, leftWeight, rightWeight, angle };
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
        distance: obj.distance
    }));
    localStorage.setItem('seesawState', JSON.stringify(saveData));
    console.log("Saved to Local Storage:", saveData.length + " objects");
}

// ADIM 5: Local Storage'dan yükleme fonksiyonu
function loadFromLocalStorage() {
    const saved = localStorage.getItem('seesawState');
    if (saved) {
        try {
            const savedObjects = JSON.parse(saved);
            console.log("Loading from Local Storage:", savedObjects.length + " objects");
            
            // Kayıtlı objeleri yeniden oluştur
            savedObjects.forEach(objData => {
                createObjectFromSavedData(objData);
            });
            
            // Tork hesapla (yeniden oluşturulan objelerle)
            if (objects.length > 0) {
                calculateTorque();
            }
            
        } catch (error) {
            console.error("Local Storage loading error:", error);
            localStorage.removeItem('seesawState');
        }
    }
}

// ADIM 5: Kayıtlı veriden obje oluşturma
function createObjectFromSavedData(objData) {
    const object = document.createElement("div");
    object.classList.add("object");
    object.innerText = objData.weight + "kg";

    const size = 30 + objData.weight * 2;
    object.style.width = size + "px";
    object.style.height = size + "px";
    object.style.backgroundColor = "#FF6B6B";

    plank.appendChild(object);
    object.style.position = 'absolute';
    object.style.left = (objData.distance + 200 - size / 2) + 'px';
    object.style.top = (-size / 2) + 'px';

    objects.push({
        element: object,
        weight: objData.weight,
        distance: objData.distance
    });
}
