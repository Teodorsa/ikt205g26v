import { GetImageUrl, UploadImage, ValidateImage } from '@/lib/imageUtils';
import { supabase } from '@/lib/supabase';
import * as ImagePicker from "expo-image-picker";
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, Image, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export default function AddNotes() {
  const router = useRouter();
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [image, setImage] = useState<any | null>(null);
  const [isSaving, setIsSaving] = useState(false);

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

    setIsSaving(true);

    try {
      let imageUrl = null;

      if (image) {
        const path = await UploadImage(image, data.user.id);

        imageUrl = GetImageUrl(path);
      }

      const { error } = await supabase.from("notes").insert({
        title,
        text,
        last_changed: new Date().toISOString(),
        image_url: imageUrl,
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
    catch {
      Alert.alert("Image upload failed")
    }
    finally {
      setIsSaving(false);
    }
  }

  const TakeImage = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Camera permission not granted");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    const validationError = ValidateImage(asset);

    if (validationError) {
      Alert.alert(validationError);
      return;
    }
        
    setImage(asset);
  }

  const PickImage = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Gallery permission not granted");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: false,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    const validationError = ValidateImage(asset);

    if (validationError) {
      Alert.alert(validationError);
      return;
    }

    setImage(asset);
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
              {image ? (
                <View style={styles.image}>
                  <Image source={{ uri: image.uri }} style={styles.image} resizeMode="contain" />
                </View>
              ) : (
                <Text style={styles.text}>No image selected</Text>
              )}
              <View style={styles.buttonContainer}>
                <Button title="Camera" onPress={TakeImage} />
                <Button title="Gallery" onPress={PickImage} />
                <Button title="Remove" onPress={() => setImage(null)} />
              </View>
              <Button title={isSaving ? "Saving..." : "Save"} onPress={AddNote} disabled={isSaving} />
              {isSaving && (
                <ActivityIndicator size="large" />
              )}
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
  buttonContainer: {
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginBottom: 20,
  },
  image: {
    width: "100%",
    height: 180,
    borderRadius: 10,
    marginTop: 8,
    marginBottom: 20,
  },
  text: {
    textAlign: "center",
    marginBottom: 10,
  },
});
