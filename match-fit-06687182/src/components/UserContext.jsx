import React, { createContext, useContext, useState, useEffect, useRef } from "react";
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
  const isLoadingRef = useRef(true);

  const loadCurrentUser = async () => {
    setIsLoadingUser(true);
    isLoadingRef.current = true;
    try {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.log("Auth error:", authError);
        throw authError;
      }
      
      if (authData?.user) {
        // Fetch profile from database - use maybeSingle() to avoid errors when profile doesn't exist
        let profileData = null;
        const { data: fetchedProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', authData.user.id)
          .maybeSingle();
        
        // If profile doesn't exist, create it automatically
        if (!fetchedProfile && !profileError) {
          console.log("Profile not found, creating one...");
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert({
              id: authData.user.id,
              full_name: '',
              role: null,
              team_role: null
            })
            .select()
            .single();
          
          if (createError) {
            console.error("Error creating profile:", createError);
          } else {
            profileData = newProfile;
          }
        } else if (profileError) {
          console.error("Error fetching profile:", profileError);
        } else {
          profileData = fetchedProfile;
        }
        
        // Merge auth user with profile data
        const user = {
          ...authData.user,
          ...(profileData || {}),
          // Fallback to user_metadata if profile doesn't exist yet
          full_name: profileData?.full_name || authData.user.user_metadata?.full_name || authData.user.email,
          role: profileData?.role || authData.user.user_metadata?.role || null,
          team_role: profileData?.team_role || authData.user.user_metadata?.role || null,
          team_id: profileData?.team_id || null,
          jersey_number: profileData?.jersey_number || null,
          position: profileData?.position || null
        };
        
        setCurrentUser(normalizeUser(user));
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.log("User not authenticated:", error);
      setCurrentUser(null);
    } finally {
      setIsLoadingUser(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    loadCurrentUser();
    
    // Add a timeout fallback to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isLoadingRef.current) {
        console.warn("User loading timed out - forcing loading to complete");
        setIsLoadingUser(false);
        isLoadingRef.current = false;
      }
    }, 5000); // 5 second timeout
    
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoadingUser(true);
      isLoadingRef.current = true;
      try {
        if (session?.user) {
          // Fetch profile when auth state changes - use maybeSingle() to avoid errors
          let profileData = null;
          const { data: fetchedProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .maybeSingle();
          
          // If profile doesn't exist, create it automatically
          if (!fetchedProfile && !profileError) {
            console.log("Profile not found, creating one...");
            const { data: newProfile, error: createError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                full_name: '',
                role: null,
                team_role: null
              })
              .select()
              .single();
            
            if (createError) {
              console.error("Error creating profile:", createError);
            } else {
              profileData = newProfile;
            }
          } else if (profileError) {
            console.error("Error fetching profile:", profileError);
          } else {
            profileData = fetchedProfile;
          }
          
          const user = {
            ...session.user,
            ...(profileData || {}),
            full_name: profileData?.full_name || session.user.user_metadata?.full_name || session.user.email,
            role: profileData?.role || session.user.user_metadata?.role || null,
            team_role: profileData?.team_role || session.user.user_metadata?.role || null,
            team_id: profileData?.team_id || null,
            jersey_number: profileData?.jersey_number || null,
            position: profileData?.position || null
          };
          
          setCurrentUser(normalizeUser(user));
        } else {
          setCurrentUser(null);
        }
      } catch (error) {
        console.error("Error in auth state change:", error);
        setCurrentUser(null);
      } finally {
        setIsLoadingUser(false);
        isLoadingRef.current = false;
      }
    });

    return () => {
      clearTimeout(timeoutId);
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