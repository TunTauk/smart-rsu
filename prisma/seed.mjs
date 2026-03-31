import bcrypt from "bcryptjs";
import { DayOfWeek, PrismaClient, UserRole } from "@prisma/client";

const prisma = new PrismaClient();

const subjectCatalog = [
  {
    code: "CSC101",
    name: "Introduction to Computer Science",
    type: "Major Core",
    credit: 3,
    description: "Foundations of computer systems, computational thinking, and basic problem solving for students beginning the computer science curriculum.",
  },
  {
    code: "CSC120",
    name: "Discrete Mathematics",
    type: "Major Core",
    credit: 3,
    description: "Logic, sets, combinatorics, graphs, and proof techniques used throughout later computer science subjects.",
  },
  {
    code: "CSC250",
    name: "Object-Oriented Programming",
    type: "Major Core",
    credit: 3,
    description: "Object-oriented design, classes, inheritance, interfaces, and team-based software construction with Java.",
    prerequisiteCode: "CSC101",
  },
  {
    code: "CSC362",
    name: "Database Systems",
    type: "Major Core",
    credit: 3,
    description: "Relational modeling, SQL, schema design, transactions, and practical database-backed application development.",
    prerequisiteCode: "CSC250",
  },
  {
    code: "CSC485",
    name: "Introduction to Research Methodology for Computer Science",
    type: "Major Core",
    credit: 3,
    description: "Research design, literature review, proposal writing, ethics, and presentation skills for senior computer science projects.",
  },
  {
    code: "CSC487",
    name: "Laws and Ethics in Information Technology",
    type: "Major Core",
    credit: 3,
    description: "Professional practice, privacy, intellectual property, cybersecurity law, and ethical decision making in information technology.",
  },
  {
    code: "CSC475",
    name: "Big Data Analytics",
    type: "Major Electives",
    credit: 3,
    description: "Large-scale data pipelines, exploratory analytics, dashboards, and data-driven decision making with modern tools.",
    prerequisiteCode: "CSC362",
  },
  {
    code: "CSC478",
    name: "Machine Learning Fundamentals",
    type: "Major Electives",
    credit: 3,
    description: "Supervised and unsupervised learning, feature engineering, model evaluation, and practical machine learning workflows.",
    prerequisiteCode: "CSC362",
  },
  {
    code: "CSC451",
    name: "Cloud Application Development",
    type: "Major Electives",
    credit: 3,
    description: "Building scalable cloud-native web services, containerized deployments, and API-driven applications.",
    prerequisiteCode: "CSC250",
  },
  {
    code: "CSC210",
    name: "Web Programming",
    type: "Major Core",
    credit: 3,
    description: "Client-server web development, modern frontend foundations, and building data-driven web applications.",
    prerequisiteCode: "CSC101",
  },
  {
    code: "CSC214",
    name: "Computer Organization and Architecture",
    type: "Major Core",
    credit: 3,
    description: "Digital logic, processor organization, memory systems, and how software interacts with hardware architecture.",
    prerequisiteCode: "CSC101",
  },
  {
    code: "CSC218",
    name: "Probability and Statistics for Computing",
    type: "Major Core",
    credit: 3,
    description: "Probability, descriptive statistics, distributions, and statistical thinking for computing and data analysis.",
    prerequisiteCode: "CSC120",
  },
  {
    code: "CSC280",
    name: "Visual Design for Interactive Media",
    type: "Major Electives",
    credit: 3,
    description: "Visual design principles, interface composition, and digital media aesthetics for interactive experiences.",
    prerequisiteCode: "CSC101",
  },
  {
    code: "CSC330",
    name: "Mobile Application Development",
    type: "Major Electives",
    credit: 3,
    description: "Designing and building mobile applications with modern UI patterns, device APIs, and data synchronization.",
    prerequisiteCode: "CSC250",
  },
  {
    code: "CSC340",
    name: "Data Visualization",
    type: "Major Electives",
    credit: 3,
    description: "Visual storytelling, dashboard design, and data communication techniques for analytical applications.",
    prerequisiteCode: "CSC120",
  },
  {
    code: "CSC463",
    name: "Human-Computer Interaction",
    type: "Major Electives",
    credit: 3,
    description: "User research, interface prototyping, accessibility, and iterative design for usable digital products.",
    prerequisiteCode: "CSC250",
  },
  {
    code: "CSC472",
    name: "Information Security Fundamentals",
    type: "Major Electives",
    credit: 3,
    description: "Security principles, threat modeling, authentication, cryptography basics, and secure software practices.",
    prerequisiteCode: "CSC250",
  },
  {
    code: "GEN101",
    name: "Thai Society and Global Citizenship",
    type: "General Educations",
    credit: 2,
    description: "Social responsibility, civic literacy, and cultural awareness in Thai and global contexts.",
  },
  {
    code: "ENG102",
    name: "Academic English",
    type: "General Educations",
    credit: 2,
    description: "Academic reading, writing, presentations, and discussion strategies for university study.",
  },
  {
    code: "ART201",
    name: "Creative Thinking and Design",
    type: "Free Elective",
    credit: 3,
    description: "Creative problem solving, visual ideation, storytelling, and design process fundamentals.",
  },
  {
    code: "BUS105",
    name: "Introduction to Entrepreneurship",
    type: "Free Elective",
    credit: 3,
    description: "Startup thinking, opportunity discovery, business modeling, and innovation planning for new ventures.",
  },
  {
    code: "IRS111",
    name: "Social Dharmacracy",
    type: "General Educations",
    credit: 2,
    description: "Social values, civic responsibility, and ethical participation in contemporary society.",
  },
  {
    code: "IRS112",
    name: "Sports for Health",
    type: "General Educations",
    credit: 1,
    description: "Physical wellness, exercise habits, and health-oriented activity for everyday life.",
  },
  {
    code: "IRS160",
    name: "Digital Media Literacy",
    type: "General Educations",
    credit: 3,
    description: "Evaluating digital content, media awareness, online communication, and responsible digital participation.",
  },
  {
    code: "IRS183",
    name: "D.I.Y.",
    type: "Free Elective",
    credit: 3,
    description: "Hands-on creative practice, self-directed making, and practical problem solving through projects.",
  },
  {
    code: "ICT102",
    name: "Computer Programming I",
    type: "Major Core",
    credit: 3,
    description: "Programming fundamentals, control flow, functions, and problem solving for beginning information technology students.",
  },
  {
    code: "ICT103",
    name: "Database Systems",
    type: "Major Core",
    credit: 3,
    description: "Introduction to data models, SQL, database design, and applications of database systems.",
  },
  {
    code: "ICT209",
    name: "Data Communications and Networking",
    type: "Major Core",
    credit: 3,
    description: "Network architectures, protocols, transmission, and practical communication technologies for information systems.",
  },
  {
    code: "ICT112",
    name: "Fundamental Information Systems",
    type: "Major Core",
    credit: 3,
    description: "Core concepts of information systems, organizations, data flow, and technology-enabled business processes.",
  },
  {
    code: "ITE201",
    name: "Information Technology Engagement in Community",
    type: "Major Electives",
    credit: 3,
    description: "Community-based technology projects, stakeholder communication, and applied IT problem solving.",
  },
  {
    code: "ILE126",
    name: "English in TED - Technology, Entertainment, and Design",
    type: "General Educations",
    credit: 3,
    description: "English listening, speaking, and discussion through TED topics in technology, entertainment, and design.",
  },
  {
    code: "IRS172",
    name: "Environmental-Friendly Life",
    type: "General Educations",
    credit: 3,
    description: "Sustainable living, environmental awareness, and practical habits for responsible daily life.",
  },
  {
    code: "ICT101",
    name: "Object-Oriented Technology",
    type: "Major Core",
    credit: 3,
    description: "Object-oriented concepts, reusable design, and software development with modern programming tools.",
  },
  {
    code: "MAT153",
    name: "Mathematics for Information Technology",
    type: "Major Core",
    credit: 3,
    description: "Mathematical foundations supporting computing, logic, data analysis, and information technology applications.",
  },
  {
    code: "ICT211",
    name: "Database Management Systems for Organization",
    type: "Major Core",
    credit: 3,
    description: "Organizational database systems, administration, design decisions, and business-oriented data management.",
  },
  {
    code: "ICT213",
    name: "System Analysis and Design",
    type: "Major Core",
    credit: 3,
    description: "Requirements analysis, modeling, process design, and structured planning of information systems.",
  },
  {
    code: "ICT202",
    name: "Computer Programming II",
    type: "Major Core",
    credit: 3,
    description: "Intermediate programming, problem decomposition, data handling, and larger software exercises.",
  },
  {
    code: "ITA127",
    name: "Thai Language for Beginners",
    type: "General Educations",
    credit: 3,
    description: "Introductory Thai language skills for communication, comprehension, and basic academic use.",
  },
  {
    code: "IRS149",
    name: "Cultural Appreciation",
    type: "General Educations",
    credit: 3,
    description: "Understanding culture, arts, identity, and appreciation of diverse social perspectives.",
  },
  {
    code: "ICT111",
    name: "Introduction to Information Technology",
    type: "Major Core",
    credit: 3,
    description: "Overview of information technology fields, systems thinking, careers, and core technical foundations.",
  },
  {
    code: "ICT110",
    name: "Web Systems and Technologies",
    type: "Major Core",
    credit: 3,
    description: "Web architecture, front-end and back-end basics, and technologies used to build web systems.",
  },
  {
    code: "IRS135",
    name: "Happy Life and Society Design",
    type: "General Educations",
    credit: 3,
    description: "Well-being, social design, and practical approaches to building a balanced and meaningful life.",
  },
  {
    code: "CT210",
    name: "Information Technology Laws",
    type: "Major Core",
    credit: 3,
    description: "Legal frameworks, digital governance, compliance, and law-related issues in information technology.",
  },
  {
    code: "ICT302",
    name: "Social and Professional Issues",
    type: "Major Core",
    credit: 3,
    description: "Professional responsibility, social impact, ethics, and workplace issues in technology practice.",
  },
  {
    code: "ICT304",
    name: "Information Assurance and Security",
    type: "Major Core",
    credit: 3,
    description: "Risk management, system protection, secure operations, and information assurance principles.",
  },
  {
    code: "ICT212",
    name: "Data Structure and Algorithm",
    type: "Major Core",
    credit: 3,
    description: "Algorithms, common data structures, performance thinking, and implementation for software problems.",
  },
  {
    code: "ICT338",
    name: "Intelligent Systems",
    type: "Major Electives",
    credit: 3,
    description: "Concepts and applications of intelligent systems, reasoning, and practical AI-oriented techniques.",
  },
  {
    code: "ILE125",
    name: "English for Global Exploration",
    type: "General Educations",
    credit: 3,
    description: "English communication for global contexts, exploration of international topics, and cross-cultural understanding.",
  },
];

const instructorCatalog = [
  {
    email: "instructor@rsu.ac.th",
    name: "Assoc. Prof. Niran Boonchai",
    department: "Computer Science",
    bio: "Teaches software engineering and systems design with a focus on practical teamwork.",
    personalitySummary: "Calm, structured, and supportive teaching style.",
  },
  {
    email: "lada@rsu.ac.th",
    name: "Dr. Lada Srisuk",
    department: "Computer Science",
    bio: "Specializes in data platforms, analytics, and machine learning for business applications.",
    personalitySummary: "Data-driven, energetic, and highly interactive in class.",
  },
  {
    email: "phoom@rsu.ac.th",
    name: "Dr. Phoom Rattanasak",
    department: "Computer Science",
    bio: "Focuses on cloud systems, backend engineering, and secure service architecture.",
    personalitySummary: "Practical, demanding, and clear about industry expectations.",
  },
  {
    email: "mali@rsu.ac.th",
    name: "Asst. Prof. Mali Tangsiri",
    department: "General Education",
    bio: "Leads communication and interdisciplinary learning courses with strong student mentoring.",
    personalitySummary: "Warm, discussion-based, and encouraging for quieter students.",
  },
];

const completedCourses = [
  { code: "CSC101", grade: "A", credit_earned: 3, semester_no: 1, semester_year: 2566 },
  { code: "CSC120", grade: "B+", credit_earned: 3, semester_no: 1, semester_year: 2566 },
  { code: "GEN101", grade: "A", credit_earned: 2, semester_no: 1, semester_year: 2566 },
  { code: "ENG102", grade: "B", credit_earned: 2, semester_no: 2, semester_year: 2566 },
  { code: "ART201", grade: "A", credit_earned: 3, semester_no: 2, semester_year: 2566 },
  { code: "CSC250", grade: "A", credit_earned: 3, semester_no: 1, semester_year: 2567 },
  { code: "CSC362", grade: "A", credit_earned: 3, semester_no: 1, semester_year: 2567 },
];

const offeredSemesterCourses = [
  {
    code: "CSC210",
    section: "141",
    room: "7-402",
    day_of_week: DayOfWeek.MONDAY,
    start_time: "09:00",
    end_time: "11:50",
  },
  {
    code: "CSC210",
    section: "241",
    room: "7-404",
    day_of_week: DayOfWeek.THURSDAY,
    start_time: "13:00",
    end_time: "15:50",
  },
  {
    code: "CSC214",
    section: "141",
    room: "4-211",
    day_of_week: DayOfWeek.TUESDAY,
    start_time: "09:00",
    end_time: "11:50",
  },
  {
    code: "CSC218",
    section: "141",
    room: "4-308",
    day_of_week: DayOfWeek.WEDNESDAY,
    start_time: "13:00",
    end_time: "15:50",
  },
  {
    code: "CSC280",
    section: "141",
    room: "5-118",
    day_of_week: DayOfWeek.FRIDAY,
    start_time: "09:00",
    end_time: "11:50",
  },
  {
    code: "CSC330",
    section: "141",
    room: "8-202",
    day_of_week: DayOfWeek.WEDNESDAY,
    start_time: "09:00",
    end_time: "11:50",
  },
  {
    code: "CSC340",
    section: "141",
    room: "5-332B",
    day_of_week: DayOfWeek.THURSDAY,
    start_time: "09:00",
    end_time: "11:50",
  },
  {
    code: "CSC451",
    section: "141",
    room: "9-505",
    day_of_week: DayOfWeek.WEDNESDAY,
    start_time: "13:00",
    end_time: "15:50",
  },
  {
    code: "CSC478",
    section: "143",
    room: "9-402",
    day_of_week: DayOfWeek.FRIDAY,
    start_time: "13:00",
    end_time: "15:50",
  },
  {
    code: "BUS105",
    section: "121",
    room: "2-305",
    day_of_week: DayOfWeek.MONDAY,
    start_time: "13:00",
    end_time: "15:50",
  },
  {
    code: "GEN101",
    section: "132",
    room: "1-105",
    day_of_week: DayOfWeek.TUESDAY,
    start_time: "13:00",
    end_time: "14:50",
  },
  {
    code: "ART201",
    section: "122",
    room: "2-210",
    day_of_week: DayOfWeek.FRIDAY,
    start_time: "13:00",
    end_time: "15:50",
  },
  {
    code: "CSC463",
    section: "142",
    room: "5-220A",
    day_of_week: DayOfWeek.TUESDAY,
    start_time: "13:00",
    end_time: "15:50",
  },
  {
    code: "CSC475",
    section: "141",
    room: "5-332B",
    day_of_week: DayOfWeek.THURSDAY,
    start_time: "13:00",
    end_time: "15:50",
  },
  {
    code: "CSC472",
    section: "141",
    room: "11-402",
    day_of_week: DayOfWeek.FRIDAY,
    start_time: "13:00",
    end_time: "15:50",
  },
  {
    code: "CSC362",
    section: "241",
    room: "3-218A",
    day_of_week: DayOfWeek.THURSDAY,
    start_time: "13:00",
    end_time: "15:50",
  },
  {
    code: "CSC478",
    section: "243",
    room: "9-404",
    day_of_week: DayOfWeek.SATURDAY,
    start_time: "13:00",
    end_time: "15:50",
  },
  {
    code: "CSC485",
    section: "141",
    room: "6-A404",
    day_of_week: DayOfWeek.SATURDAY,
    start_time: "09:00",
    end_time: "11:50",
  },
  {
    code: "CSC487",
    section: "141",
    room: "11-701",
    day_of_week: DayOfWeek.SATURDAY,
    start_time: "13:00",
    end_time: "15:50",
  },
];

const sectionInstructorAssignments = {
  "CSC210:141": ["instructor@rsu.ac.th"],
  "CSC210:241": ["phoom@rsu.ac.th"],
  "CSC214:141": ["phoom@rsu.ac.th"],
  "CSC218:141": ["lada@rsu.ac.th"],
  "CSC280:141": ["instructor@rsu.ac.th"],
  "CSC330:141": ["phoom@rsu.ac.th"],
  "CSC340:141": ["lada@rsu.ac.th"],
  "CSC362:142": ["lada@rsu.ac.th"],
  "CSC362:241": ["phoom@rsu.ac.th"],
  "CSC475:141": ["lada@rsu.ac.th"],
  "CSC478:143": ["lada@rsu.ac.th"],
  "CSC478:243": ["phoom@rsu.ac.th"],
  "CSC451:141": ["phoom@rsu.ac.th"],
  "CSC463:142": ["instructor@rsu.ac.th"],
  "CSC472:141": ["phoom@rsu.ac.th"],
  "CSC485:141": ["instructor@rsu.ac.th"],
  "CSC487:141": ["mali@rsu.ac.th"],
  "BUS105:121": ["mali@rsu.ac.th"],
  "GEN101:132": ["mali@rsu.ac.th"],
  "ART201:122": ["mali@rsu.ac.th"],
};

async function main() {
  const passwordHash = await bcrypt.hash("password", 10);

  const major = await prisma.majors.upsert({
    where: { code: "CS" },
    update: { name: "Computer Science" },
    create: {
      code: "CS",
      name: "Computer Science",
    },
  });

  const studentUser = await prisma.users.upsert({
    where: { email: "student@rsu.ac.th" },
    update: {
      password_hash: passwordHash,
      role: UserRole.STUDENT,
    },
    create: {
      email: "student@rsu.ac.th",
      password_hash: passwordHash,
      role: UserRole.STUDENT,
    },
  });

  await prisma.students.upsert({
    where: { user_id: studentUser.id },
    update: {
      rsu_id: "6500001",
      name: "Demo Student",
      major_id: major.id,
    },
    create: {
      user_id: studentUser.id,
      rsu_id: "6500001",
      name: "Demo Student",
      major_id: major.id,
    },
  });

  const student = await prisma.students.findUniqueOrThrow({
    where: { user_id: studentUser.id },
  });

  const instructorsByEmail = {};

  for (const instructor of instructorCatalog) {
    const instructorUser = await prisma.users.upsert({
      where: { email: instructor.email },
      update: {
        password_hash: passwordHash,
        role: UserRole.INSTRUCTOR,
      },
      create: {
        email: instructor.email,
        password_hash: passwordHash,
        role: UserRole.INSTRUCTOR,
      },
    });

    const instructorRecord = await prisma.instructors.upsert({
      where: { user_id: instructorUser.id },
      update: {
        name: instructor.name,
        department: instructor.department,
        bio: instructor.bio,
        personality_summary: instructor.personalitySummary,
      },
      create: {
        user_id: instructorUser.id,
        name: instructor.name,
        department: instructor.department,
        bio: instructor.bio,
        personality_summary: instructor.personalitySummary,
      },
    });

    instructorsByEmail[instructor.email] = instructorRecord;
  }

  // ── Admin user ────────────────────────────────────────────────────────────
  await prisma.users.upsert({
    where: { email: "admin@rsu.ac.th" },
    update: {
      password_hash: passwordHash,
      role: UserRole.ADMIN,
    },
    create: {
      email: "admin@rsu.ac.th",
      password_hash: passwordHash,
      role: UserRole.ADMIN,
    },
  });

  const subjectsByCode = {};

  for (const subject of subjectCatalog) {
    const upsertedSubject = await prisma.subjects.upsert({
      where: { code: subject.code },
        update: {
          name: subject.name,
          type: subject.type,
          credit: subject.credit,
          description: subject.description,
        },
        create: {
          code: subject.code,
          name: subject.name,
          type: subject.type,
          credit: subject.credit,
          description: subject.description,
        },
      });

    subjectsByCode[subject.code] = upsertedSubject;

    await prisma.major_subjects.upsert({
      where: {
        major_id_subject_id: {
          major_id: major.id,
          subject_id: upsertedSubject.id,
        },
      },
      update: {},
      create: {
        major_id: major.id,
        subject_id: upsertedSubject.id,
      },
    });
  }

  for (const subject of subjectCatalog) {
    await prisma.subjects.update({
      where: { id: subjectsByCode[subject.code].id },
      data: {
        prerequisite_id: subject.prerequisiteCode ? subjectsByCode[subject.prerequisiteCode].id : null,
      },
    });
  }

  await prisma.student_course_histories.deleteMany({
    where: { student_id: student.id },
  });

  for (const course of completedCourses) {
    await prisma.student_course_histories.create({
      data: {
        student_id: student.id,
        subject_id: subjectsByCode[course.code].id,
        grade: course.grade,
        credit_earned: course.credit_earned,
        semester_no: course.semester_no,
        semester_year: course.semester_year,
        source: "TRANSCRIPT",
      },
    });
  }

  await prisma.student_recommendation_subjects.deleteMany({});
  await prisma.student_recommendations.deleteMany({ where: { student_id: student.id } });
  await prisma.recommendation_messages.deleteMany({});
  await prisma.recommendation_conversations.deleteMany({ where: { student_id: student.id } });

  const semesterSchedule = await prisma.semester_schedules.upsert({
    where: {
      semester_no_semester_year_major_id: {
        semester_no: 1,
        semester_year: 2568,
        major_id: major.id,
      },
    },
    update: {
      registration_date: new Date("2025-12-15T09:00:00.000Z"),
    },
    create: {
      semester_no: 1,
      semester_year: 2568,
      major_id: major.id,
      registration_date: new Date("2025-12-15T09:00:00.000Z"),
    },
  });

  await prisma.student_current_enrollments.deleteMany({
    where: { student_id: student.id },
  });

  const existingSemesterSubjects = await prisma.semester_subjects.findMany({
    where: { semester_schedule_id: semesterSchedule.id },
    select: { id: true },
  });
  const existingSemesterSubjectIds = existingSemesterSubjects.map((item) => item.id);

  if (existingSemesterSubjectIds.length > 0) {
    await prisma.semester_subjects.deleteMany({
      where: { id: { in: existingSemesterSubjectIds } },
    });
  }

  const sectionIdsByCode = {};

  for (const course of offeredSemesterCourses) {
    const semesterSubject = await prisma.semester_subjects.upsert({
      where: {
        semester_schedule_id_subject_id: {
          semester_schedule_id: semesterSchedule.id,
          subject_id: subjectsByCode[course.code].id,
        },
      },
      update: {},
      create: {
        semester_schedule_id: semesterSchedule.id,
        subject_id: subjectsByCode[course.code].id,
      },
    });
    const section = await prisma.semester_sections.upsert({
      where: {
        semester_subject_id_code: {
          semester_subject_id: semesterSubject.id,
          code: course.section,
        },
      },
      update: {},
      create: {
        semester_subject_id: semesterSubject.id,
        code: course.section,
      },
    });

    await prisma.semester_section_meetings.deleteMany({
      where: { semester_section_id: section.id },
    });

    await prisma.semester_section_meetings.create({
      data: {
        semester_section_id: section.id,
        day_of_week: course.day_of_week,
        start_time: course.start_time,
        end_time: course.end_time,
        room: course.room,
      },
    });

    sectionIdsByCode[`${course.code}:${course.section}`] = section.id;

    await prisma.semester_section_instructors.deleteMany({
      where: { semester_section_id: section.id },
    });

    for (const instructorEmail of sectionInstructorAssignments[`${course.code}:${course.section}`] ?? []) {
      await prisma.semester_section_instructors.create({
        data: {
          semester_section_id: section.id,
          instructor_id: instructorsByEmail[instructorEmail].id,
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log("Student login:    student@rsu.ac.th / password");
  console.log("Instructor login: instructor@rsu.ac.th / password");
  console.log("Admin login:      admin@rsu.ac.th / password");
}

main()
  .catch((error) => {
    console.error("Seed failed.");
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
