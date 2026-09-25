import { createClient } from "@/lib/supabaseClient";
import LockInTimer from "@/components/LockInTimer";

export default async function FocusPage() {
  const supabase = createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <main style={{ padding: "40px 16px", minHeight: "100vh", background: "#0B1F3A" }}>
      <LockInTimer userId={session?.user?.id} />
    </main>
  );
}
