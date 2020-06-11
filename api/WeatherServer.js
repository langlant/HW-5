import axios from 'axios';
import {WKey} from './WeatherKey';

const WeatherServer = axios.create({
    baseURL: 'https://api.openweathermap.org/data/2.5/weather',
});

/*WeatherServer.interceptors.request.use(
    async (config) => {
      // called when request is made.
      config.headers.Accept = 'application/json';
      // const token = await AsyncStorage.getItem('token');
      // if (token) {
      //   config.headers.Authorization = `Bearer ${token}`;
      // }
      return config;
    },
    (err) => {
      // called when error
      return Promise.reject(err);
    }
  );*/

export const getWeather = async (item, callback) => {
    const response = await WeatherServer.get(
        `?lat=${item.lat}&lon=${item.lon}&appid=${WKey}&units=imperial`
    ); 
    callback(response.data)
};

export default WeatherServer;
