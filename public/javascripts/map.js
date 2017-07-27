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
function initMap(){
    getStopLocation()
    .then( data => data==='none' ? getUserLocation() : data)
    .then( data => getMap(data) )
}

function getUserLocation(){
    return new Promise((res,rej) => 
        navigator.geolocation.getCurrentPosition( position => 
            res( {lat: position.coords.latitude, lng: position.coords.longitude} )
        )
    );
}

function getStopLocation(){
    var stopId = stop.value;
    return new Promise((res,rej) => {
        if(!stopId) return res('none');
        if(stopId) {
            dlat = parseFloat(pigPos[stopId].lat);
            dlng = parseFloat(pigPos[stopId].lon);
            return res({lat: dlat, lng: dlng});
        }
    })
}

function getMap(locate) {
    //Create google map
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 12,
        center: {lat: locate.lat||24, lng: locate.lng||121}
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