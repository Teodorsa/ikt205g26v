import { supabase } from "@/lib/supabase";
import { Session } from "@supabase/supabase-js";
import { Redirect, Tabs } from "expo-router";
import { useEffect, useState } from "react";

export default function TabLayout() {
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSession = async () => {
      const { data } = await supabase.auth.getSession();
      setSession(data.session ?? null);
      setLoading(false);
    }
    loadSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      setLoading(false);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) {
    return null;
  }

  if (!session) {
    return <Redirect href="/createUser" />;
  }

  return (
    <Tabs>
      <Tabs.Screen name="index" options={{title: "Job Notes"}} />
      <Tabs.Screen name="addNotes" options={{ title: "Add a Note"}} />
      <Tabs.Screen name="noteDetails" options={{ title: "Note Details"}} />
      <Tabs.Screen name="updateNote" options={{ title: "Update Note"}} />
    </Tabs>
  );
}