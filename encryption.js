var crypto = require('crypto');

var BigInteger = require('big-integer');
var Forge = require('node-forge');

//Encryption
function encrypt(data) {
    var cipher = crypto.createCipher('aes-256-cbc', key);
    var crypted = cipher.update(data, 'utf-8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

function decrypt(data) {
    var decipher = crypto.createDecipher('aes-256-cbc', key);
    var decrypted = decipher.update(data, 'hex', 'utf-8');
    decrypted += decipher.final('utf-8');

    return decrypted;
}

var key = "supersecretkey";

module.exports = {
    encrypt: encrypt,
    decrypt: decrypt,
    generateKey:generateKey
}

function generateKey(CB) {
    // var random1 = Math.random();
    // var random2 = Math.random();
 
 
     Forge.prime.generateProbablePrime(32, function (err, num1) {
       var p = BigInteger(num1);
       Forge.prime.generateProbablePrime(32, function (err, num2) {
         var q = BigInteger(num2);
         var e = Math.floor(Math.random() * 100);
 
 
         var n = p.multiply(q);
        
         var pMinusOne = BigInteger(num1 - 1);
         var qMinusOne = BigInteger(num2 - 1);
         var phi = pMinusOne.multiply(qMinusOne);
 
         while (true) {
           var gcd = BigInteger.gcd(phi, e);
           if (gcd.equals(BigInteger.one)) {
             break
           }
           e++;
         }
 
         var d = BigInteger(e + "").modInv(phi);
 
 
         var returned = {
 
           publicKey: {
             e: BigInteger(e + "").toString(),
             n: n.toString()
           },
           privateKey: {
             d: d.toString(),
             n: n.toString()
           }
 
         };
         CB(returned);
         
       });
     });
 
 
 
 
   }