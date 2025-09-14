import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, setLoading } from "../../store/slices/authSlice";
import {
  onAuthStateChange,
  fetchUserData,
  getCurrentUser,
} from "../../supabase/auth";

// Component that listens for authentication state changes and updates Redux store
const AuthStateListener = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Setting up auth state listener");
    // Don't set loading true here - it blocks the entire UI

    // Helper function that processes user data and updates Redux store
    const processUser = async (user) => {
      console.log("processUser called with user:", user);

      if (user) {
        // Extract basic serializable properties from the user object
        const baseUserData = {
          uid: user.id,
          email: user.email,
          displayName: user.user_metadata?.full_name || "",
        };

        console.log("Base user data:", baseUserData);

        // Set basic user data immediately so login works
        console.log("Setting basic user data in Redux:", baseUserData);
        dispatch(setUser(baseUserData));
        console.log("✅ Basic user data set in Redux");

        // Set loading to false immediately so the UI can proceed
        dispatch(setLoading(false));

        // Try to fetch extended user data in background (non-blocking)
        setTimeout(async () => {
          try {
            console.log("Fetching additional user data for:", user.id);
            const userData = await fetchUserData(user.id);
            console.log("Fetched extended user data:", userData);
            console.log("🔍 Full userData properties:", {
              onboardingBasicCompleted: userData?.onboardingBasicCompleted,
              companyId: userData?.companyId,
              companyRole: userData?.companyRole,
              displayName: userData?.displayName,
            });

            // Update user data directly with the complete data
            const completeUserData = {
              ...baseUserData,
              companyId: userData?.companyId || null,
              companyRole: userData?.companyRole || null,
              onboardingBasicCompleted:
                userData?.onboardingBasicCompleted || false,
              company: userData?.company || null,
            };

            console.log(
              "🔄 Updating with complete user data in Redux:",
              completeUserData,
              "Original userData:",
              userData
            );

            dispatch(setUser(completeUserData));
          } catch (error) {
            console.error("💥 Error fetching extended user data:", error);
            console.log("🔄 Continuing with basic user data only");
            // User is already logged in with basic data, so this is fine
          }
        }, 100); // Small delay to ensure UI updates first
      } else {
        console.log("👤 No user found, setting Redux state to null");
        dispatch(setUser(null));
        console.log("✅ Redux user state cleared");
        // Set loading to false
        dispatch(setLoading(false));
      }
    };

    // Checks if user is already logged in when app starts
    const checkExistingSession = async () => {
      try {
        const {
          data: { user },
        } = await getCurrentUser();
        console.log(
          "Initial session check:",
          user ? "User exists" : "No user",
          { user }
        );
        await processUser(user);
      } catch (error) {
        console.error("Error checking existing session:", error);
        dispatch(setUser(null));
        dispatch(setLoading(false));
      }
    };

    // Check for existing session first
    checkExistingSession();

    // Set up listener for auth state changes (login/logout events)
    const {
      data: { subscription },
    } = onAuthStateChange(async (event, session) => {
      console.log(
        "🔔 Auth state changed:",
        event,
        session ? "User exists" : "No user",
        { event, session }
      );
      if (event === "SIGNED_OUT") {
        console.log("👋 User signed out detected");
      }
      await processUser(session?.user);
    });

    // Cleanup the listener when component unmounts
    return () => subscription.unsubscribe();
  }, [dispatch]);

  return children;
};

export default AuthStateListener;