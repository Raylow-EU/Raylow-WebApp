import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUser, setLoading } from "../../store/slices/authSlice";
import { onAuthStateChange, fetchUserData, getCurrentUser } from "../../supabase/auth";

const AuthStateListener = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log("Setting up auth state listener");
    dispatch(setLoading(true));

    // Helper function to process user data
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

        try {
          // Fetch additional user data from Supabase
          console.log("Fetching additional user data for:", user.id);
          const userData = await fetchUserData(user.id);
          console.log("Fetched user data:", userData);

          // Combine base user data with Supabase data
          const completeUserData = {
            ...baseUserData,
            isAdmin: userData?.isAdmin || false,
            onboardingCompleted: userData?.onboardingCompleted || false,
          };

          console.log("Setting complete user data in Redux:", completeUserData);
          dispatch(setUser(completeUserData));
        } catch (error) {
          console.error("Error fetching extended user data:", error);
          console.log("Setting basic user data in Redux instead:", baseUserData);
          dispatch(setUser(baseUserData));
        }
      } else {
        console.log("No user found, setting null");
        dispatch(setUser(null));
      }

      // Set loading to false
      console.log("Setting loading to false");
      dispatch(setLoading(false));
    };

    // Check for existing session immediately
    const checkExistingSession = async () => {
      try {
        const { data: { user } } = await getCurrentUser();
        console.log("Initial session check:", user ? "User exists" : "No user", { user });
        await processUser(user);
      } catch (error) {
        console.error("Error checking existing session:", error);
        dispatch(setUser(null));
        dispatch(setLoading(false));
      }
    };

    // Check for existing session first
    checkExistingSession();

    // Set up listener for auth state changes
    const { data: { subscription } } = onAuthStateChange(async (event, session) => {
      console.log("Auth state changed", session ? "User exists" : "No user", { event, session });
      await processUser(session?.user);
    });

    // Cleanup the listener on unmount
    return () => subscription.unsubscribe();
  }, [dispatch]);

  return children;
};

export default AuthStateListener;