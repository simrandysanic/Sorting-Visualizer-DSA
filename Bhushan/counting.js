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
let n = 100; // Default number of bars/numbers
let array = []; // Array to hold the numbers generated
let isAnimating = false; // Flag to prevent concurrent animations
let swapCount = 0; // Counter to track the number of operations
let animationId; // To hold the animation ID for stopping it
const animationSpeed = 100; // Default speed of animation in milliseconds
let currentOperationIndex = 0; // Track the current operation index
let operations = []; // Store operations globally to avoid resetting on resume


// Initialize with random array by default and display bars
initRandom(); 

// FUNCTIONS
function initRandom() {
    array = [];
    for (let i = 0; i < n; i++) {
        array.push(Math.floor(Math.random() * 100)); // Random integers between 0 and 99
    }
    showBars();
    resetSwapCounter(); // Reset swap count on button click
    updateElementCountDisplay();

     // Reset sorting variables
     currentOperationIndex = 0;
     operations = []; // Clear previous operations
}

function initWorst() {
    array = [];
    const factor = 50; // Factor to increase the size of k relative to n
    const range = n * factor; // Large range compared to n (e.g., n * 50)
    
    for (let i = 0; i < n; i++) {
        // Generate random values, ensuring the maximum value (k) is much larger than n
        array.push(Math.floor(Math.random() * range)); // Random values from 0 to range
    }
    
    showBars(); // Visualize the bars
    resetSwapCounter(); // Reset swap count on button click
    updateElementCountDisplay(); // Update the displayed element count

     // Reset sorting variables
     currentOperationIndex = 0;
     operations = []; // Clear previous operations
}



function initBest() {
    array = [];
    const maxValue = n; // Set the maximum value to n for the best case
    for (let i = 0; i < n; i++) {
        array.push(Math.floor(Math.random() * maxValue)); // Random values from 0 to n-1
    }
    showBars();
    resetSwapCounter(); // Reset swap count on button click
    updateElementCountDisplay();

     // Reset sorting variables
     currentOperationIndex = 0;
     operations = []; // Clear previous operations
}






function playCountingSort() {
    if (isAnimating) return; // Prevent starting another animation
    isAnimating = true;
    //swapCount = 0; // Reset operation counter
    disableButtons();

    if (currentOperationIndex >= operations.length) { // Reset operations only if all operations have been executed
        const copy = [...array]; // Work with a copy of the array
        operations = countingSort(copy); // Generate new operations
        currentOperationIndex = 0; // Reset the operation index for the new sort
    }

    animate(); // Visualize the operations
}

function stopAnimation() {
    clearTimeout(animationId); // Stop the animation
    isAnimating = false; // Reset flag when done
    enableButtons(); // Re-enable buttons
}

function animate() {
    if (!isAnimating || currentOperationIndex >= operations.length) {
        if (isAnimating) { // If still animating, stop
            stopAnimation(); // Stop animation when complete
            colorSortedBars(); // Color sorted bars at the end
        }
        return;
    }

    const [type, index1, index2] = operations[currentOperationIndex]; // Get current operation
    
    if (type === 'update') {
        array[index1] = index2; // Update array with the sorted value
        swapCount++; // Increment operation counter
        updateSwapCounter();

        // Play sound for the updated element
        playNote(200 + array[index1] * 5);
        showBars(index1); // Highlight updated bar (red)
    }

    currentOperationIndex++; // Move to the next operation

    animationId = setTimeout(() => {
        animate();
    }, s); // Adjusted delay for better visibility
}

function countingSort(arr) {
    let max = Math.max(...arr);
    let count = new Array(max + 1).fill(0);
    const operations = [];

    // Count occurrences
    for (let i = 0; i < arr.length; i++) {
        count[arr[i]]++;
    }

    // Compute cumulative sum
    for (let i = 1; i < count.length; i++) {
        count[i] += count[i - 1];
    }

    // Build the sorted array
    let output = new Array(arr.length).fill(0);
    for (let i = arr.length - 1; i >= 0; i--) {
        const sortedIndex = count[arr[i]] - 1;
        output[sortedIndex] = arr[i];
        count[arr[i]]--;
        operations.push(['update', sortedIndex, arr[i]]); // Track the update operation
    }

      /*// To visualize the process of placing elements in the output array
      for (let i = 0; i < output.length; i++) {
        operations.push(['update', i, output[i]]);
    }*/

    return operations;
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
    container.style.top = "60%";  // Move the container down 10% from the top of the screen
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
        bars[i].style.backgroundColor = "green"; 
    }
}

function updateSwapCounter() {
    const swapDisplay = document.getElementById("swapCounter");
    swapDisplay.innerText = `Operations: ${swapCount}`; // Updated label for Counting Sort
}

function resetSwapCounter() {
    swapCount = 0;
    updateSwapCounter();
}

function updateElementCountDisplay() {
    const elementCountDisplay = document.getElementById("elementCount");
    elementCountDisplay.innerText = `Number of Elements: ${n}`;
}

function updateSpeedDisplay() {
    const speedDisplay = document.getElementById('speedDisplay');
    speedDisplay.innerText = `Speed: ${s} ms`;
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
document.getElementById("playButton").addEventListener("click", playCountingSort);
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