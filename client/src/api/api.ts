// api.ts
import axios from 'axios';

const api = axios.create({ baseURL: '/api' }); //change this to your API base URL
export default api;