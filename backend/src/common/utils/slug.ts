import crypto from "node:crypto";
import slugify from "slugify";

export function generateSlug(title: string): string {
  const base = slugify(title, { lower: true, strict: true, trim: true });
  const suffix = crypto.randomBytes(3).toString("hex");
  return `${base}-${suffix}`;
}
