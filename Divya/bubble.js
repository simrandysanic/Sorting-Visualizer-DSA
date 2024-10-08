function bubbleSort(array) {
    const moves = [];
    const n = array.length; // Get the length of the array
    for (let i = 0; i < n; i++) {
        let swapped = false; // To track if any swaps were made
        for (let j = 0; j < n - 1 - i; j++) {
            moves.push({ indices: [j, j + 1], type: "comp" }); // Compare j and j + 1
            if (array[j] > array[j + 1]) {
                moves.push({ indices: [j, j + 1], type: "swap" }); // Track the indices of the swap
                [array[j], array[j + 1]] = [array[j + 1], array[j]]; 
                swapped = true;
            }
        }
        if (!swapped) {
            break;
        }
    }
    return moves;
}


