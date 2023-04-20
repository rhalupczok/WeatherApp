let lat;
let long;
let cityName;
const apiKey = "aec2be107d23157731e420673782f5f3";

const missingLocation = document.getElementById("missingLocation");
const userLocationWindow = document.getElementById("userLocationWindow");

const writeLocationBtn = document
    .getElementById("userLocation")
    .addEventListener("click", () => {
        userLocationWindow.style.display != "block"
            ? (userLocationWindow.style.display = "block")
            : (userLocationWindow.style.display = "none");
    });
const useGpsDataBtn = document
    .getElementById("gpsData")
    .addEventListener("click", gps);

const applyCityBtn = document
    .getElementById("applyCityBtn")
    .addEventListener("click", (e) => {
        e.preventDefault();
        let city = document.getElementById("city").value;
        console.log(city);
        cityWeather(city);
        userLocationWindow.style.display = "none";
    });

function gps() {
    navigator.geolocation.getCurrentPosition((position) => {
        userLocationWindow.style.display = "none";
        lat = position.coords.latitude;
        long = position.coords.longitude;
        let currentWeatherCords = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=${apiKey}`;
        let nextDaysWeatherCords = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&units=metric&appid=${apiKey}`;
        missingLocation.style.display = "none";
        getWeatherData(currentWeatherCords, nextDaysWeatherCords);
    }, missingLoc());
}

function cityWeather(city) {
    let currentWeatherCity = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    let naxtDaysWeatherCity = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    missingLocation.style.display = "none";
    getWeatherData(currentWeatherCity, naxtDaysWeatherCity);
}

function error(message) {
    console.log(message);
    const missingLocationWindow = document.getElementById("missingLocation");
    const errorMessage = document.createElement("p");
    errorMessage.innerHTML = `Something went wrong, error message: ${message}`;
    missingLocationWindow.appendChild(errorMessage);
    missingLocation.style.display = "block";
}

function missingLoc() {
    missingLocation.style.display = "block";
}

function getWeatherData(currentWeather, nextDaysWeather) {
    fetch(currentWeather).then(function (response) {
        response.json().then(function (data) {
            data.cod != 200
                ? error(data.message)
                : updateCurrentWeatherData(data);
        });
    });
    fetch(nextDaysWeather).then(function (response) {
        response.json().then(function (data) {
            data.cod != 200
                ? error(data.message)
                : updateNextDaysWeatherData(data);
        });
    });
}

function updateCurrentWeatherData(data) {
    const temp = data.main.temp.toPrecision(2) + " C";
    const humidity = data.main.humidity + "%";
    const pressure = data.main.pressure + " HPa";
    const clouds = data.clouds.all + "%";
    const wind = data.wind.speed + " km/h";
    const sunRise = new Date(data.sys.sunrise * 1000);
    const sunSet = new Date(data.sys.sunset * 1000);
    const desc = data.weather[0].description;
    const currentDate = new Date(data.dt * 1000);
    console.log(currentDate);

    document.getElementById("temp").innerHTML = temp;
    document.getElementById("humidity").innerHTML = humidity;
    document.getElementById("pressure").innerHTML = pressure;
    document.getElementById("clouds").innerHTML = clouds;
    document.getElementById("windSpeed").innerHTML = wind;
    document.getElementById("sunRise").innerHTML =
        sunRise.getHours() + ":" + sunRise.getMinutes();
    document.getElementById("sunSet").innerHTML =
        sunSet.getHours() + ":" + sunSet.getMinutes();
    document.getElementById("desc").innerHTML = desc;
    document.getElementById("currentTime").innerHTML =
        currentDate.getHours() + ":" + currentDate.getMinutes();
    document.getElementById("currentDay").innerHTML =
        currentDate.toDateString();

    let imgUrl =
        "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
    document.getElementById("currentImg").setAttribute("src", imgUrl);

    const locationLink = document.getElementById("locationLink");
    locationLink.innerHTML = data.name;
    locationLink.href = `https://openstreetmap.org/#map=10/${lat}/${long}`;
}

function updateNextDaysWeatherData(data) {
    const nxtDaysWeather = document.getElementById("nxtDaysWeather");
    const dayName = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    for (let i = 0; i < data.list.length; i++) {
        let temp = data.list[i].main.temp.toPrecision(2) + " C";
        let desc = data.list[i].weather[0].description;
        let currentDate = new Date(
            (data.list[i].dt - data.city.timezone) * 1000
        );
        let imgUrl =
            "http://openweathermap.org/img/wn/" +
            data.list[i].weather[0].icon +
            "@2x.png";
        let singleDay = document.createElement("div");
        singleDay.classList.add("singleDay");
        singleDay.innerHTML = `<p>${dayName[currentDate.getDay()]}</br>${
            currentDate.getHours() + ":0" + currentDate.getMinutes()
        }</p><p>${desc}</><img src="http://openweathermap.org/img/wn/${
            data.list[i].weather[0].icon
        }@2x.png"/><p>${temp}</p>`;
        nxtDaysWeather.appendChild(singleDay);
    }

    let humidity = data.list[i].main.humidity + "%";
    let pressure = data.list[i].main.pressure + " HPa";
    let clouds = data.list[i].clouds.all + "%";
    let wind = data.list[i].wind.speed + " km/h";
    let sunRise = new Date(data.list[i].sys.sunrise * 1000);
    let sunSet = new Date(data.list[i].sys.sunset * 1000);
}
