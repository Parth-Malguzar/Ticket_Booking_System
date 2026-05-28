import axios from "axios"

const api = axios.create({
   baseURL:"http://localhost:5000/api",
   withCredentials:true//now it is allowed in both frontend and backend
})

export default api