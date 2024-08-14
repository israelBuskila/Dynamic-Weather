const WEATHER_DIV_ID = 'some kind of id' 
const API_KEY = 'PUT_YOUR_KEY_HERE';
const BASE_URL = 'https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline'
const UNIT = "metric";//the default of this API is "US" unit;

const getApiUrl = (city, params) => {
    const urlObject = new URL(`${BASE_URL}/${city}`);
    Object.keys(params).forEach(key => {
        urlObject.searchParams.set(key, params[key]);
    });
    return urlObject.toString();
}

const createDiv = () => {
    const div =  document.createElement('div');
    document.body.appendChild(div);
    return div
}

const getWeatherDiv = (divId) => {
    if(!divId) {
        return createDiv()
    }
    const div = document.getElementById(divId)
    return div ? div : createDiv()
}

const disableSearchButton = (e) =>{
    const searchButton = document.getElementById('getWeatherBtn');
    searchButton.disabled = e.target.value.trim() == '' ?  true: false;   
}


const createWeatherWidget = (divId) => {
    const targetDiv = getWeatherDiv(divId)

    targetDiv.innerHTML = `
       <div class="board">
        <h1> - Weather Widget - </h1>

        <div class="search">
            <input type="text" id="cityInput" placeholder="Enter city name / coordinates" />

            <button id="getWeatherBtn" disabled><img src="public/search.png" /></button>
        </div>
    <div id="city"></div>

        <div class="weatherResult" id="weatherResult"></div>
        <div id="error"></div>
    </div>
    `;


    document.getElementById('cityInput').addEventListener('input', disableSearchButton);//disable the button on empty input
    cityInput.addEventListener('keydown', searchByEnterKey);
    document.getElementById('getWeatherBtn').addEventListener('click', getWeather);
}

const searchByEnterKey = (e) => {
    const searchButton = document.getElementById('getWeatherBtn');
    if (e.key === 'Enter' && !searchButton.disabled) {
        searchButton.click()
    }
}

const fetchWeather = async(apiUrl) => {
    try {
      const response = await fetch(apiUrl);

      if (response.status == "400" || response.status == "404") {
        const errMessage = `Invalid city!, Please input another city.`;
        error.innerHTML = `<h1>${errMessage}</h1>`;
        throw new Error(errMessage);
      }
      return await response.json();
    } catch (err) {
        console.error(err)
    }
}


const getWeather = async () => {
    const city = document.getElementById("city");
    const cityInputtedByUser = document.getElementById("cityInput").value;
    const weatherContainer = document.getElementById("weatherResult");
    const error = document.getElementById("error");

    weatherContainer.innerHTML = "";
    city.innerHTML = "";
    error.innerHTML = "";

    const apiUrl = getApiUrl(cityInputtedByUser, {
        unitGroup: UNIT,
        key: API_KEY,
        include: 14, // get the weather forecast for the next 14 days.
    });

    const jsonRes = await fetchWeather(apiUrl);
  
    city.innerHTML = `<h2>${jsonRes.address.toUpperCase()}</h2>`;
    const days = jsonRes.days;
    for (let i = 0; i < 7; i++) {
        const iconTemp = days[i].icon;
        const averageTemp = (days[i].temp + days[i + 7].temp) / 2;
        const dayOfWeek = new Date(days[i].datetime).toLocaleDateString("en-US", { weekday: "long"});
        const humidity = (days[i].humidity + days[i + 7].humidity) / 2;
        const windspeed = (days[i].windspeed + days[i + 7].windspeed) / 2;
        const dayDiv = document.createElement("div");
        dayDiv.innerHTML = `
            <div class="card">
                <h3>${dayOfWeek}</h3>
                <img src="public/${iconTemp}.png" alt="${days[i].icon}"/>
                <h2> ${averageTemp.toFixed(0) + "°C"}</h2>
                <div class="details">
                    <div class="col">
                        <img src="public/humidity.png" alt="humidity icon" />
                            <div class="humidity">
                                <p>${humidity.toFixed(0)}%<p>
                                <p>Humidity<p>
                            </div>
                    </div>
                    <div class="col">
                        <img src="public/wind.png" alt="wind icon" />
                        <div class="wind">
                            <p>${windspeed.toFixed(1)} km/h<p>
                            <p>Wind Speed<p>
                        </div>
                    </div>
                </div>
            </div>
        `;
        weatherContainer.appendChild(dayDiv);
    }
}

if (document.readyState === 'loading') {  // Document is still loading
    document.addEventListener('DOMContentLoaded', function () {
        createWeatherWidget(WEATHER_DIV_ID)
    });
} else {  // DOMContentLoaded already fired
    createWeatherWidget(WEATHER_DIV_ID)
}
