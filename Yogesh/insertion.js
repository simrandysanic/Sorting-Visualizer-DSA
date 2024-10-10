function insertionSort(array) {
    const moves = [];
    const n = array.length;

    for (let i = 0; i < n - 1; i++) {
        let temp = array[i + 1];
        let j = i;

        // Compare temp with the elements before it and find its position
        while (j >= 0 && temp < array[j]) {
            moves.push({ indices: [j, j + 1], type: "comp" }); // Compare
            moves.push({ indices: [j, j + 1], type: "swap" }); // Shift the element to the right
            array[j + 1] = array[j]; // Shift the larger element right
            j--;
        }

        // Place temp in its correct position
        array[j + 1] = temp;
        moves.push({ indices: [j + 1, i + 1], type: "swap" }); // Record the final placement
    }

    return moves;
}

