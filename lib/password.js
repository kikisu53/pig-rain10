var bcrypt = require('bcrypt');

var myPlaintextPassword = '12345678';
var falsePassword = '123456789';
var saltRounds = 10;
bcrypt.hash(myPlaintextPassword, saltRounds, function(err, hash) {
  // Store hash in your password DB.
  console.log(hash);
  bcrypt.compare('12345678', hash, function(err, res) {
    // res == true
    console.log(res);
  });
});

