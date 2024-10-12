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
let swapCount = 0; // Counter to track the number of swaps (for merge sort, count merge operations)
let animationId; // To hold the animation ID for stopping it
const animationSpeed = 1500; // Default speed of animation in milliseconds

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

function playMergeSort() {
    if (isAnimating) return; // Prevent starting another animation
    isAnimating = true;
    swapCount = 0; // Reset swap counter
    disableButtons();
    const copy = [...array]; // Work with a copy of the array
    const merges = mergeSort(copy); // Get list of merges
    animate(merges); // Visualize the merge operations
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
        return;
    }
    const [left, right, mergedArray] = merges.shift(); // Get next merge operation
    array.splice(left, mergedArray.length, ...mergedArray); // Merge in the main array
    swapCount++; // Increment merge counter
    updateSwapCounter();

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

    mergeSortRecursive(arr, 0, arr.length);
    return merges;
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

       if (activeIndex1 !== -1 && (i >= activeIndex1 && i <= activeIndex2)) {
           bar.style.backgroundColor = "red"; 
       } 
       else {
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
   swapDisplay.innerText = `Merges: ${swapCount}`; // Updated label for Merge Sort
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
document.getElementById("playButton").addEventListener("click", playMergeSort);
document.getElementById("stopButton").addEventListener("click", stopAnimation);

// Add event listeners for the number of elements selector
document.getElementById("elementsRange").addEventListener("input", (e) => {
   n = Math.min(parseInt(e.target.value), 500); 
   updateElementCountDisplay();
   initRandom(); 
});