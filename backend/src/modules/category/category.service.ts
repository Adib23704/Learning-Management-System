import { BadRequestError, NotFoundError } from "../../common/errors/index.js";
import { generateSlug } from "../../common/utils/slug.js";
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
} from "./category.dto.js";
import { categoryRepository } from "./category.repository.js";

export const categoryService = {
  async list() {
    return categoryRepository.findAll();
  },

  async getById(id: string) {
    const cat = await categoryRepository.findById(id);
    if (!cat) throw new NotFoundError("Category");
    return cat;
  },

  async create(input: CreateCategoryInput) {
    const slug = generateSlug(input.name);
    return categoryRepository.create({ ...input, slug });
  },

  async update(id: string, input: UpdateCategoryInput) {
    const cat = await categoryRepository.findById(id);
    if (!cat) throw new NotFoundError("Category");

    const data: Record<string, unknown> = { ...input };
    if (input.name) {
      data.slug = generateSlug(input.name);
    }
    return categoryRepository.update(
      id,
      data as { name?: string; slug?: string; description?: string | null },
    );
  },

  async delete(id: string) {
    const cat = await categoryRepository.findById(id);
    if (!cat) throw new NotFoundError("Category");

    const courseCount = await categoryRepository.countCourses(id);
    if (courseCount > 0) {
      throw new BadRequestError("Cannot delete category with existing courses");
    }

    return categoryRepository.delete(id);
  },
};
