import React, { useState, useRef,   useEffect } from "react";
import { StyleSheet, Text, Keyboard, TouchableOpacity, View, TouchableWithoutFeedback, Image } from "react-native";
import { Button, Input, Card } from "react-native-elements";
import { Feather } from "@expo/vector-icons";
import { storeHistoryItem, setupHistoryListener, initHistoryDB } from '../helpers/fb-history';
import { getWeather } from "../api/WeatherServer";
import { FlatList } from "react-native-gesture-handler";

const ICONS = {
  img01d: require('../assets/img01d.png'),
  img01n: require('../assets/img01n.png'),
  img02d: require('../assets/img02d.png'),
  img02n: require('../assets/img02n.png'),
  img03d: require('../assets/img03d.png'),
  img03n: require('../assets/img03n.png'),
  img04d: require('../assets/img04d.png'),
  img04n: require('../assets/img04n.png'),
  img09d: require('../assets/img09d.png'),
  img09n: require('../assets/img09n.png'),
  img10d: require('../assets/img10d.png'),
  img10n: require('../assets/img10n.png'),
  img13d: require('../assets/img13d.png'),
  img13n: require('../assets/img13n.png'),
  img50d: require('../assets/img13d.png'),
  img50n: require('../assets/img13n.png'),
 };
 

const CalculatorScreen = ({ route, navigation }) => {
  const [state, setState] = useState({
    lat1: "",
    lon1: "",
    lat2: "",
    lon2: "",
    distance: "",
    bearing: "",
  });
  const [history, setHistory] = useState([]);
  const [bearingUnits, setBearingUnits] = useState("Degrees");
  const [distanceUnits, setDistanceUnits] = useState("Kilometers");
  const [weather, setWeather] = useState([]);
  const initialField = useRef(null);
  const [startWeather, setStartWeather] = useState({
    description: '',
    icon: '',
    temperature: ''
  });

  const [endWeather, setEndWeather] = useState({
    description: '',
    icon: '',
    temperature: '',
  });

  const updateStateObject = (vals) => {
    setState({
      ...state,
      ...vals,
    });
  };

  const renderWeather = (weather) => {
    if (weather.icon === '') {
      return <View></View>;
    } else {
      return (
        <View style={styles.weatherView}>
          <Image
            style={{ width: 100, height: 100 }}
            source={ICONS['img' + weather.icon]}
          />
          <View>
            <Text style={{ fontSize: 56, fontWeight: 'bold' }}>
              {round(weather.temperature,0)}
            </Text>
            <Text> {weather.description} </Text>
          </View>
        </View>
      );
    }
  };
    useEffect(() => {
      try {
        initHistoryDB();
      } catch (err) {
        console.log(err);
      }
      setupHistoryListener((items) => {
        setHistory(items);
      });
    }, []);

  useEffect(() => {
    if (route.params?.selectedDistanceUnits) {
      setDistanceUnits(route.params.selectedDistanceUnits);
      setBearingUnits(route.params.selectedBearingUnits);
      doCalculation(route.params.selectedDistanceUnits, route.params.selectedBearingUnits);
    }
    if (route.params?.selectedItem) {
      var p1 = route.params?.selectedItem.p1;
      var p2 = route.params?.selectedItem.p2;
      setState({lat1: `${p1.lat}`, lon1: `${p1.lon}`, lat2: `${p2.lat}`, lon2: `${p2.lon}` });
    }
  }, [route.params?.selectedDistanceUnits, route.params?.selectedItem]);

  useEffect(() => {
    getWeather((data) => {
      console.log('received: ', data);
      setWeather(data.items);
    });
  }, []);

  // Converts from degrees to radians.
  function toRadians(degrees) {
    return (degrees * Math.PI) / 180;
  }

  // Converts from radians to degrees.
  function toDegrees(radians) {
    return (radians * 180) / Math.PI;
  }

  // Computes distance between two geo coordinates in kilometers.
  function computeDistance(lat1, lon1, lat2, lon2) {
    var R = 6371; // km (change this constant to get miles)
    var dLat = ((lat2 - lat1) * Math.PI) / 180;
    var dLon = ((lon2 - lon1) * Math.PI) / 180;
    var a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    var d = R * c;
    //return `${round(d, 3)}`;
    return d;
  }

  // Computes bearing between two geocoordinates in degrees. 
  function computeBearing(startLat, startLng, destLat, destLng) {
    startLat = toRadians(startLat);
    startLng = toRadians(startLng);
    destLat = toRadians(destLat);
    destLng = toRadians(destLng);

    var y = Math.sin(destLng - startLng) * Math.cos(destLat);
    var x =
      Math.cos(startLat) * Math.sin(destLat) -
      Math.sin(startLat) * Math.cos(destLat) * Math.cos(destLng - startLng);
    var brng = Math.atan2(y, x);
    brng = toDegrees(brng);
    return (brng + 360) % 360;
  }

  function round(value, decimals) {
    return Number(Math.round(value + "e" + decimals) + "e-" + decimals);
  }

  function validate(value) {
    return (isNaN(value) ? "Must be a number" : "");
  }

  function formValid(vals) {
    if (isNaN(vals.lat1) || isNaN(vals.lon1) || isNaN(vals.lat2) || isNaN(vals.lon2)) {
      return false;
    } else if (vals.lat1 === '' || vals.lon1 === '' || vals.lat2==='' || vals.lon2==='') {
      return false;
    } else {
      return true;
    }
  }

  function doCalculation(dUnits,bUnits) {
    if (formValid(state)) {
      var p1 = {
        lat: parseFloat(state.lat1),
        lon: parseFloat(state.lon1),
      };
      var p2 = {
        lat: parseFloat(state.lat2),
        lon: parseFloat(state.lon2),
      };

      var dist = computeDistance(p1.lat, p1.lon, p2.lat, p2.lon);
      var bear = computeBearing(p1.lat, p1.lon, p2.lat, p2.lon);
      const dConv = dUnits==='Kilometers' ? 1.0 :  0.621371;
      const bConv = bUnits === 'Degrees' ? 1.0 : 17.777777777778;
      updateStateObject({
        distance: `${round(dist*dConv,3)} ${dUnits}`,
        bearing: `${round(bear*bConv, 3)} ${bUnits}`,
      });
      // setHistory([
      //   ...history,
      //   { p1, p2, dUnits, bUnits, timestamp: Date.now() },
      // ]);
      storeHistoryItem({ p1, p2, dUnits, bUnits, timestamp: Date.now() });
      getWeather(p1, (data) => {
        setStartWeather({description: data.weather[0].description, temperature: data.main.temp, icon: data.weather[0].icon});
      }),
      getWeather(p2, (data) => {
        setEndWeather({description: data.weather[0].description, temperature: data.main.temp, icon: data.weather[0].icon});
      })
    }
  }

  navigation.setOptions({
    headerLeft: () => (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('History', { currentHistory: history })
        }
      >
        <Text style={styles.headerButton}> History </Text>
      </TouchableOpacity>
    ),
    headerRight: () => (
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('Settings', {
            defaultDistanceUnits: distanceUnits,
            defaultBearingUnits: bearingUnits,
          })
        }
      >
        <Feather
          style={styles.headerButton}
          name="settings"
          size={24}
          color="#fff"
        />
      </TouchableOpacity>
    ),
  });

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Input
          style={styles.input}
          placeholder="Enter latitude for point 1"
          ref={initialField}
          value={state.lat1}
          autoCorrect={false}
          errorStyle={styles.inputError}
          errorMessage={validate(state.lat1)}
          onChangeText={(val) => updateStateObject({ lat1: val })}
        />
        <Input
          style={styles.input}
          placeholder="Enter longitude for point 1"
          value={state.lon1}
          autoCorrect={false}
          errorStyle={styles.inputError}
          errorMessage={validate(state.lon1)}
          onChangeText={(val) => updateStateObject({ lon1: val })}
        />
        <Input
          style={styles.input}
          placeholder="Enter latitude for point 2"
          value={state.lat2}
          autoCorrect={false}
          errorStyle={styles.inputError}
          errorMessage={validate(state.lat2)}
          onChangeText={(val) => updateStateObject({ lat2: val })}
        />
        <Input
          style={styles.input}
          placeholder="Enter longitude for point 2"
          value={state.lon2}
          autoCorrect={false}
          errorStyle={styles.inputError}
          errorMessage={validate(state.lon2)}
          onChangeText={(val) => updateStateObject({ lon2: val })}
        />
        <View>
          <Button
            style={styles.buttons}
            title="Calculate"
            onPress={() => {
              doCalculation(distanceUnits, bearingUnits);

            }}
          />
        </View>
        <View>
          <Button
            style={styles.buttons}
            title="Clear"
            onPress={() => {
              //initialField.current.focus();
              Keyboard.dismiss();
              setState({
                lat1: '',
                lon1: '',
                lat2: '',
                lon2: '',
                distance: '',
                bearing: '',
              });
            }}
          />
        </View>
        <View style={styles.resultsGrid}>
          <View style={styles.resultsRow}>
            <View style={styles.resultsLabelContainer}>
              <Text style={styles.resultsLabelText}> Distance: </Text>
            </View>
            <Text style={styles.resultsValueText}>{state.distance}</Text>
          </View>
          <View style={styles.resultsRow}>
            <View style={styles.resultsLabelContainer}>
              <Text style={styles.resultsLabelText}> Bearing: </Text>
            </View>
            <Text style={styles.resultsValueText}>{state.bearing}</Text>
          </View>
        </View>
        <View>
        </View>
        {renderWeather(startWeather)}
        {renderWeather(endWeather)}
      </View>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#E8EAF6',
    flex: 1,
  },
  headerButton: {
    color: '#fff',
    fontWeight: 'bold',
    margin: 10,
  },
  buttons: {
    padding: 10,
  },
  inputError: {
    color: 'red',
  },
  input: {
    padding: 10,
  },
  resultsGrid: {
    borderColor: '#000',
    borderWidth: 1,
  },
  resultsRow: {
    flexDirection: 'row',
    borderColor: '#000',
    borderBottomWidth: 1,
  },
  resultsLabelContainer: {
    borderRightWidth: 1,
    borderRightColor: '#000',
    flex: 1,
  },
  resultsLabelText: {
    fontWeight: 'bold',
    fontSize: 20,
    padding: 10,
  },
  resultsValueText: {
    fontWeight: 'bold',
    fontSize: 20,
    flex: 1,
    padding: 10,
  },
});

export default CalculatorScreen;