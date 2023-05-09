let lat;
let long;
let cityName;
const apiKey = "aec2be107d23157731e420673782f5f3";
let nextDaysData = {};
let currentData = {};

const missingLocation = document.getElementById("missingLocation");
const userLocationWindow = document.getElementById("userLocationWindow");
const closePopupBG = document.getElementById("closePopupBG");

closePopupBG.addEventListener("click", closePopup);
document.addEventListener("keydown", (e) => keyDown(e));

const writeLocationBtn = document
    .getElementById("userLocation")
    .addEventListener("click", () => {
        userLocationWindow.style.display != "block"
            ? (userLocationWindow.style.display = "block")
            : (userLocationWindow.style.display = "none");
        closePopupBG.style.display != "block"
            ? (closePopupBG.style.display = "block")
            : (closePopupBG.style.display = "none");
    });
const useGpsDataBtn = document
    .getElementById("gpsData")
    .addEventListener("click", gps);

const applyCityBtn = document
    .getElementById("applyCityBtn")
    .addEventListener("click", (e) => {
        e.preventDefault();
        let city = document.getElementById("city").value;
        cityWeather(city);
        closePopup();
    });

function closePopup() {
    document.querySelectorAll(".popup").forEach((el) => {
        el.style.display = "none";
    });
}

function keyDown(e) {
    if (e.keyCode === 27) closePopup();
}

function gps() {
    navigator.geolocation.getCurrentPosition((position) => {
        closePopup();
        lat = position.coords.latitude;
        long = position.coords.longitude;
        let currentWeatherCords = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${long}&units=metric&appid=${apiKey}`;
        let nextDaysWeatherCords = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${long}&units=metric&appid=${apiKey}`;
        getWeatherData(currentWeatherCords, nextDaysWeatherCords);
    }, error("GPS data failed"));
}

function cityWeather(city) {
    let currentWeatherCity = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${apiKey}`;
    let naxtDaysWeatherCity = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;
    closePopup();
    getWeatherData(currentWeatherCity, naxtDaysWeatherCity);
}

function error(message) {
    clearNextDaysData();
    const missingLocationWindow = document.getElementById("missingLocation");
    missingLocationWindow.replaceChildren(); //clear previous messages
    const errorMessage = document.createElement("p");
    errorMessage.innerHTML = `Something went wrong </br></br> ${
        message === "Nothing to geocode"
            ? "Location has been not written"
            : message
    } </br></br> Write correct location name again or use GPS Data`;
    missingLocationWindow.appendChild(errorMessage);
    missingLoc();
}

function missingLoc() {
    missingLocation.style.display = "flex";
}

function getWeatherData(currentWeather, nextDaysWeather) {
    fetch(currentWeather).then(function (response) {
        response.json().then(function (data) {
            currentData = data;
            console.log(currentData);
            data.cod != 200
                ? error(data.message)
                : updateCurrentWeatherData(data);
        });
    });
    fetch(nextDaysWeather).then(function (response) {
        response.json().then(function (data) {
            nextDaysData = data;
            console.log(nextDaysData);
            data.cod != 200
                ? error(data.message)
                : updateNextDaysWeatherData(data);
        });
    });
}

function updateCurrentWeatherData(data) {
    const temp = data.main.temp.toPrecision(2) + " C";
    const humidity = data.main.humidity + "%";
    const pressure = data.main.pressure + "HPa";
    const clouds = data.clouds.all + "%";
    const wind = data.wind.speed + "km/h";
    const sunRise = new Date(
        (data.sys.sunrise ? data.sys.sunrise : nextDaysData.city.sunrise) * 1000
    );
    const sunSet = new Date(
        (data.sys.sunset ? data.sys.sunset : nextDaysData.city.sunset) * 1000
    );
    const desc = data.weather[0].description;
    const currentDate = new Date(
        data.timezone
            ? data.dt * 1000
            : (data.dt - nextDaysData.city.timezone) * 1000
    );
    const currentLat = data.coord
        ? data.coord.lat
        : nextDaysData.city.coord.lat;
    const currentLong = data.coord
        ? data.coord.lon
        : nextDaysData.city.coord.lon;

    document.getElementById("temp").innerHTML = temp;
    document.getElementById("humidity").innerHTML = humidity;
    document.getElementById("pressure").innerHTML = pressure;
    document.getElementById("clouds").innerHTML = clouds;
    document.getElementById("windSpeed").innerHTML = wind;
    document.getElementById("sunRise").innerHTML =
        sunRise.getHours() +
        ":" +
        (sunRise.getMinutes() < 10 ? "0" : "") +
        sunRise.getMinutes();
    document.getElementById("sunSet").innerHTML =
        sunSet.getHours() +
        ":" +
        (sunSet.getMinutes() < 10 ? "0" : "") +
        sunSet.getMinutes();
    document.getElementById("desc").innerHTML = desc;
    document.getElementById("currentTime").innerHTML =
        currentDate.getHours() +
        ":" +
        (currentDate.getMinutes() < 10 ? "0" : "") +
        currentDate.getMinutes();
    document.getElementById("currentDay").innerHTML =
        currentDate.toDateString();

    let imgUrl =
        "http://openweathermap.org/img/wn/" + data.weather[0].icon + "@2x.png";
    document.getElementById("currentImg").setAttribute("src", imgUrl);

    const locationLink = document.getElementById("locationLink");
    locationLink.innerHTML = data.name ? data.name : nextDaysData.city.name;
    locationLink.href = `https://openstreetmap.org/#map=10/${currentLat}/${currentLong}`;
}

function updateNextDaysWeatherData(data) {
    const nxtDaysWeather = document.getElementById("nxtDaysWeather");
    //remove previous data
    clearNextDaysData();
    const dayName = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ];

    // for (let i = 0; i < data.list.length; i++) {
    //     let currentDay =
    //         dayName[
    //             new Date((data.list[i].dt - data.city.timezone) * 1000).getDay()
    //         ];
    //     let previusDay =
    //         i > 0
    //             ? dayName[
    //                   new Date(
    //                       (data.list[i - 1].dt - data.city.timezone) * 1000
    //                   ).getDay()
    //               ]
    //             : "";
    //     if (currentDay != previusDay) {
    //         let singleDay = document.createElement("div");
    //         singleDay.classList.add("singleHour");
    //         singleDay.innerHTML = `<h2>${currentDay}</h2>`;
    //         nxtDaysWeather.appendChild(singleDay);
    //     }
    // }

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
        let singleHour = document.createElement("div");
        singleHour.classList.add("singleHour");
        singleHour.id = i;
        singleHour.innerHTML = `<p>${dayName[currentDate.getDay()]}</br>${
            currentDate.getHours() + ":0" + currentDate.getMinutes()
        }</p><p>${desc}</><img src="${imgUrl}"/><p>${temp}</p>`;
        nxtDaysWeather.appendChild(singleHour);
    }
}

function clearNextDaysData() {
    document.querySelectorAll(".singleHour").forEach((el) => {
        el.remove();
    });
}

//UI - highlight clicked tile of upcoming weather
function fillCurrentWeather(e) {
    if (e.target.className === "singleHour") {
        if (e.target.style.background != "rgba(0, 0, 0, 0.8)") {
            updateCurrentWeatherData(nextDaysData.list[e.target.id]);
            e.target.parentElement.childNodes.forEach((element) => {
                element.style.background = "rgba(0, 0, 0, 0.5)";
            });
            ("rgba(0, 0, 0, 0.5)");
            e.target.style.background = "rgba(0, 0, 0, 0.8)";
        } else {
            updateCurrentWeatherData(currentData);
            e.target.style.background = "rgba(0, 0, 0, 0.5)";
        }
    }

    if (e.target.parentElement.className === "singleHour") {
        if (e.target.parentElement.style.background != "rgba(0, 0, 0, 0.8)") {
            updateCurrentWeatherData(
                nextDaysData.list[e.target.parentElement.id]
            );
            e.target.parentElement.parentElement.childNodes.forEach(
                (element) => {
                    element.style.background = "rgba(0, 0, 0, 0.5)";
                }
            );
            e.target.parentElement.style.background = "rgba(0, 0, 0, 0.8)";
        } else {
            updateCurrentWeatherData(currentData);
            e.target.parentElement.style.background = "rgba(0, 0, 0, 0.5)";
        }
    }
}

const nextDaysWeather = document
    .getElementById("nxtDaysWeather")
    .addEventListener("click", (e) => fillCurrentWeather(e));
