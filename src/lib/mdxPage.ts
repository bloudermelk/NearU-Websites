import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";

const PAGES_DIR = path.join(process.cwd(), "content", "pages");

export type MdxPageFrontmatter = {
  title: string;
  metaTitle?: string;
  metaDescription?: string;
  heroImage?: string;
  [key: string]: unknown;
};

export function getMdxPage(slug: string): { frontmatter: MdxPageFrontmatter; content: string } | null {
  const filePath = path.join(PAGES_DIR, `${slug}.mdx`);
  if (!fs.existsSync(filePath)) {
    return null;
  }
  const raw = fs.readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw);
  return { frontmatter: data as MdxPageFrontmatter, content };
}
