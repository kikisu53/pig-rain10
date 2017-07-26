var fs = require('fs');
var request = require("request");

var url = 'http://opendata.cwb.gov.tw/opendataapi?dataid=O-A0002-001&authorizationkey=CWB-57B0DDC6-C19A-493E-92C6-540499CB1B6D';

request(url, function (error, response, body) {
    if (error) return console.log(error);
    var list = []
    list.push(body.match(/<stationId>.+<\//g))
    list.push(body.match(/<lat>.+<\//g))
    list.push(body.match(/<lon>.+<\//g))
    //list.push(body.match(/<weatherElement[^>]*>([\w|\W]*)<\/weatherElement>/g))
    //list.push(body.match(/RAIN.+<\/value>/g))
    
    
    var pos = {}
    for(var i=0;i<list[0].length;i++){
        list[0].map( (v,k) => {
            list[0][i] = list[0][i].replace(/<stationId>|<\//g, '')
            return pos[list[0][i].substr(0,5)] = {
                    lat: list[1][i].replace(/<lat>|<\//g, ''),
                    lon: list[2][i].replace(/<lon>|<\//g, ''),
                    //high: list[3][i].replace(/^[\d\.]/g, ''),
                    //rain: list[4][i].replace(/^[\d\.]/g, '')
            }
        }
         
    )}
    
    console.log(list);
    writeJs('pig-pos', 'pigPos', JSON.stringify(pos));
});

var date = new Date().toUTCString();
function writeJs(file, name, data){
    data = '//update time:' + date + '\r\n'
           + 'const ' + name + ' = ' + data + '\r\n'
           + '\r\n'
           + 'if (typeof module != "undefined" && module.exports) { \r\n'
           + '\t module.exports = ' + name + '; \r\n'
           + '}';
    fs.writeFile('../public/data/'+file+'.js', data,function(error){ //把資料寫入檔案
        if(error){ //如果有錯誤，把訊息顯示並離開程式
            console.log('檔案 public/data/'+file+'.js 寫入錯誤');
        }
    });
}