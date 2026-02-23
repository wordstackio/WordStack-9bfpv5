import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Share2, Twitter, Facebook, Link2 } from "lucide-react";
import { useEffect, useState } from "react";
import { getBlogPost } from "@/lib/storage";
import { BlogPost as BlogPostType } from "@/types";

export default function BlogPost() {
  const { id } = useParams();
  const [post, setPost] = useState<BlogPostType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);

    if (id) {
      const found = getBlogPost(id);
      setPost(found);
    }
    setLoading(false);
  }, [id]);

  // Inject SEO meta tags
  useEffect(() => {
    if (!post) return;

    document.title = post.metaTitle || `${post.title} | WordStack Blog`;

    const setMeta = (name: string, content: string, property?: boolean) => {
      if (!content) return;
      const attr = property ? "property" : "name";
      let tag = document.querySelector(`meta[${attr}="${name}"]`) as HTMLMetaElement | null;
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute(attr, name);
        document.head.appendChild(tag);
      }
      tag.content = content;
    };

    setMeta("description", post.metaDescription || post.excerpt);
    setMeta("keywords", post.metaKeywords);
    setMeta("og:title", post.metaTitle || post.title, true);
    setMeta("og:description", post.metaDescription || post.excerpt, true);
    setMeta("og:image", post.ogImage || post.coverImage, true);
    setMeta("og:type", "article", true);
    setMeta("twitter:card", "summary_large_image");
    setMeta("twitter:title", post.metaTitle || post.title);
    setMeta("twitter:description", post.metaDescription || post.excerpt);
    setMeta("twitter:image", post.ogImage || post.coverImage);

    return () => {
      document.title = "WordStack - A home for poets";
    };
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pb-20">
        <Card className="p-12 text-center max-w-md">
          <h1 className="font-serif text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This blog post doesn't exist or has been removed.
          </p>
          <Link to="/blog">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Blog
            </Button>
          </Link>
        </Card>
      </div>
    );
  }

  const handleShare = async (platform: string) => {
    const url = window.location.href;
    const text = post.title;

    switch (platform) {
      case "twitter":
        window.open(
          `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "facebook":
        window.open(
          `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
          "_blank"
        );
        break;
      case "copy":
        await navigator.clipboard.writeText(url);
        break;
    }
  };

  const formattedDate = new Date(post.publishedAt).toLocaleDateString(undefined, {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <article className="min-h-screen bg-background pb-20">
      {/* Back Button */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Link to="/blog">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blog
          </Button>
        </Link>
      </div>

      {/* Hero Image */}
      {post.coverImage && (
        <div className="w-full h-64 md:h-96 overflow-hidden bg-muted">
          <img
            src={post.coverImage}
            alt={post.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Article Header */}
      <header className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {post.category}
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight text-balance">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.publishedAt}>{formattedDate}</time>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            <span>{post.readTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>By {post.author}</span>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex items-center gap-3 mb-8">
          <span className="text-sm text-muted-foreground">Share:</span>
          <Button variant="outline" size="sm" onClick={() => handleShare("twitter")}>
            <Twitter className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleShare("facebook")}>
            <Facebook className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleShare("copy")}>
            <Link2 className="w-4 h-4" />
          </Button>
        </div>

        {/* Excerpt */}
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed italic border-l-4 border-primary pl-6 mb-8">
          {post.excerpt}
        </p>
      </header>

      {/* Article Content */}
      <div className="container mx-auto px-4 pb-12 max-w-3xl">
        <div className="prose prose-lg max-w-none prose-headings:font-serif prose-headings:font-bold prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4 prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3 prose-p:leading-relaxed prose-p:mb-6 prose-strong:text-foreground prose-em:text-muted-foreground prose-ul:my-6 prose-li:mb-2">
          {post.content.split("\n\n").map((paragraph, index) => {
            if (paragraph.startsWith("## ")) {
              return (
                <h2 key={index} className="font-serif text-2xl font-bold mt-10 mb-4">
                  {paragraph.replace("## ", "")}
                </h2>
              );
            }
            if (paragraph.startsWith("### ")) {
              return (
                <h3 key={index} className="font-serif text-xl font-bold mt-8 mb-3">
                  {paragraph.replace("### ", "")}
                </h3>
              );
            }

            if (paragraph.startsWith("- ")) {
              const items = paragraph.split("\n").filter(line => line.startsWith("- "));
              return (
                <ul key={index} className="list-disc pl-6 my-6 space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="leading-relaxed">
                      {item.replace("- ", "")}
                    </li>
                  ))}
                </ul>
              );
            }

            if (/^\d+\./.test(paragraph)) {
              const items = paragraph.split("\n").filter(line => /^\d+\./.test(line));
              return (
                <ol key={index} className="list-decimal pl-6 my-6 space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="leading-relaxed">
                      {item.replace(/^\d+\.\s*/, "")}
                    </li>
                  ))}
                </ol>
              );
            }

            return (
              <p key={index} className="leading-relaxed mb-6 text-foreground">
                {paragraph
                  .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-foreground">$1</strong>')
                  .replace(/\*(.*?)\*/g, '<em class="italic text-muted-foreground">$1</em>')
                  .split(/(<strong.*?<\/strong>|<em.*?<\/em>)/)
                  .map((part, i) => {
                    if (part.startsWith("<strong") || part.startsWith("<em")) {
                      return <span key={i} dangerouslySetInnerHTML={{ __html: part }} />;
                    }
                    return part;
                  })}
              </p>
            );
          })}
        </div>

        {/* Author Bio */}
        <Card className="p-6 mt-12 bg-muted/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
              <span className="text-lg font-bold text-primary">
                {post.author.charAt(0)}
              </span>
            </div>
            <div>
              <h3 className="font-semibold mb-1">About {post.author}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {post.author === "WordStack Team"
                  ? "The WordStack Team is dedicated to building a platform where poets can thrive, create, and connect with readers who appreciate their work."
                  : "Contributing poet and writer at WordStack, exploring themes of identity, belonging, and the spaces between words."}
              </p>
            </div>
          </div>
        </Card>

        {/* CTA */}
        <div className="text-center mt-12 p-8 bg-muted/20 rounded-lg border border-border">
          <h3 className="font-serif text-2xl font-bold mb-3">
            Join the WordStack Community
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Create your own poetry website, share your work, and connect with readers who value authentic creative expression.
          </p>
          <Link to="/signup">
            <Button size="lg">Get Started for Free</Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
