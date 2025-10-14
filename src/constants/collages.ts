export const collegeNameMaps: Map<string, string> = new Map([
    ['0105', 'Oriental Institute of Science and Technology'],
    ['0126', 'Oriental College of Technology'],
    ['28', 'Oriental College of Management'],
    ['694', 'Oriental College of Pharmacy']
]);

// Create an empty map for the reversed data
export const reversedCollegeMap = new Map<string, string>();

// Iterate over the original map and add the swapped key-value pairs
collegeNameMaps.forEach((code: string, name: string) => {
    reversedCollegeMap.set(code, name);
});