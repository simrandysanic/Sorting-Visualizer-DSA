const arrayContainer = document.getElementById('array-container');
const sizeSlider = document.getElementById('size');
const speedSlider = document.getElementById('speed');
const startBtn = document.getElementById('startBtn');
const generateBtn = document.getElementById('generateBtn');
const messageDiv = document.getElementById('message');
let array = [];
let size = sizeSlider.value;
let speed = speedSlider.value;

// Create the array of random values and display the corresponding numbers above each bar
function createArray() {
  array = [];
  arrayContainer.innerHTML = ''; // Clear the container
  for (let i = 0; i < size; i++) {
    const value = Math.floor(Math.random() * 100);
    array.push(value);

    // Create a container for the bar and its number
    const barContainer = document.createElement('div');
    barContainer.style.position = 'relative';
    barContainer.style.display = 'inline-block';

    // Create the number element above the bar
    const number = document.createElement('div');
    number.classList.add('array-value');
    number.innerText = value;

    // Create the array bar
    const bar = document.createElement('div');
    bar.classList.add('array-bar');
    bar.style.height = `${value * 3}px`;

    // Append the number and the bar to the container
    barContainer.appendChild(number);
    barContainer.appendChild(bar);

    // Add the container to the array-container
    arrayContainer.appendChild(barContainer);
  }
}

// Update the size and speed based on sliders
sizeSlider.addEventListener('input', function () {
  size = this.value;
  createArray();
});

speedSlider.addEventListener('input', function () {
  speed = this.value;
});

// Helper to delay the sorting for visualization
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Helper function to update bars with different colors
function updateBars(index, className) {
  const bars = document.querySelectorAll('.array-bar');
  bars[index].className = `array-bar ${className}`;
  bars[index].style.height = `${array[index] * 3}px`;
  const values = document.querySelectorAll('.array-value');
  values[index].innerText = array[index];
}

// Bucket Sort Implementation
async function bucketSort() {
  messageDiv.innerText = "Step 1: Placing elements into buckets...";
  const bucketCount = Math.floor(Math.sqrt(size)); // Number of buckets (heuristic)
  let buckets = Array.from({ length: bucketCount }, () => []);

  // Step 1: Place elements in buckets
  const maxValue = Math.max(...array);
  for (let i = 0; i < array.length; i++) {
    const bucketIndex = Math.floor((array[i] / maxValue) * (bucketCount - 1));
    buckets[bucketIndex].push(array[i]);

    // Highlight the current element being bucketed
    updateBars(i, 'bucketing');
    await sleep(speed);
    updateBars(i, '');
  }

  // Update message for sorting phase
  messageDiv.innerText = "Step 2: Sorting elements within each bucket...";
  
  // Step 2: Sort each bucket
  for (let i = 0; i < buckets.length; i++) {
    if (buckets[i].length > 0) {
      // Set the color for currently sorting bucket
      for (let j = 0; j < buckets[i].length; j++) {
        const indexInArray = array.indexOf(buckets[i][j]);
        updateBars(indexInArray, 'bucket-sorting');
        await sleep(speed);
      }
      // Sort the bucket
      buckets[i].sort((a, b) => a - b); // Simple insertion sort for small buckets
    }
  }

  // Update message for placing elements back into the array
  messageDiv.innerText = "Step 3: Placing sorted elements back into the array...";

  // Step 3: Place sorted elements back into the array
  let index = 0;
  for (let i = 0; i < buckets.length; i++) {
    for (let j = 0; j < buckets[i].length; j++) {
      array[index] = buckets[i][j];
      updateBars(index, 'sorted');
      await sleep(speed);
      index++;
    }
  }

  // Final message
  messageDiv.innerText = "Sorting complete!";
}

// Start sorting when button is clicked
startBtn.addEventListener('click', function () {
  bucketSort();
});

// Generate a new array when "Generate Array" button is clicked
generateBtn.addEventListener('click', function () {
  createArray();
});

// Generate the initial array on page load
createArray();
