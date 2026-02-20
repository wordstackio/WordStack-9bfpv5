import { Poet, Poem, Update, Collection, Spotlight } from "@/types";

// Mock Poets
export const mockPoets: Poet[] = [
  {
    id: "poet-1",
    name: "Elena Rivera",
    bio: "Writing about light, loss, and the spaces between words.",
    isPoet: true,
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop",
    followersCount: 342,
    totalPoems: 28,
    totalInk: 1240,
    createdAt: "2024-01-15",
    aboutText: "Elena Rivera is a poet based in Portland, exploring themes of memory and nature. Her work has appeared in various literary journals."
  },
  {
    id: "poet-2",
    name: "Marcus Chen",
    bio: "Urban observations. Night thoughts. Coffee-stained notebooks.",
    isPoet: true,
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop",
    followersCount: 189,
    totalPoems: 15,
    totalInk: 680,
    createdAt: "2024-02-20",
    aboutText: "Marcus writes from the heart of the city, finding poetry in subway stations and late-night diners."
  },
  {
    id: "poet-3",
    name: "Aria Blackwood",
    bio: "Gothic whispers and moonlit verses. Darkness is just another shade of light.",
    isPoet: true,
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop",
    followersCount: 521,
    totalPoems: 42,
    totalInk: 2150,
    createdAt: "2023-11-08",
    aboutText: "Aria Blackwood explores the darker corners of human emotion through lyrical, haunting verse."
  }
];

// Mock Poems
export const mockPoems: Poem[] = [
  {
    id: "poem-1",
    poetId: "poet-1",
    poetName: "Elena Rivera",
    poetAvatar: mockPoets[0].avatar,
    title: "Morning Dew on Cedar",
    content: `The forest holds its breath at dawn,
each needle weighted with the night,
droplets catching first light—
    
small mirrors reflecting everything
and nothing, suspended between
earth and sky, waiting
    
for the sun to decide
whether to let them fall
or lift them into mist.`,
    createdAt: "2024-11-20",
    clapsCount: 45,
    commentsCount: 7,
    isPinned: true,
    collectionIds: ["col-1"]
  },
  {
    id: "poem-2",
    poetId: "poet-2",
    poetName: "Marcus Chen",
    poetAvatar: mockPoets[1].avatar,
    title: "3 AM Subway",
    content: `Fluorescent hum, empty platform.
A woman counts change.
The tunnel breathes warm, stale air.
    
Somewhere above, the city sleeps—
but here, we are the forgotten ones,
waiting for trains that run on hope.`,
    createdAt: "2024-11-18",
    clapsCount: 32,
    commentsCount: 5,
    collectionIds: ["col-3"]
  },
  {
    id: "poem-3",
    poetId: "poet-3",
    poetName: "Aria Blackwood",
    poetAvatar: mockPoets[2].avatar,
    title: "The Raven's Last Confession",
    content: `I watched you from the old oak tree,
counting your secrets like fallen leaves.
The moon was a witness, pale and silent,
    
as you buried what you couldn't keep—
love letters, promises, the weight
of being human in a world that demands
    
we be anything but.
I am the keeper now,
the dark archive of all you left behind.`,
    createdAt: "2024-11-22",
    clapsCount: 68,
    commentsCount: 12,
    collectionIds: ["col-2"]
  },
  {
    id: "poem-4",
    poetId: "poet-1",
    poetName: "Elena Rivera",
    poetAvatar: mockPoets[0].avatar,
    title: "Inheritance",
    content: `My grandmother left me
her silence—the kind that settles
like dust on photographs,
    
the way she'd pause mid-sentence
to listen to what wasn't said.
I wear it now, this quiet,
    
learning the language
of things that matter
too much for words.`,
    createdAt: "2024-11-15",
    clapsCount: 38,
    commentsCount: 4,
    collectionIds: ["col-1"]
  },
  {
    id: "poem-5",
    poetId: "poet-2",
    poetName: "Marcus Chen",
    poetAvatar: mockPoets[1].avatar,
    title: "Laundromat Philosophy",
    content: `The machines spin their logic—
separate whites from colors,
delicate from sturdy.
    
But my socks don't care
about taxonomy. They're just trying
to survive the cycle.
    
Aren't we all?`,
    createdAt: "2024-11-10",
    clapsCount: 28,
    commentsCount: 8
  }
];

// Mock Collections
export const mockCollections: Collection[] = [
  {
    id: "col-1",
    poetId: "poet-1",
    name: "Nature & Memory",
    description: "Poems exploring the intersection of the natural world and personal remembrance.",
    coverImage: "https://images.unsplash.com/photo-1511497584788-876760111969?w=800&h=400&fit=crop",
    poemIds: ["poem-1", "poem-4"],
    createdAt: "2024-03-10",
    order: 0
  },
  {
    id: "col-2",
    poetId: "poet-3",
    name: "Dark Confessionals",
    description: "Raw, intimate explorations of shadow and truth.",
    coverImage: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&h=400&fit=crop",
    poemIds: ["poem-3"],
    createdAt: "2024-04-12",
    order: 0
  },
  {
    id: "col-3",
    poetId: "poet-2",
    name: "City Nights",
    description: "Urban poetry from midnight to dawn.",
    coverImage: "https://images.unsplash.com/photo-1514565131-fce0801e5785?w=800&h=400&fit=crop",
    poemIds: ["poem-2", "poem-5"],
    createdAt: "2024-05-20",
    order: 0
  }
];

// Mock Updates
export const mockUpdates: Update[] = [
  {
    id: "update-1",
    poetId: "poet-1",
    poetName: "Elena Rivera",
    poetAvatar: mockPoets[0].avatar,
    content: "Working on a new series about childhood summers. Expect something bittersweet soon.",
    createdAt: "2024-11-21"
  },
  {
    id: "update-2",
    poetId: "poet-3",
    poetName: "Aria Blackwood",
    poetAvatar: mockPoets[2].avatar,
    content: "Hosting a small reading event next month. Details coming soon for supporters.",
    createdAt: "2024-11-19"
  }
];

// Mock Spotlight (top 3, last 24h)
export const mockSpotlight: Spotlight[] = [
  {
    poemId: "poem-3",
    poetId: "poet-3",
    createdAt: "2024-11-22",
    expiresAt: "2024-11-23"
  },
  {
    poemId: "poem-1",
    poetId: "poet-1",
    createdAt: "2024-11-22",
    expiresAt: "2024-11-23"
  }
];
