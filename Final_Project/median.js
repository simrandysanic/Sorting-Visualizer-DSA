
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
let sortedIndices = new Set();
let n = 25; // Default number of bars/numbers
let array = []; // Array to hold the numbers generated
//let isAnimating = false; // Flag to prevent concurrent animations
let swapCount = 0; // Counter to track the number of swaps
let s = 600;
//let animationId; // To hold the animation ID for stopping it
//const animationSpeed = 1000; // Default speed of animation in milliseconds
// Initialize with random array by default and display bars
initRandom(); 

// FUNCTIONS
function initRandom() {
    array = [];
    for (let i = 0; i < n; i++) {
        array.push(Math.random()); // Random array (average case)
    }
    sortedIndices.clear();
    showBars();
    resetSwapCounter(); // Reset swap count on button click
    updateElementCountDisplay();
}
function initWorst() {
    array = [];
    for (let i = n; i > 0; i--) {
        array.push(i / n); // Worst case (reverse sorted array)
    }
    sortedIndices.clear();
    showBars();
    resetSwapCounter(); // Reset swap count on button click
    updateElementCountDisplay();
}
function initBest() {
    array = [];
    for (let i = 1; i <= n; i++) {
        array.push(i / n); // Best case (already sorted array)
    }
    sortedIndices.clear();
    showBars();
    resetSwapCounter(); // Reset swap count on button click
    updateElementCountDisplay();
}
// Function to mark a bar at its final position
function markFinalPosition(index) {
    sortedIndices.add(index);
}
function findMedian(arr, l, r) {
    const temp = arr.slice(l, r + 1);
    const size = temp.length;
    
    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size - 1; j++) {
            if (temp[j] > temp[j + 1]) {
                let swapTemp = temp[j];
                temp[j] = temp[j + 1];
                temp[j + 1] = swapTemp;
            }
        }
    }
    const medianIndex = Math.floor(size / 2);
    return temp[medianIndex];
}



async function playQuickSort() {
   swapCount = 0; // Reset swap counter
   disableButtons();

   // Asynchronous quick sort call
    await quickSort(array);

   enableButtons(); // Re-enable buttons after sorting is complete
   colorSortedBars(); // Change color of sorted bars
}
function swapping(one, two) {
   const temp = one[0];
   one[0] = two[0];
   two[0] = temp;
   swapCount++; 
   updateSwapCounter(); 
}
async function partition(arr, left, right) {
    const pivot = medianOfMedians(arr, left, right);
    const pivotInd = SearchpivotInd(arr, left, right, pivot);
    showBars(pivotInd, -1,-1,-1,-1, false);
    playNote(200 + pivotInd * 500);

     await delay(s);

    // Swap pivot to the beginning of the array for partitioning
    let temp = arr[left];
    arr[left] = arr[pivotInd];
    arr[pivotInd] = temp;
    swapCount++;
    updateSwapCounter();
    showBars(-1,left,pivotInd,-1,-1,false);
    playNote(200 + left * 500);
    await delay(s);
 

    let i = left + 1;
    let j = right;

    // Partition around the pivot
    while (i <= j) {
        while (i <= right && arr[i] <= pivot) {
            i++;
        }
        while (j >= left && arr[j] > pivot) {
            j--;
        }
        if (i < j) {
            // Swap elements to position them correctly
            temp = arr[i];
            arr[i] = arr[j];
            arr[j] = temp;
            swapCount++;
            updateSwapCounter();
            showBars(-1,-1,-1,i,j,false);
            playNote(200 + i * 500);
            await delay(s);
           
        }
    }
    // Place the pivot in its correct position
    temp = arr[j];
    arr[j] = arr[left];
    arr[left] = temp;
    swapCount++;
    updateSwapCounter();
    markFinalPosition(j);
    showBars();
    playNote(200 + j * 500);
    await delay(s);

    return j;
    // Highlight the current value being inserted in pink
}
async function quickSortHelper(arr, low, high) {
   if (low < high) {
       let pivotIndex = await partition(arr, low, high);
      await quickSortHelper(arr, low, pivotIndex - 1);
      await quickSortHelper(arr, pivotIndex + 1, high);
   }
}
async function quickSort(arr) {
   await quickSortHelper(arr, 0, arr.length - 1);
   showBars();
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
 function minimum(a, b) {
    return (a < b) ? a : b;
}
 function medianOfMedians(arr, left, right) {
    const sizeOfSubarray = right - left + 1;

    if (sizeOfSubarray <= 5) {
        return findMedian(arr, left, right);
    }

    const noOfSubarrays = Math.ceil(sizeOfSubarray / 5);
    const mediansArray = new Array(noOfSubarrays);

    for (let i = 0; i < noOfSubarrays; i++) {
        const subLeft = left + i * 5;
        const subRight = minimum(subLeft + 4, right);
        mediansArray[i] = findMedian(arr, subLeft, subRight);
    }

    return medianOfMedians(mediansArray, 0, noOfSubarrays - 1);
}
 function SearchpivotInd(arr, left, right, pivot) {
    for (let i = left; i <= right; i++) {
        if (arr[i] === pivot) {
            return i;
        }
    }
    return -1;
}
function showBars(activeIndex1 = -1, activeIndex2 = -1, activeIndex3 = -1, activeI4=-1,activeI5=-1, isSorted = false, highlightColor = "#5d5d77") {
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
        if (sortedIndices.has(i)) {
            bar.style.backgroundColor = "orange";}
        else if (i === activeIndex1) {
            bar.style.backgroundColor = "pink"; // Highlight the current value in pink
        } else if (i === activeIndex2 || i === activeIndex3) {
            bar.style.backgroundColor = "red"; // Highlight the shifting bar in red
        }
        else if(i===activeI4 ||i=== activeI5){
            bar.style.backgroundColor = "black";

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
document.getElementById("playButton").addEventListener("click", playQuickSort);

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