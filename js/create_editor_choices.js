const optionsData = {
    hat: {
        "GLTF/cappello_layton.glb": "Gentleman",
        "GLTF/cappello_viola.glb": "Witch"
    },
    head: {
        "GLTF/testa_bianca.glb": "White",
        "GLTF/testa_nera.glb": "Black"
    },
    eyes: {
        "GLTF/occhi_normali.glb": "Normal",
        "GLTF/occhi_arrabbiati.glb": "Angry"
    },
    nose: {
        "GLTF/naso_bianco.glb": "White",
        "GLTF/naso_nero.glb": "Black"
    },
    mouth: {
        "GLTF/bocca_felice.glb": "Happy",
        "GLTF/bocca_arrabbiata.glb": "Mad"
    },
    body: {
        "GLTF/corpo_azzurro.glb": "Light Blue",
        "GLTF/corpo_giallo.glb": "Yellow"
    }
};

function createDropdowns() {
    const form = document.getElementById("editor");
    
    // div class="form-group">
    
    for (const [key, options] of Object.entries(optionsData)) {
        const label = document.createElement("label");
        label.textContent = key.charAt(0).toUpperCase() + key.slice(1) + ":";
        label.setAttribute("for", key);
        
        const select = document.createElement("select");
        select.id = key;
        
        for (const [value, text] of Object.entries(options)) {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = text;
            select.appendChild(option);
        }
        
        form.appendChild(label);
        form.appendChild(select);
        form.appendChild(document.createElement("br"));
    }
}

document.addEventListener("DOMContentLoaded", createDropdowns);
