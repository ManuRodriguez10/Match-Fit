import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/api/supabaseClient";

const UserContext = createContext();

const normalizeUser = (user) => {
  if (!user) return null;

  const metadata = user.user_metadata || {};

  return {
    ...user,
    full_name: metadata.full_name || user.full_name || user.email,
    role: metadata.role || user.role || null,
    team_role: metadata.team_role || user.team_role || null,
    team_id: metadata.team_id || user.team_id || null,
    jersey_number: metadata.jersey_number || user.jersey_number || null,
    position: metadata.position || user.position || null
  };
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const loadCurrentUser = async () => {
    setIsLoadingUser(true);
    try {
      const { data, error } = await supabase.auth.getUser();
      if (error) {
        throw error;
      }
      setCurrentUser(normalizeUser(data?.user));
    } catch (error) {
      console.log("User not authenticated");
      setCurrentUser(null);
    } finally {
      setIsLoadingUser(false);
    }
  };

  useEffect(() => {
    loadCurrentUser();
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(normalizeUser(session?.user));
      setIsLoadingUser(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <UserContext.Provider value={{ currentUser, isLoadingUser, loadCurrentUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};