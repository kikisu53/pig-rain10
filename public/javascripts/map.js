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

function initMap() {
    var stopId = stop.value;

    //Create google map
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: {lat: 25, lng: 121}
    });

    // Add some markers to the map.
    var markers = [];
    function mark(i, location){
        return new google.maps.Marker({
            position: {lng: parseFloat(location.lon), lat: parseFloat(location.lat)},
            id: i
        })
    }
    for(let i in pigPos){
        markers.push(mark(i,pigPos[i]))
    }
    // When markers onclick
    markers.map( v => v.addListener('click', () => test(v.id)));

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers,
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        minimumClusterSize: 3
        });
}