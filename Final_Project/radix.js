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
let s = 600; // Default speed (600 ms)
let n = 25; // Default number of bars/numbers
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

// Helper function to shuffle an array (Fisher-Yates algorithm)
function shuffleArray(arr) {
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]]; // Swap elements
    }
    return arr;
}

function initWorst() {
    console.log("Generating worst-case array"); // Debugging line

    array = [];
    
    // Generate 3-digit numbers in descending order
    for (let i = Math.min(n, 50); i > 0; i--) {
        array.push(9000 + i); // Generates random 3-digit numbers around 900-999
    }
    // Generate 2-digit numbers in descending order if needed
    for (let i = Math.min(n - array.length, 50); i > 0; i--) {
        array.push(900 + i); // Generates random 2-digit numbers around 90-99
    }
    // Generate 1-digit numbers in descending order if needed
    for (let i = Math.min(n - array.length, 10); i > 0; i--) {
        array.push(i); // Generates random 1-digit numbers around 0-9
    }

    array = shuffleArray(array);

    showBars(); // Display the generated array
    resetSwapCounter(); // Reset operation count on button click
    operations = []; // Clear operations for a fresh start with the new array
    updateElementCountDisplay();
}




function initBest() {
    array = [];

    // Generate a best-case scenario array with uniformly increasing three-digit numbers
    for (let i = 0; i < n; i++) {
        array.push(i + 1); // Stays within three-digit numbers (100 to 100 + n - 1)
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
        }, s); // Use animationSpeed variable
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
    container.style.top = "150%";  // Move the container down 10% from the top of the screen
    container.style.left = "50%"; // Horizontally center the container
    container.style.transform = "translate(-50%, -50%)"; // Ensure true centering
   // container.style.border = "2px solid black"; // Add a border to make the container look like a rectangular box
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
        bar.style.backgroundColor = (activeIndex1 === i || activeIndex2 === i) ? "red" : "#5d5d77";

        // Set the left position to distribute bars evenly
        bar.style.left = `${i * (barWidth + 2)}px`; // Add 2px spacing between bars

        // Append the bar to the container
        container.appendChild(bar);

        // Create a span for the number above the bar
        const numberSpan = document.createElement("span");
        numberSpan.innerText = Math.floor(array[i]); // Convert the value to a whole number for display
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
        bars[i].style.backgroundColor = "#96CEB4"; 
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
   
});