"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FolderOpen, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { FormField } from "@/components/forms/form-field";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { type Column, DataTable } from "@/components/shared/data-table";
import { PageHeader } from "@/components/shared/page-header";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/utils/format";
import {
  type CategoryInput,
  categorySchema,
} from "@/lib/validators/course.schema";
import {
  useCreateCategoryMutation,
  useDeleteCategoryMutation,
  useGetCategoriesQuery,
  useUpdateCategoryMutation,
} from "@/store/api/categories.api";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    open: boolean;
    categoryId: string;
    categoryName: string;
  }>({ open: false, categoryId: "", categoryName: "" });

  const { data: categoriesData, isLoading } = useGetCategoriesQuery();
  const [createCategory, { isLoading: isCreating }] =
    useCreateCategoryMutation();
  const [updateCategory, { isLoading: isUpdating }] =
    useUpdateCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] =
    useDeleteCategoryMutation();

  const categories = categoriesData?.data ?? [];

  const form = useForm<CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues: { name: "", description: "" },
  });

  const openCreateDialog = () => {
    setEditingCategory(null);
    form.reset({ name: "", description: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    form.reset({
      name: category.name,
      description: category.description ?? "",
    });
    setDialogOpen(true);
  };

  const handleSubmit = async (values: CategoryInput) => {
    try {
      if (editingCategory) {
        await updateCategory({
          id: editingCategory.id,
          ...values,
        }).unwrap();
        toast.success("Category updated successfully");
      } else {
        await createCategory(values).unwrap();
        toast.success("Category created successfully");
      }
      setDialogOpen(false);
      form.reset();
    } catch {
      toast.error(
        editingCategory
          ? "Failed to update category"
          : "Failed to create category",
      );
    }
  };

  const handleDelete = async () => {
    try {
      await deleteCategory(deleteConfirm.categoryId).unwrap();
      toast.success("Category deleted successfully");
      setDeleteConfirm((prev) => ({ ...prev, open: false }));
    } catch {
      toast.error("Failed to delete category");
    }
  };

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "name",
      header: "Name",
      render: (item) => {
        const c = item as unknown as Category;
        return (
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded bg-accent-50">
              <FolderOpen className="h-4 w-4 text-accent-600" />
            </div>
            <span className="font-medium text-neutral-800">{c.name}</span>
          </div>
        );
      },
    },
    {
      key: "slug",
      header: "Slug",
      render: (item) => {
        const c = item as unknown as Category;
        return (
          <span className="font-mono text-xs text-neutral-500">{c.slug}</span>
        );
      },
    },
    {
      key: "courseCount",
      header: "Courses",
      render: (item) => {
        const c = item as unknown as Category;
        return (
          <span className="text-neutral-600">{c._count?.courses ?? 0}</span>
        );
      },
    },
    {
      key: "createdAt",
      header: "Created",
      render: (item) => {
        const c = item as unknown as Category;
        return (
          <span className="text-neutral-500">{formatDate(c.createdAt)}</span>
        );
      },
    },
    {
      key: "actions",
      header: "Actions",
      className: "text-right",
      render: (item) => {
        const c = item as unknown as Category;
        return (
          <div className="flex items-center justify-end gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                openEditDialog(c);
              }}
            >
              <Pencil className="h-4 w-4 text-neutral-500" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirm({
                  open: true,
                  categoryId: c.id,
                  categoryName: c.name,
                });
              }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Categories"
        description="Organize courses into categories"
        actions={
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        }
      />

      <DataTable
        columns={columns}
        data={categories as unknown as Record<string, unknown>[]}
        isLoading={isLoading}
        emptyMessage="No categories yet. Create your first category."
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingCategory ? "Edit Category" : "Add Category"}
            </DialogTitle>
          </DialogHeader>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              label="Name"
              required
              error={form.formState.errors.name?.message}
            >
              <Input
                {...form.register("name")}
                placeholder="e.g. Web Development"
                error={!!form.formState.errors.name}
              />
            </FormField>
            <FormField
              label="Description"
              error={form.formState.errors.description?.message}
            >
              <Textarea
                {...form.register("description")}
                placeholder="A brief description of this category"
                error={!!form.formState.errors.description}
                rows={3}
              />
            </FormField>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" isLoading={isCreating || isUpdating}>
                {editingCategory ? "Save Changes" : "Create Category"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm((prev) => ({ ...prev, open }))}
        title="Delete Category"
        description={`Are you sure you want to delete "${deleteConfirm.categoryName}"? This action cannot be undone. Courses in this category will become uncategorized.`}
        confirmText="Delete"
        variant="danger"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
