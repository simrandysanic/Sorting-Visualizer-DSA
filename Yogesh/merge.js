function mergeSort(array) {
    const moves = [];

    function merge(left, mid, right) {
        // Create temporary arrays for left and right subarrays
        const leftArray = array.slice(left, mid + 1);
        const rightArray = array.slice(mid + 1, right + 1);

        let i = 0; // Index for left subarray
        let j = 0; // Index for right subarray
        let k = left; // Index for the main array

        // Merge the left and right subarrays
        while (i < leftArray.length && j < rightArray.length) {
            moves.push({ indices: [k, left + i], type: "comp" }); // Compare

            if (leftArray[i] <= rightArray[j]) {
                array[k] = leftArray[i];
                moves.push({ indices: [k, left + i], type: "swap" }); // Swap
                i++;
            } else {
                array[k] = rightArray[j];
                moves.push({ indices: [k, mid + 1 + j], type: "swap" }); // Swap
                j++;
            }
            k++;
        }

        // Copy the remaining elements from leftArray, if any
        while (i < leftArray.length) {
            array[k] = leftArray[i];
            moves.push({ indices: [k, left + i], type: "swap" }); // Swap
            i++;
            k++;
        }

        // Copy the remaining elements from rightArray, if any
        while (j < rightArray.length) {
            array[k] = rightArray[j];
            moves.push({ indices: [k, mid + 1 + j], type: "swap" }); // Swap
            j++;
            k++;
        }
    }

    function sort(left, right) {
        if (left < right) {
            const mid = Math.floor((left + right) / 2);
            sort(left, mid);   // Sort the left half
            sort(mid + 1, right); // Sort the right half
            merge(left, mid, right); // Merge the sorted halves
        }
    }

    sort(0, array.length - 1); // Start the sorting process
    return moves; // Return the recorded moves
}

