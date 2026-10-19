import { createClient } from "@/lib/supabaseClient";

type Details = { path?: string; docId?: string; docTitle?: string };

// Records what a signed-in person is doing. Returns true if it was saved.
export async function logActivity(event: string, d: Details = {}): Promise<boolean> {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase.from("activity_log").insert({
      user_id: user.id,
      email: user.email ?? null,
      event,
      path: d.path ?? (typeof window !== "undefined" ? window.location.pathname : null),
      doc_id: d.docId ?? null,
      doc_title: d.docTitle ?? null,
    });
    return !error;
  } catch {
    return false;
  }
}
