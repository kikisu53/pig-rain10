var city = document.querySelector('#city');
var county = document.querySelector('#county');
var stop = document.querySelector('#stop');
var region = document.querySelector('.region');
var addrs = document.querySelector('#addrs');
renderCity();
renderTimespan();
city.addEventListener('change', () => {
  renderCounty();
  renderStations();
});
county.addEventListener('change', () => {
  renderStations();
});
region.addEventListener('change', () => {
  console.log('hi');
  showStationById(stop.value);
})
// <% if (messages.areaId.length > 0) { %>
//   var repeatNotification = document.querySelector('.<%= messages.areaId %>');
//   repeatNotification.classList.add('flash');
//   var flash = document.createElement('p')
//   flash.textContent = '<%= messages.info %>';
//   repeatNotification.appendChild(flash);
// <% } %>
function renderCity() {
  for (let area in pigCity) {
    let option = document.createElement('option');
    option.text = pigCity[area];
    option.setAttribute('value', area);
    city.add(option);
  }
}

function renderCounty() {
  removeAllChild(county);
  var citySelected = city.value;
  var countyFiltered = pigCounty[citySelected];
  for (let area in countyFiltered) {
    let option = document.createElement('option');
    option.text = countyFiltered[area];
    option.setAttribute('value', area);
    county.add(option);
  }
}
function renderStations() {
  removeAllChild(stop);
  var stopFiltered = pigStop[county.value];
  for (let area in stopFiltered) {
    let option = document.createElement('option');
    option.text = stopFiltered[area].addr;
    option.setAttribute('value', area);
    stop.add(option)
  }
}
function renderTimespan() {
  var timespan = document.querySelector('#timespan');
  for (let time in pigTimespan) {
    let option = document.createElement('option');
    option.text = pigTimespan[time];
    option.setAttribute('value', time);
    timespan.add(option);
  }
}

function renderAddrs() {
  addrs.innerHTML = "";
  addrs.innerHTML = "<option value=''>查詢記錄</option>";
  for(var i=0;i<=addr.length-1;i++){
    let option = document.createElement('option')
    option.text = addr[i]['address'];
    option.setAttribute('value', addr[i]['address']);
    addrs.add(option);
  }
}

addrs.addEventListener('change', () => {
  var addrs = document.getElementById('addrs')
  address.value = addrs.value
  codeAddress(addrs.value)
})

function removeAllChild(parent) {
  while (parent.firstChild) {
    parent.removeChild(parent.firstChild);
  }
}


//list_form
var checkThreshold = (threshold) => {
  var rainRule = /^[0-9]+(\.[0-9]{0,1})?$/, str='';
  threshold = document.getElementById(threshold).value;
  (!rainRule.test(threshold) || !isFinite(threshold))
  ? str='雨量設定有誤' 
  : str;
  document.getElementById('notice_rain').innerHTML=str;
}

var list = () => {
  var city = document.getElementById('city').value,
      county = document.getElementById('county').value,
      stop = document.getElementById('stop').value,
      timespan = document.getElementById('timespan').value,
      threshold = document.getElementById('threshold').value,
      str = '';
      
  if([city, county, stop].some(x => ["", "請選擇縣市", "請選擇鄉鎮區", "請選擇觀測站"].includes(x))) str+='地區 ';
  if(timespan === '請選擇間隔') str+='間隔 ';
  if(threshold === '') str+='雨量 ';
  if(str !== ''){
    str += '欄位不得為空';
    document.getElementById('notice_list').innerHTML=str;
    return false;
  }
  return true;
}

document.querySelector('.submit').addEventListener('submit', list); //?