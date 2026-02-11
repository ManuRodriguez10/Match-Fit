import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react";
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

/**
 * Fetches auth user and profile data from Supabase.
 * Separated from state management so it can be used for both
 * initial loads (with loading state) and silent refreshes (without loading state).
 */
const fetchUserData = async () => {
  const { data: authData, error: authError } = await supabase.auth.getUser();
  if (authError) {
    throw authError;
  }

  if (!authData?.user) {
    return null;
  }

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
      } else {
        profileData = newProfile;
      }
    } else if (profileError && profileError.message !== 'Profile fetch timeout') {
      console.error("Error fetching profile:", profileError);
    } else {
      profileData = fetchedProfile;
    }
  } catch (error) {
    console.error("Profile fetch error:", error);
  }

  // Merge auth user with profile data
  const user = {
    ...authData.user,
    ...(profileData || {}),
    full_name: profileData?.full_name || authData.user.user_metadata?.full_name || authData.user.email,
    role: profileData?.role || authData.user.user_metadata?.role || null,
    team_role: profileData?.team_role || authData.user.user_metadata?.team_role || null,
    team_id: profileData?.team_id || null,
    jersey_number: profileData?.jersey_number || null,
    position: profileData?.position || null
  };

  return { user: normalizeUser(user), authUser: authData.user, profileData };
};

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const isLoadingRef = useRef(true);
  const currentUserRef = useRef(null);
  const refreshInFlightRef = useRef(false);
  const visibilityHandledRef = useRef(false);

  /**
   * Full load with loading state — used only for initial load and explicit reloads
   * (e.g., after onboarding completion, profile updates).
   */
  const loadCurrentUser = useCallback(async () => {
    setIsLoadingUser(true);
    isLoadingRef.current = true;
    try {
      const result = await fetchUserData();

      if (result) {
        setCurrentUser(result.user);
        currentUserRef.current = result.user;

        // If profile exists but team_role is missing, and user_metadata has it, sync silently
        if (result.profileData && !result.profileData.team_role && result.authUser.user_metadata?.team_role) {
          supabase
            .from('profiles')
            .update({ team_role: result.authUser.user_metadata.team_role })
            .eq('id', result.authUser.id)
            .then(({ error }) => {
              if (error) {
                console.error("Error syncing team_role to profile:", error);
              } else {
                // Silent refresh after syncing — don't show loading
                silentRefreshUser();
              }
            });
        }
      } else {
        setCurrentUser(null);
        currentUserRef.current = null;
      }
    } catch (error) {
      console.log("User not authenticated:", error);
      setCurrentUser(null);
      currentUserRef.current = null;
    } finally {
      setIsLoadingUser(false);
      isLoadingRef.current = false;
    }
  }, []);

  /**
   * Silent refresh — updates user data in the background WITHOUT setting isLoadingUser=true.
   * This is the key fix: tab switches trigger this instead of loadCurrentUser,
   * so the UI never shows a loading screen when returning to the tab.
   */
  const silentRefreshUser = useCallback(async () => {
    // Prevent concurrent silent refreshes
    if (refreshInFlightRef.current) {
      return;
    }
    refreshInFlightRef.current = true;

    try {
      const result = await fetchUserData();

      if (result) {
        setCurrentUser(result.user);
        currentUserRef.current = result.user;
      } else {
        // User is no longer authenticated — clear state, but don't show loading
        setCurrentUser(null);
        currentUserRef.current = null;
        setIsLoadingUser(false);
        isLoadingRef.current = false;
      }
    } catch (error) {
      // On error during silent refresh, keep the existing user state.
      // The user is still seeing the app — don't kick them out for a transient network error.
      console.warn("Silent user refresh failed (keeping existing state):", error.message);
    } finally {
      refreshInFlightRef.current = false;
    }
  }, []);

  useEffect(() => {
    let isInitialLoad = true;
    const hasCompletedInitialLoadRef = { current: false };

    // Start initial load (this one DOES show loading state)
    loadCurrentUser().then(() => {
      hasCompletedInitialLoadRef.current = true;
      isInitialLoad = false;
    }).catch(() => {
      hasCompletedInitialLoadRef.current = true;
      isInitialLoad = false;
    });

    // Timeout fallback to prevent infinite loading on initial load
    const timeoutId = setTimeout(() => {
      if (isLoadingRef.current) {
        console.warn("User loading timed out - forcing loading to complete");
        setIsLoadingUser(false);
        isLoadingRef.current = false;
        hasCompletedInitialLoadRef.current = true;
        isInitialLoad = false;
      }
    }, 3000);

    /**
     * Handle tab visibility changes.
     * When the tab becomes visible again, we do a SILENT session check.
     * We set a flag to debounce against the duplicate 'focus' event.
     */
    const handleVisibilityChange = async () => {
      if (document.hidden || !hasCompletedInitialLoadRef.current) {
        return;
      }

      // Debounce: visibilitychange and focus often fire together
      if (visibilityHandledRef.current) {
        return;
      }
      visibilityHandledRef.current = true;
      // Reset debounce flag after a short delay
      setTimeout(() => { visibilityHandledRef.current = false; }, 500);

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
          // No session — user was logged out while tab was hidden
          if (currentUserRef.current) {
            setCurrentUser(null);
            currentUserRef.current = null;
            setIsLoadingUser(false);
          }
          return;
        }

        // Check if session needs refresh (within 5 minutes of expiry)
        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at;

        if (expiresAt && expiresAt - now < 300) {
          // Refresh session — the TOKEN_REFRESHED event will trigger silentRefreshUser
          const { error: refreshError } = await supabase.auth.refreshSession();
          if (refreshError) {
            console.warn("Error refreshing session on tab return:", refreshError);
          }
        }
        // If session is valid and not expiring, do nothing — user state is already correct
      } catch (error) {
        console.warn("Error in visibility change handler:", error);
      }
    };

    // Fallback for browsers that don't fire visibilitychange reliably
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
      if (_event === 'TOKEN_REFRESHED' || _event === 'SIGNED_IN') {
        if (hasCompletedInitialLoadRef.current) {
          // KEY FIX: Use silent refresh so the UI doesn't flash a loading screen
          await silentRefreshUser();
        }
        return;
      }

      if (_event === 'INITIAL_SESSION') {
        if (hasCompletedInitialLoadRef.current && !currentUserRef.current) {
          // No current user but we got a session — do a silent refresh
          await silentRefreshUser();
        }
        return;
      }

      // Don't process other events during initial load
      if (isInitialLoad || !hasCompletedInitialLoadRef.current) {
        return;
      }

      if (_event === 'SIGNED_OUT') {
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
  }, [loadCurrentUser, silentRefreshUser]);

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