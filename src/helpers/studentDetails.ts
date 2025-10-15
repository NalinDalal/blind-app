import { collegeNameMaps, reversedCollegeMap } from "@/constants/collages";

export interface StudentDetails {
  collegeName: string;
  branch: string;
  admissionYear: number;
  // Added admission semester
  admissionSemester: number;
  // Roll number is now a string to hold values like "D02"
  rollNumber: string;
  fullId: string;
  admissionType: "Regular" | "Diploma (Lateral Entry)";
}

/**
 * Extracts student identification details from an institutional email address.
 *
 * Validates the email format and the college code against known mappings; returns `null` if the format is invalid or the college code is unrecognized.
 *
 * @returns A `StudentDetails` object containing `collegeName`, `branch`, `admissionYear`, `admissionSemester`, `rollNumber`, `fullId`, and `admissionType`, or `null` if parsing/validation fails.
 */
export function getStudentDetailsFromEmail(
  email: string,
): StudentDetails | null {
  // Updated Regex to capture the semester and the full roll number separately
  const emailRegex =
    /^(\d{4})([a-zA-Z]+)(\d{2})(\d{1})([a-zA-Z0-9]+)@oriental\.ac\.in$/;
  const match = email.match(emailRegex);

  if (!match) {
    console.error("Invalid email format.");
    return null;
  }

  const [_, collegeCode, branch, year, semester, rollNumber] = match;

  if (!collegeNameMaps.has(collegeCode)) {
    console.error(`Invalid college code: ${collegeCode}`);
    return null;
  }

  const studentDetails: StudentDetails = {
    collegeName: collegeNameMaps.get(collegeCode) || "Unknown College",
    branch: branch.toUpperCase(),
    admissionYear: 2000 + parseInt(year, 10),
    admissionSemester: parseInt(semester, 10),
    rollNumber: rollNumber, // The roll number is captured directly (e.g., "D02" or "253")
    fullId: `${collegeCode}${branch}${year}${semester}${rollNumber}`,
    // Admission type is determined if the roll number starts with 'D'
    admissionType: rollNumber.toUpperCase().startsWith("D")
      ? "Diploma (Lateral Entry)"
      : "Regular",
  };
  return studentDetails;
}

/**
 * Create a student email address using college, branch, year, semester, and roll number.
 *
 * @param collegeName - Full college name used to look up its code
 * @param branch - Branch code (e.g., "CS", "EE"); case is normalized by the function
 * @param admissionYear - Full admission year (e.g., 2023)
 * @param admissionSemester - Admission semester number appended to the username
 * @param rollNumber - Numeric part of the roll number (for diploma entries this is the numeric portion that will be prefixed with `D`)
 * @param admissionType - Determines roll number formatting; `"Diploma (Lateral Entry)"` prefixes `D` and pads the numeric part to two digits
 * @returns The constructed email address (e.g., `0105cs231253@oriental.ac.in`), or `null` if `collegeName` is not recognized
 */
export function generateStudentEmail(
  collegeName: string,
  branch: string,
  admissionYear: number,
  admissionSemester: number, // Added semester parameter
  rollNumber: number, // The numeric part of the roll number
  admissionType: "Regular" | "Diploma (Lateral Entry)" = "Regular",
): string | null {
  if (!reversedCollegeMap.has(collegeName)) {
    console.error(`Invalid college name: ${collegeName}`);
    return null;
  }

  const collegeCode = reversedCollegeMap.get(collegeName);
  const yearShort = admissionYear.toString().slice(-2);
  const branchLower = branch.toLowerCase();

  let rollNumberPart: string;

  if (admissionType === "Diploma (Lateral Entry)") {
    // Prepend 'D' and pad the numeric part, e.g., 2 -> "D02"
    rollNumberPart = `D${rollNumber.toString().padStart(2, "0")}`;
  } else {
    // Use the number directly for regular students, e.g., 253 -> "253"
    rollNumberPart = rollNumber.toString();
  }

  const username = `${collegeCode}${branchLower}${yearShort}${admissionSemester}${rollNumberPart}`;
  return `${username}@oriental.ac.in`;
}

// --- Example Usage ---

console.log("--- Parsing Emails ---");
const diplomaEmail = "0105cs243d02@oriental.ac.in";
const regularEmail = "0105cs231253@oriental.ac.in";

const diplomaDetails = getStudentDetailsFromEmail(diplomaEmail);
const regularDetails = getStudentDetailsFromEmail(regularEmail);

console.log("\nDiploma Student Details:", diplomaDetails);
console.log("\nRegular Student Details:", regularDetails);

console.log("\n--- Generating Emails ---");
const newRegularEmail = generateStudentEmail(
  "Oriental Institute of Science and Technology",
  "CS",
  2023,
  1,
  253,
  "Regular",
);
const newDiplomaEmail = generateStudentEmail(
  "Oriental Institute of Science and Technology",
  "CS",
  2024,
  3,
  2,
  "Diploma (Lateral Entry)",
);

console.log(
  `Generated Regular Email should be 0105cs231253@oriental.ac.in ->`,
  newRegularEmail,
);
console.log(
  `Generated Diploma Email should be 0105cs243D02@oriental.ac.in ->`,
  newDiplomaEmail,
);