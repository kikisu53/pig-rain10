// same as list.js
// const city = document.querySelector('#city');
// renderCity();
// const county = document.querySelector('#county');
// const stop = document.querySelector('#stop');
// city.addEventListener('change', () => {
//   renderCounty();
//   renderStations();
//   initMap();
// });
// county.addEventListener('change', ()=>{
//   renderStation();
//   initMap();
// });
// renderTimespan();
// stop.addEventListener('change', ()=>{
//   initMap();
// });

function showStationById(id) {
    key = false;
    if(map===undefined) return initMap(id); //預防地圖未產生前，使用者就點選頁面上功能（地圖為非同步）
    console.log(id);
    var marker = getMarkerById(id);
    var pos = {
        lat: marker.position.lat(),
        lng: marker.position.lng()
    }
    console.log(pos);
    map.setZoom(15);
    map.setCenter(pos);
    console.log(map.getCenter())
    setTimeout(() => google.maps.event.trigger(marker, 'click'), 1000);
}

function getMarkerById(id) {
    return markerDict[id];
}

var map;
var markers;
var infoWindow;
var markerDict;
var heremark;
// safari 10.0 以上版本的geolocation API只接受https連線請求

var key = true; //避免使用者點選頁面功能後，網頁才偵測出使用者的GPS
function initMap(stopId) {
    geocoder = new google.maps.Geocoder();
    var locate = { lat: 24.052171, lng: 120.892433 };

    if (stopId) {
        key = false;
        console.log(key)
        lat = parseFloat(pigPos[stopId].lat);
        lng = parseFloat(pigPos[stopId].lon);
        locate = { lat: lat, lng: lng };
        return getMap(locate);
    }
    getMap(locate);
    if (navigator.geolocation) {
        return getUserLocation()
            .then(data => {
                if(key) {
                    alert('為您定位中');
                    map.setCenter(data);
                    heremark = new google.maps.Marker({
                        position: data,
                     //   icon: 'https://s3-us-west-2.amazonaws.com/bh7tjgl2y35m6ivs/pig-cwb/here.png',
                        map: map
                    });
                }
            })
            .catch(() => key ? alert('無法偵測到您到位置') : '')
    }
}

function getUserLocation() {
    return new Promise((res, rej) =>
        navigator.geolocation.getCurrentPosition(
            position => {
                var lat = position.coords.latitude, lng = position.coords.longitude;
                (lat > 20 && lat < 27 && lng > 116 && lat < 122)
                    ? res({ lat: lat, lng: lng })
                    : res({ err: '您的位置不在服務範圍內，使用系統預設值', lat: 24, lng: 121 })
            },
            err => rej(err.code)
        )
    );
}

function getMap(locate) {
    //Create google map
    map = new google.maps.Map(document.querySelector('#map'), {
        zoom: 14,
        center: { lat: locate.lat, lng: locate.lng }
    });
    infoWindow = new google.maps.InfoWindow();
    createAllMarkers();
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

function createAllMarkers() {
    

    // createAllMarkers();
    // Add markers to the map: markers = all stop
    markers = [];
    function mark(i, location, type) {
        location = TWD67toWGS84(location);
        pos = type==='noGPS'
        ? location
        : { lng: parseFloat(location.lon), lat: parseFloat(location.lat) };
        return new google.maps.Marker({
            position: pos,
            id: i
        });
    }

    // for function getMarkerById
    markerDict = {};

    // create all markers
    for (let i in pigArea) {
        if(pigPos[i]===undefined) {
            console.log(i)
            var data = pigArea[i];
            findGPS(data.city+data.addr).then( GPS => {
                markerDict[i] = mark(i, GPS, 'noGPS');
                markers.push(markerDict[i]);
            });
            continue;
        }
        markerDict[i] = mark(i, pigPos[i]);
        markers.push(markerDict[i]);
    }

    // When markers onclick
    markers.map(v => v.addListener('click', () => {
        addInfoWindows(v);
        addMarkerAddr(v.id);
    }));

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers, {
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        minimumClusterSize: 3
    });
}

function addInfoWindows(marker) {
    var id = marker.id;
    var rainfall = pigRain[id];
    var contentString
    if (!pigArea[id]) {
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

function codeAddress() {
    var address = document.getElementById('address').value;
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
            icon: 'https://www.spreadshirt.it/image-server/v1/designs/117102917,width=178,height=178/i-am-here.png'
        });
      } else {
        alert('地址轉換失敗，請輸入有效地址');
      }
    });
  }

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

function findGPS(addr){
    geocoder = new google.maps.Geocoder();
    return new Promise((res,rej) => 
        geocoder.geocode( { 'address': addr }, function(results, status) {
            if (status == 'OK') res(results[0].geometry.location);
            console.log(status);
        })
    );

}

