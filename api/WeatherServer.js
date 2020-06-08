import axios from 'axios';
import {WKey} from './WeatherKey';

const WeatherServer = axios.create({
    baseURL: 'api.openweathermap.org',
});

export const getWeather = async (callback) => {
    const response = await WeatherServer.get(
        'api.openweathermap.org/data/2.5/weather?lat=${item.p2.lat}&lon=${item.p2.lon}&appid=${WKey}'
    )
};

export default WeatherServer;
