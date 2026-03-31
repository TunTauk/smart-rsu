export type TranscriptCourse = {
  code: string;
  name: string;
  credit: number;
  grade: string;
  semesterNo: number | null;
  semesterYear: number | null;
};

const KNOWN_GRADES = new Set([
  "A", "B+", "B", "C+", "C", "D+", "D", "F", "W", "S", "U", "I", "NI",
]);

// RSU transcript semester headers are in English, year in Thai Buddhist Era
function parseSemesterHeader(line: string): { semesterNo: number; year: number } | null {
  const clean = line.replace(/\u0000/g, "").trim();
  let semesterNo: number;
  if (/FIRST SEMESTER/i.test(clean)) semesterNo = 1;
  else if (/SECOND SEMESTER/i.test(clean)) semesterNo = 2;
  else if (/SUMMER SESSION/i.test(clean)) semesterNo = 3;
  else return null;

  const yearMatch = clean.match(/ปีการศึกษา\s*(\d{4})/);
  if (!yearMatch) return null;
  return { semesterNo, year: parseInt(yearMatch[1], 10) };
}

function parseCourseRow(rawLine: string): Omit<TranscriptCourse, "semesterNo" | "semesterYear"> | null {
  const line = rawLine.replace(/\u0000/g, " ").trim();

  // Course code: 2-4 uppercase letters followed by 3 digits
  const codeMatch = line.match(/^([A-Z]{2,4}\d{3})\s+([\s\S]*)/);
  if (!codeMatch) return null;

  const code = codeMatch[1];
  const rest = codeMatch[2].trim();
  if (!rest) return null;

  const parts = rest.split("\t").map((s) => s.trim()).filter(Boolean);

  let name: string;
  let credit: number;
  let grade: string;

  if (parts.length >= 3) {
    // Normal: [NAME, CREDIT, GRADE] — but CREDIT field sometimes has "NAME CREDIT" together
    grade = parts[parts.length - 1];
    const rawCredit = parts[parts.length - 2];
    const creditEmbedded = rawCredit.match(/^(.*\S)\s+(\d+)$/);
    if (creditEmbedded && creditEmbedded[1]) {
      name = [...parts.slice(0, -2), creditEmbedded[1]].join(" ").trim();
      credit = parseInt(creditEmbedded[2], 10);
    } else {
      name = parts.slice(0, -2).join(" ").trim();
      credit = parseInt(rawCredit, 10);
    }
  } else if (parts.length === 2) {
    // [NAME_WITH_CREDIT, GRADE] — credit is the trailing number in part 0
    grade = parts[1];
    const creditMatch = parts[0].match(/^(.+?)\s+(\d+)\s*$/);
    if (!creditMatch) return null;
    name = creditMatch[1].trim();
    credit = parseInt(creditMatch[2], 10);
  } else {
    // Single part: "NAME CREDIT GRADE" — all joined by spaces
    const m = parts[0].match(/^(.+?)\s+(\d+)\s+([A-Z][+]?)\s*$/);
    if (!m) return null;
    name = m[1];
    credit = parseInt(m[2], 10);
    grade = m[3];
  }

  if (!KNOWN_GRADES.has(grade)) return null;
  if (isNaN(credit) || credit <= 0 || credit > 12) return null;
  if (!name) return null;

  return { code, name, credit, grade };
}

export async function extractCoursesFromPDF(buffer: Buffer): Promise<TranscriptCourse[]> {
  // pdf-parse v2 relies on canvas-backed polyfills such as DOMMatrix in serverless Node runtimes.
  await import("pdf-parse/worker");
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: new Uint8Array(buffer) });
  const result = await parser.getText({});

  await parser.destroy();

  const allText = (result.pages as { text: string }[]).map((p) => p.text).join("\n");
  const rawLines = allText.split("\n").map((l) => l.trim()).filter(Boolean);

  const SKIP_LINE =
    /^(Semester\s|Cumulative\s|STATUS|รหัส|ชื|คณะ|ประเภท|สอบ|https?:\/\/|\d{1,2}\/\d{1,2}\/\d{2,4})/i;
  const CODE_START = /^[A-Z]{2,4}\d{3}[\s\t]/;
  const SEMESTER_HEADER = /FIRST SEMESTER|SECOND SEMESTER|SUMMER SESSION/i;

  // Join continuation lines (e.g. long course names that wrap across lines)
  const lines: string[] = [];
  for (const raw of rawLines) {
    const isCourse = CODE_START.test(raw);
    const isSemester = SEMESTER_HEADER.test(raw);
    const isSkip = SKIP_LINE.test(raw);

    if (isCourse || isSemester || isSkip) {
      lines.push(raw);
    } else {
      const prev = lines[lines.length - 1];
      if (prev && CODE_START.test(prev)) {
        lines[lines.length - 1] = prev + " " + raw;
      } else {
        lines.push(raw);
      }
    }
  }

  const courses: TranscriptCourse[] = [];
  let currentSemester: { semesterNo: number; year: number } | null = null;

  for (const line of lines) {
    const semester = parseSemesterHeader(line);
    if (semester) {
      currentSemester = semester;
      continue;
    }

    const course = parseCourseRow(line);
    if (course) {
      courses.push({
        ...course,
        semesterNo: currentSemester?.semesterNo ?? null,
        semesterYear: currentSemester?.year ?? null,
      });
    }
  }

  return courses;
}
