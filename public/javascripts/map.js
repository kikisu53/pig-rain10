function test(ss){
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

// safari 10.0 以上版本的geolocation API只接受https連線請求
var key = true; //因為定位非同步，有時候使用者已經選擇位置，故當key＝true使用user GPS 定位
function initMap(findStop){
    var stopId = findStop || stop.value;
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

    // Add markers to the map: markers = all stop
    var markers = [];
    function mark(i, location){
        return new google.maps.Marker({
            position: {lng: parseFloat(location.lon), lat: parseFloat(location.lat)},
            id: i
        })
    }
    for(let i in pigArea){ //針對pigArea中每個雨量觀測站，到pigPos取經緯度
        if(pigPos[i]===undefined) {console.log(i); continue;};
        markers.push(mark(i,pigPos[i]))
    }
    // When markers onclick
    markers.map( v => v.addListener('click', () => test(v.id)));

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers,{
        imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        minimumClusterSize: 3
    });
}