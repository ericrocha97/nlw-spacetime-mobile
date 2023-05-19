import axios from 'axios'
import Constants from 'expo-constants'

const apiUrl = Constants.manifest.extra.API_URL

export const api = axios.create({
  baseURL: apiUrl,
})
