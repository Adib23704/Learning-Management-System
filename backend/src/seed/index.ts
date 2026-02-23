import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import { config } from "../config";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: config.DATABASE_URL }),
});

const SALT_ROUNDS = 12;

async function main() {
  console.log("Seeding database...");

  // Clean existing data
  await prisma.lessonProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.lesson.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.course.deleteMany();
  await prisma.category.deleteMany();
  await prisma.user.deleteMany();

  // Create users
  const hashedPw = await bcrypt.hash("password123", SALT_ROUNDS);

  await prisma.user.create({
    data: {
      email: "superadmin@lms.dev",
      password: hashedPw,
      firstName: "Super",
      lastName: "Admin",
      role: "SUPER_ADMIN",
    },
  });

  await prisma.user.create({
    data: {
      email: "admin@lms.dev",
      password: hashedPw,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
    },
  });

  const instructor1 = await prisma.user.create({
    data: {
      email: "john.instructor@lms.dev",
      password: hashedPw,
      firstName: "John",
      lastName: "Mitchell",
      role: "INSTRUCTOR",
    },
  });

  const instructor2 = await prisma.user.create({
    data: {
      email: "sarah.instructor@lms.dev",
      password: hashedPw,
      firstName: "Sarah",
      lastName: "Chen",
      role: "INSTRUCTOR",
    },
  });

  const students = await Promise.all(
    [
      { email: "alice@example.com", firstName: "Alice", lastName: "Johnson" },
      { email: "bob@example.com", firstName: "Bob", lastName: "Williams" },
      { email: "carol@example.com", firstName: "Carol", lastName: "Davis" },
      { email: "david@example.com", firstName: "David", lastName: "Martinez" },
      { email: "emma@example.com", firstName: "Emma", lastName: "Brown" },
    ].map((s) =>
      prisma.user.create({
        data: { ...s, password: hashedPw, role: "STUDENT" },
      }),
    ),
  );

  // Create categories
  const categories = await Promise.all(
    [
      {
        name: "Web Development",
        slug: "web-development",
        description: "Frontend, backend, and full-stack web technologies",
      },
      {
        name: "Mobile Development",
        slug: "mobile-development",
        description: "iOS, Android, and cross-platform mobile apps",
      },
      {
        name: "Data Science",
        slug: "data-science",
        description: "Data analysis, machine learning, and AI",
      },
      {
        name: "Design",
        slug: "design",
        description: "UI/UX, graphic design, and product design",
      },
      {
        name: "DevOps",
        slug: "devops",
        description: "CI/CD, cloud infrastructure, and deployment",
      },
    ].map((c) => prisma.category.create({ data: c })),
  );

  // Create courses with lessons
  const coursesData = [
    {
      title: "React Fundamentals",
      slug: "react-fundamentals",
      description:
        "Master the core concepts of React including components, state, props, hooks, and modern patterns. Build real projects from scratch.",
      price: 49.99,
      isFree: false,
      status: "PUBLISHED" as const,
      instructorId: instructor1.id,
      categoryId: categories[0].id,
      lessons: [
        {
          title: "Introduction to React",
          content:
            "React is a JavaScript library for building user interfaces...",
          order: 1,
          isPreview: true,
        },
        {
          title: "JSX and Components",
          content:
            "JSX is a syntax extension that lets you write HTML-like markup inside JavaScript...",
          order: 2,
          isPreview: true,
        },
        {
          title: "Props and State",
          content: "Props let you pass data from parent to child components...",
          order: 3,
          isPreview: false,
        },
        {
          title: "Hooks Deep Dive",
          content:
            "Hooks let you use state and lifecycle features in function components...",
          order: 4,
          isPreview: false,
        },
        {
          title: "Building a Project",
          content: "Let's put it all together and build a real application...",
          order: 5,
          isPreview: false,
        },
      ],
    },
    {
      title: "Node.js Backend Development",
      slug: "nodejs-backend",
      description:
        "Learn to build scalable backend applications with Node.js, Express, and PostgreSQL. Covers REST APIs, authentication, and deployment.",
      price: 59.99,
      isFree: false,
      status: "PUBLISHED" as const,
      instructorId: instructor1.id,
      categoryId: categories[0].id,
      lessons: [
        {
          title: "Setting Up Node.js",
          content:
            "Node.js is a JavaScript runtime built on Chrome's V8 engine...",
          order: 1,
          isPreview: true,
        },
        {
          title: "Express.js Basics",
          content:
            "Express is a minimal and flexible Node.js web application framework...",
          order: 2,
          isPreview: false,
        },
        {
          title: "Database Integration",
          content:
            "Let's connect our Express app to PostgreSQL using Prisma...",
          order: 3,
          isPreview: false,
        },
        {
          title: "Authentication & JWT",
          content:
            "JSON Web Tokens provide a compact way to securely transmit information...",
          order: 4,
          isPreview: false,
        },
      ],
    },
    {
      title: "TypeScript for Beginners",
      slug: "typescript-beginners",
      description:
        "A comprehensive introduction to TypeScript. Learn type annotations, interfaces, generics, and how to integrate TypeScript with existing projects.",
      price: 0,
      isFree: true,
      status: "PUBLISHED" as const,
      instructorId: instructor1.id,
      categoryId: categories[0].id,
      lessons: [
        {
          title: "Why TypeScript?",
          content: "TypeScript adds static type definitions to JavaScript...",
          order: 1,
          isPreview: true,
        },
        {
          title: "Basic Types",
          content: "TypeScript supports the same basic types as JavaScript...",
          order: 2,
          isPreview: true,
        },
        {
          title: "Interfaces and Types",
          content: "Interfaces provide a way to define the shape of objects...",
          order: 3,
          isPreview: false,
        },
      ],
    },
    {
      title: "UI/UX Design Principles",
      slug: "uiux-design-principles",
      description:
        "Learn the fundamental principles of user interface and user experience design. Covers layout, typography, color theory, and usability testing.",
      price: 39.99,
      isFree: false,
      status: "PUBLISHED" as const,
      instructorId: instructor2.id,
      categoryId: categories[3].id,
      lessons: [
        {
          title: "Design Thinking",
          content:
            "Design thinking is a human-centered approach to innovation...",
          order: 1,
          isPreview: true,
        },
        {
          title: "Layout and Grid Systems",
          content: "Grids provide structure and consistency to your designs...",
          order: 2,
          isPreview: false,
        },
        {
          title: "Color Theory for UI",
          content:
            "Color plays a critical role in how users perceive your interface...",
          order: 3,
          isPreview: false,
        },
        {
          title: "Typography Fundamentals",
          content:
            "Good typography makes content readable and visually appealing...",
          order: 4,
          isPreview: false,
        },
      ],
    },
    {
      title: "Python Data Analysis",
      slug: "python-data-analysis",
      description:
        "Analyze and visualize data with Python using pandas, NumPy, and matplotlib. Real-world datasets and hands-on exercises included.",
      price: 44.99,
      isFree: false,
      status: "PUBLISHED" as const,
      instructorId: instructor2.id,
      categoryId: categories[2].id,
      lessons: [
        {
          title: "Python Refresher",
          content:
            "A quick refresher on Python basics before diving into data analysis...",
          order: 1,
          isPreview: true,
        },
        {
          title: "Pandas Introduction",
          content: "pandas is the primary tool for data analysis in Python...",
          order: 2,
          isPreview: false,
        },
        {
          title: "Data Visualization",
          content:
            "Visualizing data helps you identify patterns and communicate insights...",
          order: 3,
          isPreview: false,
        },
      ],
    },
    {
      title: "Docker & Kubernetes Basics",
      slug: "docker-kubernetes-basics",
      description:
        "Get started with containerization and orchestration. Learn Docker fundamentals and Kubernetes concepts for deploying modern applications.",
      price: 54.99,
      isFree: false,
      status: "PUBLISHED" as const,
      instructorId: instructor2.id,
      categoryId: categories[4].id,
      lessons: [
        {
          title: "What are Containers?",
          content:
            "Containers package an application with all its dependencies...",
          order: 1,
          isPreview: true,
        },
        {
          title: "Docker Fundamentals",
          content: "Docker is the most popular container platform...",
          order: 2,
          isPreview: false,
        },
        {
          title: "Intro to Kubernetes",
          content:
            "Kubernetes automates the deployment, scaling, and management of containers...",
          order: 3,
          isPreview: false,
        },
      ],
    },
    {
      title: "Mobile App Design",
      slug: "mobile-app-design",
      description:
        "Learn to design beautiful and functional mobile applications. Covers iOS and Android design guidelines, prototyping, and user testing.",
      price: 0,
      isFree: true,
      status: "DRAFT" as const,
      instructorId: instructor2.id,
      categoryId: categories[1].id,
      lessons: [
        {
          title: "Mobile Design Patterns",
          content:
            "Mobile design patterns are proven solutions to common UI challenges...",
          order: 1,
          isPreview: true,
        },
      ],
    },
  ];

  for (const courseData of coursesData) {
    const { lessons, ...courseFields } = courseData;
    const course = await prisma.course.create({ data: courseFields });

    for (const lesson of lessons) {
      await prisma.lesson.create({
        data: { ...lesson, courseId: course.id },
      });
    }
  }

  // Fetch published courses for enrollment
  const publishedCourses = await prisma.course.findMany({
    where: { status: "PUBLISHED" },
    include: { lessons: true },
  });

  // Create enrollments with some progress
  const enrollmentPairs = [
    { student: students[0], courseIdx: 0, progress: 80 },
    { student: students[0], courseIdx: 1, progress: 25 },
    { student: students[0], courseIdx: 2, progress: 100 },
    { student: students[1], courseIdx: 0, progress: 60 },
    { student: students[1], courseIdx: 3, progress: 50 },
    { student: students[2], courseIdx: 1, progress: 100 },
    { student: students[2], courseIdx: 4, progress: 33 },
    { student: students[3], courseIdx: 0, progress: 40 },
    { student: students[3], courseIdx: 5, progress: 0 },
    { student: students[4], courseIdx: 2, progress: 66 },
    { student: students[4], courseIdx: 3, progress: 100 },
  ];

  for (const { student, courseIdx, progress } of enrollmentPairs) {
    const course = publishedCourses[courseIdx];
    if (!course) continue;

    const isComplete = progress === 100;
    const enrollment = await prisma.enrollment.create({
      data: {
        studentId: student.id,
        courseId: course.id,
        progress,
        status: isComplete ? "COMPLETED" : "ACTIVE",
        completedAt: isComplete ? new Date() : null,
      },
    });

    // Create lesson progress
    const totalLessons = course.lessons.length;
    const completedCount = Math.round((progress / 100) * totalLessons);

    for (let i = 0; i < totalLessons; i++) {
      await prisma.lessonProgress.create({
        data: {
          enrollmentId: enrollment.id,
          lessonId: course.lessons[i].id,
          isCompleted: i < completedCount,
          completedAt: i < completedCount ? new Date() : null,
        },
      });
    }
  }

  console.log("Seed complete!");
  console.log("\nTest Credentials (all passwords: password123):");
  console.log("  Super Admin: superadmin@lms.dev");
  console.log("  Admin:       admin@lms.dev");
  console.log("  Instructor:  john.instructor@lms.dev");
  console.log("  Instructor:  sarah.instructor@lms.dev");
  console.log("  Student:     alice@example.com");
  console.log("  Student:     bob@example.com");
}

main()
  .catch((e) => {
    console.error("Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
