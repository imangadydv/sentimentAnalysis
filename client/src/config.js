/**
 * API base URLs. In development we always use localhost.
 * For production build, set VITE_API_SERVER and VITE_ML_API in .env
 */
const DEV = import.meta.env.DEV;
const LOCAL_SERVER = "http://localhost:5001";
const LOCAL_ML = "http://localhost:10000";

export const API_SERVER = DEV
  ? LOCAL_SERVER
  : (import.meta.env.VITE_API_SERVER ?? LOCAL_SERVER);
export const ML_API = DEV
  ? LOCAL_ML
  : (import.meta.env.VITE_ML_API ?? LOCAL_ML);
