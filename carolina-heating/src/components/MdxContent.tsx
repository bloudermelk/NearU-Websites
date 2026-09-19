import { MDXRemote } from "next-mdx-remote/rsc";

export function MdxContent({ source }: { source: string }) {
  return (
    <div className="prose prose-neutral max-w-none prose-headings:font-heading prose-headings:text-brand-secondary prose-a:text-brand-primary">
      <MDXRemote source={source} />
    </div>
  );
}
