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
  const currentUserRef = useRef(null);

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
        
        const normalizedUser = normalizeUser(user);
        setCurrentUser(normalizedUser);
        currentUserRef.current = normalizedUser;
      } else {
        setCurrentUser(null);
        currentUserRef.current = null;
      }
    } catch (error) {
      console.log("User not authenticated:", error);
      setCurrentUser(null);
      currentUserRef.current = null;
    } finally {
      // ALWAYS set loading to false, even if there were errors
      setIsLoadingUser(false);
      isLoadingRef.current = false;
    }
  };

  useEffect(() => {
    let isInitialLoad = true;
    let hasCompletedInitialLoad = false;
    const hasCompletedInitialLoadRef = { current: false };
    
    // Start initial load
    loadCurrentUser().then(() => {
      hasCompletedInitialLoad = true;
      hasCompletedInitialLoadRef.current = true;
      isInitialLoad = false;
    }).catch(() => {
      hasCompletedInitialLoad = true;
      hasCompletedInitialLoadRef.current = true;
      isInitialLoad = false;
    });
    
    // Add a timeout fallback to prevent infinite loading (reduced to 3 seconds)
    const timeoutId = setTimeout(() => {
      if (isLoadingRef.current) {
        console.warn("User loading timed out - forcing loading to complete");
        setIsLoadingUser(false);
        isLoadingRef.current = false;
        hasCompletedInitialLoad = true;
        hasCompletedInitialLoadRef.current = true;
        isInitialLoad = false;
      }
    }, 3000); // 3 second timeout
    
    // Handle tab visibility changes - refresh session when tab becomes visible
    const handleVisibilityChange = async () => {
      if (!document.hidden && hasCompletedInitialLoadRef.current) {
        // Tab became visible and initial load is complete
        try {
          // Check if we have a session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session) {
            // No session - user might have been logged out
            // Clear user state without triggering loading state
            if (currentUserRef.current) {
              setCurrentUser(null);
              currentUserRef.current = null;
              setIsLoadingUser(false);
            }
            return;
          }
          
          // Session exists, check if it needs refresh
          const now = Math.floor(Date.now() / 1000);
          const expiresAt = session.expires_at;
          
          // Only refresh if session is close to expiring (within 5 minutes)
          if (expiresAt && expiresAt - now < 300) {
            // Refresh session - TOKEN_REFRESHED event will handle user reload
            const { error: refreshError } = await supabase.auth.refreshSession();
            if (refreshError) {
              console.warn("Error refreshing session:", refreshError);
            }
            // If refresh succeeds, TOKEN_REFRESHED event will fire and reload user
          }
          // If session is valid and not expiring, do nothing - user should already be loaded
        } catch (error) {
          console.warn("Error in visibility change handler:", error);
          // Don't call loadCurrentUser - just log the error
        }
      }
    };

    // Also handle window focus as a fallback (some browsers may not fire visibilitychange)
    const handleWindowFocus = async () => {
      if (hasCompletedInitialLoadRef.current) {
        await handleVisibilityChange();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Process critical auth events immediately - these are needed for session recovery after tab switches
      if (_event === 'TOKEN_REFRESHED' || _event === 'SIGNED_IN') {
        // Token was refreshed or user was signed in - reload user to ensure everything is in sync
        // Only reload if initial load is complete to avoid double-loading
        if (hasCompletedInitialLoadRef.current) {
          await loadCurrentUser();
        } else {
          // Still in initial load, let the initial load process handle it
          // But don't skip it completely - we need to ensure user gets loaded
          // If we're here, it means initial load hasn't completed yet, so let it continue
        }
        return;
      }
      
      if (_event === 'INITIAL_SESSION') {
        // INITIAL_SESSION fires when Supabase initializes - handle it appropriately
        if (hasCompletedInitialLoadRef.current) {
          // Initial load is complete, but we got INITIAL_SESSION (e.g., after tab switch)
          // Only reload if we don't have a current user
          if (!currentUserRef.current) {
            await loadCurrentUser();
          }
        }
        // If still in initial load, let the initial load process handle it
        return;
      }
      
      // Don't process other auth state changes during initial load
      // Only process after initial load is complete
      if (isInitialLoad || !hasCompletedInitialLoad || !hasCompletedInitialLoadRef.current) {
        console.log("Skipping auth state change during initial load:", _event);
        return;
      }
      
      // Only process SIGNED_OUT - SIGNED_IN is handled above
      if (_event === 'SIGNED_OUT') {
        // User signed out, clear the user state
        setCurrentUser(null);
        currentUserRef.current = null;
        setIsLoadingUser(false);
        isLoadingRef.current = false;
      }
    });

    return () => {
      clearTimeout(timeoutId);
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleWindowFocus);
    };
  }, []); // Empty dependency array - we use refs to access current values

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