var request = require("request");
var pigPos = require('../public/data/pig-pos');
var pigArea = require('../public/data/pig-area');

function checkPos(stopId){
    if(stopId in pigPos)
        return pigPos[stopId]
    var ad;
    if(!(pigArea[stopId] in pigArea)){
        ad = stopId
    }else{
        ad = pigArea[stopId].city+pigArea[stopId].addr
    }
    console.log(ad)
    var addr = 'http://maps.googleapis.com/maps/api/geocode/json?address='
                +encodeURIComponent(ad)
                +'&sensor=false&language=zh-tw';
    console.log(transPos(addr));
    return addr;
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
            return res(pos);
        })
    )
}

module.exports ={
    checkPos,
    transPos
}