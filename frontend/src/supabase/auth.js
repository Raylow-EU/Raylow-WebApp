import { supabase } from "./config.js";

// Creates a new user account with email/password in Supabase Auth
export const registerWithEmailAndPassword = async (
  email,
  password,
  fullName
) => {
  try {
    // Sign up user with Supabase Auth only - no database operations here
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (authError) {
      console.error("Supabase auth error details:", authError);
      throw new Error(authError.message || "Authentication failed");
    }

    console.log("User registered successfully, requires onboarding");
    return authData.user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

// Authenticates user with email/password and returns user object
export const loginWithEmailAndPassword = async (email, password) => {
  try {
    console.log("Attempting login with email:", email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Supabase auth error:", error);
      throw new Error(error.message);
    }

    console.log("Login successful, user:", data.user);
    return data.user;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Signs out user and clears all local storage/session data
export const logoutUser = async () => {
  try {
    // Force clear all storage first
    localStorage.clear();
    sessionStorage.clear();

    // Try Supabase signOut with timeout
    const signOutPromise = supabase.auth.signOut();
    const timeoutPromise = new Promise(
      (resolve) => setTimeout(() => resolve({ error: null }), 2000) // Resolve after 2 seconds
    );

    await Promise.race([signOutPromise, timeoutPromise]);
  } catch (error) {
    console.error("Logout error:", error);
    // Ensure cleanup even if there's an error
    localStorage.clear();
    sessionStorage.clear();
    // Don't throw error - we want logout to succeed
  }
};

// Fetches extended user data from database (company info, onboarding status, etc.)
export const fetchUserData = async (uid) => {
  console.log("🔍 Fetching user data from backend API for uid:", uid);

  try {
    // Use backend API instead of direct Supabase query to avoid RLS issues
    const response = await fetch(`http://localhost:3001/api/onboarding/status/${uid}`);

    if (!response.ok) {
      throw new Error(`Backend API error: ${response.status}`);
    }

    const data = await response.json();
    console.log("✅ Got user data from backend:", data);

    const userData = {
      uid: data.user.id,
      email: data.user.email || "", // Backend might not return email
      displayName: data.user.fullName || "",
      companyId: data.user.companyId,
      companyRole: data.user.companyRole,
      onboardingBasicCompleted: data.user.onboardingBasicCompleted,
      company: data.company,
    };

    console.log("✅ Returning user data from backend:", userData);
    return userData;
  } catch (error) {
    console.error("💥 Backend API failed, falling back to auth data:", error);

    // Fallback to basic auth data if backend fails
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user && user.id === uid) {
      const basicUserData = {
        uid: user.id,
        email: user.email,
        displayName: user.user_metadata?.full_name || "",
        companyId: null,
        companyRole: null,
        onboardingBasicCompleted: false, // Assume needs onboarding if backend fails
        company: null,
      };
      console.log("✅ Returning fallback auth data:", basicUserData);
      return basicUserData;
    }

    throw new Error("Could not fetch user data from any source");
  }
};

// Creates a new user profile in the database when user doesn't exist in users table
export const createUserProfile = async (uid, userAuth = null) => {
  try {
    console.log("🆕 Creating user profile for uid:", uid);

    // If userAuth is not provided, get current user
    let user = userAuth;
    if (!user) {
      console.log("🔐 Getting current user from auth...");
      const {
        data: { user: currentUser },
        error: authError,
      } = await supabase.auth.getUser();

      if (authError) {
        console.error("❌ Auth error:", authError);
        throw new Error(
          "Could not fetch current user from auth: " + authError.message
        );
      }

      if (!currentUser || currentUser.id !== uid) {
        console.error("❌ User mismatch or not found:", {
          currentUser: currentUser?.id,
          requestedUid: uid,
        });
        throw new Error(
          "Could not fetch current user from auth - user mismatch"
        );
      }

      user = currentUser;
      console.log("✅ Got current user:", user.email);
    }

    // Create user profile in database
    console.log("💾 Creating user profile in database...");
    const profileData = {
      id: uid,
      email: user.email,
      full_name: user.user_metadata?.full_name || "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    console.log("📝 Profile data to insert:", profileData);

    // Add timeout to insert operation
    const insertPromise = supabase
      .from("users")
      .insert([profileData])
      .select()
      .single();

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Database insert timeout after 5 seconds")),
        5000
      )
    );

    const { data, error } = await Promise.race([insertPromise, timeoutPromise]);

    if (error) {
      console.error("❌ Database insert error:", error);
      throw error;
    }

    console.log("✅ User profile created successfully:", data.id);

    const userData = {
      uid: data.id,
      email: data.email,
      displayName: data.full_name,
      companyId: null,
      companyRole: null,
      onboardingBasicCompleted: false,
      company: null,
    };

    console.log("📤 Returning user data:", userData);
    return userData;
  } catch (error) {
    console.error("💥 Error creating user profile:", error);
    throw error;
  }
};

// Gets the current authenticated user from Supabase Auth
export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

// Sets up a listener for authentication state changes (login/logout)
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};
