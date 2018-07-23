var bodyParser = require('body-parser');
var fs = require('fs');
var users = require('./files/users.json');
var enc = require('./encryption');
var defaults = require('./files/defaults.json');
var usersByPIN = require("./files/usersByPIN.json");
var usersEmails = require("./files/usersEmails.json");
var usersProfileImage = require("./files/usersProfileImage.json");

function login(req, res) {

    var username, password;

    if (req.body.username) {
        username = req.body.username;
        password = req.body.password;
    }
    else {
        username = req.query.username;
        password = req.query.password;
    }

    username = ((new String(username)).toLowerCase()).toString();


    var bool = false;

    if (users.hasOwnProperty(username)) {
        if (enc.decrypt(users[username].pass) === password) {
            bool = true;
        }
        if (bool) {
            var contacts = [];
            var blockedContacts = [];
            if (users[username].contacts.length > 0) {
                users[username].contacts.forEach(contact => {
                    contact = contact.toString();

                    var obj = {
                        fullname: users[contact].fullname,
                        username: contact,
                        yearOfBirth: users[contact].yearOfBirth,
                        profileImage: usersProfileImage[contact],
                        status: users[contact].status,
                        lastSeen: users[contact].lastSeen
                    }
                    contacts.push(obj);
                });
            }
            //
            if (users[username].blockedContacts.length > 0) {
                users[username].blockedContacts.forEach(contact => {
                    contact = contact.toString();

                    var obj = {
                        fullname: users[contact].fullname,
                        username: contact,
                        yearOfBirth: users[contact].yearOfBirth,
                        profileImage: usersProfileImage[contact]
                    }
                    blockedContacts.push(obj.username);
                });
            }
            var contactsRequests = [];
            if (users[username].hasOwnProperty('contactsRequests')) {
                contactsRequests = users[username].contactsRequests;
            }
            res.json({
                ok: bool,
                username: username,
                email: usersEmails[username],
                fullname: users[username].fullname,
                yearOfBirth: users[username].yearOfBirth,
                profileImage: usersProfileImage[username],
                contactsRequests: contactsRequests,
                pin: users[username].pin,
                privacy: users[username].privacy,
                message: "Logged In!",
                contacts: contacts,
                blockedContacts: blockedContacts
            });
        }
        else {
            res.json({
                ok: bool,
                message: "Username or Password Entered Wrong!"
            });
        }
    }

    else {
        res.json({
            ok: bool,
            message: "Username or Password Entered Wrong!"
        });
    }

}

function signup(req, res) {
    var username, password, email, fullname, yearOfBirth;
    if (req.body.username) {
        username = req.body.username;
        password = req.body.password;
        email = req.body.email;
        fullname = req.body.fullname;
        yearOfBirth = req.body.yearOfBirth;
    } else {
        username = req.query.username;
        password = req.query.password;
        email = req.query.email;
        fullname = req.query.fullname;
        yearOfBirth = req.query.yearOfBirth;
    }
    username = ((new String(username)).toLowerCase()).toString();
    email = ((new String(email)).toLowerCase()).toString();

    if (users[username]) {
        res.json({
            ok: false,
            message: "Username Already Exist!"
        });
    }
    else if (usersEmails[email]) {
        res.json({
            ok: false,
            message: "Email Already Used!"
        });
    }
    else {
        enc.generateKey((RSAkey) => {
            var publicKey = JSON.stringify(RSAkey.publicKey);
            var privateKey = JSON.stringify(RSAkey.privateKey);
            console.log(publicKey);
            console.log(privateKey);
            var pin = makePIN();
            users[username] = {};
            users[username].pass = enc.encrypt(password.toString());
            users[username].fullname = fullname;
            usersEmails[email] = username;
            users[username].email = email;
            usersProfileImage[username] = defaults.MALE_IMAGE;
            users[username].yearOfBirth = yearOfBirth;
            users[username].contacts = [];
            users[username].blockedContacts = [];
            users[username].pin = pin;
            users[username].privacy = "public";
            users[username].lastSeen = (new Date()).toString();
            users[username].status = "offline";
            users[username].contactsRequests = [];
            users[username].publicKey = enc.encrypt(publicKey);
            users[username].privateKey = enc.encrypt(privateKey);
            fs.writeFileSync('./files/users.json', JSON.stringify(users));
            fs.writeFileSync('./files/usersProfileImage.json', JSON.stringify(usersProfileImage));
            usersByPIN[pin] = username;
            fs.writeFile("./files/usersByPIN.json", JSON.stringify(usersByPIN));
            fs.writeFile("./files/usersEmails.json", JSON.stringify(usersEmails));
            res.json({
                ok: true,
                message: "Signed Up!",
                login: {
                    ok: true,
                    username: username,
                    email: users[username].email,
                    fullname: users[username].fullname,
                    yearOfBirth: users[username].yearOfBirth,
                    profileImage: usersProfileImage[username],
                    contactsRequests: [],
                    pin: users[username].pin,
                    privacy: users[username].privacy,
                    message: "Logged In!",
                    contacts: [],
                    blockedContacts: [],
                    privateKey:JSON.parse(enc.decrypt(users[username].privateKey))
                }
            });
        });
    }
}

function search(req, res) {

    var pattern = "^" + req.body.username;
    var user = req.body.user;
    pattern = new RegExp(pattern, 'i');
    var keys = Object.keys(users);
    keys = takeOfContactsFromResault(keys, user);
    keys = takeOfPrivateUsersFromResault(keys);
    var resUsers = [];
    for (var i = 0; i < keys.length; i++) {
        if (pattern.test(keys[i])) {
            let resp = {
                username: keys[i],
                fullname: users[keys[i]].fullname,
                profileImage: usersProfileImage[keys[i]]
            }
            resUsers.push(resp);
        }
    }
    res.json(resUsers);

}

function search1(req, res) {

    var username = req.body.username;

    if (users.hasOwnProperty(username)) {
        res.json({
            found: true,
            username: username,
            //email: users[username].email,
            fullname: users[username].fullname,
        });
    } else {
        res.json({
            found: false,
            username: ''
        });
    }


}

function hasPIN(pin) {
    var bool = false;
    if (usersByPIN.hasOwnProperty(pin)) {
        bool = true;
    }
    return false;
}

function makePIN() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    for (var i = 0; i < 6; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    if (hasPIN(text)) {
        text = makePIN();
    }
    return text;
}

module.exports = (app) => {
    app.use(bodyParser.json({ limit: '50mb' }));
    app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));

    app.get('/', (req, res) => {
        res.end("Connected !")
    });
    app.post('/login', (req, res) => {
        login(req, res);
    });
    app.post('/signup', (req, res) => {
        signup(req, res);
    });
    app.post('/search2', (req, res) => {
        search(req, res);
    });
    app.post('/search', (req, res) => {
        search1(req, res);
    });
}


function takeOfContactsFromResault(keys, user) {
    var indexOfUser = keys.indexOf(user);
    keys.splice(indexOfUser, 1);
    console.log(user);
    var contactsList = users[user].contacts;
    for (var i = 0; i < contactsList.length; i++) {
        var indexOfUser = keys.indexOf(contactsList[i]);
        keys.splice(indexOfUser, 1);
    }
    return keys;
}
function takeOfPrivateUsersFromResault(keys) {
    var newKeys = [];
    for (i = 0; i < keys.length; i++) {
        if (users[keys[i]].privacy == "public") {
            newKeys.push(keys[i]);
        }
    }
    return newKeys;
}