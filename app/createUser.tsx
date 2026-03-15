import { supabase } from '@/lib/supabase';
import { Stack, useRouter } from 'expo-router';
import { useState } from 'react';
import { Alert, Button, Keyboard, KeyboardAvoidingView, Platform, Pressable, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from 'react-native';

export default function CreateUser() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const SignUp = async () => {
    if(email.trim() === '' || password.trim() === '') {
      Alert.alert("All fields are required!");
      return;
    }

    const {data, error} = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if(!error) {
      router.replace("/");
    }
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Create User",
          headerTitleStyle: styles.topOfScreen
        }}
      />
      <View style={styles.container}>
        <Text style={styles.header}>Create User</Text>
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.container}>
              <TextInput
                style={styles.input}
                placeholder="Enter Email"
                value={email}
                onChangeText={setEmail}   
                autoCapitalize="none"
              />
              <TextInput
                style={styles.input}
                placeholder="Enter Password"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
                
              <Button title="Save" onPress={SignUp} />
              <Button title="Cancel" onPress={() => router.back()} />

              <Pressable
                onPress={() => router.push("/login")}
                style={{ marginRight: 16 }}>
                <Text style={styles.informationText}>Already have an Account? login here</Text>
              </Pressable>
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
  informationText: {
    color: "blue",
    textDecorationLine: "underline",
    textAlign: "center",
    marginTop: 10,
  },
  topOfScreen: {
    fontSize: 20,
    fontWeight: "500",
  },
});
