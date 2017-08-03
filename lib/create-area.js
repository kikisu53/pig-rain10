var fs = require('fs');
var request = require("request");

var url = 'http://www.cwb.gov.tw/V7/observe/rainfall/A136.htm';
request(url, function (error, response, body) {
    if (error) return console.log('Can not create table "pig-area"');
/*
    html:
        Area7>
            <td>新北市烏來區</td>
            <td><span title='C0A56 福山里李茂岸8號(福山國小旁)'>福山 (C0A56)</span>
    output:
        list = array[city_id, city, county, spot_id, spot_addr, spot_name, '']
*/
    list = body.match(/Area.+<\/span>/g)
                .map( v => 
                    v.replace(/\s/g,'')
                        .replace(/<\/|[>/=']|title|span|\([0-9A-Z]{5}\)|td/g,'<')
                        .replace(/(<)+/g, '<')
                        .replace(/.{2}[縣市]/, s => ''+s+'<')
                        .replace(/[0-9A-Z]{5}/g, s => ''+s+'<')
                        .split('<')
                    );
    //writefile: pig-city.js
    var area ={};
    list.map( v => area[v[0]] = v[1]);
    writeJs('pig-city', 'pigCity', JSON.stringify(area));

    //writefile: pig-county.js
    area ={};
    var county = {}, i=1;
    list.map( v => {
        if(area[v[0]]===undefined) area[v[0]]={};
        if(county[v[2]]===undefined) {
            county[v[2]] = 'C'+i;
            i++;
        }
        area[v[0]][county[v[2]]] = v[2];
    });
    writeJs('pig-county', 'pigCounty', JSON.stringify(area));

    //writefile: pig-area.js
    area ={};
    list.map( v => 
        area[v[3]] = {
            city: v[1]+v[2],
            stop: v[5],
            addr: v[4],
            cityId: v[0],
            countyId: county[v[2]]
        }
    );
    writeJs('pig-area', 'pigArea', JSON.stringify(area));

    //writefile: pig-stop.js
    area ={};
    list.map( v => {
        let countyid = county[v[2]];
        if(area[countyid]===undefined) area[countyid]={};
        area[countyid][v[3]] = {
            name: v[5],
            addr: v[4]
        }
    });
    writeJs('pig-stop', 'pigStop', JSON.stringify(area));
});

var date = new Date().toUTCString();
function writeJs(file, name, data){
    data = '//update time:' + date + '\r\n'
           + 'const ' + name + ' = ' + data + '\r\n'
           + '\r\n'
           + 'if (typeof module != "undefined" && module.exports) { \r\n'
           + '\t module.exports = ' + name + '; \r\n'
           + '}';
    fs.writeFile('./public/data/'+file+'.js', data,function(error){ //把資料寫入檔案
        if(error){
            console.log('檔案 public/data/'+file+'.js 寫入錯誤');
            console.log(error)
        }
    });
}