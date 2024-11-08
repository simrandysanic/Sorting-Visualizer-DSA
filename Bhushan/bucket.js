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
let s = 600; // Delay for animation
let n = 25; // Default number of bars/numbers
let array = []; // Array to hold the numbers generated
let isAnimating = false; // Flag to prevent concurrent animations
let swapCount = 0; // Counter to track the number of operations
let animationId; // To hold the animation ID for stopping it
const animationSpeed = 100; // Default speed of animation in milliseconds
let pausedOperations = []; // Store remaining operations when paused
let currentOperations = []; // Store the ongoing operations during animation

// Initialize with random array by default and display bars
initRandom(); 

// FUNCTIONS
function initRandom() {
    array = [];
    for (let i = 0; i < n; i++) {
        array.push(Math.random()); // Random floating-point numbers between 0 and 1
    }
    showBars();
    resetSwapCounter(); // Reset operation count on button click
    updateElementCountDisplay();

    // Reset sorting operations when initializing a new array
    currentOperations = []; 
    pausedOperations = []; // Clear any paused operations
}


function initBest() {
    array = [];
    const bucketSize = 1 / 10; // Assuming 10 buckets

    for (let i = 0; i < n; i++) {
        const value = (i % 10) * bucketSize + Math.random() * bucketSize; 
        array.push(value); // Values are evenly distributed within each bucket range
    }

    array.sort((a, b) => a - b); // Pre-sort to ensure it's already sorted for the best case
    showBars(); // Display the best-case array in the visualization
    resetSwapCounter(); // Reset the operation counter for best case
    updateElementCountDisplay();

    // Reset sorting operations when initializing a new array
    currentOperations = []; 
    pausedOperations = []; // Clear any paused operations
}



function initWorst() {
    array = [];
    for (let i = 0; i < n; i++) {
        // Concentrate values near 1 to increase bucket collisions
        array.push(0.9 + Math.random() * 0.1); // Random values between 0.9 and 1
    }
    showBars(); // Update the bars to reflect the worst-case array
    resetSwapCounter(); // Reset operation counter
    updateElementCountDisplay(); // Update displayed element count

    // Reset sorting operations when initializing a new array
    currentOperations = []; 
    pausedOperations = []; // Clear any paused operations
}




function playBucketSort() {
    if (isAnimating) return; // Prevent starting another animation
    isAnimating = true;
    //swapCount = 0; // Reset operation counter
    disableButtons();

    // Only generate new operations if pausedOperations is empty
    if (pausedOperations.length === 0) {
        currentOperations = bucketSort([...array]); // Start new operations
    } else {
        currentOperations = [...pausedOperations]; // Resume from paused
    }
    pausedOperations = []; // Clear paused operations since we're resuming
    
    animate(); // Visualize the operations
}

function stopAnimation() {
    isAnimating = false; // Reset flag when done
    enableButtons();
    clearTimeout(animationId); // Stop the animation

    // Save the remaining operations for resuming later
    pausedOperations = [...currentOperations];
}

function animate() {
    if (currentOperations.length === 0) {
        stopAnimation(); // Stop animation when complete
        colorSortedBars(); // Color sorted bars at the end
        return;
    }

    const [type, index1, value] = currentOperations.shift(); // Get next operation

    if (type === 'update') {
        array[index1] = value; // Update array with the sorted value
        swapCount++; // Increment operation counter
        updateSwapCounter();

        // Play sound for the updated element
        playNote(200 + array[index1] * 500);
        showBars(index1); // Highlight updated bar (red)
    }

    animationId = setTimeout(() => {
        animate();
    }, s); // Adjusted delay for better visibility
}

function bucketSort(arr) {
    const operations = [];
    const buckets = Array.from({ length: 10 }, () => []); // Create 10 buckets (for simplicity)

    // Distribute array elements into buckets
    for (let i = 0; i < arr.length; i++) {
        const bucketIndex = Math.floor(arr[i] * 10); // Determine the bucket based on value
        buckets[bucketIndex].push(arr[i]);
    }

    // Sort each bucket individually and collect the sorted elements
    let index = 0;
    for (let i = 0; i < buckets.length; i++) {
        const sortedBucket = insertionSort(buckets[i], operations, index);
        for (let j = 0; j < sortedBucket.length; j++) {
            arr[index] = sortedBucket[j];
            operations.push(['update', index, sortedBucket[j]]); // Track the update operation
            index++;
        }
    }

    return operations;
}

function insertionSort(arr, operations, globalIndex) {
    for (let i = 1; i < arr.length; i++) {
        let key = arr[i];
        let j = i - 1;

        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            operations.push(['update', globalIndex + j + 1, arr[j]]); // Track each swap
            j--;
        }
        arr[j + 1] = key;
        operations.push(['update', globalIndex + j + 1, key]); // Track final position of key
    }

    return arr;
}

function showBars(activeIndex1 = -1, activeIndex2 = -1, isSorted = false) {
    const container = document.getElementById("container");
    container.innerHTML = ""; // Clear previous bars

    // Set the width and height of the container (increase width further)
    const containerWidth = 1500;  // Set a larger width for the container (increased width)
    const containerHeight = 350;  // Set a fixed height for the container

    // Set the container's width and height in JavaScript
    container.style.width = `${containerWidth}px`;
    container.style.height = `${containerHeight}px`;
    container.style.overflowX = "hidden";  // Prevent horizontal scroll
    container.style.position = "absolute"; // Absolute positioning to control centering
    
    // Adjust top positioning to move the container a little lower on the screen
    container.style.top = "190%";  // Move the container down 10% from the top of the screen
    container.style.left = "50%"; // Horizontally center the container
    container.style.transform = "translate(-50%, -50%)"; // Ensure true centering
    container.style.border = "2px solid black"; // Add a border to make the container look like a rectangular box
    container.style.boxSizing = "border-box"; // Ensure border is included in the size

    // Calculate the width of each bar based on the container width and the number of bars
    const barWidth = Math.max(5, Math.floor(containerWidth / array.length) - 2); // Adjust bar width dynamically

    // Calculate maximum height for the bars based on the container height
    const maxValue = Math.max(...array);  // Get the maximum value from the array to scale the bars
    const maxHeight = 80;  // Max height of the bars as a percentage of container height

    // Create bars and position them
    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement("div");
        bar.style.position = "absolute"; // Position bars absolutely within the container
        bar.style.bottom = "0"; // Set bars to start from the bottom
        bar.style.height = `${(array[i] / maxValue) * maxHeight}%`; // Set height relative to maxValue
        bar.style.width = `${barWidth}px`; // Set the width of each bar
        bar.classList.add("bar");

        // Set the background color based on whether the bar is active or not
        bar.style.backgroundColor = (activeIndex1 === i || activeIndex2 === i) ? "red" : "blue";

        // Set the left position to distribute bars evenly
        bar.style.left = `${i * (barWidth + 2)}px`; // Add 2px spacing between bars

        // Append the bar to the container
        container.appendChild(bar);

        // Create a span for the number above the bar
        const numberSpan = document.createElement("span");
        numberSpan.innerText = Math.floor(array[i] * 100); // Convert the value to a whole number for display
        numberSpan.style.fontSize = "12px";  // Adjust font size for readability
        numberSpan.style.position = "absolute"; // Position it absolutely above the bar
        numberSpan.style.left = `${i * (barWidth + 2) + barWidth / 2}px`; // Center the number above the bar
        numberSpan.style.transform = "translateX(-50%)";  // Align the number horizontally at the center of the bar
        numberSpan.style.bottom = `${(array[i] / maxValue) * maxHeight + 2}%`;  // Position the number slightly above the bar

        // Append the number span to the container
        container.appendChild(numberSpan);
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
    swapDisplay.innerText = `Operations: ${swapCount}`; // Updated label for Bucket Sort
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
document.getElementById("playButton").addEventListener("click", playBucketSort);
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
    
});