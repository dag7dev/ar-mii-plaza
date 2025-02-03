const miiEntities = [];
const MIN_DISTANCE = 0.6; // Distanza minima tra i Mii
const MOVE_SPEED = 2000; // Durata del movimento in millisecondi
let gridMode = false;
let meetMode = false; 
let model = document.querySelector("#mii");
let selectedMii = null;

// Chiamare la funzione ogni volta che lo schermo ruota
window.onload = checkSavedMii;

// Night mode: yellow light after 6pm
const hour = new Date().getHours();
if (hour > 18 || hour < 6) {
    document.querySelector("#scene-container").innerHTML += `
<a-entity light="type: point; color: yellow; intensity: 1" position="0 1 0"></a-entity>
`;
}

// Generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        let r = Math.random() * 16 | 0,
            v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Mii Option Menu
function showMiiMenu(mii) {
    selectedMii = mii;

    const menu = document.getElementById("mii-menu");
    menu.style.display = "block";
}

// Hide Mii Option Menu
function closeMiiMenu() {
    document.getElementById("mii-menu").style.display = "none";
    selectedMii = null;
}

// Edit Mii
function editMii() {
    if (!selectedMii) return;

    // Load the saved Mii data
    const savedMii = JSON.parse(localStorage.getItem("savedMii"));

    if (savedMii) {
        // Load values into the editor
        document.getElementById("hat").value = savedMii.hat;
        document.getElementById("head").value = savedMii.head;
        document.getElementById("eyes").value = savedMii.eyes;
        document.getElementById("nose").value = savedMii.nose;
        document.getElementById("mouth").value = savedMii.mouth;
        document.getElementById("body").value = savedMii.body;

        // Store the Mii ID for editing
        localStorage.setItem("editingMiiID", savedMii.id);

        // Show the editor
        document.getElementById("editor").style.display = "flex";
    }

    closeMiiMenu();
}



function deleteOldMii() {
    const savedMii = localStorage.getItem("savedMii");
    if (savedMii) {
        const miiConfig = JSON.parse(savedMii);
        const oldMii = document.getElementById(miiConfig.id);
        if (oldMii) {
            oldMii.parentNode.removeChild(oldMii);
        }
    }
}

// Delete selected mii
function deleteMii() {
    if (!selectedMii) return;

    // from scene and
    selectedMii.parentNode.removeChild(selectedMii);

    // from localStorage
    localStorage.removeItem("savedMii");

    closeMiiMenu();
}

function checkSavedMii() {
    const savedMii = localStorage.getItem("savedMii");

    if (savedMii) {
        // show saved Mii
        document.getElementById("editor").style.display = "none";
        const miiConfig = JSON.parse(savedMii);

        // check if the Mii already exists
        const existingMii = document.getElementById(miiConfig.id);
        if (!existingMii) {
            createMii(miiConfig);
        }
    } else {
        document.getElementById("editor").style.display = "flex";
    }
}


// Enable Grid Mode
function arrangeMiiGrid() {
    gridMode = !gridMode;

    if (gridMode) {
        console.log("I Mii si dispongono in griglia e camminano fino alla loro posizione.");

        const gridSize = Math.ceil(Math.sqrt(miiEntities.length));
        const spacing = 0.8;
        const finalRotation = "0 0 0";
        let row = 0, col = 0;

        miiEntities.forEach((mii, index) => {
            let newX = (col - (gridSize - 1) / 2) * spacing;
            let newZ = (row - (gridSize - 1) / 2) * spacing;

            mii.removeAttribute("animation");

            let currentPos = mii.getAttribute("position");

            // New movement position
            let dx = newX - currentPos.x;
            let dz = newZ - currentPos.z;
            let angle = Math.atan2(dx, dz) * (180 / Math.PI);

            mii.setAttribute("rotation", `0 ${angle} 0`);
            mii.setAttribute("animation", `property: position; to: ${newX} 0 ${newZ}; dur: 3000; easing: easeInOutQuad`);

            setTimeout(() => {
                mii.setAttribute("rotation", finalRotation);
            }, 3100);

            col++;
            if (col >= gridSize) {
                col = 0;
                row++;
            }
        });

    } else {
        miiEntities.forEach(mii => moveMii(mii));
    }
}

function startAR() {
    const editingMiiID = localStorage.getItem("editingMiiID");
    if (editingMiiID) {
        const oldMii = document.getElementById(editingMiiID);
        if (oldMii) {
            oldMii.parentNode.removeChild(oldMii);
        }
        localStorage.removeItem("editingMiiID");
    }

    const newUUID = generateUUID();

    const miiConfig = {
        id: newUUID,
        hat: document.getElementById("hat").value,
        head: document.getElementById("head").value,
        eyes: document.getElementById("eyes").value,
        nose: document.getElementById("nose").value,
        mouth: document.getElementById("mouth").value,
        body: document.getElementById("body").value
    };

    localStorage.setItem("savedMii", JSON.stringify(miiConfig));
    document.getElementById("editor").style.display = "none";
    createMii(miiConfig);
}


// Raycaster
AFRAME.registerComponent('rotate-on-click', {
    init: function () {
        const el = this.el;

        el.classList.add("clickable");

        el.addEventListener('click', function (evt) {
            console.log("Mii cliccato!");

            el.setAttribute('rotation', '0 0 0');
            el.removeAttribute('animation');
            el.setAttribute('animation', {
                property: 'rotation',
                to: '0 360 0',
                dur: 1000,
                loop: false
            });

            showMiiMenu(el);
        });
    }
});


// Create Mii starting from the configuration
function createMii(miiConfig) {
    const mii = document.createElement('a-entity');
    mii.setAttribute('id', miiConfig.id);
    mii.setAttribute('position', '0 0 0');
    mii.setAttribute('rotate-on-click', '');

    mii.innerHTML = `
<a-entity position="0 0 0" gltf-model="${miiConfig.hat}"></a-entity>
<a-entity position="0 0 0" gltf-model="${miiConfig.head}"></a-entity>
<a-entity position="0 0 0" gltf-model="${miiConfig.eyes}"></a-entity>
<a-entity position="0 0 0" gltf-model="${miiConfig.nose}"></a-entity>
<a-entity position="0 0 0" gltf-model="${miiConfig.mouth}"></a-entity>
<a-entity position="0 0 0" gltf-model="${miiConfig.body}"></a-entity>
`;

    document.querySelector('#mii-container').appendChild(mii);
    miiEntities.push(mii);
    moveMii(mii);
}



// Move all Mii
function moveMii(mii) {
    if (gridMode) return;

    let newPosition = getValidMovePosition(mii);

    let currentPosition = mii.getAttribute("position");
    let dx = newPosition.x - currentPosition.x;
    let dz = newPosition.z - currentPosition.z;
    let direction = Math.atan2(dx, dz) * (180 / Math.PI);

    mii.setAttribute("rotation", `0 ${direction} 0`);
    mii.setAttribute("animation", `property: position; to: ${newPosition.x} 0 ${newPosition.z}; dur: ${MOVE_SPEED}; easing: easeInOutQuad`);

    setTimeout(() => {
        if (!meetMode) {
            moveMii(mii);
        }
    }, MOVE_SPEED + 500);
}


// This is used to obtain a new proposition
function getValidMovePosition(mii) {
    let attempts = 0;
    let newX, newZ;
    let valid = false;
    let currentPosition = mii.getAttribute("position");

    while (!valid && attempts < 100) { // Aumentiamo il numero di tentativi
        let offset = (Math.random() * 1) + 0.5; // Movimento più ampio
        let angle = Math.random() * Math.PI * 2;
        newX = parseFloat(currentPosition.x) + Math.cos(angle) * offset;
        newZ = parseFloat(currentPosition.z) + Math.sin(angle) * offset;
        valid = true;

        // Verifica che il Mii non esca dai confini
        if (newX > 2 || newX < -2 || newZ > 2 || newZ < -2) {
            valid = false;
        }

        // Controllo di collisione con altri Mii
        for (let otherMii of miiEntities) {
            if (otherMii !== mii) {
                let pos = otherMii.getAttribute("position");
                let distance = Math.sqrt((newX - pos.x) ** 2 + (newZ - pos.z) ** 2);
                if (distance < MIN_DISTANCE) {
                    valid = false;
                    break;
                }
            }
        }

        attempts++;
    }

    return { x: newX, z: newZ };
}
function addRandomMii() {
    const newUUID = generateUUID();

    const randomMii = {
        id: newUUID,
        hat: document.getElementById("hat").options[Math.floor(Math.random() * document.getElementById("hat").length)].value,
        head: document.getElementById("head").options[Math.floor(Math.random() * document.getElementById("head").length)].value,
        eyes: document.getElementById("eyes").options[Math.floor(Math.random() * document.getElementById("eyes").length)].value,
        nose: document.getElementById("nose").options[Math.floor(Math.random() * document.getElementById("nose").length)].value,
        mouth: document.getElementById("mouth").options[Math.floor(Math.random() * document.getElementById("mouth").length)].value,
        body: document.getElementById("body").options[Math.floor(Math.random() * document.getElementById("body").length)].value
    };

    createMii(randomMii); 
}



function toggleMeetMii() {
    if (miiEntities.length < 2) return;
    
    meetMode = !meetMode;

    if (meetMode) {
        console.log("Meet Mii: I Mii si incontrano!");

        for (let i = 0; i < miiEntities.length - 1; i += 2) {
            const mii1 = miiEntities[i];
            const mii2 = miiEntities[i + 1];

            const pos1 = mii1.getAttribute("position");
            const pos2 = mii2.getAttribute("position");

            const angleRad = Math.atan2(pos2.x - pos1.x, pos2.z - pos1.z);
            const angleDeg = angleRad * (180 / Math.PI);

            // **Fase 1: Si guardano**
            mii1.setAttribute("rotation", `0 ${angleDeg} 0`);
            mii2.setAttribute("rotation", `0 ${angleDeg + 180} 0`);

            // **Aspetta 1 secondo, poi si muovono**
            setTimeout(() => {
                console.log(`Meet Mii: Coppia ${i / 2 + 1} si muove!`);

                const midX = (pos1.x + pos2.x) / 2;
                const midZ = (pos1.z + pos2.z) / 2;

                const offset = 0.2;
                const newX1 = midX - Math.sin(angleRad) * offset;
                const newZ1 = midZ - Math.cos(angleRad) * offset;
                const newX2 = midX + Math.sin(angleRad) * offset;
                const newZ2 = midZ + Math.cos(angleRad) * offset;

                mii1.setAttribute("animation", `property: position; to: ${newX1} 0.1 ${newZ1}; dur: 2000; easing: easeInOutQuad`);
                mii2.setAttribute("animation", `property: position; to: ${newX2} 0.1 ${newZ2}; dur: 2000; easing: easeInOutQuad`);
            }, 100);
        }

        if (miiEntities.length % 2 !== 0) {
            console.log("C'è un Mii senza coppia, rimane fermo.");
        }

    } else {
        console.log("Meet Mii disattivato, i Mii riprendono a muoversi!");
        miiEntities.forEach(mii => moveMii(mii));
    }
}
