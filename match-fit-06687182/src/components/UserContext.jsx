import React, { createContext, useContext, useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);

  const loadCurrentUser = async () => {
    setIsLoadingUser(true);
    try {
      // TODO: Replace with your authentication system
      // const user = await base44.auth.me();
      // Temporarily disabled to allow local development without base44
      setCurrentUser(null);
    } catch (error) {
      console.log("User not authenticated");
      setCurrentUser(null);
    }
    setIsLoadingUser(false);
  };

  useEffect(() => {
    loadCurrentUser();
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