import express from "express";
import { supabase } from "../config/supabase.js";

const router = express.Router();

// Create a new chat session
router.post("/sessions", async (req, res) => {
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
router.get("/sessions/:userId", async (req, res) => {
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
router.post("/messages", async (req, res) => {
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
router.get("/sessions/:sessionId/messages", async (req, res) => {
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
router.delete("/sessions/:sessionId", async (req, res) => {
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

export default router;
