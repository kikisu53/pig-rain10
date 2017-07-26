function test(ss){
    alert(ss)
}
function initMap() {
    //Create google map
    var map = new google.maps.Map(document.getElementById('map'), {
        zoom: 10,
        center: {lat: 25, lng: 121}
    });

    // Add some markers to the map.
    var markers = locations.map(function(location, i) {
        return new google.maps.Marker({
        position: location,
        id: i
        });
        
    });

    // When markers onclick
    markers.map( v => v.addListener('click', () => test(v.id)));

    // Add a marker clusterer to manage the markers.
    var markerCluster = new MarkerClusterer(map, markers,
        {imagePath: 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m',
        minimumClusterSize: 3
        });
}

//{id:{lat, lon}}
    var locations = [
    {lng: -33.718234, lat: 50.363181, alt:0},
    {lng: -33.727111, lat: 50.371124, alt:0},
    {lng: -33.848588, lat: 51.209834, alt:0},
    {lng: -33.851702, lat: 51.216968, alt:0},
    {lng: -34.671264, lat: 50.863657, alt:0},
    {lng: -35.304724, lat: 48.662905, alt:0},
    {lng: -36.817685, lat: 75.699196, alt:0},
    {lng: -36.828611, lat: 75.790222, alt:0},
    {lng: -37.750000, lat: 45.116667, alt:0},
    {lng: -37.759859, lat: 45.128708, alt:0},
    {lng: -37.765015, lat: 45.133858, alt:0},
    {lng: -37.770104, lat: 45.143299, alt:0},
    {lng: -37.773700, lat: 45.145187, alt:0},
    {lng: -37.774785, lat: 45.137978, alt:0},
    {lng: -37.819616, lat: 44.968119, alt:0},
    {lng: -38.330766, lat: 44.695692, alt:0}
    ]

