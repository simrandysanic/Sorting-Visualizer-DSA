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
let swapCount = 0; // Counter to track the number of operations
let animationId; // To hold the animation ID for stopping it
const animationSpeed = 100; // Default speed of animation in milliseconds
let operations = []; // Move operations to a global scope


// Initialize with random array by default and display bars
initRandom(); 

// FUNCTIONS
function initRandom() {
    array = [];
    for (let i = 0; i < n; i++) {
        array.push(Math.floor(Math.random() * 1000)); // Random integers between 0 and 999
    }
    showBars();
    resetSwapCounter(); // Reset operation count on button click
    operations = []; // Clear operations for a fresh start with the new array
    updateElementCountDisplay();
}

function initWorst() {
    console.log("Generating worst-case array"); // Debugging line

    array = [];
    
    // Generate 3-digit numbers in descending order
    for (let i = Math.min(n, 50); i > 0; i--) {
        array.push(900 + i); // Generates random 3-digit numbers around 900-999
    }
    // Generate 2-digit numbers in descending order if needed
    for (let i = Math.min(n - array.length, 50); i > 0; i--) {
        array.push(90 + i); // Generates random 2-digit numbers around 90-99
    }
    // Generate 1-digit numbers in descending order if needed
    for (let i = Math.min(n - array.length, 10); i > 0; i--) {
        array.push(i); // Generates random 1-digit numbers around 0-9
    }

    showBars(); // Display the generated array
    resetSwapCounter(); // Reset operation count on button click
    operations = []; // Clear operations for a fresh start with the new array
    updateElementCountDisplay();
}




function initBest() {
    array = [];

    // Generate a best-case scenario array with uniformly increasing three-digit numbers
    for (let i = 0; i < n; i++) {
        array.push(500 + i); // Stays within three-digit numbers (100 to 100 + n - 1)
    }

    showBars();
    resetSwapCounter(); // Reset operation count on button click
    operations = []; // Clear operations for a fresh start with the new array
    updateElementCountDisplay();
}





function playRadixSort() {
    if (isAnimating) return; // Prevent starting another animation
    isAnimating = true;
    //swapCount = 0; // Reset operation counter
    disableButtons();

   // Only generate operations if none exist (i.e., first time or after reset)
    if (operations.length === 0) {
        swapCount = 0; // Reset operation counter only for a fresh start
        updateSwapCounter();
        const copy = [...array]; // Work with a copy of the array
        operations = radixSort(copy); // Generate list of operations
    }
    
    animate(operations); // Visualize the operations
}

function stopAnimation() {
    isAnimating = false; // Reset flag when done
    enableButtons();
    clearTimeout(animationId); // Stop the animation
}

function animate(operations) {
    if (operations.length === 0) {
        stopAnimation(); // Stop animation when complete
        colorSortedBars(); // Color sorted bars at the end
        return;
    }

    const [type, index1, value] = operations.shift(); // Get next operation

    if (type === 'update') {
        array[index1] = value; // Update array with the sorted value
        swapCount++; // Increment operation counter
        updateSwapCounter();

        // Play sound for the updated element
        playNote(200 + array[index1] * 0.5);
        showBars(index1); // Highlight updated bar (red)
    }

    // Only set animationId if still animating
    if (isAnimating) {
        animationId = setTimeout(() => {
            animate(operations);
        }, animationSpeed); // Use animationSpeed variable
    }
}

function radixSort(arr) {
    const max = Math.max(...arr);
    const operations = [];

    // Perform counting sort for each digit, starting from least significant digit
    for (let exp = 1; Math.floor(max / exp) > 0; exp *= 10) {
        countingSortByDigit(arr, exp, operations);
    }

    return operations;
}

function countingSortByDigit(arr, exp, operations) {
    let count = new Array(10).fill(0);
    let output = new Array(arr.length).fill(0);

    // Count occurrences of digits at exp position
    for (let i = 0; i < arr.length; i++) {
        const digit = Math.floor((arr[i] / exp) % 10);
        count[digit]++;
        
    }

    // Compute cumulative sum
    for (let i = 1; i < 10; i++) {
        count[i] += count[i - 1];
        
    }

    // Build the sorted array based on the current digit (exp)
    for (let i = arr.length - 1; i >= 0; i--) {
        const digit = Math.floor((arr[i] / exp) % 10);
        const sortedIndex = count[digit] - 1;

        // Only track the operation if there's a need to update the position
        if (output[sortedIndex] !== arr[i]) {
            operations.push(['update', sortedIndex, arr[i]]);
        }

        output[sortedIndex] = arr[i];
        count[digit]--;
        
    }

    // Copy the sorted numbers back to the original array
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] !== output[i]) { // Track changes
            operations.push(['update', i, output[i]]);
        }
        arr[i] = output[i];
    }
}



function showBars(activeIndex = -1, isSorted = false) {
    const container = document.getElementById("container");
    container.innerHTML = ""; 
    const barWidth = Math.max(2, Math.floor(container.clientWidth / n)); 

    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement("div");
        bar.style.height = (array[i] / 10) + "%"; // Adjusted for radix sort (range 0-999)
        bar.style.width = barWidth + "px"; 
        bar.classList.add("bar");
        bar.style.marginRight = "0px"; 

        if (i === activeIndex) {
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
    swapDisplay.innerText = `Operations: ${swapCount}`; // Updated label for Radix Sort
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
    document.getElementById("speedRange").disabled = true; // Disable the speed scroller 
}

function enableButtons() {
    document.getElementById("randomArray").disabled = false;
    document.getElementById("worstCaseArray").disabled = false;
    document.getElementById("bestCaseArray").disabled = false;
    document.getElementById("playButton").disabled = false;
    document.getElementById("stopButton").style.display = "none"; 
    document.getElementById("elementsRange").disabled = false;
    document.getElementById("speedRange").disabled = false; // Re-enable the speed scroller 
}

// HTML Buttons trigger the respective initialization functions
document.getElementById("randomArray").addEventListener("click", initRandom);
document.getElementById("worstCaseArray").addEventListener("click", initWorst);
document.getElementById("bestCaseArray").addEventListener("click", initBest);
document.getElementById("playButton").addEventListener("click", playRadixSort);
document.getElementById("stopButton").addEventListener("click", stopAnimation);

// Add event listeners for the number of elements selector
document.getElementById("elementsRange").addEventListener("input", (e) => {
    n = Math.min(parseInt(e.target.value), 500); 
    updateElementCountDisplay();
    initRandom(); 
});

// Slider to adjust the animation speed
document.getElementById("speedRange").addEventListener("input", function() {
    s = 1100 - parseInt(this.value); // Invert the delay calculation
    updateSpeedDisplay();
});