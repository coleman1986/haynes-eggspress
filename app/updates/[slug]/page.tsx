// app/updates/[slug]/page.tsx
import { prisma } from "@/lib/prisma";
import { marked } from "marked";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// 👇 Your Next type setup expects params as a Promise
export default async function UpdatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await prisma.update.findUnique({ where: { slug } });
  if (!post || !post.published) {
    return <main className="card">Update not found.</main>;
  }

  // marked.parse can be async; await to get a string
  const html = await marked.parse(post.contentMarkdown || "");

  return (
    <main className="space-y-6">
      <article className="card">
        <h1 className="text-2xl font-bold">{post.title}</h1>
        <p className="text-sm text-gray-500 mt-1">
          {new Date(post.createdAt).toLocaleString()}
        </p>
        {post.coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.coverUrl} alt="" className="w-full rounded mt-4" />
        ) : null}
        <div
          className="prose prose-sm max-w-none mt-4"
          dangerouslySetInnerHTML={{ __html: html as string }}
        />
      </article>
      <div>
        <a href="/updates" className="text-sm text-emerald-700 underline">
          ← Back to updates
        </a>
      </div>
    </main>
  );
}
