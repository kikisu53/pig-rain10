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

//新增或修改資料
// ConditionExpression = true, exceute the command,
// ConditionExpression = true, not exceute the command,
function update(data, condition) {
    var params = {
        ExpressionAttributeNames: {
            "#pw": "password",
            "#ur":"user"
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
    return new Promise((res, rej) => 
        dynamodb.updateItem(params, (err, data) =>
            err ? rej(err) : res(data)
        )
    );
}

function register(data){
    return encode(data.password)
        .then(
            result => update({user:data.user, password:result}, "attribute_not_exists(#ur)"),
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
            result => update({user:data.user, password:result}, "attribute_exists(#ur)"),
            err => err
        )
}

function changepw(data){
    return login({user:data.user, password:data.password} ).then(
        result => {
            switch(result){
                case 0:
                    res.render('login', {err:'帳號不存在', csrfToken: req.csrfToken()});
                break;
                case 2:
                    req.session = {logined: true, user:user};
                    res.redirect('list');
                break;
                case 3:
                    res.render('login', {err:'帳號密碼錯誤', csrfToken: req.csrfToken()});
                break;
                default:
                    res.render('login', {err:'Error', csrfToken: req.csrfToken()});
                break; 
            }
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
