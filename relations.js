
var fs = require('fs');
var users = require('./files/users.json');
var usersByPIN = require("./files/usersByPIN.json");
var usersProfileImage = require("./files/usersProfileImage.json");

function addContact(req, res) {
    var username = req.body.username;
    var addedContact = req.body.addedContact;

    let data = {};
    var bool;

    if (users.hasOwnProperty(username)) {
        var user = users[username];
        bool = true;
        let arr = Array.from(user['contacts']);
        for (var i = 0; i < arr.length; i++) {
            if (arr[i] === addedContact) {
                bool = false;
            }
        }
        arr = Array.from(users[addedContact].contactsRequests);
        for (var i = 0; i < arr.length; i++) {
            if (arr[i].username === username) {
                bool = false;
            }
        }
        if (bool) {
            data = {
                username: username,
                fullname: users[username].fullname,
                profileImage: usersProfileImage[username]
            };
            users[addedContact].contactsRequests.push(data);
            fs.writeFileSync("./files/users.json", JSON.stringify(users));
        }
        res.json({
            bool: bool,
            data: data
        });
    }
}
function acceptContact(req, res) {
    var username = req.body.username;
    var addedContact = req.body.addedContact
    users[username].contacts.push(addedContact);
    users[addedContact].contacts.push(username);
    var index = -1;
    var bool;
    var arr = Array.from(users[addedContact].contactsRequests);
    for (i = 0; i < arr.length; i++) {
        if (arr[i].username == username) {
            index = i;
            break;
        }
    }
    if (index > -1) {
        bool = true;
        users[addedContact].contactsRequests.splice(index, 1);
        fs.writeFileSync("./files/users.json", JSON.stringify(users));
    }
    else {
        bool = false;
    }
    res.json(bool);
}
function deleteContact(req, res) {
    let username = req.body.username;
    let deletedContact = req.body.deletedContact;
    var index = -1;
    var index2 = -1;
    var bool;
    index = (Array.from(users[username].contacts)).indexOf(deletedContact);
    index2 = (Array.from(users[deletedContact].contacts)).indexOf(username);
    if (index2 > -1) {
        users[deletedContact].contacts.splice(index2, 1);
    }
    if (index > -1) {
        bool = true;
        users[username].contacts.splice(index, 1);
        fs.writeFileSync("./files/users.json", JSON.stringify(users));
    } else {
        bool = false;
    }


    res.json(bool);
}
function declineContact(req, res) {
    let username = req.body.username;
    let addedContact = req.body.addedContact;
    var index = -1, arr;
    arr = Array.from(users[addedContact].contactsRequests);
    for (i = 0; i < arr.length; i++) {
        if (arr[i].username == username) {
            index = i;
            break;
        }
    }
    if (index > -1) {
        users[addedContact].contactsRequests.splice(index, 1);
        fs.writeFileSync("./files/users.json", JSON.stringify(users));
    }
    res.send(true);
}
function getUserByPin(req, res) {
    let pin = req.body.pin;
    let username = req.body.username;
    var bool = false;
    var addContactData = {};
    if (usersByPIN.hasOwnProperty(pin)) {
        addContactData = {
            username: username,
            addedContact: usersByPIN[pin]
        };
        bool = true;
    }
    res.json({
        bool: bool,
        data: addContactData
    })
}


module.exports = (app) => {
    app.post("/addContact", (req, res) => {
        addContact(req, res);
    });

    app.post("/acceptContact", (req, res) => {
        acceptContact(req, res);
    });
    app.post("/deleteContact", (req, res) => {
        deleteContact(req, res);
    });
    app.post("/declineContact", (req, res) => {
        declineContact(req, res);
    });
    app.post("/userByPin", (req, res) => {
        getUserByPin(req, res);
    });
}