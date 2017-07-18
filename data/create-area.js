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
        list = array[city_id, city, county, spot_id, spot_addr, spot_name, county_id]
*/
    list = body.match(/Area.+<\/span>/g)
                .map( (v,i) => 
                    (v+'C'+i).replace(/\s/g,'')
                        .replace(/<\/|[>/=']|title|span|\([0-9A-Z]{5}\)|td/g,'<')
                        .replace(/(<)+/g, '<')
                        .replace(/.{2}[縣市]/, s => ''+s+'<')
                        .replace(/[0-9A-Z]{5}/g, s => ''+s+'<')
                        .split('<')
                    );
    //writefile: pig-area.json
    //{stop-id(S) :{city:'S', stop:'S',addr:'S' }}
    var area ={};
    list.map( v => 
        area[v[3]] = {
            city: v[1]+v[2],
            stop: v[5],
            addr: v[4]
        }
    );
    writeJson('pig-area.json',JSON.stringify(area));
    //writefile: pig-city.json
    //{<city-id, type = string>: <city name, type = string>,...}
    area ={};
    list.map( v => area[v[0]] = v[1]);
    writeJson('pig-city.json',JSON.stringify(area));
    //writefile: pig-county.json
    //{<city-id, type = string>: 
    //	{<county-id, type = string>: <county name, type = string>,...},
    //  ...
    //}
    area ={};
    list.map( v => {
        if(area[v[0]]===undefined) area[v[0]]={};
        area[v[0]][v[6]] = v[2];
    });
    writeJson('pig-county.json',JSON.stringify(area));
    //writefile: pig-stop.json
    //{ <county-id, type = string>: 
	//	{ <stop-id, type = string>:
    //		{ "name": <stop name, type = string>, "addr": <stop name, type = string>},
    //      ...
    //  },...
    //}
    area ={};
    list.map( v => {
        if(area[v[6]]===undefined) area[v[6]]={};
        area[v[6]][v[3]] = {
            name: v[5],
            addr: v[4]
        }
    });
    writeJson('pig-stop.json',JSON.stringify(area));
});

var date = new Date().toUTCString();
function writeJson(filename, data){
    fs.writeFile(__dirname+'/'+filename, '//update time:'+date+'\r\n'+data,function(error){ //把資料寫入檔案
        if(error){ //如果有錯誤，把訊息顯示並離開程式
            console.log('檔案'+filename+'寫入錯誤');
        }
    });
}