// Variables declared in list.js
// var city = document.querySelector('#city');
// var county = document.querySelector('#county');
// var stop = document.querySelector('#stop');

var map;
var markers;    //所有測站marker
var addr = [];  //user查詢過的地址的markers，存進array
var heremark;   //使用者位置的marker
var infoWindow; //顯示標記資訊視窗使用
var geocoder;   //地址轉經緯度使用
var markerDict; //markers陣列

function initMap() {
    var lastLocation = document.querySelector('.mapCenter').value;
    lastLocation = lastLocation && JSON.parse(lastLocation);
    var locate = lastLocation || { lat: 24.052171, lng: 120.892433 };
    getMap(locate);
    createAllMarkers();
}

function getMap(locate) {
    //Create google map
    map = new google.maps.Map(document.querySelector('#map'), {
        zoom: 14,
        center: { lat: locate.lat, lng: locate.lng }
    });
    infoWindow = new google.maps.InfoWindow(); //顯示標記資訊視窗使用
    geocoder = new google.maps.Geocoder(); //地址轉經緯度使用
}

// Add markers to the map: markers = all stop
function createAllMarkers() {
    markers = [];
    markerDict = {}; // for function getMarkerById

    // create all markers
    for (let i in pigArea) {
        if(pigPos[i]===undefined) { //if the stop has no GPS, find it using Google API
            var data = pigArea[i];
            getGPS(data.city+data.addr).then( GPS => {
                markerDict[i] = mark(i, GPS, 'noGPS');
                markers.push(markerDict[i]);
            });
            continue;
        }
        markerDict[i] = mark(i, pigPos[i]);
        markers.push(markerDict[i]);
    }

    // While markers onclick
    markers.map(v => v.addListener('click', () => {
        addInfoWindows(v);
        addMarkerAddr(v.id);
        var mapCenter = {
            lng: map.getCenter().lng(), 
            lat: map.getCenter().lat()
        };
        document.querySelector('.mapCenter').value = JSON.stringify(mapCenter);
    }));

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers, {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        minimumClusterSize: 3
    });
}

function getGPS(addr){
    return new Promise((res,rej) => 
        geocoder.geocode( { 'address': addr }, function(results, status) {
            if (status == 'OK') res(results[0].geometry.location);
            console.log(status);
        })
    );
}

// get Marker
function mark(stopId, location, type) {
    location = TWD67toWGS84(location);
    pos = type==='noGPS'
    ? location
    : { lng: parseFloat(location.lon), lat: parseFloat(location.lat) };
    return new google.maps.Marker({
        position: pos,
        id: stopId
    });
}

function TWD67toWGS84(pos) {
    // TWD67 橫座標 ＝ TWD97 橫座標 － 828 公尺
    // TWD67 縱座標 ＝ TWD97 縱座標 ＋ 207 公尺
    var lngPerMeter = 360 / (6378137 * 2 * Math.PI);
    var latPerMeter = 180 / (6378137 * 2 * Math.PI);
    
    // 100 跟 200 為工人智慧修正量
    pos.lon = parseFloat(pos.lon) + (100 + 828) * lngPerMeter;
    pos.lat = parseFloat(pos.lat) - (200 + 207) * latPerMeter;
    return pos;
}

// set the stop choosen by user in the center of Map, and the infoWindow of the stop
function showStopById(stopId) {
    if(map===undefined) return initMap(stopId); //預防地圖未產生前，使用者點選頁面上功能（地圖為非同步）
    console.log(stopId);
    var marker = getMarkerById(stopId);
    var pos = {
        lat: marker.position.lat(),
        lng: marker.position.lng()
    }
    console.log(pos);
    map.setZoom(15);
    map.setCenter(pos);
    console.log(map.getCenter())
    setTimeout(() => google.maps.event.trigger(marker, 'click'), 500);
}

// find marker belong to the stop using stopId
function getMarkerById(stopId) {
    return markerDict[stopId];
}

function addInfoWindows(marker) {
    var id = marker.id;
    var rainfall = pigRain[id];
    var contentString
    if (!pigArea[id] || !rainfall) {
        contentString = '尚無資料';
    } else {
        contentString = ['行政區: ' + pigArea[id].city,
        '測站: ' + pigArea[id].stop,
        '位址: ' + pigArea[id].addr,
        '10分鐘 : ' + rainfall[0] + ' mm',
        '1小時 : ' + rainfall[1] + ' mm',
        '3小時 : ' + rainfall[2] + ' mm',
        '6小時 : ' + rainfall[3] + ' mm',
        '12小時 : ' + rainfall[4] + ' mm',
        '24小時 : ' + rainfall[5] + ' mm',
        '本日 : ' + rainfall[6] + ' mm',
        '前一日 : ' + rainfall[7] + ' mm',
        '前二日 : ' + rainfall[8] + ' mm'
        ].join('<br>');
    }
    infoWindow.setContent(contentString);
    infoWindow.open(map, marker);
}

// 使用者點Marker後，下拉式選單變成對應的位置
function addMarkerAddr(stopId){
    var list = pigArea[stopId];
    var cityId = list.cityId;
    var countyId = list.countyId;
    changeOptSelected(city, cityId);
    renderCounty();
    changeOptSelected(county, countyId);
    renderStations()
    changeOptSelected(stop, stopId);
}

function changeOptSelected(selectElement, optionElement) {
    var list = selectElement.childNodes;
    for(let i in list){
        list[i].selected = 
            list[i].value===optionElement ? true : false;
    } 
}

function setMapOnAll(map) {
    for (let i = 0; i < addrArr.length; i++) 
        addrArr[i].setMap(map);
}

function clearMarkers() {
    setMapOnAll(null);
}

function addressExists(address) {
  let result;  
  addrArr.some(function(e) {
    if(e.address === address) result = e;  
  });
  return result;
}

function storageExists(address) {
    if(address in localStorage)
        return true 
    return false
}

function codeAddress() {
    var address = document.getElementById('address').value;
    var addrs = document.querySelector('#addrs');
    if(addrArr.length !== 0) clearMarkers();
    if (addressExists(address) && storageExists(address)) {
        var marker = addressExists(address);
        console.log(marker)
        map.setCenter(marker['position']);
        marker.setMap(map);
        return false;
    }
    geocoder.geocode( { 'address': address }, function(results, status) {
      if (status === 'OK') {
        map.setCenter(results[0].geometry.location);
        marker = new google.maps.Marker({
            //size: new google.maps.size(20,30),
            map: map,
            position: results[0].geometry.location,
            icon: 'https://s3-us-west-2.amazonaws.com/bh7tjgl2y35m6ivs/pig-cwb/here.png'
        });
        marker['address']=address;
        addrArr.push(marker); //store all records
        if(!storageExists(address)) {
            localStorage[address] = address;
            console.log(localStorage[address])
            console.log(addrArr)
            let option = document.createElement('option')
            option.text = address;
            option.setAttribute('value', address);
            addrs.add(option); //select add
        }
      } else {
        alert('地址轉換失敗，請輸入有效地址');
      }
    });
  }

// when user ask his GPS, the cneter of Map = user's GPS, and mark it.
document.querySelector('.getLocation').addEventListener('click', useCurrentLocation);
function useCurrentLocation() {
    if (navigator.geolocation) {
        return getUserLocation()
            .then(data => {
                if(data.err) return alert(data.err);
                alert('為您定位中');
                heremark.setMap(null); //刪除舊的heremark
                map.setCenter(data);
                heremark = new google.maps.Marker({
                    position: data,
                    icon: 'https://s3-us-west-2.amazonaws.com/bh7tjgl2y35m6ivs/pig-cwb/here.png',
                    map: map
                });
            })
            .catch(() => alert('無法偵測到您到位置'))
    }
}

// safari 10.0 以上版本的geolocation API只接受https連線請求
function getUserLocation() {
    return new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(
            position => {
                var lat = position.coords.latitude, lng = position.coords.longitude;
                (lat > 20 && lat < 27 && lng > 116 && lat < 122)
                    ? res({ lat: lat, lng: lng })
                    : res({ err: '您的位置不在服務範圍內'})
            },
            err => rej(err.code)
        )
    );
}

//update rain data, when rain data change
function sse(){
    if(typeof(EventSource) !== "undefined") {
        var source = new EventSource("/getdata/sse");
        source.onmessage = function(event) {
            pigRain = JSON.parse(event.data);
        };
    }
}
sse();
