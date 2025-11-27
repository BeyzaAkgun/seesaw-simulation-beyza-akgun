let objects = [];

const clickArea = document.querySelector(".click-area");
const plank = document.querySelector(".plank");


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
    
    calculateTorque();

    console.log(`Object created: ${weight}kg at ${normalizedX}px from center`);


});

// Function to calculate torque and weights on both sides
function calculateTorque() {
    let leftTorque = 0;
    let rightTorque = 0;
    let leftWeight = 0;
    let rightWeight = 0;
    
    objects.forEach(obj => {
        if (obj.distance < 0) {
            // Left side
            leftTorque += obj.weight * Math.abs(obj.distance);
            leftWeight += obj.weight;
        } else if (obj.distance > 0) {
            //Right side
            rightTorque += obj.weight * obj.distance;
            rightWeight += obj.weight;
        }
    });
    
    const netTorque = rightTorque - leftTorque;
    
    console.log(" TORQUE CALCULATION RESULTS ");
    console.log("Left Side - Weight:", leftWeight + "kg", "Torque:", leftTorque);
    console.log("Right Side - Weight:", rightWeight + "kg", "Torque:", rightTorque);
    console.log("Net Torque:", netTorque);
    console.log("Total Object Count:", objects.length);
    return { netTorque, leftWeight, rightWeight };
}