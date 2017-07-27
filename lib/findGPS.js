var pigPos = require('../public/data/pig-pos');

var findGPS = (stopId) => {
    if(stopId in pigPos)
        return [pigPos[stopId].lat, pigPos[stopId].lon]; //{lat: '24.9994', lon: '121.4338'}
    console.log('we do not have pos')    
}

findGPS('SSSSS');

module.exports ={
    findGPS
}