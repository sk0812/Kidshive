import Image from "next/image";
import Link from "next/link";

const blogPosts = [
  {
    title: "Supporting Your Child's Early Development",
    excerpt:
      "Learn about key milestones in early childhood development and how to nurture your child's growth through engaging activities.",
    image: "https://images.pexels.com/photos/296301/pexels-photo-296301.jpeg",
    date: "March 15, 2024",
    readTime: "5 min read",
    category: "Child Development",
  },
  {
    title: "The Importance of Play-Based Learning",
    excerpt:
      "Discover how play-based learning helps children develop critical thinking skills and creativity in their early years.",
    image: "https://images.pexels.com/photos/8612921/pexels-photo-8612921.jpeg",
    date: "March 12, 2024",
    readTime: "4 min read",
    category: "Education",
  },
  {
    title: "Creating a Safe Learning Environment",
    excerpt:
      "Tips and guidelines for parents and educators to ensure a safe and nurturing space for children to learn and grow.",
    image: "https://images.pexels.com/photos/8613089/pexels-photo-8613089.jpeg",
    date: "March 10, 2024",
    readTime: "6 min read",
    category: "Safety",
  },
];

export default function BlogPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[60vh] min-h-[400px] flex items-center">
        <Image
          src="https://images.pexels.com/photos/296301/pexels-photo-296301.jpeg"
          alt="Blog hero"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative container mx-auto px-4">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Insights & Updates
            </h1>
            <p className="text-lg text-white/90">
              Stay informed with the latest news, tips, and stories about early
              childhood education and development.
            </p>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.map((post, index) => (
              <article
                key={index}
                className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
              >
                <Link
                  href={`/blog/${post.title
                    .toLowerCase()
                    .replace(/\s+/g, "-")}`}
                >
                  <div className="relative h-48">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                      <span>{post.date}</span>
                      <span>•</span>
                      <span>{post.readTime}</span>
                    </div>
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary mb-3">
                      {post.category}
                    </span>
                    <h2 className="text-xl font-semibold mb-2 hover:text-primary transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-muted-foreground">{post.excerpt}</p>
                  </div>
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
