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
let sortedIndices = new Set();
let s = 600;
let n = 25; // Default number of bars/numbers
let array = []; // Array to hold the numbers generated
let isAnimating = false; // Flag to prevent concurrent animations
let shiftCount = 0; // Counter to track the number of shifts (for insertion sort)
let remainingShifts = []; // Store the remaining shifts when paused
initRandom(); 

// FUNCTIONS
function initRandom() {
    array = [];
    for (let i = 0; i < n; i++) {
        array.push(Math.random()); // Random array (average case)
    }
    sortedIndices.clear();
    showBars();
    resetShiftCounter(); // Reset shift count on button click
    updateElementCountDisplay();
}

function initWorst() {
    array = [];
    for (let i = n; i > 0; i--) {
        array.push(i / n); // Worst case (reverse sorted array)
    }
    sortedIndices.clear();
    showBars();
    resetShiftCounter(); // Reset shift count on button click
    updateElementCountDisplay();
}

function initBest() {
    array = [];
    for (let i = 1; i <= n; i++) {
        array.push(i / n); // Best case (already sorted array)
    }
    sortedIndices.clear();
    showBars();
    resetShiftCounter(); // Reset shift count on button click
    updateElementCountDisplay();
}
// Function to mark a bar at its final position
function markFinalPosition(index) {
    sortedIndices.add(index);
}

async function playInsertionSort() {
  
    shiftCount = 0; // Reset shift counter on a new sort
    disableButtons();
    await insertionSort(array);
   
    enableButtons(); 
}
 async function insertionSort(arr) {
    markFinalPosition(0);
    showBarsfinal();
    await delay(s);
    for (let i = 1; i < arr.length; i++) {
        markFinalPosition(i);
        let j = i - 1;
        const currentValue = arr[i];

        // Highlight the current value being inserted in pink
        showBars(i, -1, false); // Pass -1 to indicate no second active bar
        playNote(200 + currentValue * 500); // Play sound for the current value
         await delay(s); 

        while (j >= 0 && arr[j] > currentValue) {
            arr[j + 1] = arr[j]; 
            shiftCount++;
            updateShiftCounter(); // Update display after shift
            showBars(-1, j + 1, false); // Show the shifting bar in red
            playNote(200 + arr[j + 1] * 500); // Play sound for each shift
            await delay(s); // Delay for visibility
            j--;
        }

        arr[j + 1] = currentValue; // Insert the current value

        // Highlight the final insertion position
        showBars(j + 1, -1, false); // Highlight the final position in pink
        playNote(200 + currentValue * 500); // Play sound for the final insertion
        await delay(s); // Delay after inserting the element
        showBarsfinal();
        await delay(s);
    }
    colorSortedBars(); // All elements are sorted, show the final state
}

// Helper function to handle delays for the speed control
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showBars(activeIndex1 = -1, activeIndex2 = -1, isSorted = false, highlightColor = "#5d5d77") {
    const container = document.getElementById("container");
    container.innerHTML = ""; // Clear previous bars

    const barWidth = Math.max(5, Math.floor(container.clientWidth / n)); // Calculate bar width

    // Calculate maximum height for the bars
    const maxValue = Math.max(...array);

    // Set a percentage height to leave space at the top
    const barMaxHeight = 90; // Use 90% of the container height for bars

    for (let i = 0; i < array.length; i++) {
        // Create a div for the bar
        const bar = document.createElement("div");
        bar.style.position = "absolute"; // Position bars absolutely
        bar.style.bottom = "0"; // Start from the bottom of the container
        bar.style.height = `${(array[i] / maxValue) * barMaxHeight}%`; // Set height relative to maxValue and barMaxHeight
        bar.style.width = barWidth + "px"; // Set width of the bar
        bar.classList.add("bar");
        
        // Set the background color based on the indices
        if (i === activeIndex1) {
            bar.style.backgroundColor = "pink"; // Highlight the current value in pink
        } else if (i === activeIndex2) {
            bar.style.backgroundColor = "red"; // Highlight the shifting bar in red
        } else {
            bar.style.backgroundColor = highlightColor; // Default color for other bars
        }

        // Set the left position based on index
        bar.style.left = `${i * (barWidth + 1)}px`; // Adding 1px for spacing

        // Append the bar to the container
        container.appendChild(bar);

        // Create a span for the number above the bar
        const numberSpan = document.createElement("span"); // Create a span for the label
        numberSpan.innerText = Math.floor(array[i] * 100); // Convert the value to a whole number
        numberSpan.style.fontSize = "12px"; // Adjust font size for readability
        numberSpan.style.position = "absolute"; // Position it absolutely
        
        // Adjust the left position to center the number over the bar
        numberSpan.style.left = `${i * (barWidth + 1) + barWidth / 2}px`; 
        
        // Use CSS transform to align the center of the number with the center of the bar
        numberSpan.style.transform = "translateX(-50%)"; 
        
        // Position the number slightly above the bar
        numberSpan.style.bottom = `${(array[i] / maxValue) * barMaxHeight + 2}%`;
        
        // Append the number span to the container
        container.appendChild(numberSpan);
    }
}
function showBarsfinal(activeIndex1 = -1, activeIndex2 = -1, isSorted = false, highlightColor = "#5d5d77") {
    const container = document.getElementById("container");
    container.innerHTML = ""; // Clear previous bars

    const barWidth = Math.max(5, Math.floor(container.clientWidth / n)); // Calculate bar width

    // Calculate maximum height for the bars
    const maxValue = Math.max(...array);

    // Set a percentage height to leave space at the top
    const barMaxHeight = 90; // Use 90% of the container height for bars

    for (let i = 0; i < array.length; i++) {
        // Create a div for the bar
        const bar = document.createElement("div");
        bar.style.position = "absolute"; // Position bars absolutely
        bar.style.bottom = "0"; // Start from the bottom of the container
        bar.style.height = `${(array[i] / maxValue) * barMaxHeight}%`; // Set height relative to maxValue and barMaxHeight
        bar.style.width = barWidth + "px"; // Set width of the bar
        bar.classList.add("bar");
        if (sortedIndices.has(i)) {
            bar.style.backgroundColor = "orange";}
        else{
            bar.style.backgroundColor = highlightColor; 

        }

        // Set the left position based on index
        bar.style.left = `${i * (barWidth + 1)}px`; // Adding 1px for spacing

        // Append the bar to the container
        container.appendChild(bar);

        // Create a span for the number above the bar
        const numberSpan = document.createElement("span"); // Create a span for the label
        numberSpan.innerText = Math.floor(array[i] * 100); // Convert the value to a whole number
        numberSpan.style.fontSize = "12px"; // Adjust font size for readability
        numberSpan.style.position = "absolute"; // Position it absolutely
        
        // Adjust the left position to center the number over the bar
        numberSpan.style.left = `${i * (barWidth + 1) + barWidth / 2}px`; 
        
        // Use CSS transform to align the center of the number with the center of the bar
        numberSpan.style.transform = "translateX(-50%)"; 
        
        // Position the number slightly above the bar
        numberSpan.style.bottom = `${(array[i] / maxValue) * barMaxHeight + 2}%`;
        
        // Append the number span to the container
        container.appendChild(numberSpan);
    }
}

function colorSortedBars() {
    const bars = document.getElementsByClassName("bar");
    for (let i = 0; i < bars.length; i++) {
        bars[i].style.backgroundColor = "#96CEB4"; 
    }
    enableButtons();
}

function updateShiftCounter() {
    const swapDisplay = document.getElementById("swapCounter");
    swapDisplay.innerText = `Shifts: ${shiftCount}`; // Updated label for Insertion Sort
}
function resetShiftCounter() {
    shiftCount = 0;
    updateShiftCounter();
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
    document.getElementById("elementsRange").disabled = true; 
    document.getElementById("speedRange").disabled = true;
    
}
function enableButtons() {
    document.getElementById("randomArray").disabled = false;
    document.getElementById("worstCaseArray").disabled = false;
    document.getElementById("bestCaseArray").disabled = false;
    document.getElementById("playButton").disabled = false;
    document.getElementById("elementsRange").disabled = false; 
   document.getElementById("speedRange").disabled = false;
}
// HTML Buttons trigger the respective initialization functions
document.getElementById("randomArray").addEventListener("click", initRandom);
document.getElementById("worstCaseArray").addEventListener("click", initWorst);
document.getElementById("bestCaseArray").addEventListener("click", initBest);
document.getElementById("playButton").addEventListener("click", playInsertionSort);
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



































































































