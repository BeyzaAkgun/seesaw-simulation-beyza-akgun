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

    console.log(`Object created: ${weight}kg at ${normalizedX}px from center`);


});