
// SOUND FUNCTIONS
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

// GLOBAL VARIABLES
let n = 100; // Default number of bars/numbers
let array = []; // Array to hold the numbers generated
let isAnimating = false; // Flag to prevent concurrent animations
let swapCount = 0; // Counter to track the number of swaps (for insertion sort, count shifts)
let animationId; // To hold the animation ID for stopping it
const animationSpeed = 500; // Default speed of animation in milliseconds

// Initialize with random array by default and display bars
initRandom(); 

// FUNCTIONS
function initRandom() {
    array = [];
    for (let i = 0; i < n; i++) {
        array.push(Math.random()); // Random array (average case)
    }
    showBars();
    resetSwapCounter(); // Reset swap count on button click
    updateElementCountDisplay();
}

function initWorst() {
    array = [];
    for (let i = n; i > 0; i--) {
        array.push(i / n); // Worst case (reverse sorted array)
    }
    showBars();
    resetSwapCounter(); // Reset swap count on button click
    updateElementCountDisplay();
}

function initBest() {
    array = [];
    for (let i = 1; i <= n; i++) {
        array.push(i / n); // Best case (already sorted array)
    }
    showBars();
    resetSwapCounter(); // Reset swap count on button click
    updateElementCountDisplay();
}

function playInsertionSort() {
    if (isAnimating) return; // Prevent starting another animation
    isAnimating = true;
    swapCount = 0; // Reset swap counter
    disableButtons();
    const copy = [...array]; // Work with a copy of the array
    const shifts = insertionSort(copy); // Get list of shifts
    animate(shifts); // Visualize the shift operations
}

function stopAnimation() {
    isAnimating = false; // Reset flag when done
    enableButtons();
    clearTimeout(animationId); // Stop the animation
}

function animate(shifts) {
    if (shifts.length === 0) {
        stopAnimation(); // Stop animation when complete
        colorSortedBars(); // Color sorted bars at the end
        return;
    }
    const [i, j, value] = shifts.shift(); // Get next shift operation
    array.splice(j, 1); // Remove the value from its original position
    array.splice(i, 0, value); // Insert it at the correct position

    swapCount++; // Increment shift counter
    updateSwapCounter();

    // Play sound for the moved element
    playNote(200 + value * 500);

    showBars(i, j); // Highlight shifted bars (red)
    animationId = setTimeout(() => {
        animate(shifts);
    }, animationSpeed); // Adjusted delay for better visibility
}

function insertionSort(arr) {
    const shifts = [];
    for (let i = 1; i < arr.length; i++) {
        let j = i - 1;
        const currentValue = arr[i];
        while (j >= 0 && arr[j] > currentValue) {
            arr[j + 1] = arr[j]; // Shift elements to the right
            shifts.push([j + 1, j, arr[j]]); // Track the shifts
            j--;
        }
        arr[j + 1] = currentValue;
        shifts.push([j + 1, i, currentValue]); // Track final insertion
    }
    return shifts;
}

function showBars(activeIndex1 = -1, activeIndex2 = -1, isSorted = false) {
    const container = document.getElementById("container");
    container.innerHTML = ""; 
    const barWidth = Math.max(2, Math.floor(container.clientWidth / n)); 

    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement("div");
        bar.style.height = array[i] * 100 + "%";
        bar.style.width = barWidth + "px"; 
        bar.classList.add("bar");
        bar.style.marginRight = "0px"; 

        if (activeIndex1 !== -1 && (i === activeIndex1 || i === activeIndex2)) {
            bar.style.backgroundColor = "red"; 
        } else {
            bar.style.backgroundColor = "blue"; 
        }

        container.appendChild(bar);
    }
}

function colorSortedBars() {
    const bars = document.getElementsByClassName("bar");
    for (let i = 0; i < bars.length; i++) {
        bars[i].style.backgroundColor = "green"; 
    }
}

function updateSwapCounter() {
    const swapDisplay = document.getElementById("swapCounter");
    swapDisplay.innerText = `Shifts: ${swapCount}`; // Updated label for Insertion Sort
}

function resetSwapCounter() {
    swapCount = 0;
    updateSwapCounter();
}

function updateElementCountDisplay() {
    const elementCountDisplay = document.getElementById("elementCount");
    elementCountDisplay.innerText = `Number of Elements: ${n}`;
}

function disableButtons() {
    document.getElementById("randomArray").disabled = true;
    document.getElementById("worstCaseArray").disabled = true;
    document.getElementById("bestCaseArray").disabled = true;
    document.getElementById("playButton").disabled = true;
    document.getElementById("stopButton").style.display = "inline"; 
    document.getElementById("elementsRange").disabled = true; 
}

function enableButtons() {
    document.getElementById("randomArray").disabled = false;
    document.getElementById("worstCaseArray").disabled = false;
    document.getElementById("bestCaseArray").disabled = false;
    document.getElementById("playButton").disabled = false;
    document.getElementById("stopButton").style.display = "none"; 
    document.getElementById("elementsRange").disabled = false; 
}

// HTML Buttons trigger the respective initialization functions
document.getElementById("randomArray").addEventListener("click", initRandom);
document.getElementById("worstCaseArray").addEventListener("click", initWorst);
document.getElementById("bestCaseArray").addEventListener("click", initBest);
document.getElementById("playButton").addEventListener("click", playInsertionSort);
document.getElementById("stopButton").addEventListener("click", stopAnimation);

// Add event listeners for the number of elements selector
document.getElementById("elementsRange").addEventListener("input", (e) => {
    n = Math.min(parseInt(e.target.value), 500); 
    updateElementCountDisplay();
    initRandom(); 
});
