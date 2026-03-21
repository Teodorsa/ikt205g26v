import { supabase } from "@/lib/supabase";
import { Stack, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Button, Keyboard, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableWithoutFeedback, View } from "react-native";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');  

  const login = async () => {
    if(email.trim() === '' || password.trim() === '') {
      Alert.alert("All fields are required!");
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      Alert.alert("Login failed, please try again");
      return;
    }

    router.replace("/");
  }

  return (
    <>
      <Stack.Screen
        options={{
          title: "Login",
          headerTitleStyle: styles.topOfScreen
        }}
      />

      <View style={styles.container}>
        <Text style={styles.header}>Login</Text>
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
              <Button title="Login" onPress={login} />
              <Button title="Cancel" onPress={() => router.push("/")} />
            </View>   
          </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </View>
    </>
  )
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
  topOfScreen: {
    fontSize: 20,
    fontWeight: "500",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
  },
});
