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
let n = 25; // Default number of bars/numbers
let array = []; // Array to hold the numbers generated
let isAnimating = false; // Flag to prevent concurrent animations
let MergeCount = 0; // Counter to track the number of swaps (for merge sort, count merge operations)
let animationId; // To hold the animation ID for stopping it
let remainingMerges = [];
const animationSpeed = 600; // Default speed of animation in milliseconds

// Initialize with random array by default and display bars
initRandom(); 

// FUNCTIONS
function initRandom() {
    array = [];
    for (let i = 0; i < n; i++) {
        array.push(Math.random()); // Random array (average case)
    }
    showBars();
    resetMergeCounter(); // Reset swap count on button click
    updateElementCountDisplay();
}
function initWorst() {
    array = [];
    for (let i = n; i > 0; i--) {
        array.push(i / n); // Worst case (reverse sorted array)
    }
    showBars();
    resetMergeCounter(); // Reset swap count on button click
    updateElementCountDisplay();
}
function initBest() {
    array = [];
    for (let i = 1; i <= n; i++) {
        array.push(i / n); // Best case (already sorted array)
    }
    showBars();
    resetMergeCounter(); // Reset swap count on button click
    updateElementCountDisplay();
}

function playMergeSort() {
    if (isAnimating) return; // Prevent starting another animation
    isAnimating = true;

    if(remainingMerges.length ===0)
    {
        MergeCount = 0; // Reset Merge counter
        const copy = [...array]; // Work with a copy of the array
        remainingMerges = mergeSort(copy); // Get list of merges
    }
    
    disableButtons();
    animate(remainingMerges); // Visualize the merge operations
}

function stopAnimation() {
    isAnimating = false; // Reset flag when done
    enableButtons();
    clearTimeout(animationId); // Stop the animation
}

function animate(merges) {
    if (merges.length === 0) {
        stopAnimation(); // Stop animation when complete
        colorSortedBars(); // Color sorted bars at the end
        remainingMerges = [];
        return;
    }
    const [left, right, mergedArray] = merges.shift(); // Get next merge operation
    array.splice(left, mergedArray.length, ...mergedArray); // Merge in the main array
    MergeCount++; // Increment merge counter
    updateMergeCounter();

    // Play sound for the merged elements
    playNote(200 + array[left] * 500);
    playNote(200 + array[right - 1] * 500);

    showBars(left, right - 1); // Highlight merged bars (red)
    animationId = setTimeout(() => {
        animate(merges);
    }, animationSpeed); // Adjusted delay for better visibility
}

function mergeSort(arr) {
    const merges = [];
    mergeSortRecursive(arr, 0, arr.length);
    function mergeSortRecursive(array, left, right) {
        if (right - left < 2) return array.slice(left, right);
        
        const middle = Math.floor((left + right) / 2);
        const leftArr = mergeSortRecursive(array, left, middle);
        const rightArr = mergeSortRecursive(array, middle, right);
        
        let result = [], i = 0, j = 0;
        while (i < leftArr.length && j < rightArr.length) {
            if (leftArr[i] < rightArr[j]) {
                result.push(leftArr[i++]);
            } else {
                result.push(rightArr[j++]);
            }
        }
        result = result.concat(leftArr.slice(i)).concat(rightArr.slice(j));

        merges.push([left, right, result]); // Track the merge operations
        return result;
    }

    return merges;
}

function showBars(activeIndex1 = -1, activeIndex2 = -1, isSorted = false) {
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

        // Set the background color based on whether the bar is active or not
        bar.style.backgroundColor = (activeIndex1 === i || activeIndex2 === i) ? "red" : "#5d5d77";

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

    // Ensure the container has enough height for the bars and numbers
    container.style.height = "350px"; // Ensure container has enough height
}

function colorSortedBars() {
   const bars = document.getElementsByClassName("bar");
   for (let i = 0; i < bars.length; i++) {
       bars[i].style.backgroundColor = "#96CEB4"; 
   }
}

function updateMergeCounter() {
   const swapDisplay = document.getElementById("MergeCounter");
   swapDisplay.innerText = `Merges: ${MergeCount}`; // Updated label for Merge Sort
}

function resetMergeCounter() {
   MergeCount = 0;
   updateMergeCounter();
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
document.getElementById("playButton").addEventListener("click", playMergeSort);
document.getElementById("stopButton").addEventListener("click", stopAnimation);

// Slider to adjust the number of elements (bars) in the array
document.getElementById("elementsRange").addEventListener("input", function() {
    n = parseInt(this.value);
    initRandom();
    updateElementCountDisplay();
});

// Slider to adjust the animation speed
document.getElementById("speedRange").addEventListener("input", function() {
    s = 1100 - parseInt(this.value); // Invert the delay calculation
    updateSpeedDisplay();
});