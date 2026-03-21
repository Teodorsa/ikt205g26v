import { supabase } from '@/lib/supabase';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useState } from 'react';
import { Alert, Button, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export default function UpdateNote() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const { nid } = useLocalSearchParams();

  useFocusEffect(
    useCallback(() => {
      const getNote = async () => {
        if (!nid) return;

        const { data, error } = await supabase.from("notes").select("*").eq("nid", nid).single();

        if (error) {
            Alert.alert("Note not found");
            return;
        }

        if (data) {
            setTitle(data.title);
            setText(data.text);
        }
        }
        getNote();
    }, [nid])
  );

  const UpdateNote = async () => {
    if(title.trim() === '' || text.trim() === '') {
      Alert.alert("All fields are required!");
      return;
    }
        
    const { data, error: userError } = await supabase.auth.getUser();

    if(userError || !data.user) {
      router.replace("../createUser");
      return;
    } 

    const { error } = await supabase.from("notes").update({
      title,
      text,
      last_changed: new Date().toISOString(),
    }).eq("nid", nid);

    if (error) {
      Alert.alert("Note could not be updated, please try again");
      return;
    }

    Alert.alert("Note updated successfully!");
    setTitle('');
    setText('');
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Update Note",
          headerTitleStyle: styles.topOfScreen
        }}
      />

      <View style={styles.container}>
        <Text style={styles.header}>Update Note</Text>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                placeholder="Title"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={styles.textAreaInput}
                placeholder="Text"
                value={text}
                onChangeText={setText}
              />
              
              <Button title="Save" onPress={UpdateNote} />
              <Button title="Cancel" onPress={() => router.back()} />
            </View>
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  header: { 
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
   },
  container: { 
  flex: 1, 
  padding: 20, 
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
  textAreaInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    minHeight: 120,
    textAlignVertical: "top",
  },
  topOfScreen: {
    fontSize: 20,
    fontWeight: "500",
  },
});
