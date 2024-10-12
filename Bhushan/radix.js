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

// Radix Sort Implementation
async function radixSort() {
  let max = Math.max(...array);
  let exp = 1;
  while (Math.floor(max / exp) > 0) {
    await countSort(exp);
    exp *= 10;
  }
}

// Counting Sort for Radix Sort
async function countSort(exp) {
  let output = new Array(array.length);
  let count = new Array(10).fill(0);

  for (let i = 0; i < array.length; i++) {
    count[Math.floor(array[i] / exp) % 10]++;
  }

  for (let i = 1; i < 10; i++) {
    count[i] += count[i - 1];
  }

  for (let i = array.length - 1; i >= 0; i--) {
    output[count[Math.floor(array[i] / exp) % 10] - 1] = array[i];
    count[Math.floor(array[i] / exp) % 10]--;
  }

  for (let i = 0; i < array.length; i++) {
    array[i] = output[i];
    updateBars(i, 'current-digit');
    await sleep(speed);
    updateBars(i, 'sorted');
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
  radixSort();
});

// Generate a new array when "Generate Array" button is clicked
generateBtn.addEventListener('click', function () {
  createArray();
});

// Generate the initial array on page load
createArray();
