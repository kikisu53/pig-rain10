const AWS = require('aws-sdk') //for aws service
const extend = require('extend');
const bcrypt = require('bcrypt');
AWS.config.update({
  region: "us-west-2"
});

const dynamodb = new AWS.DynamoDB();
const saltRounds = 10;

//加密
function encode(plain) {
    return new Promise((res, rej) =>
        bcrypt.hash(plain, saltRounds, (err, hash) =>
            err ? rej(err) : res(hash)
        )
    );
}

//帳號確認
// input: user
// output: resolve('') for user non-existing
//         resolve(password) for user existing
//         reject(err)
function userexist(user){
    var params = {
        Key: {
            "user": {S: user}
        },
        TableName: "pig-user"
    };
    return new Promise((res, rej) =>
        dynamodb.getItem(params, (err, data) =>
            err 
            ? rej(err)
            : data.Item===undefined ? res('') : res(data.Item.password.S)
        )
    )
}

//密碼確認: res(result) = ture for success, false for fail
function pwcheck(plain, hash) {
    return new Promise((res, rej) =>
        bcrypt.compare(plain, hash, (err, result) => {
            err ? rej(err) : res(result)
        }
        )
    );
}

//新增或修改資料
// ConditionExpression = true, exceute the command,
// ConditionExpression = true, not exceute the command,
function update(data, condition) {
    var params = {
        ExpressionAttributeNames: {
            "#pw": "password",
            "#ur": "user"
        }, 
        ExpressionAttributeValues: {
            ":pw": {S: data.password}
        }, 
        Key: { //parimary key, includeing sort key if exist
            "user": {S: data.user},
        }, 
        TableName: "pig-user", 
        UpdateExpression: "SET #pw = :pw",
        ConditionExpression: condition
    };
    if(data.verify){
        params.ExpressionAttributeNames["#vr"] = 'varify';
        params.ExpressionAttributeNames["#exp"] = 'expiration';
        params.ExpressionAttributeValues[":vr"] = {S: data.verify};
        params.ExpressionAttributeValues[":exp"] = {N: data.expiration};
        params.ExpressionAttributeValues[":now"] = {N: Date.parse(new Date()).toString()} 
        params.UpdateExpression += ", #vr = :vr, #exp = :exp";
    }
    console.log(params)
    return new Promise((res, rej) => 
        dynamodb.updateItem(params, (err, data) =>
            err ? rej(err) : res({expiration: data.expiration, verify: data.verify})
        )
    );
}

function register(data){
    var promiseList = [];
    promiseList.push(encode(data.user));
    promiseList.push(encode(data.password));
    var exp = new Date();
    exp.setDate(exp.getDate() + 7);
    var expnum = Date.parse(exp).toString();
    return Promise.all(promiseList)
        .then(
            result => update({
                    user: data.user, 
                    password: result[1],
                    verify: result[0],
                    expiration: expnum
                },
                "attribute_not_exists(#ur) OR (attribute_exists(#ur) AND #exp < :now )"
            ),
            err => err
        )
}

function login(data){
    return userexist(data.user)
        .then(
            result => {
                if(result==='') return 0;
                return pwcheck(data.password, result)
                    .then(
                        result => result ? 2 : 3,
                        err => err
                    );
            },
            err => err
        );
}

function forgetpw(data){
    return encode(data.password)
        .then(
            result => update({
                    user:data.user, 
                    password:result
                }, 
                "attribute_exists(#ur)"
            ),
            err => err
        )
}

function changepw(data){
    return login({user:data.user, password:data.oldpw} ).then(
        result => {
            if(result!==2) return result;
            return encode(data.password)
                .then(
                    result => update({
                        user:data.user, 
                        password:result
                    }, 
                    "attribute_exists(#ur)"),
                    err => err
                )
        },
        err => err
    )
}

// code table
// 0: 帳號不存在
// 1: 帳號存在，但尚未驗證密碼
// 2: 帳號存在，密碼正確
// 3. 帳號存在，密碼不正確

module.exports ={
    register,
    login,
    forgetpw,
    changepw
}