/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 */

import React, {useEffect, useState} from 'react';
import { PERMISSIONS, request, check, RESULTS } from 'react-native-permissions';
import * as data from './src/data/data.json'
import {
  FlatList,
  Image,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, {LatLng, Marker, PROVIDER_GOOGLE} from 'react-native-maps';
import Geolocation from "react-native-geolocation-service";
import {captureScreen} from 'react-native-view-shot'

const App = () => {
  const [locdata, setlocdata] = useState(data.chargers);
  const [imgPath, setPath] = useState('');
  const [location, setLocation] = useState<any>(null);
  const handleLoc = async () => {
    let permissionCheck = '';
    if(Platform.OS === 'ios'){
      permissionCheck = await check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE);

      if(
        permissionCheck === RESULTS.BLOCKED || permissionCheck === RESULTS.DENIED  ){
          const permissionRequest = await request(
            PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
          );
          permissionRequest === RESULTS.GRANTED
            ? console.warn('Location permission granted')
            : console.warn('location permisson denied');
        }
    }
    if(Platform.OS === 'android'){
      permissionCheck = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);

      if(
        permissionCheck === RESULTS.BLOCKED || permissionCheck === RESULTS.DENIED  ){
          const permissionRequest = await request(
            PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
          );
          permissionRequest === RESULTS.GRANTED
            ? console.warn('Location permission granted')
            : console.warn('location permisson denied');
        }
    }
  }

  useEffect(()=>{
    handleLoc();
  },[])
  useEffect(()=>{
    Geolocation.getCurrentPosition(
      position => {
        const {latitude, longitude} = position.coords;
        setLocation({ latitude, longitude})
      },
      error =>{
        console.log(error.code, error.message)
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
    )
  },[])
  const screenshot = () => {
    captureScreen({
      format: 'webm',
    }).then(
      (uri) => {
        setPath(uri);
      },
      (error) => console.error("Something went wrong"),
    );
    const picup = new FormData()
    picup.append('file',imgPath)
    fetch('HTTP://3.7.20.173:8503/api/upload/',{ method: 'POST',headers:{  
      "Content-Type": "image/webm",
      "otherHeader": "foo",
      } , body :picup} )
   .then((res) => res.json())
   .then((res) => { console.log("response" +JSON.stringify(res)); })
   .catch((e) => console.log(e))
  };
  const renderItem = ({item}: any) => {
    return (
      <View style={styles.smallcontainer}>
        <Text style={styles.titlelist}>{item.name}</Text>
        <Text style={styles.titlelist}>{item.address}</Text>
        <Text style={styles.titlelist}>{item.distance} metres</Text>
      </View>
    )
  }
  return (
    <SafeAreaView style={styles.container}>
    {location && (
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={{
          latitude: location.latitude,
          longitude: location.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        }}
        showsUserLocation={true}
        paddingAdjustmentBehavior='automatic'
        showsMyLocationButton={true}
        showsBuildings={true}
        maxZoomLevel={30}
        loadingEnabled={true}
        loadingIndicatorColor="#fcb103"
        loadingBackgroundColor='#242f3e'
        onRegionChangeComplete={location => setLocation(location)}
      >
        <Marker coordinate={{
          latitude: location.latitude,
          longitude: location.longitude
        }} />
        {locdata.map(charger => (
          <Marker
            key={charger.id}
            coordinate={{
              latitude: charger.latitude,
              longitude: charger.longitude,
            }}
            pinColor='#00FF00' />
        ))}
      </MapView>
      )}
      <View style={{width: '100%'}}>
      <TouchableOpacity onPress={screenshot} style={styles.actionbutton}>
            <Image source={require('./src/icons/screenshot.png')} style={{width: 30, height: 40}} />
      </TouchableOpacity>  
      <FlatList
          horizontal
          data={locdata}
          renderItem={renderItem}
          style={styles.bottomFoot} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {width: '100%', height: '100%'},
  map: {
    width: '100%',
    height: '100%',
    flex : 1
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '600',
  },
  sectionDescription: {
    marginTop: 8,
    fontSize: 18,
    fontWeight: '400',
  },
  highlight: {
    fontWeight: '700',
  },
  bottomFoot: {
    width: '100%',
    flexDirection: 'row',
  },
  smallcontainer: {backgroundColor: '#000', padding: 5, margin: 5},
  titlelist: {color: '#fff'},
  actionbutton: {width: 50, height: 50, borderRadius: 100/2, marginTop: -60,marginLeft: 10, alignItems: 'center', backgroundColor: '#FFF', elevation: 10, padding: 5}
});

export default App;
