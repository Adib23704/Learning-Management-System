"use client";

import { ArrowRight, BookOpen, GraduationCap, Play, Users } from "lucide-react";
import Link from "next/link";
import { Container } from "@/components/layout/container";
import { CourseCard } from "@/components/shared/course-card";
import { CourseCardSkeleton } from "@/components/shared/course-card-skeleton";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/lib/constants/routes";
import { useGetCategoriesQuery } from "@/store/api/categories.api";
import { useGetCoursesQuery } from "@/store/api/courses.api";

export default function LandingPage() {
  const { data: coursesData, isLoading: coursesLoading } = useGetCoursesQuery({
    limit: 4,
    status: "PUBLISHED",
  });
  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });

  const courses = coursesData?.data ?? [];
  const categories = categoriesData?.data ?? [];

  return (
    <>
      <section className="relative overflow-hidden bg-neutral-950 py-24 sm:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--color-accent-950)_0%,transparent_50%)]" />
        <Container>
          <div className="relative mx-auto max-w-3xl text-center">
            <p className="mb-4 text-sm font-medium tracking-wider text-accent-400 uppercase">
              Start Learning Today
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Advance your career with{" "}
              <span className="text-accent-400">expert-led</span> courses
            </h1>
            <p className="mt-6 text-lg text-neutral-300 leading-relaxed">
              Join thousands of learners mastering new skills in web
              development, data science, design, and more. Learn at your own
              pace from industry professionals.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="min-w-45">
                <Link href={ROUTES.COURSES}>
                  Browse Courses
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="min-w-45 border-neutral-700 bg-transparent text-neutral-200 hover:bg-neutral-800 hover:text-white"
              >
                <Link href={ROUTES.REGISTER}>Create Account</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-neutral-200 bg-white py-8">
        <Container>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {[
              { icon: BookOpen, label: "Courses Available", value: "50+" },
              { icon: Users, label: "Active Students", value: "1,200+" },
              { icon: GraduationCap, label: "Completion Rate", value: "89%" },
              { icon: Play, label: "Video Lessons", value: "500+" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <stat.icon className="mx-auto h-6 w-6 text-accent-600" />
                <p className="mt-2 text-2xl font-bold text-neutral-900">
                  {stat.value}
                </p>
                <p className="text-sm text-neutral-500">{stat.label}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {categories.length > 0 && (
        <section className="py-16 sm:py-20">
          <Container>
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                Explore by Category
              </h2>
              <p className="mt-2 text-neutral-500">
                Find courses in the area that interests you most
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
              {categories.slice(0, 5).map((category) => (
                <Link
                  key={category.id}
                  href={`${ROUTES.COURSES}?category=${category.id}`}
                  className="group flex flex-col items-center rounded-lg border border-neutral-200 bg-white p-6 transition hover:border-accent-300 hover:shadow-md"
                >
                  <BookOpen className="h-8 w-8 text-neutral-400 transition group-hover:text-accent-600" />
                  <span className="mt-3 text-sm font-medium text-neutral-700 group-hover:text-accent-700">
                    {category.name}
                  </span>
                  {category._count && (
                    <span className="mt-1 text-xs text-neutral-400">
                      {category._count.courses} courses
                    </span>
                  )}
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}

      <section className="bg-neutral-100 py-16 sm:py-20">
        <Container>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-bold text-neutral-900 sm:text-3xl">
                Featured Courses
              </h2>
              <p className="mt-2 text-neutral-500">
                Handpicked courses to get you started
              </p>
            </div>
            <Button asChild variant="ghost" className="hidden sm:flex">
              <Link href={ROUTES.COURSES}>
                View all
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {coursesLoading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <CourseCardSkeleton key={i} />
                ))
              : courses.map((course) => (
                  <CourseCard key={course.id} course={course} showInstructor />
                ))}
          </div>
          <div className="mt-8 text-center sm:hidden">
            <Button asChild variant="outline">
              <Link href={ROUTES.COURSES}>View All Courses</Link>
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container>
          <div className="rounded-2xl bg-accent-950 px-8 py-14 text-center sm:px-16">
            <h2 className="text-2xl font-bold text-white sm:text-3xl">
              Ready to start learning?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-accent-200">
              Create your free account and get access to thousands of lessons.
              Whether you want to learn or teach, we have got you covered.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button
                asChild
                size="lg"
                className="bg-white text-accent-900 hover:bg-neutral-100"
              >
                <Link href={ROUTES.REGISTER}>Get Started Free</Link>
              </Button>
              <Button
                asChild
                variant="link"
                className="text-accent-200 hover:text-white"
              >
                <Link href={ROUTES.COURSES}>Explore Courses</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
