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
let n = 20; // Default number of bars/numbers
let array = []; // Array to hold the numbers generated
let swapCount = 0;
initRandom(); 

// FUNCTIONS
function updateShiftCounter() {
    const swapDisplay = document.getElementById("swapCounter");
    swapDisplay.innerText = `Swaps: ${swapCount}`; // Updated label for Insertion Sort
}
function initRandom() {
    // Step 1: Create an array with numbers from 0 to n-1
    array = [];
    for (let i = 1; i <= n; i++) {
        array.push(i); // Fill the array with 0, 1, 2, ..., n-1
    }
    
    // Step 2: Shuffle the array using the Fisher-Yates (Knuth) shuffle
    for (let i = n - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1)); // Random index from 0 to i
        [array[i], array[j]] = [array[j], array[i]]; // Swap elements at indices i and j
    }
    // Now the array contains numbers 0 to n-1 in random order
    showBars();
    resetShiftCounter(); // Reset shift count on button click
    updateElementCountDisplay();
}
function initWorst() {
    array = [];
    for (let i = n ; i > 0; i--) {  // Start from n-1 and go down to 0
        array.push(i); // Push values n-1, n-2, ..., 0 into the array
    }
    showBars();
    resetShiftCounter(); // Reset shift count on button click
    updateElementCountDisplay();
}
function initBest() {
    array = [];
    for (let i = 1; i <= n; i++) {
        array.push(i); // Best case (already sorted array)
    }
    showBars();
    resetShiftCounter(); // Reset shift count on button click
    updateElementCountDisplay();
}
async function playcyclicSort() {
  
    
    disableButtons();
    await cyclicSort(array);
   
    enableButtons(); 
}
async function cyclicSort(arr) {
    let i = 0;
    const n = arr.length;

    while (i < n) {
        // Calculate the correct position for the current element
        let correct = arr[i] - 1;
        showBars(i,-1,-1);
        playNote(200 + i * 100);
        await delay(s);

        // If the element is not in the correct position, swap it with the correct position
        if (arr[i] !== arr[correct]) {
            // Highlight the bars being swapped
            swapCount++;
            updateShiftCounter();
            showBars(-1,i, correct);  // Highlight the two bars being swapped
            playNote(200 + i * 10); // Play a note (optional, based on the index)
            await delay(s);  // Delay for the animation

            // Swap arr[i] with arr[correct]
            [arr[i], arr[correct]] = [arr[correct], arr[i]];

            // Update the bars after the swap
            showBars(-1,i, correct);
            await delay(s); // Delay to visualize the swap
        } else {
            // If the element is already in the correct position, move to the next element
            i++;
        }
    }

    // Final sorted state
    showBars();
    colorSortedBars(); // Optionally color the sorted bars
}
// Helper function to handle delays for the speed control
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
function showBars(activeIndex1 = -1, activeIndex2 = -1, activeIndex3 = -1, isSorted = false, highlightColor = "#5d5d77") {
    const container = document.getElementById("container");
    container.innerHTML = ""; // Clear previous bars

    // Get container width and calculate bar width
    const containerWidth = container.clientWidth; // Get container's actual width
    const barWidth = Math.max(5, Math.floor(containerWidth / n)); // Calculate bar width based on the container's width

    // Log to see if the width is sufficient and if n is being updated correctly
    console.log('Container width:', containerWidth);
    console.log('Bar width:', barWidth);
    console.log('Number of elements:', n);

    const maxValue = n; // The max value is n (since the array is 1 to n)
    const barMaxHeight = 90; // Max height of bars as a percentage of the container height

    for (let i = 0; i < array.length; i++) {
        // Create a div for each bar
        const bar = document.createElement("div");
        bar.style.position = "absolute"; // Position bars absolutely
        bar.style.bottom = "0"; // Start from the bottom of the container

        // Set height of the bar relative to the max value
        bar.style.height = `${(array[i] / maxValue) * barMaxHeight}%`;

        bar.style.width = barWidth + "px"; // Set width of the bar
        bar.classList.add("bar");

        // Highlight the bars based on their state
        if (i === activeIndex1) {
            bar.style.backgroundColor = "pink"; // Highlight active bars in pink
        } else if (i === activeIndex2 || i === activeIndex3) {
            bar.style.backgroundColor = "red"; // Highlight shifting bars in red
        } else {
            bar.style.backgroundColor = highlightColor; // Default color
        }

        // Set the left position based on index
        bar.style.left = `${i * (barWidth + 1)}px`; // Add some space between bars

        container.appendChild(bar);

        // Create a number label above the bar
        const numberSpan = document.createElement("span");
        numberSpan.innerText = array[i]; // Display the original value from the array
        numberSpan.style.fontSize = "12px";
        numberSpan.style.position = "absolute"; // Position the label absolutely

        // Adjust number position to be centered over the bar
        numberSpan.style.left = `${i * (barWidth + 1) + barWidth / 2}px`;
        numberSpan.style.transform = "translateX(-50%)"; // Center the label

        // Position the number slightly above the bar
        numberSpan.style.bottom = `${(array[i] / maxValue) * barMaxHeight + 2}%`;

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


function resetShiftCounter() {
    swapCount = 0;
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
document.getElementById("playButton").addEventListener("click", playcyclicSort);
// Add event listeners for the number of elements selector
document.getElementById("elementsRange").addEventListener("input", (e) => {
    n = Math.min(parseInt(e.target.value), 500); 
    updateElementCountDisplay();
    initRandom(); 
});

document.getElementById("speedRange").addEventListener("input", function() {
    s = 1100 - parseInt(this.value); // Invert the delay calculation
});



































































































