function insertionSort(array) {
    const moves = [];
    const n = array.length;

    for (let i = 1; i < n; i++) { // Start from the second element
        let temp = array[i];
        let j = i - 1;

        // Compare temp with the elements before it and find its position
        while (j >= 0 && temp < array[j]) {
            moves.push({ indices: [j, j + 1], type: "comp" }); // Compare
            moves.push({ indices: [j, j + 1], type: "swap" }); // Track the swap
            array[j + 1] = array[j]; // Shift the larger element right
            j--;
        }

        // Place temp in its correct position
        array[j + 1] = temp; 
        moves.push({ indices: [j + 1, i], type: "swap" }); // Record the final placement
    }

    return moves;
}

