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
// safari 10.0 以上版本的geolocation API只接受https連線請求
var key = true;
function initMap() {
    var stopId = stop.value;
    var locate = { err: '定位失敗，使用系統預設值', lat: 24.052171, lng: 120.892433 };
    if (stopId) {
        lat = parseFloat(pigPos[stopId].lat);
        lng = parseFloat(pigPos[stopId].lon);
        locate = { lat: lat, lng: lng };
        return getMap(locate);
    }
    if (navigator.geolocation) {
        return getUserLocation()
            .then(data => key ? getMap(data) : '')
            .catch(() => key ? getMap(locate) : '')
    }
    getMap(locate);
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
    if (locate.err) alert(locate.err);
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
    pos.lon = parseFloat(pos.lon) + 828 * lngPerMeter;
    pos.lat = parseFloat(pos.lat) - 207 * latPerMeter;
}

function createAllMarkers() {
    

    // createAllMarkers();
    // Add markers to the map: markers = all stop
    markers = [];
    function mark(i, location) {
        TWD67toWGS84(location);
        return new google.maps.Marker({
            position: { lng: parseFloat(location.lon), lat: parseFloat(location.lat) },
            id: i
        });
    }

    // for function getMarkerById
    markerDict = {};

    // create all markers
    for (let i in pigPos) {
        markerDict[i] = mark(i, pigPos[i]);
        markers.push(markerDict[i]);
    }

    // When markers onclick
    markers.map(v => v.addListener('click', () => {
        addInfoWindows(v);
        var marker = getMarkerById(v.id);
        addMarkerAddr(marker.id);
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

function addMarkerAddr(stopId) {
    var list = pigArea[stopId];
    var cityId = list.cityId;
    var countyId = list.countyId;
    console.log({ cityId, countyId, stopId });
    changeOptSelected(city, cityId);
    renderCounty();
    changeOptSelected(county, countyId);
    renderStations()
    changeOptSelected(stop, stopId);
}

function changeOptSelected(selectElement, optionElement) {
    var list = selectElement.childNodes;
    for (let i in list) {
        list[i].selected =
            list[i].value === optionElement ? true : false;
    }
}