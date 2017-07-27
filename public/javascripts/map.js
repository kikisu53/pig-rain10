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
    setTimeout(() => google.maps.event.trigger(marker, 'click'), 1000);
    
}
function getMarkerById(id) {
    return markerDict[id];
}
var map;
var markers;
var infoWindow;
var markerDict;
function initMap() {
    var stopId = stop.value;
    //Create google map
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 7,
        center: { lat: 24.148494, lng: 120.924061 }
    });
    infoWindow = new google.maps.InfoWindow();
    // Add some markers to the map.
    markers = [];
    function mark(i, location) {
        return new google.maps.Marker({
            position: { lng: parseFloat(location.lon), lat: parseFloat(location.lat) },
            id: i
        })
    }
    markerDict = {};
    for (let i in pigPos) {
        markerDict[i] = mark(i, pigPos[i]);
        markers.push(markerDict[i]);
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