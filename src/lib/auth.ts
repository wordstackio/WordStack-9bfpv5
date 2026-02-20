import { User } from "@/types";

const STORAGE_KEY = "wordstack_user";

export const getCurrentUser = (): User | null => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : null;
};

export const setCurrentUser = (user: User) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
};

export const logout = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const mockLogin = (email: string): User => {
  const user: User = {
    id: "user-" + Date.now(),
    name: email.split("@")[0],
    bio: "New to WordStack",
    isPoet: false,
    followersCount: 0,
    createdAt: new Date().toISOString()
  };
  setCurrentUser(user);
  return user;
};

export const mockSignup = (email: string, name: string, asPoet: boolean): User => {
  const user: User = {
    id: "user-" + Date.now(),
    name,
    bio: asPoet ? "Poet on WordStack" : "Reader on WordStack",
    isPoet: asPoet,
    followersCount: 0,
    createdAt: new Date().toISOString()
  };
  setCurrentUser(user);
  return user;
};

export const upgradeToPoet = (userId: string): User | null => {
  const user = getCurrentUser();
  if (!user || user.id !== userId) return null;
  
  const upgradedUser: User = {
    ...user,
    isPoet: true,
    bio: user.bio === "Reader on WordStack" ? "Poet on WordStack" : user.bio
  };
  
  setCurrentUser(upgradedUser);
  return upgradedUser;
};
