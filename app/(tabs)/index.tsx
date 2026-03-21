import { RegisterForLocalNotificationsAsync } from '@/lib/notifications';
import { supabase } from '@/lib/supabase';
import { Session } from '@supabase/supabase-js';
import * as Notifications from 'expo-notifications';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Button, FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';

type Note = {
  nid: string;
  uid: string;
  title: string;
  last_changed: string;
  image_url: string;
}

export default function HomeScreen() {  
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null)
  const [notes, setNotes] = useState<Note[]>([])

  const deleteNote = async (nid: string) => {
    Alert.alert(
      "Delete Note",
      "Are you sure you want to delete this note?",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            const { error } = await supabase.from("notes").delete().eq("nid", nid);

            if (error) {
              Alert.alert("Note could not be deleted, please try again");
              return;
            }

            Alert.alert("Note deleted successfully!");
            getNotes();
          }
        }
      ]
    )
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session ?? null))
    const { data: sub } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => sub.subscription.unsubscribe()
    },
  [])

  useEffect(() => {
    if (!session?.user.id) return;

    const EnsureUserExistsInPublic = async () => {
      const {error} = await supabase.from("users").upsert({uid: session.user.id});

      if (error) {
        Alert.alert("A database error has occured");
      }
    }

    EnsureUserExistsInPublic();
  }, [session]);

  useEffect(() => {
    if (session) {
      RegisterForLocalNotificationsAsync();
    }
  }, [session])

  useEffect(() => {
    if (!session?.user.id) return;

    const channel = supabase
      .channel(`notifications-${session.user.id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `rid=eq.${session.user.id}`,
        },
        async (payload) => {
          const row = payload.new as {
            nid: string;
            sid: string;
            rid: string;
            title: string;
          };

          await Notifications.scheduleNotificationAsync({
            content: {
              title: row.title,
              body: "A user added a new note",
            },
            trigger: null,
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [session]);

  useFocusEffect(
    useCallback(() => {
      if (session) {
        getNotes();
      }
    }, [session])
  );

  const getNotes = async () => { 
    if(!session) return;
    const { data, error } = await supabase.from("notes").select("nid, uid, title, last_changed, image_url").order("last_changed", { ascending: false });

    if (error) {
      Alert.alert("Note could not be fetched, please try again");
      return;
    }

    setNotes(data ?? []);
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Job Notes",
          headerTitleStyle: styles.topOfScreen,
          headerRight: () => {
            const label = session ? "Logout" : "Sign Up"

            return (
              <Pressable
                onPress={async () => {
                  if (session) {
                    await supabase.auth.signOut()
                  } else {
                    router.push("../createUser")
                  }
                }}
                style={{ marginRight: 16 }}>
                <Text style={styles.topOfScreen}>{label}</Text>
              </Pressable>
            )
          },
        }}
      />

      <View style={styles.container}>
        <Text style={styles.header}>Notes List:</Text>

        <FlatList
          data={notes}
          keyExtractor={(item) => item.nid}
          ListEmptyComponent={<Text>No notes available</Text>}
          renderItem={({ item }) => {
            const isOwner = session?.user.id === item.uid;

            return (
              <View style={styles.container}>
                <View style={styles.noteRow}>
                  <Pressable
                    onPress={() => router.push({pathname: "/noteDetails", params: { nid: item.nid }})}>
                    <View style={styles.noteItem}>
                      <Text style={styles.noteText}>{item.title}</Text>
                    </View>
                  </Pressable>

                  {isOwner && (
                    <View style={styles.buttonContainer}>
                      <Button title="Edit" onPress={() => router.push({pathname: "/updateNote", params: { nid: item.nid }})} />
                      <Button title="Del" onPress={() => deleteNote(item.nid)} />
                    </View>
                  )}
                </View>

                {item.image_url && (
                  <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
                )}
              </View>
            )
          }}
        />  
        <Button title="Add Note" onPress={() => router.push("/addNotes")} />
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
   },
   noteItem: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  noteText: { 
    fontSize: 16,
  },
  topOfScreen: {
    fontSize: 20,
    fontWeight: "500",
  },
  noteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 20,
  },
});
