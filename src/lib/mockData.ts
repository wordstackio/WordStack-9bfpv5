import { Poet, Poem, Update, Collection, Spotlight, Comment } from "@/types";

// Mock Poets
export const mockPoets: Poet[] = [
  {
    id: "poet-1",
    name: "Elena Rivera",
    bio: "Writing about light, loss, and the spaces between words.",
    isPoet: true,
    avatar: "/images/avatars/avatar-woman-redhead.jpg",
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
    avatar: "/images/avatars/avatar-man-beard.jpg",
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
    avatar: "/images/avatars/avatar-woman-casual.jpg",
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
    coverImage: "/images/covers/nature-forest.jpg",
    poemIds: ["poem-1", "poem-4"],
    createdAt: "2024-03-10",
    order: 0
  },
  {
    id: "col-2",
    poetId: "poet-3",
    name: "Dark Confessionals",
    description: "Raw, intimate explorations of shadow and truth.",
    coverImage: "/images/covers/sunset-ocean.jpg",
    poemIds: ["poem-3"],
    createdAt: "2024-04-12",
    order: 0
  },
  {
    id: "col-3",
    poetId: "poet-2",
    name: "City Nights",
    description: "Urban poetry from midnight to dawn.",
    coverImage: "/images/covers/city-night.jpg",
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

// Mock Poem Comments (seeded per poem)
export const mockPoemComments: Comment[] = [
  // poem-1 comments
  {
    id: "pc-1",
    postId: "poem-1",
    userId: "user-1",
    userName: "Sarah Mitchell",
    userAvatar: "/images/avatars/avatar-woman-dark.jpg",
    content: "The imagery of droplets as small mirrors is stunning. This captures that exact moment between night and day so beautifully.",
    parentCommentId: undefined,
    mentions: [],
    createdAt: "2024-11-20T10:30:00Z",
    clapsCount: 12
  },
  {
    id: "pc-2",
    postId: "poem-1",
    userId: "user-2",
    userName: "James Thornton",
    userAvatar: "/images/avatars/avatar-man-headshot.jpg",
    content: "\"Waiting for the sun to decide\" -- what a perfect way to end this. The personification of the sun makes the whole poem feel alive.",
    parentCommentId: undefined,
    mentions: [],
    createdAt: "2024-11-20T14:15:00Z",
    clapsCount: 8
  },
  {
    id: "pc-3",
    postId: "poem-1",
    userId: "user-3",
    userName: "Priya Kapoor",
    userAvatar: "/images/avatars/avatar-woman-blonde.jpg",
    content: "@James Thornton Agreed, the ending lingers. It feels like the whole poem is suspended in that in-between moment.",
    parentCommentId: "pc-2",
    mentions: ["James"],
    createdAt: "2024-11-20T16:45:00Z",
    clapsCount: 4
  },
  {
    id: "pc-4",
    postId: "poem-1",
    userId: "user-5",
    userName: "Amara Obi",
    userAvatar: "/images/avatars/avatar-woman-closeup.jpg",
    content: "This reminds me of Bashō. Simple, precise, yet deeply resonant. More of this, please.",
    parentCommentId: undefined,
    mentions: [],
    createdAt: "2024-11-21T08:20:00Z",
    clapsCount: 15
  },
  // poem-2 comments
  {
    id: "pc-5",
    postId: "poem-2",
    userId: "user-4",
    userName: "Leo Nguyen",
    userAvatar: "/images/avatars/avatar-man-older.jpg",
    content: "\"Trains that run on hope\" hits hard. Anyone who has taken the late-night subway knows this feeling.",
    parentCommentId: undefined,
    mentions: [],
    createdAt: "2024-11-18T23:10:00Z",
    clapsCount: 20
  },
  {
    id: "pc-6",
    postId: "poem-2",
    userId: "user-1",
    userName: "Sarah Mitchell",
    userAvatar: "/images/avatars/avatar-woman-dark.jpg",
    content: "The economy of words here is masterful. Every line earns its place.",
    parentCommentId: undefined,
    mentions: [],
    createdAt: "2024-11-19T09:30:00Z",
    clapsCount: 6
  },
  // poem-3 comments
  {
    id: "pc-7",
    postId: "poem-3",
    userId: "user-2",
    userName: "James Thornton",
    userAvatar: "/images/avatars/avatar-man-headshot.jpg",
    content: "Aria's work always leaves me unsettled in the best way. \"The dark archive of all you left behind\" is unforgettable.",
    parentCommentId: undefined,
    mentions: [],
    createdAt: "2024-11-22T11:00:00Z",
    clapsCount: 18
  },
  {
    id: "pc-8",
    postId: "poem-3",
    userId: "user-3",
    userName: "Priya Kapoor",
    userAvatar: "/images/avatars/avatar-woman-blonde.jpg",
    content: "There is something almost sacred about this confession. The raven as witness, as keeper. Gorgeous.",
    parentCommentId: undefined,
    mentions: [],
    createdAt: "2024-11-22T13:20:00Z",
    clapsCount: 11
  },
  {
    id: "pc-9",
    postId: "poem-3",
    userId: "user-5",
    userName: "Amara Obi",
    userAvatar: "/images/avatars/avatar-woman-closeup.jpg",
    content: "@Priya Kapoor Yes! It reads like a gothic love letter. The tension between holding on and letting go is palpable.",
    parentCommentId: "pc-8",
    mentions: ["Priya"],
    createdAt: "2024-11-22T15:45:00Z",
    clapsCount: 7
  },
  // poem-4 comments
  {
    id: "pc-10",
    postId: "poem-4",
    userId: "user-4",
    userName: "Leo Nguyen",
    userAvatar: "/images/avatars/avatar-man-older.jpg",
    content: "This one brought tears. The quiet inheritance of silence, the things that matter too much for words. Real.",
    parentCommentId: undefined,
    mentions: [],
    createdAt: "2024-11-16T07:00:00Z",
    clapsCount: 22
  },
  // poem-5 comments
  {
    id: "pc-11",
    postId: "poem-5",
    userId: "user-1",
    userName: "Sarah Mitchell",
    userAvatar: "/images/avatars/avatar-woman-dark.jpg",
    content: "Marcus always finds philosophy in the most unexpected places. This is hilarious and profound at the same time.",
    parentCommentId: undefined,
    mentions: [],
    createdAt: "2024-11-11T12:00:00Z",
    clapsCount: 9
  },
  {
    id: "pc-12",
    postId: "poem-5",
    userId: "user-3",
    userName: "Priya Kapoor",
    userAvatar: "/images/avatars/avatar-woman-blonde.jpg",
    content: "\"Aren't we all?\" -- the perfect mic drop ending. I want this on a laundromat wall.",
    parentCommentId: undefined,
    mentions: [],
    createdAt: "2024-11-11T18:30:00Z",
    clapsCount: 14
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
