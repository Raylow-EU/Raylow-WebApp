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
  try {
    console.log("🔍 Fetching user data from database for uid:", uid);

    // First, let's try a simple query to test permissions
    console.log("🔍 Testing database connection and permissions...");
    const testQuery = supabase
      .from("users")
      .select("id, email")
      .eq("id", uid)
      .limit(1);

    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error("Database query timeout after 3 seconds")),
        3000
      )
    );

    const { data: testData, error: testError } = await Promise.race([
      testQuery,
      timeoutPromise,
    ]);

    if (testError) {
      console.error("❌ Database connection/permission error:", testError);
      console.log("🔍 Error details:", {
        code: testError.code,
        message: testError.message,
        details: testError.details,
        hint: testError.hint,
      });

      // If it's a permission issue, throw a more specific error
      if (
        testError.code === "42501" ||
        testError.message?.includes("permission")
      ) {
        throw new Error(
          "Database permission denied. Please check RLS policies."
        );
      }

      throw testError;
    }

    if (!testData || testData.length === 0) {
      console.log("👤 User not found in database, creating profile...");
      const createdUser = await createUserProfile(uid);
      console.log("✅ User profile created:", createdUser);
      return createdUser;
    }

    console.log("✅ Basic query successful, fetching full user data...");

    // Now fetch the full user data
    const fullQuery = supabase
      .from("users")
      .select(
        `
        id,
        email,
        full_name,
        company_id,
        company_role,
        onboarding_basic_completed_at
      `
      )
      .eq("id", uid)
      .single();

    const { data, error } = await Promise.race([fullQuery, timeoutPromise]);

    if (error) {
      console.error("❌ Full query error:", error);
      throw error;
    }

    console.log("🔍 Raw database data:", {
      id: data.id,
      email: data.email,
      full_name: data.full_name,
      company_id: data.company_id,
      company_role: data.company_role,
      onboarding_basic_completed_at: data.onboarding_basic_completed_at,
    });

    const userData = {
      uid: data.id,
      email: data.email,
      displayName: data.full_name,
      companyId: data.company_id,
      companyRole: data.company_role,
      onboardingBasicCompleted: !!data.onboarding_basic_completed_at,
      company: null, // We'll fetch company data separately if needed
    };

    console.log("✅ User data fetched successfully:", userData);
    console.log("🔍 Onboarding flag details:", {
      rawValue: data.onboarding_basic_completed_at,
      booleanValue: !!data.onboarding_basic_completed_at,
    });
    return userData;
  } catch (error) {
    console.error("💥 Error fetching user data:", error);

    // If database is having issues, return basic user data from auth
    console.log("🔄 Falling back to basic auth user data");
    try {
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
          onboardingBasicCompleted: false,
          company: null,
        };
        console.log("✅ Returning basic user data:", basicUserData);
        return basicUserData;
      }
    } catch (fallbackError) {
      console.error("💥 Fallback also failed:", fallbackError);
    }

    throw error;
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
