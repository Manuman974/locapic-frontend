import { useState } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import { useDispatch } from 'react-redux';
import { updateNickname } from '../reducers/user';

export default function HomeScreen({ navigation }) {
  const dispatch = useDispatch();

  const [nickname, setNickname] = useState('');
  const [error, setError] = useState(false); // Ajout d'un état pour gérer l'erreur

  const handleSubmit = () => {
    // Vérification que le nickname n'est pas vide
    if (nickname.trim().length === 2) {
      setError(true);
      return;
    }
    
    setError(false);
    dispatch(updateNickname(nickname));
    navigation.navigate('TabNavigator');
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <Image style={styles.image} source={require('../assets/home-image.jpg')} />
      <Text style={styles.title}>Welcome to Locapic</Text>

      <TextInput 
        placeholder="Nickname" 
        onChangeText={(value) => {
          setNickname(value);
          setError(false); // Réinitialiser l'erreur quand l'utilisateur tape
        }} 
        value={nickname} 
        style={[styles.input, error && styles.inputError]} 
      />
      {error && <Text style={styles.errorText}>Nickname is required</Text>}
      <TouchableOpacity onPress={() => handleSubmit()} style={styles.button} activeOpacity={0.8}>
        <Text style={styles.textButton}>Go to map</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '100%',
    height: '50%',
  },
  title: {
    width: '80%',
    fontSize: 38,
    fontWeight: '600',
  },
  input: {
    width: '80%',
    marginTop: 25,
    borderBottomColor: '#ec6e5b',
    borderBottomWidth: 1,
    fontSize: 18,
  },

  inputError: {
    borderBottomColor: 'red',
  },
  errorText: {
    color: 'red',
    marginTop: 5,
    fontSize: 14,
  },
  
  button: {
    alignItems: 'center',
    paddingTop: 8,
    width: '80%',
    marginTop: 30,
    backgroundColor: '#ec6e5b',
    borderRadius: 10,
    marginBottom: 80,
  },
  textButton: {
    color: '#ffffff',
    height: 30,
    fontWeight: '600',
    fontSize: 16,
  },
});
