import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { supabase } from "./config/supabase.js";

dotenv.config();

// Create Express app and set port
const app = express();
const PORT = process.env.PORT || 3001;

// Utility function to parse and validate employee count from various formats
const validateEmployeeCount = (employeesEstimate) => {
  if (!employeesEstimate || typeof employeesEstimate !== "string") return null;

  // Handle common formats: "1-10", "50+", "100", etc.
  const cleaned = employeesEstimate.trim().toLowerCase();

  if (cleaned.includes("-")) {
    const parts = cleaned.split("-");
    const firstNum = parseInt(parts[0]);
    return isNaN(firstNum) ? null : firstNum;
  }

  if (cleaned.includes("+")) {
    const num = parseInt(cleaned.replace("+", ""));
    return isNaN(num) ? null : num;
  }

  const num = parseInt(cleaned);
  return isNaN(num) ? null : num;
};

// Security and logging middleware
app.use(helmet());
app.use(morgan("combined"));

// Configure CORS to allow frontend connections
app.use(
  cors({
    origin: [
      process.env.FRONTEND_URL || "http://localhost:8000",
      "http://localhost:5173",
      "http://localhost:8001",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json()); // Parse JSON request bodies

// Health check endpoint for monitoring
app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date().toISOString() });
});

// API endpoint for completing basic user onboarding
app.post("/api/onboarding/basic", async (req, res) => {
  try {
    const { userId, fullName, role, companyName, sector, employeesEstimate } =
      req.body;

    // Basic validation
    if (!userId || !fullName || !companyName) {
      return res.status(400).json({
        error: "User ID, full name, and company name are required",
      });
    }

    // First, check if the company already exists
    const { data: existingCompany, error: companyCheckError } = await supabase
      .from("companies")
      .select("id")
      .eq("name", companyName)
      .single();

    let companyId;

    if (companyCheckError && companyCheckError.code !== "PGRST116") {
      console.error("Error checking company:", companyCheckError);
      return res
        .status(500)
        .json({ error: "Failed to check company existence" });
    }

    if (existingCompany) {
      companyId = existingCompany.id;
    } else {
      // Create new company
      const { data: newCompany, error: companyError } = await supabase
        .from("companies")
        .insert([
          {
            name: companyName,
            sector: sector || null,
            employees_estimate: validateEmployeeCount(employeesEstimate),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select("id")
        .single();

      if (companyError) {
        console.error("Error creating company:", companyError);
        return res.status(500).json({ error: "Failed to create company" });
      }

      companyId = newCompany.id;
    }

    // Get user email from Supabase Auth
    const { data: authUser, error: authError } =
      await supabase.auth.admin.getUserById(userId);

    if (authError || !authUser?.user?.email) {
      console.error("Error getting user from auth:", authError);
      return res.status(500).json({ error: "Failed to get user information" });
    }

    // Upsert user profile with company info and mark basic onboarding as complete
    const { data: upsertedUser, error: userUpsertError } = await supabase
      .from("users")
      .upsert({
        id: userId,
        email: authUser.user.email,
        full_name: fullName,
        company_id: companyId,
        company_role: role || "owner",
        onboarding_basic_completed_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userUpsertError) {
      console.error("Error upserting user:", userUpsertError);
      return res.status(500).json({ error: "Failed to update user profile" });
    }

    // Return success response
    const response = {
      message: "Basic onboarding completed successfully",
      user: {
        id: upsertedUser.id,
        fullName: upsertedUser.full_name,
        companyId: upsertedUser.company_id,
        companyRole: upsertedUser.company_role,
        onboardingBasicCompleted: !!upsertedUser.onboarding_basic_completed_at,
      },
      company: {
        id: companyId,
        name: companyName,
        sector: sector,
        employeesEstimate: employeesEstimate,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error("Onboarding error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get onboarding status
app.get("/api/onboarding/status/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        `
        id,
        full_name,
        company_id,
        company_role,
        onboarding_basic_completed_at,
        companies (
          id,
          name,
          sector,
          employees_estimate
        )
      `
      )
      .eq("id", userId)
      .single();

    if (userError) {
      console.error("Error fetching user:", userError);
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      user: {
        id: userData.id,
        fullName: userData.full_name,
        companyId: userData.company_id,
        companyRole: userData.company_role,
        onboardingBasicCompleted: !!userData.onboarding_basic_completed_at,
      },
      company: userData.companies
        ? {
            id: userData.companies.id,
            name: userData.companies.name,
            sector: userData.companies.sector,
            employeesEstimate: userData.companies.employees_estimate,
          }
        : null,
    });
  } catch (error) {
    console.error("Status check error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// =============================================================================
// CHAT API ENDPOINTS
// =============================================================================

// Create a new chat session
app.post("/api/chat/sessions", async (req, res) => {
  try {
    const { userId, title } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .insert([
        {
          owner_user_id: userId,
          title: title || "New Chat",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (sessionError) {
      console.error("Error creating chat session:", sessionError);
      return res.status(500).json({ error: "Failed to create chat session" });
    }

    res.status(201).json(session);
  } catch (error) {
    console.error("Chat session creation error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get user's chat sessions
app.get("/api/chat/sessions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const { data: sessions, error: sessionsError } = await supabase
      .from("chat_sessions")
      .select("*")
      .eq("owner_user_id", userId)
      .order("updated_at", { ascending: false });

    if (sessionsError) {
      console.error("Error fetching chat sessions:", sessionsError);
      return res.status(500).json({ error: "Failed to fetch chat sessions" });
    }

    res.json(sessions || []);
  } catch (error) {
    console.error("Chat sessions fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Send a message and get RAG response
app.post("/api/chat/messages", async (req, res) => {
  try {
    const { sessionId, userId, message } = req.body;

    if (!sessionId || !userId || !message) {
      return res.status(400).json({
        error: "Session ID, user ID, and message are required",
      });
    }

    // First, save the user message
    const { data: userMessage, error: userMessageError } = await supabase
      .from("chat_messages")
      .insert([
        {
          session_id: sessionId,
          user_id: userId,
          role: "user",
          content: message,
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (userMessageError) {
      console.error("Error saving user message:", userMessageError);
      return res.status(500).json({ error: "Failed to save message" });
    }

    // Get company context for enhanced responses
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(
        `
        companies (
          name,
          sector,
          employees_estimate
        )
      `
      )
      .eq("id", userId)
      .single();

    let companyContext = "";
    if (userData?.companies) {
      const company = userData.companies;
      companyContext = `Company: ${company.name}, Sector: ${
        company.sector || "Not specified"
      }, Size: ${company.employees_estimate || "Not specified"} employees`;
    }

    // Call RAG service
    try {
      const ragResponse = await fetch("http://localhost:8001/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question: message,
          company_context: companyContext,
        }),
      });

      if (!ragResponse.ok) {
        throw new Error(
          `RAG service responded with status: ${ragResponse.status}`
        );
      }

      const ragData = await ragResponse.json();
      const assistantResponse = ragData.answer;

      // Save the assistant response
      const { data: assistantMessage, error: assistantMessageError } =
        await supabase
          .from("chat_messages")
          .insert([
            {
              session_id: sessionId,
              user_id: null, // null for assistant messages
              role: "assistant",
              content: assistantResponse,
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

      if (assistantMessageError) {
        console.error("Error saving assistant message:", assistantMessageError);
        return res
          .status(500)
          .json({ error: "Failed to save assistant response" });
      }

      // Update session timestamp
      await supabase
        .from("chat_sessions")
        .update({ updated_at: new Date().toISOString() })
        .eq("id", sessionId);

      res.json({
        userMessage,
        assistantMessage,
      });
    } catch (ragError) {
      console.error("RAG service error:", ragError);

      // Save an error message from assistant
      const errorMessage =
        "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.";

      const { data: assistantMessage } = await supabase
        .from("chat_messages")
        .insert([
          {
            session_id: sessionId,
            user_id: null,
            role: "assistant",
            content: errorMessage,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      res.json({
        userMessage,
        assistantMessage,
        error: "RAG service unavailable",
      });
    }
  } catch (error) {
    console.error("Chat message error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get messages for a chat session
app.get("/api/chat/sessions/:sessionId/messages", async (req, res) => {
  try {
    const { sessionId } = req.params;

    const { data: messages, error: messagesError } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("session_id", sessionId)
      .order("created_at", { ascending: true });

    if (messagesError) {
      console.error("Error fetching messages:", messagesError);
      return res.status(500).json({ error: "Failed to fetch messages" });
    }

    res.json(messages || []);
  } catch (error) {
    console.error("Messages fetch error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a chat session
app.delete("/api/chat/sessions/:sessionId", async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    // Verify ownership before deletion
    const { data: session, error: sessionError } = await supabase
      .from("chat_sessions")
      .select("owner_user_id")
      .eq("id", sessionId)
      .single();

    if (sessionError || !session) {
      return res.status(404).json({ error: "Chat session not found" });
    }

    if (session.owner_user_id !== userId) {
      return res
        .status(403)
        .json({ error: "Not authorized to delete this session" });
    }

    // Delete the session (messages will be cascade deleted)
    const { error: deleteError } = await supabase
      .from("chat_sessions")
      .delete()
      .eq("id", sessionId);

    if (deleteError) {
      console.error("Error deleting chat session:", deleteError);
      return res.status(500).json({ error: "Failed to delete chat session" });
    }

    res.json({ message: "Chat session deleted successfully" });
  } catch (error) {
    console.error("Chat session deletion error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Error handling
app.use((err, req, res, next) => {
  console.error("Server error:", err);
  res.status(500).json({ error: "Internal server error" });
});

const server = app.listen(PORT, () => {
  console.log(`🚀 Raylow backend server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  console.log(`🔗 Onboarding: http://localhost:${PORT}/api/onboarding/basic`);
});

// Graceful shutdown
process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close();
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close();
});
