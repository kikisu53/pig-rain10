var fs = require('fs');
var gpsData = require('./rawGPS');

gpsData = gpsData.split('\n').map(x => x.trim());
output = [];
for (var i = 0; i < gpsData.length; i += 12) {
  output.push({
    id: gpsData[i + 0],
    name: gpsData[i + 1],
    altitude: gpsData[i + 2],
    longtitude: gpsData[i + 3],
    latitude: gpsData[i + 4],
    city: gpsData[i + 5],
    address: gpsData[i + 6],
    start_time: gpsData[i + 7],
    end_time: gpsData[i + 8],
    remarks: gpsData[i + 9],
    original_id: gpsData[i + 10],
    new_id: gpsData[i + 11]
  });
}
fs.writeFileSync('pig-area-detailJSON.js', JSON.stringify(output), 'utf8');