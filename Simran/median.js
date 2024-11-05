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
const animationSpeed = 100; // Default speed of animation in milliseconds

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

function playQuickSort() {
    if (isAnimating) return; // Prevent starting another animation
    isAnimating = true;
    swapCount = 0; // Reset swap counter
    disableButtons();
    
    const copy = [...array]; // Work with a copy of the array
    const swaps = quickSort(copy); // Get list of swaps
        
    animate(swaps); // Start animation with generated swaps
}

function stopAnimation() {
    isAnimating = false; // Reset flag when done
    enableButtons();
    clearTimeout(animationId); // Stop the animation
}

function quickSort(arr) {
    const swaps = [];
    quickSortHelper(arr, 0, arr.length - 1, swaps);
    return swaps;
}

function quickSortHelper(arr, low, high, swaps) {
    if (low < high) {
        let pivotIndex = partition(arr, low, high, swaps); // Get pivot index
        quickSortHelper(arr, low, pivotIndex - 1, swaps);
        quickSortHelper(arr, pivotIndex + 1, high, swaps);
    }
}

function partition(arr, low, high, swaps) {
    let pivotValue = arr[high];
    let i = low - 1;

    for (let j = low; j < high; j++) {
        if (arr[j] < pivotValue) {
            i++;
            swaps.push([i, j]); // Record swap indices
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }

    swaps.push([i + 1, high]); // Record final swap with pivot
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];
    return i + 1; // Return new pivot index
}

function medianOfMedians(arr, low, high) {
    if (high - low < 5) {
        return partition(arr, low, high, []); // Use partition for small arrays
    }

    let medians = [];
    
    for (let i = low; i <= high; i += 5) {
        let subHigh = Math.min(i + 4, high);
        let medianIndex = partition(arr, i, subHigh, []);
        medians.push(arr[medianIndex]); // Store median value
    }

    return quickSort(medians)[Math.floor(medians.length / 2)]; // Return median of medians
}

// Adjust the animate function to handle pairs correctly
function animate(swaps) {
    if (swaps.length === 0) {
        stopAnimation(); // Stop animation when complete
        colorSortedBars(); // Color sorted bars at the end
        return;
    }

    const nextSwap = swaps.shift(); // Get the next pair of indices to swap

    if (Array.isArray(nextSwap) && nextSwap.length === 2) {
        const [i, j] = nextSwap; // Destructure only if valid

        if (typeof i !== 'undefined' && typeof j !== 'undefined') {
            [array[i], array[j]] = [array[j], array[i]]; // Perform the swap
            swapCount++; // Increment swap counter
            updateSwapCounter();

            // Play sound for the swapped elements
            playNote(200 + array[i] * 500);
            playNote(200 + array[j] * 500);

            showBars(i, j); // Highlight swapped bars (red)

            animationId = setTimeout(() => {
                animate(swaps);
            },s); // Use animationSpeed variable for consistency
        }
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

function colorSortedBars() {
   const bars = document.getElementsByClassName("bar");
   for (let i = 0; i < bars.length; i++) {
       bars[i].style.backgroundColor = "#96CEB4"; 
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
    document.getElementById("speedRange").disabled = true;
}

function enableButtons() {
    document.getElementById("randomArray").disabled = false;
    document.getElementById("worstCaseArray").disabled = false;
    document.getElementById("bestCaseArray").disabled = false;
    document.getElementById("playButton").disabled = false;
    document.getElementById("stopButton").style.display = "none"; 
    document.getElementById("elementsRange").disabled = false;
    document.getElementById("speedRange").disabled = false;
}

// HTML Buttons trigger the respective initialization functions
document.getElementById("randomArray").addEventListener("click", initRandom);
document.getElementById("worstCaseArray").addEventListener("click", initWorst);
document.getElementById("bestCaseArray").addEventListener("click", initBest);
document.getElementById("playButton").addEventListener("click", playQuickSort);
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