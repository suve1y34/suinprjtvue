import axios from 'axios'

const instance = axios.create({
  baseURL: 'http://localhost:19717', // API 서버 주소
  timeout: 5000, // 5초 넘으면 timeout
  headers: {
    'Content-Type': 'application/json'
  }
})

export default instance