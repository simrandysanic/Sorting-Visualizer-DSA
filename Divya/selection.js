function selectionSort(array) {
    const moves = [];
    const n = array.length; // Get the length of the array
    for (let i = 0; i < n - 1; i++) {
        let minIndex = i; // Assume the minimum is the first element in the unsorted part
        for (let j = i + 1; j < n; j++) {
            moves.push({ indices: [minIndex, j], type: "comp" }); // Compare minIndex and j
            if (array[minIndex] > array[j]) {
                minIndex = j; // Update the index of the minimum element
            }
        }
        // Only push the swap move if minIndex has changed
        if (minIndex !== i) {
            moves.push({ indices: [i, minIndex], type: "swap" }); // Track the indices of the swap
            [array[i], array[minIndex]] = [array[minIndex], array[i]]; // Perform the swap
        }
    }
    return moves;
}
