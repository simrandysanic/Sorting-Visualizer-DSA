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
let s = 600;
let n = 25; // Default number of bars/numbers
let array = []; // Array to hold the numbers generated
let isAnimating = false; // Flag to prevent concurrent animations
let swapCount = 0; // Counter to track the number of swaps
let animationId; // To hold the animation ID for stopping it
let currentIndex = 0; // Current position in the animation
const animationSpeed = 100; // Default speed of animation in milliseconds
let swaps = []; // Keep track of the swaps

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
    currentIndex = 0; // Reset the animation index
}

function initWorst() {
    array = [];
    for (let i = n; i > 0; i--) {
        array.push(i / n); // Worst case (reverse sorted array)
    }
    showBars();
    resetSwapCounter(); // Reset swap count on button click
    updateElementCountDisplay();
    currentIndex = 0; // Reset the animation index
}

function initBest() {
    array = [];
    for (let i = 1; i <= n; i++) {
        array.push(i / n); // Best case (already sorted array)
    }
    showBars();
    resetSwapCounter(); // Reset swap count on button click
    updateElementCountDisplay();
    currentIndex = 0; // Reset the animation index
}

function playHeapSort() {
    if (isAnimating) return; // Prevent starting another animation
    isAnimating = true;
    disableButtons();
    if (currentIndex === 0) {
        const copy = [...array]; // Work with a copy of the array
        swaps = heapSort(copy); // Get list of swaps
    }
    animate(); // Visualize the swaps
}


function stopAnimation() {
    isAnimating = false; // Reset flag when done
    enableButtons();
    clearTimeout(animationId); // Stop the animation
}

function animate() {
    if (currentIndex >= swaps.length) {
        stopAnimation(); // Stop animation when complete
        colorSortedBars(); // Color sorted bars at the end
        return;
    }
    const [i, j] = swaps[currentIndex]; // Get next pair of indices to swap
    [array[i], array[j]] = [array[j], array[i]]; // Perform the swap
    swapCount++; // Increment swap counter
    updateSwapCounter();

    // Play sound for the swapped elements
    playNote(200 + array[i] * 500);
    playNote(200 + array[j] * 500);

    showBars(i, j); // Highlight swapped bars (red)
    currentIndex++; // Move to the next swap
    animationId = setTimeout(animate, s); // Adjusted delay for better visibility
}


function heapSort(arr) {
    const swaps = [];
    const n = arr.length;

    // Build heap (rearrange array)
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
        heapify(arr, n, i, swaps);
    }

    // One by one extract elements from heap
    for (let i = n - 1; i > 0; i--) {
        // Move current root to end
        swaps.push([0, i]);
        [arr[0], arr[i]] = [arr[i], arr[0]];
        heapify(arr, i, 0, swaps); // call max heapify on the reduced heap
    }
    return swaps;
}

// To maintain the heap property
function heapify(arr, n, i, swaps) {
    let largest = i; // Initialize largest as root
    let left = 2 * i + 1; // left = 2*i + 1
    let right = 2 * i + 2; // right = 2*i + 2

    // If left child is larger than root
    if (left < n && arr[left] > arr[largest]) {
        largest = left;
    }

    // If right child is larger than largest so far
    if (right < n && arr[right] > arr[largest]) {
        largest = right;
    }

    // If largest is not root
    if (largest !== i) {
        swaps.push([i, largest]); // Track the swap
        [arr[i], arr[largest]] = [arr[largest], arr[i]]; // Swap

        // Recursively heapify the affected sub-tree
        heapify(arr, n, largest, swaps);
    }
}

function showBars(activeIndex1 = -1, activeIndex2 = -1) {
    const container = document.getElementById("container");
    container.innerHTML = ""; // Clear previous bars
    const barWidth = Math.max(2, Math.floor(container.clientWidth / n)); // Calculate bar width based on container width and number of elements

    // Calculate maximum height for the bars
    const maxValue = Math.max(...array);

    // Set a percentage height to leave space at the top
    const barMaxHeight = 90; // Use 90% of the container height for bars

    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement("div");

        bar.style.position = "absolute"; // Position bars absolutely
        bar.style.bottom = "0"; // Start from the bottom of the container
        bar.style.height = `${(array[i] / maxValue) * barMaxHeight}%`; // Set height relative to maxValue and barMaxHeight
        bar.style.width = barWidth + "px"; // Set width of the bar
        bar.classList.add("bar");
        //bar.style.marginRight = "0px";

        // Color bars differently based on their status
        if (activeIndex1 !== -1 && (i === activeIndex1 || i === activeIndex2)) {
            bar.style.backgroundColor = "#FFEEAD"; // Swapped bars
        } else {
            bar.style.backgroundColor = "#5d5d77"; // Unsorted bars
        }

        // Set the left position based on index
        bar.style.left = `${i * (barWidth + 1)}px`; // Adding 1px for spacing

        // Create a span for the number above the bar
        const numberSpan = document.createElement("span");
        numberSpan.innerText = Math.floor(array[i] * 100); // Show the number corresponding to the bar height
        numberSpan.style.fontSize = "12px"; // Adjust the font size for readability
        numberSpan.style.position = "absolute"; // Position the number absolutely
        numberSpan.style.left = `${i * (barWidth + 1)+ barWidth / 2 - 8}px`; // Match the bar's left position

        // Position the number slightly above the bar, with a little space
        numberSpan.style.bottom = `${(array[i] / maxValue) * barMaxHeight + 2}%`; // Add 2% to position the number above the bar

        // Append the number span to the container
        container.appendChild(numberSpan);
        container.appendChild(bar); // This appends the bar to the container    
    }
}

// Color sorted bars after the animation is complete
function colorSortedBars() {
    const bars = document.getElementsByClassName("bar");
    for (let i = 0; i < bars.length; i++) {
        bars[i].style.backgroundColor = "#96CEB4"; // Sorted bars
    }
}

function updateSwapCounter() {
    const swapDisplay = document.getElementById("swapCounter");
    swapDisplay.innerText = `Swaps: ${swapCount}`;
}

function resetSwapCounter() {
    swapCount = 0;
    updateSwapCounter();
}

// Update displayed number of elements
function updateElementCountDisplay() {
    const elementCountDisplay = document.getElementById("elementCount");
    elementCountDisplay.innerText = `Number of Elements: ${n}`;
}

// Enable and disable buttons during animation
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
document.getElementById("playButton").addEventListener("click", playHeapSort);
document.getElementById("stopButton").addEventListener("click", stopAnimation);

// Add event listeners for the number of elements selector
document.getElementById("elementsRange").addEventListener("input", (e) => {
    n = Math.min(parseInt(e.target.value), 60); 
    updateElementCountDisplay();
    initRandom(); 
});
// Add event listener for the speed selector
document.getElementById("speedRange").addEventListener("input", (e) => {
    s = 1000 - parseInt(e.target.value); // Invert speed range, as lower values should be faster
    updateSpeedDisplay();
});

