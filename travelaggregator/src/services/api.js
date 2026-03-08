import axios from 'axios'

const API = axios.create({
  baseURL: 'http://localhost:8000/api/v1'
})

export const fetchDashboard = async (source, destination, travelDate, numTravelers = 1, preferredMode = null) => {
  try {
    const { data } = await API.post('/dashboard/', {
      source,
      destination,
      travel_date: travelDate,
      num_travelers: numTravelers,
      preferred_mode: preferredMode
    })
    return data
  } catch (error) {
    console.error('Dashboard Fetch failed:', error)
    throw error
  }
}

export const fetchRoutes = async (source, destination, date) => {
  try {
    const { data } = await API.get(`/routes/search?source=${source}&destination=${destination}&date=${date}`)
    return data
  } catch {
    return { bus_options: [], train_options: [], flight_options: [], cab_options: [] }
  }
}

export const fetchWeather = async (city, date) => {
  try {
    const { data } = await API.get(`/weather?city=${city}&date=${date}`)
    return data
  } catch {
    return {
      temperature_max: 27,
      rain_probability: 20,
      travel_advice: 'Weather looks good for travel.'
    }
  }
}

export const fetchHotels = async (city, checkIn, checkOut) => {
  try {
    const { data } = await API.get(`/hotels/search?city=${city}&check_in=${checkIn}&check_out=${checkOut}`)
    return data
  } catch {
    return []
  }
}

export const fetchRisk = async (source, destination, date) => {
  try {
    const { data } = await API.get(`/risk?source=${source}&destination=${destination}&date=${date}`)
    return data
  } catch {
    return {
      risk_level: 'low',
      overall_risk_score: 2,
      recommendations: ['Everything seems normal.']
    }
  }
}

export const login = async (email, password) => {
  try {
    const { data } = await API.post('/auth/login', { email, password })
    localStorage.setItem('travel_token', data.access_token)
    return data
  } catch (error) {
    console.error('Login failed:', error)
    throw error
  }
}

export const register = async (userData) => {
  try {
    const { data } = await API.post('/auth/register', userData)
    return data
  } catch (error) {
    console.error('Registration failed:', error)
    throw error
  }
}

export const getMe = async () => {
  const token = localStorage.getItem('travel_token')
  if (!token) return null
  try {
    const { data } = await API.get('/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  } catch {
    localStorage.removeItem('travel_token')
    return null
  }
}

export const saveItinerary = async (itineraryData) => {
  const token = localStorage.getItem('travel_token')
  try {
    const { data } = await API.post('/itineraries/', itineraryData, {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  } catch (error) {
    console.error('Failed to save itinerary:', error)
    throw error
  }
}

export const fetchItineraries = async () => {
  const token = localStorage.getItem('travel_token')
  try {
    const { data } = await API.get('/itineraries/', {
      headers: { Authorization: `Bearer ${token}` }
    })
    return data
  } catch (error) {
    console.error('Failed to fetch itineraries:', error)
    throw error
  }
}

export const fetchCopilotReply = async (message, destination, hotels = []) => {
  try {
    const { data } = await API.post('/copilot/chat', {
      message,
      destination,
      hotels
    })
    return data
  } catch (error) {
    console.error('Copilot Fetch failed:', error)
    return {
      reply: "I'm having trouble connecting to my brain right now. Please try again later!",
      suggestions: ["Try again"]
    }
  }
}
