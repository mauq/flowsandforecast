"use strict";

function toAmpm(curr) {
  let time = curr.substr(11);
  let hour = +time.substr(0, 2);
  let hourCorr = hour % 12 || 12;
  let ampm = (hour < 12 || hour === 24) ? "AM" : "PM";
  time = hourCorr + ampm;
  return time;
}

function swapView(cont, data){
  const cent = document.getElementsByClassName(cont);

  //remove contents of container
  cent[0].innerHTML = "";

  //populate container
  data.forEach((item, i) => {
    const cont = document.createElement('div');
    const rain3hr = document.createElement('div');
    rain3hr.classList.add('bar-cont');
    const chance = document.createElement('p');
    const bar = document.createElement('div');
    bar.classList.add('bar');
    const time = document.createElement('p');

    chance.innerHTML = Math.round(item[1] * 100) + '%';
    bar.style.height = (item[1] * 100) + '%';
    time.innerHTML = item[0];

    cont.appendChild(chance);
    rain3hr.appendChild(bar);
    cont.appendChild(rain3hr);
    cont.appendChild(time);
    cent[0].appendChild(cont);
  });

}

axios.get('http://api.openweathermap.org/data/2.5/forecast?q=Forks&units=imperial&appid=23bd40f43f1959f801895de830da8f31')
  .then(function (response) {
    // handle success
    //console.log(response);

    //city name for weather forecast
    const mainContainer = document.getElementsByClassName('head');
    const city = document.createElement('h1');
    city.innerHTML = response.data.city.name;
    mainContainer[0].appendChild(city);

    //REFORMAT DATA
    let forecast = new Map();
    const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    response.data.list.forEach((item, i) => {
      //convert time to day of the week
      // add 9 hours time to get days to restart at midnight instead of 9 am
      let d = new Date((item.dt + 32400) * 1000);
      let day = daysOfWeek[d.getDay()];

      //convert time to am/pm time
      let t = toAmpm(item.dt_txt);

      //if day of week is not in map, make new daily FlowsandForecast
      //else update daily temp hi and lo and precipitation per 3hours
      if (forecast.has(day) !== true) {
        forecast.set(day, {
          'hi': item.main.temp_max,
          'lo': item.main.temp_min,
          'rain': [[t, item.pop]]
        });
      } else {
        if (forecast.get(day).hi < item.main.temp_max) {
          let temp = forecast.get(day);
          temp.hi = item.main.temp_max;
          forecast.set(day, temp);
        }
        if (forecast.get(day).lo > item.main.temp_min) {
          let temp = forecast.get(day);
          temp.lo = item.main.temp_min;
          forecast.set(day, temp);
        }
        let temp = forecast.get(day);
        temp.rain.push([t, item.pop]);
        forecast.set(day, temp);
      }
    });
    console.log(forecast);

    //with forecast data, populate the dom
    const fiveDay = document.getElementsByClassName('day');
    forecast.forEach((values, keys) => {

      const dayCard = document.createElement('div');
      dayCard.classList.add('day-card');
      dayCard.addEventListener('click', function() {swapView('cent', values.rain)});

      const dayOfWeek = document.createElement('h3')
      const hilo = document.createElement('p');
      dayOfWeek.innerHTML = keys;
      hilo.innerHTML = values.hi + ' ' + values.lo;

      dayCard.appendChild(dayOfWeek);
      dayCard.appendChild(hilo);
      fiveDay[0].appendChild(dayCard);
    });

  })
  .catch(function (error) {
    // handle error
    console.log(error);
  })
  .then(function (response) {
    // always executed
  });
