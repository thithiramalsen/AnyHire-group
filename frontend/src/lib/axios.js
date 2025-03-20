import axios from "axios";

const axiosInstance = axios.create({
  baseURL: import.meta.mode === "development" ? "http://localhost:5000/api" : "/api", //Backend port number in development and can be dynamic when deployed
  withCredentials: true, //send cookies to the server
});

export default axiosInstance;