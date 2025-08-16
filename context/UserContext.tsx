// app/context/UserContext.tsx

"use client";

import {
  createContext,
  useState,
  useEffect,
  ReactNode,
  useContext,
} from "react";

interface User {
  _id: string;
  name: string;
  email: string;
  username: string;
  avatarUrl?: string;
}

interface UserContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  error: string | null;
  fetchUser: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch the user information from the API
  const fetchUser = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setUser(null); // If there's no token, clear the user state
        setIsLoading(false);
        return;
      }
      // navigator.clipboard.writeText(token);
      const response = await fetch("/api/auth/me", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        // console.log("\nUSer Found: ", JSON.stringify(data.user));
        setUser(data.user);
      } else {
        setUser(null);
        setError(data.message);
      }
    } catch (err) {
      console.error(err);
      setUser(null);
      setError("Failed to fetch user");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser(); // Fetch user info when the app loads
  }, []);

  return (
    <UserContext.Provider
      value={{ user, setUser, isLoading, error, fetchUser }}
    >
      {children}
    </UserContext.Provider>
  );
};

// Custom hook to use the UserContext
export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};
