// Purpose: This file is responsible for finding the user's location and then finding the current weather at that location.
// The weather is used in determining the display of the app, and the location is used to alert the user of locations near them.
require('dotenv').config();
const API_KEY = process.env.APIKey;

function getLocation() {
    // Collects GPS coordinates from the user's browser
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        console.log("Geolocation is not supported by this browser.");
    };
}

function showError(error) {
    // Raises an error if GPS services are not available
    switch (error.code) {
        case error.PERMISSION_DENIED:
            console.log("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            console.log("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            console.log("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            console.log("An unknown error occurred.");
            break;
    };
}

function showPosition(position) {
    // Returns the user's GPS coordinates as their latitude and longitude
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;
    const pos = `${lat},${lon}`
    return {
        pos
    };
}

function findWeather() {
    // From the user's GPS coordinates, utilizes the WeatherAPI to find the current weather and city name of the user's location.
    try {
        const response = fetch(BASE_URL);
        let data = response.json();

        const location = data.location.name;
        const cloud = data.current.condition.text;
        const precipIn = data.current.precip_in;
        const tempF = data.current.temp_f;

        console.log(location);
        console.log(cloud);
        console.log(precipIn);
        console.log(tempF);

    } catch (error) {
        console.log("Error in retrieving weather data");
    }
}

// Default location is set to East Lansing, MI this occurs when the user denies GPS services.
let loc = getLocation();

if (typeof loc === 'undefined') {
    loc = "42.746880,-84.483704";
}

// API Address and call of the findWeather function.
const BASE_URL = `https://api.weatherapi.com/v1/current.json?key=${API_KEY}&q=${loc}&aqi=no`;
const weather = findWeather();