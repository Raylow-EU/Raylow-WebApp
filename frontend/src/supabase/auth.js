import { supabase } from "./config.js";

export const registerWithEmailAndPassword = async (
  email,
  password,
  fullName,
  companyData = null
) => {
  try {
    // Sign up user with Supabase Auth
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

    // If user is created and confirmed, set up their profile
    if (authData.user && !authError) {
      // Create user profile in database
      const { error: dbError } = await supabase.from("users").insert([
        {
          id: authData.user.id,
          email: email,
          full_name: fullName,
          company_name: companyData?.companyName || null,
          is_admin: false,
          onboarding_completed: !!companyData,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (dbError) {
        console.error("Error creating user profile:", dbError);
        // Don't throw here, user is still created in auth
      }

      // Create onboarding record if company data is provided
      if (companyData) {
        const { error: onboardingError } = await supabase
          .from("user_onboarding")
          .insert([
            {
              user_id: authData.user.id,
              company_name: companyData.companyName,
              completed: true,
              completed_at: new Date().toISOString(),
            },
          ]);

        if (onboardingError) {
          console.error("Error creating onboarding record:", onboardingError);
        }
      }
    }

    return authData.user;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
};

export const loginWithEmailAndPassword = async (email, password) => {
  try {
    console.log("Attempting login with email:", email);

    // Use backend login API instead of direct Supabase
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/auth/login`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Login failed");
    }

    console.log("Login successful, user:", data.user);

    // Return user in the same format as Supabase
    return {
      id: data.user.uid,
      email: data.user.email,
      user_metadata: {
        full_name: data.user.displayName,
      },
    };
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const loginWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${window.location.origin}/dashboard`,
    },
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};

export const logoutUser = async () => {
  const { error } = await supabase.auth.signOut();
  if (error) {
    throw new Error(error.message);
  }
};

export const fetchUserData = async (uid) => {
  try {
    const { data, error } = await supabase
      .from("users")
      .select(
        "id, email, full_name, is_admin, onboarding_completed, onboarding_basic_completed_at"
      )
      .eq("id", uid)
      .single();

    if (error) {
      throw error;
    }

    return {
      uid: data.id,
      email: data.email,
      displayName: data.full_name,
      isAdmin: data.is_admin,
      onboardingCompleted: data.onboarding_completed,
      onboardingBasicCompleted: !!data.onboarding_basic_completed_at,
    };
  } catch (error) {
    console.error("Error fetching user data:", error);
    throw error;
  }
};

// Get current user session
export const getCurrentUser = () => {
  return supabase.auth.getUser();
};

// Listen to auth state changes
export const onAuthStateChange = (callback) => {
  return supabase.auth.onAuthStateChange(callback);
};
