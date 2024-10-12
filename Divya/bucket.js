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
}

function initWorst() {
    array = [];
    for (let i = n; i > 0; i--) {
        array.push(i / n); // Worst case (reverse sorted array)
    }
    showBars();
    resetSwapCounter(); // Reset operation count on button click
    updateElementCountDisplay();
}

function initBest() {
    array = [];
    for (let i = 1; i <= n; i++) {
        array.push(i / n); // Best case (already sorted array)
    }
    showBars();
    resetSwapCounter(); // Reset operation count on button click
    updateElementCountDisplay();
}

function playBucketSort() {
    if (isAnimating) return; // Prevent starting another animation
    isAnimating = true;
    swapCount = 0; // Reset operation counter
    disableButtons();
    const copy = [...array]; // Work with a copy of the array
    const operations = bucketSort(copy); // Get list of operations
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
        playNote(200 + array[index1] * 500);
        showBars(index1); // Highlight updated bar (red)
    }

    animationId = setTimeout(() => {
        animate(operations);
    }, animationSpeed); // Adjusted delay for better visibility
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

        // Move elements of arr[0..i-1], that are greater than key, to one position ahead
        while (j >= 0 && arr[j] > key) {
            arr[j + 1] = arr[j];
            j--;
        }
        arr[j + 1] = key;
    }

    return arr;
}

function showBars(activeIndex = -1, isSorted = false) {
    const container = document.getElementById("container");
    container.innerHTML = ""; 
    const barWidth = Math.max(2, Math.floor(container.clientWidth / n)); 

    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement("div");
        bar.style.height = array[i] * 100 + "%"; // Heights adjusted for floating-point numbers between 0 and 1
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
document.getElementById("playButton").addEventListener("click", playBucketSort);
document.getElementById("stopButton").addEventListener("click", stopAnimation);

// Add event listeners for the number of elements selector
document.getElementById("elementsRange").addEventListener("input", (e) => {
    n = Math.min(parseInt(e.target.value), 500); 
    updateElementCountDisplay();
    initRandom(); 
});
