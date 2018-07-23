var fs = require('fs');
var users = require('./files/users.json');
var usersProfileImage = require("./files/usersProfileImage.json");
var usersByPIN = require("./files/usersByPIN.json");
var usersEmails = require("./files/usersEmails.json");

var enc = require('./encryption');


function setOnline(req, res) {
    var username = req.body.username;
    username = ((new String(username)).toLowerCase()).toString();

    users[username].status = "online";
    res.send(true);
}
function setOffline(req, res) {
    var username = req.body.username;
    username = ((new String(username)).toLowerCase()).toString();

    users[username].status = "offline";
    users[username].lastSeen = new Date();
    fs.writeFileSync('./files/users.json', JSON.stringify(users));
    res.send(true);
}
function getStatus(req, res) {
    var username = req.body.username;
    username = ((new String(username)).toLowerCase()).toString();

    let data = {
        username: username,
        status: users[username].status,
        lastSeen: users[username].lastSeen
    };
    res.json(data);
}
function getContacts(req, res) {
    var username = req.body.username;
    username = ((new String(username)).toLowerCase()).toString();

    var data = users[username].contacts;
    res.json(data);
}
function profileImageUpload(req, res) {
    var username = req.body.username;
    var profileImage = req.body.profileImage;

    username = ((new String(username)).toLowerCase()).toString();


    if (users[username]) {
        usersProfileImage[username] = profileImage;
        fs.writeFile("./files/usersProfileImage.json", JSON.stringify(usersProfileImage));
    }
    res.send(true);
}

// NEW FUNCTIONS
function setPrivacy(req, res) {
    var username = req.body.username;
    var privacy = req.body.privacy;
    username = ((new String(username)).toLowerCase()).toString();

    if (users.hasOwnProperty(username)) {
        users[username].privacy = privacy;
        fs.writeFile('./files/users.json', JSON.stringify(users));
        res.json({
            ok: true,
            message: "Privacy change done!",
            privacy: privacy
        });
    } else {
        res.json({
            ok: false,
            message: "Error changing privacy!",
            privacy: privacy
        });
    }
}
function setPassword(req, res) {
    var username = req.body.username;
    var oldPassword = req.body.oldPassword;
    var newPassword = req.body.newPassword;
    username = ((new String(username)).toLowerCase()).toString();

    if (users.hasOwnProperty(username)) {
        if (enc.decrypt(users[username].pass) === oldPassword) {
            users[username].pass = enc.encrypt(newPassword);
            fs.writeFile('./files/users.json', JSON.stringify(users));
            res.json({
                ok: true,
                message: "Password Changed!",
            });

        } else {
            res.json({
                ok: false,
                message: "Old password Not Correct!",
            });
        }
    } else {
        res.json({
            ok: false,
            message: "Error changing password!",
        });
    }

}
function resetPIN(req, res) {
    var username = req.body.username;
    username = ((new String(username)).toLowerCase()).toString();

    if (users.hasOwnProperty(username)) {
        var oldPIN = users[username].pin;
        delete usersByPIN[oldPIN];
        var newPIN = makePIN();
        users[username].pin = newPIN;
        usersByPIN[newPIN] = username;
        fs.writeFile('./files/users.json', JSON.stringify(users));
        fs.writeFile('./files/usersByPIN.json', JSON.stringify(usersByPIN));
        res.json({
            ok: true,
            message: "PIN reset done!",
            PIN: newPIN
        });
    }
    else {
        res.json({
            ok: false,
            message: "Error changing PIN!",
        });
    }
}

module.exports = (app) => {
    app.post("/setOnline", (req, res) => {
        setOnline(req, res);
    });
    app.post("/setOffline", (req, res) => {
        setOffline(req, res);
    });
    app.post("/getContacts", (req, res) => {
        getContacts(req, res);
    });
    app.post("/getStatus", (req, res) => {
        getStatus(req, res);
    });
    app.post("/profileImageUpload", (req, res) => {
        profileImageUpload(req, res);
    });
    app.post('/setPrivacy', (req, res) => {
        setPrivacy(req, res);
    });
    app.post('/setPassword', (req, res) => {
        setPassword(req, res);
    });
    app.post('/resetPIN', (req, res) => {
        resetPIN(req, res);
    });
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