// API Configuration
// Automatically selects URL based on environment

const PROD_API_URL = 'http://13.201.16.207/api'; // AWS EC2 (Production)
// const DEV_API_URL = 'http://13.201.16.207/api'; // Use AWS Backend for Dev (Stable)
const DEV_API_URL = 'http://10.225.177.142:5002/api'; // Local IP for Expo Go

// Automatically select URL based on environment
const API_URL = __DEV__ ? DEV_API_URL : PROD_API_URL;

export default API_URL;
