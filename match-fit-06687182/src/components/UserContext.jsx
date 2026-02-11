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

  const loadCurrentUser = async (options = {}) => {
    const { silent = false } = options;
    if (!silent) {
      setIsLoadingUser(true);
      isLoadingRef.current = true;
    }

    // Timeout fallback for ANY load - prevents infinite loading on hung requests (e.g. tab switch)
    const LOAD_TIMEOUT_MS = 5000;
    const loadTimeoutId = setTimeout(() => {
      if (isLoadingRef.current) {
        console.warn("loadCurrentUser timed out - clearing loading state");
        setIsLoadingUser(false);
        isLoadingRef.current = false;
      }
    }, LOAD_TIMEOUT_MS);

    try {
      // Add timeout around getUser - can hang when tab was suspended
      const getUserPromise = supabase.auth.getUser();
      const getUserTimeout = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("getUser timeout")), 3000)
      );
      const { data: authData, error: authError } = await Promise.race([getUserPromise, getUserTimeout]);
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
      console.log("User load error:", error);

      // Don't clear user on timeout - preserve existing session (common after tab switch)
      const isTimeout = error?.message === "getUser timeout" ||
                       error?.message === "Profile fetch timeout";
      if (isTimeout && currentUserRef.current) {
        // Keep existing user - don't "log out" on transient timeout
        return;
      }

      // Check if this is an invalid JWT error (403, user doesn't exist)
      const isInvalidJWT = error?.status === 403 ||
                          error?.message?.includes("User from sub claim in JWT does not exist") ||
                          error?.message?.includes("JWT") ||
                          error?.code === 'invalid_token';

      // If invalid JWT, clear the session to remove stale token
      if (isInvalidJWT) {
        console.log("Invalid JWT detected, clearing session...");
        try {
          await supabase.auth.signOut({ scope: 'local' });
        } catch (signOutError) {
          console.warn("Error clearing session:", signOutError);
        }
      }

      setCurrentUser(null);
      currentUserRef.current = null;
    } finally {
      clearTimeout(loadTimeoutId);
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
        // If we've been loading for a long time (possible hung load), force clear and retry
        if (isLoadingRef.current) {
          console.warn("Visibility change: clearing stuck loading state and retrying");
          setIsLoadingUser(false);
          isLoadingRef.current = false;
          await loadCurrentUser({ silent: true });
          return;
        }
        // Tab became visible and initial load is complete
        try {
          // Check if we have a session
          const { data: { session }, error: sessionError } = await supabase.auth.getSession();
          
          if (sessionError || !session) {
            // getSession() can falsely return null after tab suspension
            // If we already have a user, trust it - don't reload
            // Only reload if we don't have a user
            if (!currentUserRef.current) {
              await loadCurrentUser({ silent: true });
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

    // Handle page restore from bfcache (back/forward navigation)
    const handlePageShow = (event) => {
      if (event.persisted && hasCompletedInitialLoadRef.current) {
        // Only reload if we don't already have a user
        if (!currentUserRef.current) {
          loadCurrentUser({ silent: true });
        }
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleWindowFocus);
    window.addEventListener('pageshow', handlePageShow);

    const {
      data: { subscription }
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      // Process critical auth events immediately - these are needed for session recovery after tab switches
      if (_event === 'TOKEN_REFRESHED' || _event === 'SIGNED_IN') {
        // Token was refreshed or user was signed in - reload user to ensure everything is in sync
        // Use silent:true to avoid showing loading spinner on tab focus (prevents stuck spinner)
        if (hasCompletedInitialLoadRef.current) {
          await loadCurrentUser({ silent: true });
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
          // Only reload if we don't have a current user - use silent to avoid stuck spinner
          if (!currentUserRef.current) {
            await loadCurrentUser({ silent: true });
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
      window.removeEventListener('pageshow', handlePageShow);
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
