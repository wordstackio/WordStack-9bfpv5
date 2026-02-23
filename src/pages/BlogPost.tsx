import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, Clock, Calendar, Share2, Twitter, Facebook, Link2 } from "lucide-react";
import { useEffect } from "react";

// Extended blog post data with full content
const blogPosts = [
  {
    id: "blog-1",
    category: "Platform Updates",
    title: "Introducing Collections: Organize Your Poetry Journey",
    readTime: "4m read",
    image: "/images/covers/writing-books.jpg",
    publishedAt: "November 20, 2024",
    author: "WordStack Team",
    authorAvatar: undefined,
    excerpt: "We're excited to announce Collections, a powerful new way to organize and showcase your poetry on WordStack.",
    content: `We're thrilled to introduce Collections — a feature that many of you have been asking for. Collections allow you to group your poems thematically, chronologically, or however you see fit.

## Why Collections Matter

As a poet, your work evolves. You explore different themes, styles, and voices. Collections give you the power to organize your poetry in meaningful ways that help readers discover the full depth of your creative journey.

### What You Can Do With Collections

- **Thematic Groupings**: Create collections around specific themes like "Nature Poems," "Love & Loss," or "Urban Reflections"
- **Project-Based Organization**: Group poems from specific writing projects or chapbooks
- **Chronological Archives**: Organize work by year or creative period
- **Curated Showcases**: Build collections that tell a story or guide readers through your work

## How to Get Started

Creating a collection is simple:

1. Navigate to your Collections page from your poet dashboard
2. Click "Create New Collection"
3. Give it a name and description
4. Add poems from your library
5. Reorder them to create the perfect flow

Collections appear on your poet page, giving visitors an organized way to explore your work. Each collection has its own dedicated page with an introduction and the poems you've selected.

## The Vision Behind Collections

WordStack is about giving poets ownership over how their work is presented. Collections are another step toward making your poet page feel like a true creative home — not just a profile, but a carefully curated space that reflects your artistic vision.

We can't wait to see how you use Collections to showcase your poetry. As always, we're listening to your feedback and constantly improving the platform.

Happy organizing!

— The WordStack Team`,
    metaDescription: "Discover how WordStack's new Collections feature helps poets organize, curate, and showcase their poetry in meaningful ways."
  },
  {
    id: "blog-2",
    category: "Writing Tips",
    title: "Finding Your Voice: A Guide for New Poets",
    readTime: "6m read",
    image: "/images/covers/writing-desk.jpg",
    publishedAt: "November 18, 2024",
    author: "Sarah Chen",
    authorAvatar: undefined,
    excerpt: "Every poet's journey begins with a question: What do I have to say? Here's how to discover and develop your unique poetic voice.",
    content: `Every poet starts somewhere. And that starting point is often marked by uncertainty: *What do I write about? How do I sound like myself?*

The truth is, finding your voice isn't about forcing originality. It's about learning to listen — to yourself, to the world, and to the silence between words.

## Start With What Moves You

Your voice emerges from genuine emotion and curiosity. Don't write about what you think poetry "should" be about. Write about what keeps you up at night, what makes you stop mid-step, what you can't stop thinking about.

### Questions to Ask Yourself

- What images or memories keep returning to you?
- What emotions feel most urgent to express?
- What experiences have shaped how you see the world?
- What questions don't have easy answers?

## Read Widely, But Don't Imitate

Reading other poets is essential. It teaches you rhythm, form, technique, and possibility. But the goal isn't to write like Mary Oliver or Ocean Vuong — it's to learn from them while discovering what only you can say.

### How to Read Like a Poet

- Notice what makes you pause or reread a line
- Study how poets create images and music
- Ask why a poem affected you emotionally
- Try writing responses or reimaginings

## Experiment Without Judgment

Your voice develops through practice, not perfection. Write poems that fail. Try forms that feel awkward. Use words that seem too simple or too strange. Every experiment teaches you something about your natural rhythms and obsessions.

### Exercise: Voice Exploration

Try writing the same poem three different ways:
1. As conversational as possible
2. As lyrical and musical as possible
3. As stark and minimal as possible

See which version feels most authentic to you.

## Trust Your Obsessions

We all have recurring themes, images, and questions that show up in our work. Don't fight them. These obsessions are often where your most powerful voice lives. If you keep writing about water, or cities, or your grandmother's hands — lean into it.

## Your Voice Will Evolve

Here's the liberating truth: your voice isn't a fixed thing you "find" once and keep forever. It evolves as you grow, read, experience life, and practice your craft.

The poet you are at 22 will write differently than the poet you are at 35 or 50. And that's not just okay — that's the point.

## Final Thoughts

Finding your voice is less about invention and more about excavation. It's already there, waiting beneath self-doubt and comparison. Your job is to write honestly, consistently, and curiously until it emerges.

Start where you are. Write what matters. Trust the process.

— Sarah Chen, Contributing Poet`,
    metaDescription: "A practical guide for new poets on discovering and developing their unique poetic voice through honest writing, wide reading, and fearless experimentation."
  },
  {
    id: "blog-3",
    category: "Community",
    title: "November's Most Inked Poems: A Celebration",
    readTime: "3m read",
    image: "/images/covers/library-books.jpg",
    publishedAt: "November 15, 2024",
    author: "WordStack Team",
    authorAvatar: undefined,
    excerpt: "This month, our community came together to support incredible poetry. Here are the poems that resonated most deeply.",
    content: `November has been an extraordinary month on WordStack. We've seen an outpouring of support for poets across the platform, with readers using Ink to celebrate work that moved them.

## The Power of Community Support

When we launched WordStack, we wanted to create a space where poets could be supported directly by their readers. No intermediaries, no algorithms deciding what deserves attention — just genuine appreciation flowing from reader to creator.

This month proved that vision is working. Thousands of Ink were given to poets, enabling them to continue their craft.

## November's Top Supported Poems

Here are the poems that received the most Ink this month:

### 1. "Silence in the Library" by Maya Rivers
A haunting meditation on memory and loss that captured hearts across the platform. Maya's sparse, precise language created a space for readers to bring their own grief and healing.

**What readers said:**
*"This poem found me at exactly the right moment."*
*"Every line lands with perfect weight."*

### 2. "City of Rain" by James Morrison  
An urban love letter that transforms concrete and downpours into something transcendent. James's imagery reminded us why we fall in love with places that don't always love us back.

### 3. "My Grandmother's Hands" by Lucia Santos
A tender, specific portrait that somehow feels universal. Lucia's attention to detail — the worn wedding ring, the garden dirt, the way light catches silver hair — created a poem that made readers call their own grandmothers.

### 4. "November Storm" by David Park
Raw emotion meets formal control in this villanelle about climate change and hope. David proved that traditional forms can still speak urgently to contemporary anxieties.

### 5. "What the Desert Taught Me" by Aisha Rahman
Sparse, powerful, and deeply personal. Aisha's poem about displacement and belonging resonated across cultures and experiences.

## Why This Matters

These aren't just poems that got attention — they're poems that built genuine connections between poets and readers. That's what WordStack is about.

Every Ink given is a conversation. It says: *Your words mattered to me. Keep creating.*

## Looking Ahead

As we move into December, we're excited to see what new voices emerge and what poems will touch our community. Keep writing, keep reading, and keep supporting the work that moves you.

Thank you for making WordStack a place where poetry thrives.

— The WordStack Team`,
    metaDescription: "Celebrating November's most supported poems on WordStack and the poets whose work resonated deeply with our community."
  }
];

export default function BlogPost() {
  const { id } = useParams();
  const post = blogPosts.find(p => p.id === id);

  useEffect(() => {
    // Scroll to top when component mounts
    window.scrollTo(0, 0);

    // Update page title for SEO
    if (post) {
      document.title = `${post.title} | WordStack Blog`;
    }

    return () => {
      document.title = "WordStack - A home for poets";
    };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4 pb-20">
        <Card className="p-12 text-center max-w-md">
          <h1 className="font-serif text-2xl font-bold mb-4">Post Not Found</h1>
          <p className="text-muted-foreground mb-6">
            This blog post doesn't exist or has been removed.
          </p>
          <Link to="/community">
            <Button>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Community
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
        alert("Link copied to clipboard!");
        break;
    }
  };

  return (
    <article className="min-h-screen bg-background pb-20">
      {/* SEO Meta Tags (would be better with react-helmet or similar) */}
      <div style={{ display: "none" }}>
        <meta name="description" content={post.metaDescription} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:image" content={post.image} />
        <meta property="og:type" content="article" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.metaDescription} />
        <meta name="twitter:image" content={post.image} />
      </div>

      {/* Back Button */}
      <div className="container mx-auto px-4 py-6 max-w-4xl">
        <Link to="/community">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Community
          </Button>
        </Link>
      </div>

      {/* Hero Image */}
      <div className="w-full h-64 md:h-96 overflow-hidden bg-muted">
        <img
          src={post.image}
          alt={post.title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Article Header */}
      <header className="container mx-auto px-4 py-8 md:py-12 max-w-3xl">
        <div className="flex items-center gap-2 mb-4">
          <span className="inline-block px-3 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
            {post.category}
          </span>
        </div>

        <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-6 border-b border-border">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <time dateTime={post.publishedAt}>{post.publishedAt}</time>
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
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("twitter")}
          >
            <Twitter className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("facebook")}
          >
            <Facebook className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleShare("copy")}
          >
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
            // Handle markdown-style headings
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

            // Handle list items
            if (paragraph.startsWith("- ")) {
              const items = paragraph.split("\n").filter(line => line.startsWith("- "));
              return (
                <ul key={index} className="list-disc pl-6 my-6 space-y-2">
                  {items.map((item, i) => (
                    <li key={i} className="leading-relaxed">
                      {item.replace("- ", "").replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>").replace(/\*(.*?)\*/g, "<em>$1</em>")}
                    </li>
                  ))}
                </ul>
              );
            }

            // Handle numbered lists
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

            // Regular paragraphs
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
        <div className="text-center mt-12 p-8 bg-gradient-to-b from-accent/20 to-background rounded-lg border border-border">
          <h3 className="font-serif text-2xl font-bold mb-3">
            Join the WordStack Community
          </h3>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            Create your own poetry website, share your work, and connect with readers who value authentic creative expression.
          </p>
          <Link to="/signup">
            <Button size="lg">
              Get Started for Free
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}
