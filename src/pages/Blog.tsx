import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Clock, Calendar, BookOpen, ArrowRight } from "lucide-react";
import { getPublishedBlogPosts } from "@/lib/storage";
import { BlogPost } from "@/types";

export default function Blog() {
  const [posts, setPosts] = useState<BlogPost[]>([]);

  useEffect(() => {
    setPosts(getPublishedBlogPosts());
    document.title = "Blog | WordStack";
    return () => { document.title = "WordStack - A home for poets"; };
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <div className="border-b border-border">
        <div className="container mx-auto px-4 py-12 max-w-4xl text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <BookOpen className="w-6 h-6 text-primary" />
            <span className="text-sm font-medium text-primary uppercase tracking-wider">WordStack Blog</span>
          </div>
          <h1 className="font-serif text-3xl md:text-4xl font-bold mb-3 text-balance">
            Insights, Tips & Platform Updates
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Writing advice, community highlights, and everything new on WordStack.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-10 max-w-4xl">
        {posts.length === 0 ? (
          <div className="text-center py-16">
            <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="font-serif text-xl font-bold mb-2">No posts yet</h2>
            <p className="text-muted-foreground">Check back soon for articles and updates.</p>
          </div>
        ) : (
          <>
            {/* Featured / first post */}
            {posts.length > 0 && (
              <Link to={`/blog/${posts[0].slug}`} className="block mb-10 group">
                <Card className="overflow-hidden hover:shadow-lg transition-shadow">
                  {posts[0].coverImage && (
                    <div className="w-full h-56 md:h-72 overflow-hidden bg-muted">
                      <img
                        src={posts[0].coverImage}
                        alt={posts[0].title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  )}
                  <div className="p-6">
                    <div className="flex items-center gap-3 mb-3">
                      <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
                        {posts[0].category}
                      </span>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        <span>{posts[0].readTime}</span>
                      </div>
                    </div>
                    <h2 className="font-serif text-2xl md:text-3xl font-bold mb-3 group-hover:text-primary transition-colors text-balance">
                      {posts[0].title}
                    </h2>
                    <p className="text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                      {posts[0].excerpt}
                    </p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(posts[0].publishedAt).toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })}</span>
                        <span className="text-border">|</span>
                        <span>{posts[0].author}</span>
                      </div>
                      <span className="text-sm font-medium text-primary flex items-center gap-1 group-hover:gap-2 transition-all">
                        Read <ArrowRight className="w-4 h-4" />
                      </span>
                    </div>
                  </div>
                </Card>
              </Link>
            )}

            {/* Rest of posts in grid */}
            {posts.length > 1 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {posts.slice(1).map(post => (
                  <Link key={post.id} to={`/blog/${post.slug}`} className="block group">
                    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                      {post.coverImage && (
                        <div className="w-full h-40 overflow-hidden bg-muted">
                          <img
                            src={post.coverImage}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        </div>
                      )}
                      <div className="p-5">
                        <div className="flex items-center gap-3 mb-2">
                          <span className="inline-block px-2 py-0.5 bg-primary/10 text-primary text-xs font-medium rounded-full">
                            {post.category}
                          </span>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {post.readTime}
                          </span>
                        </div>
                        <h3 className="font-serif text-lg font-bold mb-2 group-hover:text-primary transition-colors line-clamp-2 text-balance">
                          {post.title}
                        </h3>
                        <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{post.author}</span>
                          <span>{new Date(post.publishedAt).toLocaleDateString(undefined, { month: "short", day: "numeric" })}</span>
                        </div>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
