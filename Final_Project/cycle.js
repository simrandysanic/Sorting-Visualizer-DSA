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
let swapCount = 0;
initRandom(); 

// FUNCTIONS
function updateShiftCounter() {
    const swapDisplay = document.getElementById("swapCounter");
    swapDisplay.innerText = `Swaps: ${swapCount}`; // Updated label for Insertion Sort
}
function initRandom() {
    array = [];
    for (let i = 0; i < n; i++) {
        array.push(Math.random()); // Random array (average case)
    }
    showBars();
    resetShiftCounter(); // Reset shift count on button click
    updateElementCountDisplay();
}

function initWorst() {
    array = [];
    for (let i = n; i > 0; i--) {
        array.push(i / n); // Worst case (reverse sorted array)
    }
    showBars();
    resetShiftCounter(); // Reset shift count on button click
    updateElementCountDisplay();
}

function initBest() {
    array = [];
    for (let i = 1; i <= n; i++) {
        array.push(i / n); // Best case (already sorted array)
    }
    showBars();
    resetShiftCounter(); // Reset shift count on button click
    updateElementCountDisplay();
}

async function playcycleSort() {
  
    
    disableButtons();
    await cycleSort(array);
   
    enableButtons(); 
}

// Cycle Sort Algorithm with visualization
async function cycleSort(arr) {
    let writes = 0;

    // Traverse array elements and put them in the right place
    for (let cycle_start = 0; cycle_start <= arr.length - 2; cycle_start++) {
        let item = arr[cycle_start];
        let pos = cycle_start;
        showBars(cycle_start,-1);
        playNote(200 + cycle_start * 500);
        await delay(s);

        // Find the position where we put the item
        for (let i = cycle_start + 1; i < arr.length; i++) {
            if (arr[i] < item) {
                showBars(-1,i,cycle_start);
                playNote(200 + cycle_start * 500);
                await delay(s);
                pos++;
            }
        }

        // If item is already in the correct position
        if (pos === cycle_start){
            
            continue;

        } 

        // Ignore all duplicate elements
        while (item === arr[pos]) {
            pos++;
        }

        // Put the item to its right position
        if (pos !== cycle_start) {
            [arr[pos], item] = [item, arr[pos]];
            // swapCount++; // Swap using destructuring
            // updateShiftCounter();
            writes++;
           
        }

        // Rotate the rest of the cycle
        while (pos !== cycle_start) {
            pos = cycle_start;
            for (let i = cycle_start + 1; i < arr.length; i++) {
                if (arr[i] < item) {
                    pos++;
                }
            }

            // Ignore duplicates
            while (item === arr[pos]) {
                pos++;
            }

            // Put the item to its right position
            if (item !== arr[pos]) {
                [arr[pos], item] = [item, arr[pos]];
                swapCount++; // Swap
                updateShiftCounter();
                writes++;
                showBars(cycle_start, pos);
                playNote(200 + cycle_start * 500);
                await delay(s);
            }
        }
    }
    // Final visualization
    showBars();
    colorSortedBars();
}

// Helper function to handle delays for the speed control
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function showBars(activeIndex1 = -1, activeIndex2 = -1, activeIndex3 =-1, isSorted = false, highlightColor = "#5d5d77") {
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
        if (i === activeIndex1) {
            bar.style.backgroundColor = "pink"; // Highlight the current value in pink
        } else if (i === activeIndex2 || i === activeIndex3) {
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
document.getElementById("playButton").addEventListener("click", playcycleSort);
// Add event listeners for the number of elements selector
document.getElementById("elementsRange").addEventListener("input", (e) => {
    n = Math.min(parseInt(e.target.value), 500); 
    updateElementCountDisplay();
    initRandom(); 
});

document.getElementById("speedRange").addEventListener("input", function() {
    s = 1100 - parseInt(this.value); // Invert the delay calculation
});



































































































