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
        // Fetch profile with timeout to prevent hanging
        let profileData = null;
        try {
          const profilePromise = supabase
            .from('profiles')
            .select('*')
            .eq('id', authData.user.id)
            .maybeSingle();
          
          // Add timeout to profile fetch (2 seconds)
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Profile fetch timeout')), 2000)
          );
          
          let fetchedProfile = null;
          let profileError = null;
          
          try {
            const result = await Promise.race([profilePromise, timeoutPromise]);
            fetchedProfile = result?.data || null;
            profileError = result?.error || null;
          } catch (timeoutError) {
            // Timeout occurred, continue with null profile
            console.warn("Profile fetch timed out, continuing without profile");
            fetchedProfile = null;
            profileError = null;
          }
          
          // If profile doesn't exist, try to create it
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
              // Continue anyway - profile will be null, user can complete role setup
            } else {
              profileData = newProfile;
            }
          } else if (profileError && profileError.message !== 'Profile fetch timeout') {
            console.error("Error fetching profile:", profileError);
            // Continue anyway - profile will be null
          } else {
            profileData = fetchedProfile;
          }
        } catch (error) {
          console.error("Profile fetch error:", error);
          // Continue with null profile - user can complete role setup
        }
        
        // Merge auth user with profile data (profileData can be null - that's OK)
        const user = {
          ...authData.user,
          ...(profileData || {}),
          // Fallback to user_metadata if profile doesn't exist yet
          full_name: profileData?.full_name || authData.user.user_metadata?.full_name || authData.user.email,
          role: profileData?.role || authData.user.user_metadata?.role || null,
          team_role: profileData?.team_role || authData.user.user_metadata?.team_role || null,
          team_id: profileData?.team_id || null,
          jersey_number: profileData?.jersey_number || null,
          position: profileData?.position || null
        };
        
        // If profile exists but team_role is missing, and user_metadata has it, update the profile
        if (profileData && !profileData.team_role && authData.user.user_metadata?.team_role) {
          // Silently update the profile in the background
          supabase
            .from('profiles')
            .update({ team_role: authData.user.user_metadata.team_role })
            .eq('id', authData.user.id)
            .then(({ error }) => {
              if (error) {
                console.error("Error syncing team_role to profile:", error);
              } else {
                // Reload user to get updated profile
                loadCurrentUser();
              }
            });
        }
        
        setCurrentUser(normalizeUser(user));
      } else {
        setCurrentUser(null);
      }
    } catch (error) {
      console.log("User not authenticated:", error);
      setCurrentUser(null);
    } finally {
      // ALWAYS set loading to false, even if there were errors
      setIsLoadingUser(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    let isInitialLoad = true;
    let hasCompletedInitialLoad = false;
    
    // Start initial load
    loadCurrentUser().then(() => {
      hasCompletedInitialLoad = true;
      isInitialLoad = false;
    }).catch(() => {
      hasCompletedInitialLoad = true;
      isInitialLoad = false;
    });
    
    // Add a timeout fallback to prevent infinite loading (reduced to 3 seconds)
    const timeoutId = setTimeout(() => {
      if (isLoadingRef.current) {
        console.warn("User loading timed out - forcing loading to complete");
        setIsLoadingUser(false);
        isLoadingRef.current = false;
        hasCompletedInitialLoad = true;
        isInitialLoad = false;
      }
    }, 3000); // 3 second timeout
    
    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Don't process auth state changes during initial load
      // Only process after initial load is complete
      if (isInitialLoad || !hasCompletedInitialLoad) {
        console.log("Skipping auth state change during initial load:", _event);
        return;
      }
      
      // Only process meaningful auth state changes
      if (_event === 'SIGNED_OUT' || _event === 'SIGNED_IN' || _event === 'TOKEN_REFRESHED') {
        setIsLoadingUser(true);
        isLoadingRef.current = true;
        try {
          if (session?.user) {
            // Fetch profile when auth state changes
            let profileData = null;
            try {
              const { data: fetchedProfile, error: profileError } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', session.user.id)
                .maybeSingle();
              
              // If profile doesn't exist, try to create it
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
            } catch (error) {
              console.error("Profile fetch error:", error);
            }
            
            const user = {
              ...session.user,
              ...(profileData || {}),
              full_name: profileData?.full_name || session.user.user_metadata?.full_name || session.user.email,
              role: profileData?.role || session.user.user_metadata?.role || null,
              team_role: profileData?.team_role || session.user.user_metadata?.team_role || null,
              team_id: profileData?.team_id || null,
              jersey_number: profileData?.jersey_number || null,
              position: profileData?.position || null
            };
            
            // If profile exists but team_role is missing, and user_metadata has it, update the profile
            if (profileData && !profileData.team_role && session.user.user_metadata?.team_role) {
              // Silently update the profile in the background
              supabase
                .from('profiles')
                .update({ team_role: session.user.user_metadata.team_role })
                .eq('id', session.user.id)
                .then(({ error }) => {
                  if (error) {
                    console.error("Error syncing team_role to profile:", error);
                  } else {
                    // Reload user to get updated profile
                    loadCurrentUser();
                  }
                });
            }
            
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