const n = 10;
const array = [];
init();

let audioCtx = null;

function playNote(freq) {
    if (audioCtx == null) {
        audioCtx = new (AudioContext || webkitAudioContext || window.webkitAudioContext)();
    }
    const dur = 0.1;
    const osc = audioCtx.createOscillator();
    osc.frequency.value = freq;
    osc.start();
    osc.stop(audioCtx.currentTime + dur);
    const node = audioCtx.createGain();
    node.gain.value = 0.1;
    node.gain.linearRampToValueAtTime(0, audioCtx.currentTime + dur);
    osc.connect(node);
    node.connect(audioCtx.destination);
}

function init() {
    for (let i = 0; i < n; i++) {
        array[i] = Math.random();
    }
    showBars();
}


function play(algorithm) {
    const copy = [...array]; // Work with a copy of the original array
    let moves;
            moves = insertionSort(copy);

    animate(moves);
}
function animate(moves) {
    if (moves.length === 0) {
        // All moves completed; mark final sorted indices
        showBars();
        return;
    }
    const move = moves.shift();
    const [i, j] = move.indices;

    if (move.type === "swap") {
        [array[i], array[j]] = [array[j], array[i]];
    }

    playNote(200 + array[i] * 500);
    playNote(200 + array[j] * 500);

    showBars(move);

    setTimeout(() => {
        animate(moves);
    }, 100);
}



function showBars(move) {
    const container = document.getElementById("container");
    container.innerHTML = "";

    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement("div");
        bar.style.height = array[i] * 100 + "%";
        bar.classList.add("bar");

        if (move && move.indices.includes(i)) {
            bar.style.backgroundColor = (move.type === "swap") ? "pink" : "purple";
        } else {
            bar.style.backgroundColor = "blue"; // Default color
        }

        container.appendChild(bar);
    }
}
