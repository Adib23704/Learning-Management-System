"use client";

import { BookOpen, Search, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useState } from "react";
import { Container } from "@/components/layout/container";
import { CourseCard } from "@/components/shared/course-card";
import { CourseCardSkeleton } from "@/components/shared/course-card-skeleton";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { useGetCategoriesQuery } from "@/store/api/categories.api";
import { useGetCoursesQuery } from "@/store/api/courses.api";
import type { CourseFilters } from "@/types";

export default function CatalogPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [priceFilter, setPriceFilter] = useState<string>("");
  const [showFilters, setShowFilters] = useState(false);

  const debouncedSearch = useDebounce(search, 400);

  const filters: CourseFilters = {
    status: "PUBLISHED",
    limit: 12,
    ...(debouncedSearch && { search: debouncedSearch }),
    ...(selectedCategory && { categoryId: selectedCategory }),
    ...(priceFilter === "free" && { isFree: true }),
    ...(priceFilter === "paid" && { isFree: false }),
  };

  const { data, isLoading, isFetching } = useGetCoursesQuery(filters);
  const { data: categoriesData } = useGetCategoriesQuery({ limit: 100 });

  const courses = data?.data ?? [];
  const categories = categoriesData?.data ?? [];

  const hasActiveFilters = selectedCategory || priceFilter;

  const clearFilters = useCallback(() => {
    setSelectedCategory("");
    setPriceFilter("");
    setSearch("");
  }, []);

  return (
    <section className="py-10 sm:py-14">
      <Container>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">
            Course Catalog
          </h1>
          <p className="mt-2 text-neutral-500">
            Discover courses taught by experienced professionals
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
              <Input
                placeholder="Search courses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button
              variant={showFilters ? "secondary" : "outline"}
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>

          {showFilters && (
            <div className="flex flex-wrap items-center gap-3 rounded-lg border border-neutral-200 bg-white p-4">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedCategory("")}
                  className={`rounded-full px-3 py-1.5 text-sm transition ${
                    !selectedCategory
                      ? "bg-accent-600 text-white"
                      : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  }`}
                >
                  All Categories
                </button>
                {categories.map((cat) => (
                  <button
                    type="button"
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      selectedCategory === cat.id
                        ? "bg-accent-600 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>

              <div className="h-6 w-px bg-neutral-200" />

              <div className="flex gap-2">
                {[
                  { key: "", label: "All Prices" },
                  { key: "free", label: "Free" },
                  { key: "paid", label: "Paid" },
                ].map((opt) => (
                  <button
                    type="button"
                    key={opt.key}
                    onClick={() => setPriceFilter(opt.key)}
                    className={`rounded-full px-3 py-1.5 text-sm transition ${
                      priceFilter === opt.key
                        ? "bg-accent-600 text-white"
                        : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {hasActiveFilters && (
                <>
                  <div className="h-6 w-px bg-neutral-200" />
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-sm text-neutral-500 hover:text-neutral-700"
                  >
                    <X className="h-3.5 w-3.5" />
                    Clear all
                  </button>
                </>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <CourseCardSkeleton key={i} />
            ))}
          </div>
        ) : courses.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="No courses found"
            description={
              hasActiveFilters || debouncedSearch
                ? "Try adjusting your filters or search term"
                : "Courses will appear here once instructors publish them"
            }
            action={
              hasActiveFilters || debouncedSearch ? (
                <Button variant="outline" onClick={clearFilters}>
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        ) : (
          <>
            <p className="mb-4 text-sm text-neutral-500">
              {isFetching
                ? "Searching..."
                : `Showing ${courses.length} course${courses.length !== 1 ? "s" : ""}`}
            </p>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {courses.map((course) => (
                <CourseCard key={course.id} course={course} showInstructor />
              ))}
            </div>
          </>
        )}
      </Container>
    </section>
  );
}
