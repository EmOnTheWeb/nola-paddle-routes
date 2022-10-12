import axios from 'axios';
const BASE_URL = process.env.VUE_APP_BASE_URL;

export default axios.create({
    baseURL: BASE_URL,
    withCredentials: true
});
