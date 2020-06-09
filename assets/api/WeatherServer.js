import axios from 'axios';
import {WKey} from './WeatherKey';

const WeatherServer = axios.create({
    baseURL: 'api.openweathermap.org',
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

export const getWeather = async (callback) => {
    const response = await WeatherServer.get(
        'api.openweathermap.org/data/2.5/weather?lat=${item.p2.lat}&lon=${item.p2.lon}&appid=${WKey}'
    )
};

export default WeatherServer;
