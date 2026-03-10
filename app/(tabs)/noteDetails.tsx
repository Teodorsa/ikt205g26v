import { supabase } from '@/lib/supabase';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Button, StyleSheet, Text, View } from "react-native";

type Note = {
  nid: string;
  title: string;
  text: string;
  last_changed: string;
}

export default function NoteDetails() {
  const router = useRouter();
  const { nid } = useLocalSearchParams<{ nid: string }>();
  const [note, setNote] = useState<Note | null>(null);

  useEffect(() => {
    const getNote = async () => {
      if (!nid) return;

      const { data, error } = await supabase.from("notes").select("*").eq("nid", nid).single();

      if (error) {
        console.error("Error fetching note", error);
        return;
      }

      setNote(data);
    };
    getNote();
  }, [nid]);

  if (!note) return <Text>Note not found</Text>;

  return (
    <>
      <Stack.Screen
        options={{
          title: "Details",
          headerTitleStyle: styles.topOfScreen
        }}
      />

      <View style={styles.container}>
        <Text style={styles.header}>
          {note.title}
        </Text>
        <Text style={styles.noteItem}>
          {note.text}
        </Text>
        <Button title="Back" onPress={() => router.back()} />
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
  },
  header: { 
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
   },
   noteItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  topOfScreen: {
    fontSize: 20,
    fontWeight: "500",
  },
});