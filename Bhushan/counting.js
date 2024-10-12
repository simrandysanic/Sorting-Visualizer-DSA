const arrayContainer = document.getElementById('array-container');
const sizeSlider = document.getElementById('size');
const speedSlider = document.getElementById('speed');
const startBtn = document.getElementById('startBtn');
const generateBtn = document.getElementById('generateBtn');
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

// Counting Sort Implementation
async function countingSort() {
  const max = Math.max(...array);
  const count = new Array(max + 1).fill(0);
  const output = new Array(array.length).fill(0);

  // Step 1: Count the occurrences
  for (let i = 0; i < array.length; i++) {
    count[array[i]]++;
    updateBars(i, 'counting'); // Highlight as counting
    await sleep(speed);
    updateBars(i, ''); // Reset after highlighting
  }

  // Step 2: Cumulative sum
  for (let i = 1; i < count.length; i++) {
    count[i] += count[i - 1];
  }

  // Step 3: Place elements in output array
  for (let i = array.length - 1; i >= 0; i--) {
    output[count[array[i]] - 1] = array[i];
    count[array[i]]--;

    updateBars(i, 'placing'); // Highlight as placing in output
    await sleep(speed);
  }

  // Step 4: Copy sorted output to original array and update bars
  for (let i = 0; i < array.length; i++) {
    array[i] = output[i];
    updateBars(i, 'sorted'); // Highlight as sorted
    await sleep(speed);
  }
}

// Update bars with different colors during sorting
function updateBars(index, className) {
  const bars = document.querySelectorAll('.array-bar');
  bars[index].className = `array-bar ${className}`;
  bars[index].style.height = `${array[index] * 3}px`;
  // Update the number above the bar during sorting
  const values = document.querySelectorAll('.array-value');
  values[index].innerText = array[index];
}

// Start sorting when button is clicked
startBtn.addEventListener('click', function () {
  countingSort();
});

// Generate a new array when "Generate Array" button is clicked
generateBtn.addEventListener('click', function () {
  createArray();
});

// Generate the initial array on page load
createArray();
