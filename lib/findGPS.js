var request = require("request");
var pigPos = require('../public/data/pig-pos');
var pigArea = require('../public/data/pig-area');

var findGPS = (stopId) => {
    if(stopId in pigPos)
        return console.log(pigPos[stopId]); //{lat: '24.9994', lon: '121.4338'}
    console.log('we do not have pos')
    var addr = 'http://maps.googleapis.com/maps/api/geocode/json?address='
                +encodeURIComponent(pigArea[stopId].city+pigArea[stopId].addr)
                +'&sensor=false&language=zh-tw';
    transPos(addr);
}

//google api :
//http://maps.googleapis.com/maps/api/geocode/json?address=新北市板橋大觀路二段265巷62號&sensor=false&language=zh-tw
function transPos(url){
    return new Promise((res, rej) => 
        request(url, function (error, response, body) {
            if (error) return console.log('Can not transform pos');
            body = JSON.parse(body)
            //console.log(typeof body.results[0].geometry.location.lat) //Number
            pos = { 
                    'lat' : body.results[0].geometry.location.lat, 
                    'lng' : body.results[0].geometry.location.lng
                }
            return res(pos)
        })
    )
}

module.exports ={
    findGPS
}