import axios from 'axios'
export function getsshid(params) {
  return axios.post('http://127.0.0.1:9008/', params)
}
