import { supabase } from '../supabaseClient';

// Create a new conversation
export async function createConversation(sessionId, title = "New Chat") {
  const { data, error } = await supabase
    .from("conversations")
    .insert([{ session_id: sessionId, title }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Add a message to a conversation
export async function addMessage(conversationId, role, content) {
  const { data, error } = await supabase
    .from("messages")
    .insert([{ conversation_id: conversationId, role, content }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Fetch all conversations for a session
export async function getConversations(sessionId) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("session_id", sessionId)
    .order("updated_at", { ascending: false });

  if (error) throw error;
  return data;
}

// Fetch messages for a conversation
export async function getMessages(conversationId) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data;
}
