var fs = require('fs');
var request = require("request");

var url = 'http://www.cwb.gov.tw/V7/observe/rainfall/A136.htm';
request(url, function (error, response, body) {
    if (error) return console.log('Can not create table "pig-data"');
    /*<tr class=Area5><td>屏東縣瑪家鄉</td>
    <td><span title='81R64 佳義村 - 水保局'>佳義國小 (81R64)</span></td>
    <td align=right><font color=black>-</font></td>
    <td align=right><font color=black>-</font></td>
    <td align=right><font color=black>-</font></td>
    <td align=right><font color=black>-</font></td>
    <td align=right><font color=orange>56.5</font></td>
    <td align=right><font color=orange>56.5</font></td>
    <td align=right><font color=orange>56.5</font></td>
    <td align=right><font color=orange>58.5</font></td>
    <td align=right><font color=orange>58.5</font></td></tr>*/
    list = body.match(/title.+<\/td>/g)
                .map( v => 
                    v.replace(/[\u4e00-\u9fa5].[0-9]+/g, '')
                        .replace(/\s/g,'')
                        .replace(/<\/|[>/=']|title|span|align|right|fontcolor|font|black|blue|orange|green|red|\([0-9A-Z]{5}\)|\(|td/g,'')
                        .replace(/(<)+/g, '<')
                        .split('<')
                    );
    //writefile: pig-rain.js
    //{stop-id(S) :{tenMin:'S', one:'S', three:'S', six:'S', twlve:'S', twentyfour:'S', today:'S', beforeOne:'S', beforeTwo:'S' }}
    //console.log(list);
    if(rain !== null) rain = {}
    var rain ={};
    list.map( v => {
        v[0] = v[0].substr(0,5);
    return  rain[v[0]] = [
            v[1],
            v[2],
            v[3],
            v[4],
            v[5],
            v[6],
            v[7],
            v[8],
            v[9]
        ]
    }
    );
    writeJs('pig-rain', 'pigRain', JSON.stringify(rain));
    //writefile: pig-rain.js
    //{<stop-id, type = string>: <threshold, type = string>,...}
});    
var date = new Date().toUTCString();
console.log(date);
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