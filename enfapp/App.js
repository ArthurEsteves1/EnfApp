import React, { useState, useEffect } from 'react';
import {View, Text, TextInput, StyleSheet, Alert, Image, FlatList, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';
import * as Notifications from 'expo-notifications';
import { Ionicons } from '@expo/vector-icons';

const Tab = createBottomTabNavigator();
const encryptionKey = "chave-secreta-segura";
const encryptPassword = (password) => CryptoJS.AES.encrypt(password, encryptionKey).toString();
const decryptPassword = (encryptedPassword) => {
const bytes = CryptoJS.AES.decrypt(encryptedPassword, encryptionKey);
return bytes.toString(CryptoJS.enc.Utf8);
};

function RegisterScreen({ onRegisterSuccess }) {
const [username, setUsername] = useState('');
const [password, setPassword] = useState('');

const handleRegister = async () => {
  if (!username || !password) {
    Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    try {
      const storedUsername = await AsyncStorage.getItem('username');
      if (storedUsername === username) {
        Alert.alert("Erro", "Nome de usuário já cadastrado");
        return;
      }

      const encryptedPassword = encryptPassword(password);
      await AsyncStorage.setItem('username', username);
      await AsyncStorage.setItem('password', encryptedPassword);

      Alert.alert("Sucesso", "Conta criada com sucesso");
      onRegisterSuccess();
    } catch (error) {
      console.error("Erro ao armazenar dados: ", error);
    }
  };

  return (
    <View style={styles.container}>
    <Image source={require('./assets/saude_image.png')} style={styles.logo} />
      <Text style={styles.title}>Cadastrar</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: '#000000' }]}
        onPress={handleRegister}
      >
        <Text style={styles.addButtonText}>Cadastrar</Text>
      </TouchableOpacity>
    </View>
  );
}

function LoginScreen({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      Alert.alert("Erro", "Preencha todos os campos");
      return;
    }

    try {
      const storedUsername = await AsyncStorage.getItem('username');
      const storedPassword = await AsyncStorage.getItem('password');

      if (storedUsername === username && storedPassword) {
        const decryptedPassword = decryptPassword(storedPassword);

        if (decryptedPassword === password) {
          Alert.alert("Sucesso", "Login realizado com sucesso");
          onLoginSuccess();
        } else {
          Alert.alert("Erro", "Senha incorreta");
        }
      } else {
        Alert.alert("Erro", "Usuário não encontrado");
      }
    } catch (error) {
      console.error("Erro ao verificar dados: ", error);
    }
  };

  return (
    <View style={styles.container}>
      <Image source={require('./assets/saude_image.png')} style={styles.logo} />

      <Text style={styles.title}>Login</Text>
      <TextInput
        style={styles.input}
        placeholder="Usuário"
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: '#6A0DAD' }]}
        onPress={handleLogin}
      >
        <Text style={styles.addButtonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const clearData = async (key, setState) => {
  await AsyncStorage.removeItem(key);
  setState([]);
};

function SaudeScreen() {
  const [dores, setDores] = useState({});
  const [dor, setDor] = useState('');
  const [selectedDay, setSelectedDay] = useState('Segunda');

  const daysOfWeek = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  useEffect(() => {
    const fetchDores = async () => {
      const storedDores = await AsyncStorage.getItem('dores');
      if (storedDores) {
        setDores(JSON.parse(storedDores));
      }
    };
    fetchDores();
  }, []);

  const handleAddDor = async () => {
    if (!dor) {
      Alert.alert("Erro", "Descreva os seus sintomas");
      return;
    }

    const newDores = { ...dores, [selectedDay]: [...(dores[selectedDay] || []), dor] };
    setDores(newDores);
    await AsyncStorage.setItem('dores', JSON.stringify(newDores));
    setDor('');
  };

  const clearSingleItem = async (itemIndex) => {
    const updatedDayDores = (dores[selectedDay] || []).filter((_, index) => index !== itemIndex);
    const updatedDores = { ...dores, [selectedDay]: updatedDayDores };
    setDores(updatedDores);
    await AsyncStorage.setItem('dores', JSON.stringify(updatedDores));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Registro de Sintomas</Text>

      <Ionicons name="pulse-outline" size={30} color="gray" style={{ marginBottom: 20 }} />

      <Text>Selecione o Dia:</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {daysOfWeek.map((day) => (
          <TouchableOpacity
            key={day}
            onPress={() => setSelectedDay(day)}
            style={{
              backgroundColor: selectedDay === day ? 'lightblue' : 'lightgray',
              padding: 10,
              margin: 5,
              borderRadius: 5,
            }}
          >
            <Text>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Descreva os sintomas de hoje"
        value={dor}
        onChangeText={setDor}
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: '#8B0000' }]}
        onPress={handleAddDor}
      >
        <Text style={styles.addButtonText}>Adicionar Sintoma</Text>
      </TouchableOpacity>

       <TouchableOpacity
  style={[styles.clearButton, { backgroundColor: '#FF0000' }]} 
  onPress={() => clearData('dores', setDores)}
>
  <Text style={styles.addButtonText}>Limpar tudo</Text>
</TouchableOpacity>

      <FlatList
        data={dores[selectedDay] || []}
        renderItem={({ item, index }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
            <Text style={{ flex: 1 }}>{item}</Text>
            <TouchableOpacity
              onPress={() => clearSingleItem(index)}
              style={{
                backgroundColor: '#FF0000',
                padding: 5,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                width: 24,
                height: 24,
              }}
            >
              <Text style={{ color: 'white', fontSize: 10 }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

function AtividadesScreen() {
  const [exercises, setExercises] = useState({});
  const [exercise, setExercise] = useState('');
  const [selectedDay, setSelectedDay] = useState('Segunda');

  const daysOfWeek = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  useEffect(() => {
    const fetchExercises = async () => {
      const storedExercises = await AsyncStorage.getItem('exercises');
      if (storedExercises) {
        setExercises(JSON.parse(storedExercises));
      }
    };
    fetchExercises();
  }, []);

  const handleAddExercise = async () => {
    if (!exercise) {
      Alert.alert("Erro", "Preencha o exercício");
      return;
    }
    const newExercises = { ...exercises, [selectedDay]: [...(exercises[selectedDay] || []), exercise] };
    setExercises(newExercises);
    await AsyncStorage.setItem('exercises', JSON.stringify(newExercises));
    setExercise('');
  };

  const clearSingleExercise = async (itemIndex) => {
    const updatedDayExercises = (exercises[selectedDay] || []).filter((_, index) => index !== itemIndex);
    const updatedExercises = { ...exercises, [selectedDay]: updatedDayExercises };
    setExercises(updatedExercises);
    await AsyncStorage.setItem('exercises', JSON.stringify(updatedExercises));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Exercícios</Text>
      <Ionicons name="bicycle-outline" size={30} color="gray" style={{ marginBottom: 20 }} />

      <Text>Selecione o Dia:</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {daysOfWeek.map((day) => (
          <TouchableOpacity
            key={day}
            onPress={() => setSelectedDay(day)}
            style={{
              backgroundColor: selectedDay === day ? 'lightblue' : 'lightgray',
              padding: 10,
              margin: 5,
              borderRadius: 5,
            }}
          >
            <Text>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Ex: Caminhada 30 minutos"
        value={exercise}
        onChangeText={setExercise}
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: '#006400' }]}
        onPress={handleAddExercise}
      >
        <Text style={styles.addButtonText}>Adicionar Exercício</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.clearButton, { backgroundColor: '#32CD32' }]}
        onPress={() => clearData('exercises', setExercises)}
      >
        <Text style={styles.addButtonText}>Limpar tudo</Text>
      </TouchableOpacity>

      <FlatList
        data={exercises[selectedDay] || []}
        renderItem={({ item, index }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
            <Text style={{ flex: 1 }}>{item}</Text>
            <TouchableOpacity
              onPress={() => clearSingleExercise(index)}
              style={{
                backgroundColor: '#FF0000',
                padding: 5,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                width: 24,
                height: 24,
              }}
            >
              <Text style={{ color: 'white', fontSize: 10 }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

function DescansoScreen() {
  const [sleepRecords, setSleepRecords] = useState({});
  const [sleepHours, setSleepHours] = useState('');
  const [selectedDay, setSelectedDay] = useState('Segunda');

  const daysOfWeek = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

  useEffect(() => {
    const fetchSleepRecords = async () => {
      const storedSleepRecords = await AsyncStorage.getItem('sleepRecords');
      if (storedSleepRecords) {
        setSleepRecords(JSON.parse(storedSleepRecords));
      }
    };
    fetchSleepRecords();
  }, []);

  const handleAddSleepRecord = async () => {
    if (!sleepHours) {
      Alert.alert("Erro", "Informe as horas de sono");
      return;
    }

    const newSleepRecords = { ...sleepRecords, [selectedDay]: [...(sleepRecords[selectedDay] || []), sleepHours] };
    setSleepRecords(newSleepRecords);
    await AsyncStorage.setItem('sleepRecords', JSON.stringify(newSleepRecords));
    setSleepHours('');
  };

  const clearSingleSleepRecord = async (itemIndex) => {
    const updatedDayRecords = (sleepRecords[selectedDay] || []).filter((_, index) => index !== itemIndex);
    const updatedSleepRecords = { ...sleepRecords, [selectedDay]: updatedDayRecords };
    setSleepRecords(updatedSleepRecords);
    await AsyncStorage.setItem('sleepRecords', JSON.stringify(updatedSleepRecords));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Horas de Sono</Text>
      <Ionicons name="bed-outline" size={30} color="gray" style={{ marginBottom: 20 }} />

      <Text>Selecione o Dia:</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {daysOfWeek.map((day) => (
          <TouchableOpacity
            key={day}
            onPress={() => setSelectedDay(day)}
            style={{
              backgroundColor: selectedDay === day ? 'lightblue' : 'lightgray',
              padding: 10,
              margin: 5,
              borderRadius: 5,
            }}
          >
            <Text>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Ex: 8"
        value={sleepHours}
        onChangeText={setSleepHours}
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: '#00008B' }]}
        onPress={handleAddSleepRecord}
      >
        <Text style={styles.addButtonText}>Adicionar Horas de Sono</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.clearButton, { backgroundColor: '#B0E0E6' }]}
        onPress={() => clearData('sleepRecords', setSleepRecords)}
      >
        <Text style={styles.clearButtonText}>Limpar tudo</Text>
      </TouchableOpacity>

      <FlatList
        data={sleepRecords[selectedDay] || []}
        renderItem={({ item, index }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
            <Text style={{ flex: 1 }}>{item} horas</Text>
            <TouchableOpacity
              onPress={() => clearSingleSleepRecord(index)}
              style={{
                backgroundColor: '#FF0000',
                padding: 5,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                width: 24,
                height: 24,
              }}
            >
              <Text style={{ color: 'white', fontSize: 10 }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

function NutricaoScreen() {
  const [meals, setMeals] = useState({});
  const [meal, setMeal] = useState('');
  const [selectedDay, setSelectedDay] = useState('Segunda');
  const [selectedMealType, setSelectedMealType] = useState('Café da manhã');

  const daysOfWeek = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];
  const mealTypes = ["Café da manhã", "Almoço", "Jantar"];

  useEffect(() => {
    const fetchMeals = async () => {
      const storedMeals = await AsyncStorage.getItem('meals');
      if (storedMeals) {
        setMeals(JSON.parse(storedMeals));
      }
    };
    fetchMeals();
  }, []);

  const handleAddMeal = async () => {
    if (!meal) {
      Alert.alert("Erro", "Preencha o campo de alimentação");
      return;
    }
    const newMeals = { 
      ...meals, 
      [selectedDay]: {
        ...(meals[selectedDay] || {}),
        [selectedMealType]: [...(meals[selectedDay]?.[selectedMealType] || []), meal]
      }
    };
    setMeals(newMeals);
    await AsyncStorage.setItem('meals', JSON.stringify(newMeals));
    setMeal('');

    
  };

  const handleClearMeals = async () => {
    const updatedMeals = { 
      ...meals, 
      [selectedDay]: {
        ...(meals[selectedDay] || {}),
        [selectedMealType]: [] 
      }
    };
    setMeals(updatedMeals);
    await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
  };

  const clearSingleMeal = async (index) => {
    const updatedMeals = { 
      ...meals, 
      [selectedDay]: {
        ...(meals[selectedDay] || {}),
        [selectedMealType]: meals[selectedDay]?.[selectedMealType].filter((_, i) => i !== index) 
      }
    };
    setMeals(updatedMeals);
    await AsyncStorage.setItem('meals', JSON.stringify(updatedMeals));
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Alimentação</Text>
      <Ionicons name="fast-food-outline" size={30} color="gray" style={{ marginBottom: 20 }} />

      <Text>Selecione o Dia:</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {daysOfWeek.map((day) => (
          <TouchableOpacity 
            key={day} 
            onPress={() => setSelectedDay(day)} 
            style={{
              backgroundColor: selectedDay === day ? 'lightblue' : 'lightgray',
              padding: 10, margin: 5, borderRadius: 5
            }}
          >
            <Text>{day}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text>Selecione a Refeição:</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
        {mealTypes.map((type) => (
          <TouchableOpacity 
            key={type} 
            onPress={() => setSelectedMealType(type)} 
            style={{
              backgroundColor: selectedMealType === type ? 'lightgreen' : 'lightgray',
              padding: 10, margin: 5, borderRadius: 5
            }}
          >
            <Text>{type}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TextInput
        style={styles.input}
        placeholder="Bife com batata frita"
        value={meal}
        onChangeText={setMeal}
      />

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: '#FFA500' }]}
        onPress={handleAddMeal}
      >
        <Text style={styles.addButtonText}>Adicionar Refeição</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.clearButton, { backgroundColor: '#FFEB3B' }]}
        onPress={handleClearMeals}
      >
        <Text style={styles.clearButtonText}>Limpar tudo</Text>
      </TouchableOpacity>

      <FlatList
        data={meals[selectedDay]?.[selectedMealType] || []}
        renderItem={({ item, index }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 5 }}>
            <Text style={{ flex: 1 }}>{item}</Text>
            <TouchableOpacity
              onPress={() => clearSingleMeal(index)}
              style={{
                backgroundColor: '#FF0000',
                padding: 5,
                borderRadius: 50,
                justifyContent: 'center',
                alignItems: 'center',
                width: 24,
                height: 24,
              }}
            >
              <Text style={{ color: 'white', fontSize: 10 }}>✕</Text>
            </TouchableOpacity>
          </View>
        )}
        keyExtractor={(item, index) => index.toString()}
        style={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  clearButton: {
  paddingVertical: 10,
  paddingHorizontal: 20,
  borderRadius: 10,
  marginVertical: 10,
  justifyContent: 'center',
  alignItems: 'center',
  alignSelf: 'center', 
  width: '60%', 
},
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    marginBottom: 20,
    borderRadius: 5,
  },
  addButton: {
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
   logo: {
    width: 150,       
    height: 150,     
    marginBottom: 20,
     alignSelf: 'center',
  },
});

export { styles };

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const handleLoginSuccess = () => setIsLoggedIn(true);
  const handleRegisterSuccess = () => setShowRegister(false);
  const handleLogout = () => setIsLoggedIn(false);
  return (
    <NavigationContainer>
      {isLoggedIn ? (
        <Tab.Navigator screenOptions={{
          headerRight: () => (
            <TouchableOpacity onPress={handleLogout} style={{ marginRight: 16 }}>
              <Ionicons name="log-out-outline" size={24} color="#FF6347" />
            </TouchableOpacity>
          ),
        }}>
          <Tab.Screen
            name="Saúde"
            component={SaudeScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="heart-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Atividade"
            component={AtividadesScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="bicycle-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Descanso"
            component={DescansoScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="bed-outline" size={size} color={color} />
              ),
            }}
          />
          <Tab.Screen
            name="Nutrição"
            component={NutricaoScreen}
            options={{
              tabBarIcon: ({ color, size }) => (
                <Ionicons name="fast-food-outline" size={size} color={color} />
              ),
            }}
          />
        </Tab.Navigator>
      ) : (
        <View style={{ flex: 1 }}>
          {showRegister ? (
            <RegisterScreen onRegisterSuccess={handleRegisterSuccess} />
          ) : (
            <LoginScreen onLoginSuccess={handleLoginSuccess} />
          )}

          <TouchableOpacity
            style={[styles.addButton, { backgroundColor: '#191970' }]}
            onPress={() => setShowRegister(!showRegister)}
          >
            <Text style={styles.addButtonText}>
              {showRegister ? "Voltar ao Login" : "Criar uma conta"}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </NavigationContainer>
  );
}