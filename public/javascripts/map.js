function test(ss) {
    alert(ss)
}

// same list.js
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

<<<<<<< HEAD
// safari 10.0 以上版本的geolocation API只接受https連線請求
var key = true; //因為定位非同步，有時候使用者已經選擇位置，故當key＝true使用user GPS 定位
function initMap(findStop){
    var stopId = findStop || stop.value;
=======
function showStationById(id) {
    console.log(id);
    infoWindow.close();
    var marker = getMarkerById(id);
    var pos = {
        lat: marker.position.lat(),
        lng: marker.position.lng()
    }
    console.log(pos);
    map.setZoom(15);
    map.setCenter(pos);
    console.log(map.getCenter())
    setTimeout(() => google.maps.event.trigger(marker, 'click'), 000);
    
}
function getMarkerById(id) {
    return markers.filter(marker => marker.id === id)[0];
}
var map;
var markers;
var infoWindow;
  // safari 10.0 以上版本的geolocation API只接受https連線請求
function initMap() {
    var stopId = stop.value;
>>>>>>> b4b49fcf33710e104470608f045577ece7a51d20
    var locate = {err:'定位失敗，使用系統預設值',lat: 24, lng: 121};
    if(stopId){
        lat = parseFloat(pigPos[stopId].lat);
        lng = parseFloat(pigPos[stopId].lon);
        var locate = {lat: lat, lng: lng};
        return getMap(locate);
    }
    if(navigator.geolocation){
        return getUserLocation()
        .then( data => key ? getMap(data) : '' )
        .catch( () => key ? getMap(locate) : '')
    }
    getMap(locate);
}

function getUserLocation(){
    return new Promise((res,rej) => 
        navigator.geolocation.getCurrentPosition(
            position => {
                var lat = position.coords.latitude, lng = position.coords.longitude;
                (lat>20 && lat<27 && lng>116 && lat<122)
                ? res({lat: lat, lng: lng})
                : res({err:'您的位置不在服務範圍內，使用系統預設值',lat: 24, lng: 121})
            },
            err => rej(err.code)
        )
    );
}

function getMap(locate) {
    if(locate.err) alert(locate.err);
    //Create google map

    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: locate.lat, lng: locate.lng}
    });
    infoWindow = new google.maps.InfoWindow();
    // Add markers to the map: markers = all stop
    var markers = [];
    function mark(i, location){
        return new google.maps.Marker({
            position: { lng: parseFloat(location.lon), lat: parseFloat(location.lat) },
            id: i
        })
    }
    for(let i in pigArea){ //針對pigArea中每個雨量觀測站，到pigPos取經緯度
        if(pigPos[i]===undefined) {console.log(i); continue;};
        markers.push(mark(i,pigPos[i]))
    }
    // When markers onclick
    markers.map(v => v.addListener('click', () => addInfoWindows(v)));

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers,
        {
            imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
            minimumClusterSize: 3
        });
}
var addInfoWindows = (v) => {
    var id = v.id;
    var contentString
    if (!pigArea[id]) {
        contentString = '尚無資料';
    } else {
        contentString = ['行政區: ' + pigArea[id].city,
        '測站: ' + pigArea[id].stop,
        '位址: ' + pigArea[id].addr
        ].join('<br>');
    }
    infoWindow.setContent(contentString);
    infoWindow.open(map, v);
}