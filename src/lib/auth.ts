import { User } from "@/types";
import { supabase } from "./supabase";

const STORAGE_KEY = "wordstack_user";

// ──────────────────────────────────────────────
// DEV MODE: Pre-configured test accounts
// Set VITE_DEV_MODE=true in .env to enable
// ──────────────────────────────────────────────
export const DEV_MODE = import.meta.env.VITE_DEV_MODE === "true";

export const DEV_USERS: Record<string, User> = {
  admin: {
    id: "dev-admin-001",
    name: "Dev Admin",
    bio: "WordStack Administrator (Dev Mode)",
    isPoet: true,
    isAdmin: true,
    avatar: "/images/avatars/avatar-man-older.jpg",
    followersCount: 999,
    createdAt: "2024-01-01",
    bannerImage: undefined,
    customUrl: "dev-admin",
    socialLinks: {},
  },
  poet: {
    id: "dev-poet-001",
    name: "Dev Poet",
    bio: "Writing verses in development (Dev Mode)",
    isPoet: true,
    isAdmin: false,
    avatar: "/images/avatars/avatar-woman-redhead.jpg",
    followersCount: 150,
    createdAt: "2024-02-01",
    bannerImage: undefined,
    customUrl: "dev-poet",
    socialLinks: {},
  },
  reader: {
    id: "dev-reader-001",
    name: "Dev Reader",
    bio: "Discovering poetry in development (Dev Mode)",
    isPoet: false,
    isAdmin: false,
    avatar: "/images/avatars/avatar-woman-dark.jpg",
    followersCount: 10,
    createdAt: "2024-03-01",
    bannerImage: undefined,
    customUrl: "dev-reader",
    socialLinks: {},
  },
};

// Dev mode login: bypass Supabase entirely
export const devLogin = (role: "admin" | "poet" | "reader"): User => {
  const user = DEV_USERS[role];
  setCurrentUser(user);
  return user;
};

// Session management
export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUser = (user: User) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const clearCurrentUser = () => {
  localStorage.removeItem(STORAGE_KEY);
};

// Map Supabase user to app User type
const mapSupabaseUserToUser = async (supabaseUser: any): Promise<User | null> => {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', supabaseUser.id)
    .single();

  if (error || !profile) return null;

  return {
    id: profile.id,
    name: profile.name,
    bio: profile.bio || '',
    isPoet: profile.is_admin ? true : profile.is_poet,
    isAdmin: profile.is_admin,
    avatar: profile.avatar,
    followersCount: profile.followers_count || 0,
    createdAt: profile.created_at,
    bannerImage: profile.banner_image,
    customUrl: profile.custom_url,
    socialLinks: profile.social_links
  };
};

// Sign up with email and password
export const signup = async (
  email: string,
  password: string,
  name: string,
  asPoet: boolean
): Promise<{ user: User | null; error: string | null }> => {
  try {
    // Check if any admin exists
    const { data: hasAdminData } = await supabase.rpc('has_admin');
    const isFirstUser = !hasAdminData;

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name,
          is_poet: asPoet
        }
      }
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Failed to create user' };
    }

    // Create profile
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: authData.user.id,
        name,
        bio: asPoet ? 'Poet on WordStack' : 'Reader on WordStack',
        is_poet: asPoet,
        is_admin: isFirstUser, // First user becomes admin
        followers_count: 0,
        total_poems: 0,
        ink_balance: 100 // Welcome bonus
      });

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return { user: null, error: 'Failed to create profile' };
    }

    // Initialize free ink usage
    await supabase.from('free_ink_usage').insert({
      user_id: authData.user.id,
      daily_used: 0,
      monthly_used: 0
    });

    // Add welcome ink transaction
    await supabase.from('ink_transactions').insert({
      id: `ink-welcome-${authData.user.id}`,
      user_id: authData.user.id,
      type: 'initial',
      amount: 100,
      description: 'Welcome bonus - start supporting poets!'
    });

    if (isFirstUser) {
      console.log('🔐 First user signup - Admin privileges granted');
    }

    const user = await mapSupabaseUserToUser(authData.user);
    if (user) {
      setCurrentUser(user);
    }

    return { user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Signup failed' };
  }
};

// Login with email and password
export const login = async (
  email: string,
  password: string
): Promise<{ user: User | null; error: string | null }> => {
  try {
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return { user: null, error: authError.message };
    }

    if (!authData.user) {
      return { user: null, error: 'Login failed' };
    }

    const user = await mapSupabaseUserToUser(authData.user);
    if (user) {
      setCurrentUser(user);
    }

    return { user, error: null };
  } catch (err: any) {
    return { user: null, error: err.message || 'Login failed' };
  }
};

// Logout
export const logout = async () => {
  if (!DEV_MODE) {
    await supabase.auth.signOut();
  }
  clearCurrentUser();
};

// Check and restore session on app load
export const restoreSession = async (): Promise<User | null> => {
  // In dev mode, just restore from localStorage (no Supabase session needed)
  if (DEV_MODE) {
    const stored = getCurrentUser();
    return stored;
  }

  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session?.user) {
    clearCurrentUser();
    return null;
  }

  const user = await mapSupabaseUserToUser(session.user);
  if (user) {
    setCurrentUser(user);
  }
  
  return user;
};

// Upgrade reader to poet
export const upgradeToPoet = async (userId: string): Promise<User | null> => {
  try {
    const { error } = await supabase
      .from('profiles')
      .update({ 
        is_poet: true,
        bio: 'Poet on WordStack'
      })
      .eq('id', userId);

    if (error) {
      console.error('Upgrade error:', error);
      return null;
    }

    const user = getCurrentUser();
    if (user) {
      const upgradedUser = {
        ...user,
        isPoet: true,
        bio: 'Poet on WordStack'
      };
      setCurrentUser(upgradedUser);
      return upgradedUser;
    }

    return null;
  } catch (err) {
    console.error('Upgrade failed:', err);
    return null;
  }
};

// Delete account
export const deleteAccount = async (): Promise<{ success: boolean; error: string | null }> => {
  try {
    const user = getCurrentUser();
    if (!user) return { success: false, error: "No user logged in" };

    // Delete the profile from Supabase
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', user.id);

    if (profileError) {
      console.error('Profile deletion error:', profileError);
    }

    // Sign out
    await supabase.auth.signOut();
    clearCurrentUser();

    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'Account deletion failed' };
  }
};

// Legacy functions for backward compatibility
export const mockLogin = async (email: string): Promise<User | null> => {
  return (await login(email, 'password123')).user;
};

export const mockSignup = async (email: string, name: string, asPoet: boolean): Promise<User | null> => {
  return (await signup(email, 'password123', name, asPoet)).user;
};
