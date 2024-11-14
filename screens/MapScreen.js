import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addPlace, importPlaces } from '../reducers/user';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';

const BACKEND_ADDRESS = 'http://192.168.45.186:3000';

export default function MapScreen() {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.user.value);

  const [currentPosition, setCurrentPosition] = useState(null);
  const [tempCoordinates, setTempCoordinates] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [newPlace, setNewPlace] = useState('');

  useEffect(() => {
    (async () => {
      const result = await Location.requestForegroundPermissionsAsync();
      const status = result?.status;

      if (status === 'granted') {
        Location.watchPositionAsync({ distanceInterval: 10 },
          (location) => {
            setCurrentPosition(location.coords);
          });
      }
    })();

    fetch(`${BACKEND_ADDRESS}/places/${user.nickname}`)
      .then((response) => response.json())
      .then((data) => {
        console.log('Places received from backend:', data.places);
        data.result && dispatch(importPlaces(data.places));
      });
  }, []);

  const handleLongPress = (e) => {
    setTempCoordinates(e.nativeEvent.coordinate);
    setModalVisible(true);
  };

  const handleNewPlace = () => {
    // Send new place to backend to register it in database
    if (!tempCoordinates || !newPlace.trim()) {
      console.warn('Missing coordinates or place name');
      return;
    }

    const coordinates = {
      latitude: parseFloat(tempCoordinates.latitude),
      longitude: parseFloat(tempCoordinates.longitude)
    };

    fetch(`${BACKEND_ADDRESS}/places`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nickname: user.nickname, name: newPlace, latitude: coordinates.latitude, longitude: coordinates.longitude }),
    }).then((response) => response.json())
      .then((data) => {
        // Dispatch in Redux store if the new place have been registered in database
        if (data.result) {
          dispatch(addPlace({ name: newPlace, latitude: coordinates.latitude, longitude: coordinates.longitude }));
          setModalVisible(false);
          setNewPlace('');
        }
      })
      .catch(error => {
        console.error('Error saving place:', error);
      });
  };

  const handleClose = () => {
    setModalVisible(false);
    setNewPlace('');
  };

  const markers = user.places.map((data, i) => {
    console.log('Processing place:', data);
    // Conversion explicite en nombres
    const coordinate = {
      latitude: parseFloat(data.latitude),
      longitude: parseFloat(data.longitude)
    };

    console.log('Converted coordinates:', coordinate);

    // Vérification que les coordonnées sont valides
if (!coordinate.latitude || !coordinate.longitude || 
      isNaN(coordinate.latitude) || isNaN(coordinate.longitude)) {
    console.warn(`Invalid coordinates for place: ${data.name}`, data);
    return null;
  }
  
    return (
      <Marker 
        key={i} 
        coordinate={coordinate}
        title={data.name} 
      />
    );
  }).filter(Boolean); // Filtrer les markers null

  return (
    <View style={styles.container}>
      <Modal visible={modalVisible} animationType="fade" transparent>
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <TextInput placeholder="New place" onChangeText={(value) => {console.log(value);setNewPlace(value)}} value={newPlace} style={styles.input} />
            <TouchableOpacity onPress={() => handleNewPlace()} style={styles.button} activeOpacity={0.8}>
              <Text style={styles.textButton}>Add</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => handleClose()} style={styles.button} activeOpacity={0.8}>
              <Text style={styles.textButton}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <MapView onLongPress={(e) => handleLongPress(e)} mapType="hybrid" style={styles.map}>
      {currentPosition && (
        <Marker 
          coordinate={{
            latitude: parseFloat(currentPosition.latitude),
            longitude: parseFloat(currentPosition.longitude)
          }} 
          title="My position" 
          pinColor="#fecb2d" 
        />
      )}
      {markers}
      </MapView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  input: {
    width: 150,
    borderBottomColor: '#ec6e5b',
    borderBottomWidth: 1,
    fontSize: 16,
  },
  button: {
    width: 150,
    alignItems: 'center',
    marginTop: 20,
    paddingTop: 8,
    backgroundColor: '#ec6e5b',
    borderRadius: 10,
  },
  textButton: {
    color: '#ffffff',
    height: 24,
    fontWeight: '600',
    fontSize: 15,
  },
});
