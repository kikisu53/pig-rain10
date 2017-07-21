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
    return new Promise((resolve, reject) => 
        dynamodb.getItem(params, (err, data) => 
            err
            ? reject(err)
            : data.Item===undefined ? resolve('') : resolve(data.Item.password.S)
        )
    )
}

//密碼確認
function pwcheck(plain, hash) {
    return new Promise((res, rej) => 
        bcrypt.compare(plain, hash, (err, result) => {
            err ? rej(err) : res(result)
        }
        )
    );
}

function signup(data){
    return userexist(data.user)
    .then(
        result => {
            if(result!=='') return 1;
            return encode(data.password)
                .then(
                    result => {
                        var params = {
                            Item: {
                                "user": {S: data.user}, 
                                "password":{S: result}
                            }, 
                            TableName: "pig-user"
                        }
                        return dynamodb.putItem(params, (err, data) => 
                                err ? err : data
                        )
                    },
                    err => err
                )
            },
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

function update(data){
    return userexist(data.user)
    .then(
        result => {
            if(result==='') return 0;
            return encode(data.password)
                .then(result => {
                    var params = {
                        ExpressionAttributeNames: {
                            "#pw": "password",
                        }, 
                        ExpressionAttributeValues: {
                            ":pw": {S: result}, 
                        }, 
                        Key: { //parimary key, includeing sort key if exist
                            "user": {S: data.user},
                        }, 
                        TableName: "pig-user", 
                        UpdateExpression: "SET #pw = :pw"
                    };
                    return dynamodb.updateItem(params, (err, data) => 
                            err ? console.log(err) : data
                    )
                })
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
    signup,
    login,
    update
}