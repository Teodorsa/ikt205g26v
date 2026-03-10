import { supabase } from '@/lib/supabase';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export default function AddNotes() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');

  const AddNote = async () => {
    if(title.trim() === '' || text.trim() === '') {
      Alert.alert("All fields are required!");
      return;
    }
        
    const { data, error: userError } = await supabase.auth.getUser();

    if(userError || !data.user) {
      router.replace("../createUser");
      return;
    } 

    const { error } = await supabase.from("notes").insert({
      title,
      text,
      last_changed: new Date().toISOString(),
      uid: data.user.id,
    });

    if ( error ) {
      console.error("Error adding note", error);
      return;
    }

    Alert.alert("Note added successfully!");
    setTitle('');
    setText('');
    router.back();
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Add Note",
          headerTitleStyle: styles.topOfScreen
        }}
      />

      <View style={styles.container}>
        <Text style={styles.header}>Add A New Note</Text>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                placeholder="Enter note title"
                value={title}
                onChangeText={setTitle}
              />
              <TextInput
                style={styles.textAreaInput}
                placeholder="Enter note text"
                value={text}
                onChangeText={setText}
              />
              
              <Button title="Save" onPress={AddNote} />
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
