var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const formidable = require('formidable');
mongoose.Promise = global.Promise;
mongoose.connect("mongodb+srv://tester:a@unplugged-a8oex.azure.mongodb.net/UnPlugged?retryWrites=true&w=majority").catch(error => console.log("error"));
mongoose.set('useNewUrlParser', true);
mongoose.set('useFindAndModify', false);
mongoose.set('useCreateIndex', true);
mongoose.set('useUnifiedTopology', true);
var mdb = mongoose.connection;
mdb.on('error', console.error.bind(console, 'connection error:'));

mdb.once('open', function (callback) {
    console.log(mdb.name);
});

var UserSchema = new mongoose.Schema({
    UserID: String,
    Name: {
        First: String,
        Last: String
    },
    Username: String,
    Password: String,
    Email: String,
    DOB: Date,
    Age: Number,
    Role: String,
    CreationDate: Date,
    PostRemoved: Number,
    UserLocation: String
});

var PostSchema = new mongoose.Schema({
    UserID: String,
    Username: String,
    PostID: String,
    Tile: String,
    TextBody: String,
    Image: String,
    Likes: Number,
    Dislikes: Number,
    Reports: Number,
    PostDate: Date,
    Category: String,
    UserLocation: String
});

var CommentSchema = new mongoose.Schema({
    UserID: String,
    PostID: String,
    CommentID: String,
    CommentTextBody: String,
    CommentDate: Date
});



var accountSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String
});

var Account = mongoose.model('Account_Collection', accountSchema);
var postData = mongoose.model("textPost", PostSchema, "User Post");
var commentData = mongoose.model("comment", CommentSchema, "Comments");
var userData = mongoose.model("Users", UserSchema, "User Infomration");

const Categories = Object.freeze({
    Sports: "Sports",
    Movies: "Movies",
    TV: "TV",
    Cars: "Cars",
    Fashion: "Fashion",
    Events: "Events",
    Questions: "Questions",
    Memes: "Memes",
    LocalWeirdos: "Local Weirdos"
})

var fs = require('fs')
const config = require('../config')
var currentUser;
userData.findById("5e59b9380237258e8071509a", (err, user) => {
    // userData.findById("5e5c14b42ce5913088a37c98", (err, user) => {
    if (err) {
        throw err;
    }
    currentUser = user;
    console.log(`Current User is ${user.Username}`);
})


exports.index = (req, res) => { //landing page
    Account.find((err, account) => {
        if (err) return console.error(err);
        res.render('index', {
            title: 'UnPlugged',
            accounts: account,
            "config": config
        });
    });
};

exports.login = (req, res) => { //login page
    Account.find((err, account) => {
        if (err) return console.error(err);
        res.render('login', {
            title: 'Log Into Your Account',
            accounts: account
        });
    });
};

exports.main = (req, res) => {
    var currentLocation = currentUser.UserLocation;
    console.log(currentLocation);
    postData.find({
        UserLocation: currentLocation
    }, (err, postData) => {
        if (err) {
            console.error(err)
        } else {
            commentData.find({}, (err, commentData) => {
                if (err) {
                    console.error(err)
                } else {
                    res.render('main', {
                        title: 'UnPlugged',
                        "posts": postData,
                        "comments": commentData,
                        "config": config
                    })
                }
            })
        }
    })
};


exports.userCreator = (req, res) => {
    res.render('userCreator', {
        "title": 'Add Person'
    });
};

var currentUser;
exports.createUser = (req, res) => {
    // var usernameBool = Boolean(validateUserName(req.body.username));
    // var emailBool = Boolean(validateEmail(req.body.email));

    // if (usernameBool && emailBool) {

    var user = new userData({
        Name: {
            First: req.body.firstName,
            Last: req.body.lastName
        },
        Username: req.body.username,
        Password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
        Email: req.body.email,
        DOB: req.body.DOB,
        Age: getAge(req.body.DOB)
    });

    currentUser = user;

    user.save((err, user) => {
        if (err) return console.error(err);
        console.log(req.body.username + ' added');
    });

    // req.session.user = {
    //     isAuthenticated: true
    // }

    res.render('displayUser', {
        currentUser: currentUser
    });
    //     } else if (usernameBool) {
    //         console.log("Username is already in use.");
    //         res.redirect("/signup");
    //     } else if (emailBool) {
    //         console.log("Email is already in use.")
    //         res.redirect("/signup");
    //     }
};

const validateUserName = (userName) => {
    console.log(userName);
    userData.findOne({
        Username: userName
    }, (err, user) => {
        if (user != null) {
            console.log(user.Username);
            if (String(user.Username) === String(userName)) {
                return true;
            }
        }
        return false;
    });
}


exports.signUp = (req, res) => { //signing up
    res.render('signUp', {
        "title": 'Sign Up For An Account',
        "config": config
    })
};

exports.createTextPost = (req, res) => { //Text Post
    res.render('createTextPost', {
        "title": 'Upload a Post!',
        "config": config
    })
};
exports.uploadPost = (req, res) => {
    // console.log(req.body.postText);
    postData.create({
        UserID: currentUser.UserID,
        Username: currentUser.Username,
        TextBody: req.body.postText,
        Likes: 0,
        Dislikes: 0,
        PostDate: Date.now(),
        PostID: Date.now().toString(),
        Category: req.body.category,
        UserLocation: currentUser.UserLocation
    }, (err, test) => {
        if (err) return console.error(err);
        console.log(test.toString() + " Added");
    });
    res.redirect('/feed');
}


exports.createImagePost = (req, res) => { //Image Post
    res.render('createImagePost', {
        "title": 'Upload a Post!',
        "config": config
    })
};
exports.uploadImage = (req, res) => {
    // console.log(req.body.postText);

    const form = formidable({
        multiples: true
    });
    var imagePath;
    form.parse(req)
    //Upload File
    form.on('fileBegin', (name, file) => {
        file.path = __dirname + '\\uploads\\' + file.name;
        imagePath = __dirname + '\\uploads\\' + file.name;
        // console.log(imagePath);
    });
    form.on('file', (name, file) => {
        //Encode File
        fs.readFile(imagePath, (err, data) => {
            if (err) console.error(err);
            imgEncode = new Buffer(data).toString('base64');
            // console.log(imgEncode);

            //Create Post
            postData.create({
                UserID: currentUser.UserID,
                Username: currentUser.Username,
                TextBody: req.body.postText,
                Likes: 0,
                Dislikes: 0,
                PostDate: Date.now(),
                PostID: Date.now().toString(),
                Category: req.body.category,
                UserLocation: currentUser.UserLocation,
                Image:imgEncode
            }, (err, test) => {
                if (err) return console.error(err);
                console.log(test.toString() + " Added");
            });

            //Delete local file
            fs.unlink(imagePath, (err)=>{if(err)console.error(err)});

        })

    });
    res.redirect('/feed');
}



exports.createVideoPost = (req, res) => { //Video Post
    res.render('createVideoPost', {
        "title": 'Upload a Post!',
        "config": config
    })
};

exports.vote = (req, res) => {
    // console.log(req.body);
    var scoreUp = req.body.currentScoreUp
    var scoreDown = req.body.currentScoreDown
    if (req.body.Vote == "Like") {
        scoreUp++;
        res.redirect("/feed");
    } 
    if (req.body.Vote == "Dislike") {
        scoreDown++;
        res.redirect("/feed");
    } else if (req.body.Vote == "Comment") {
        var postID = encodeURIComponent(req.body.dbID)
        res.redirect('/comment' + "/?postID=" + postID);
    }
    postData.findByIdAndUpdate(req.body.dbID, {
        $set: {
            'Likes': scoreUp,
            "Dislikes": scoreDown

        }
    });




    // userData.create({
    //     UserID:Date.now(),
    //     Name:"Loganathan Pala",
    //     Username:"Forest Man",
    //     Password:"heywhatthatinthetree",
    //     Email:"ohno@hmmmm.jp",
    //     DOB:Date.now(),
    //     Age:69,
    //     Role:"User",
    //     CreationDate:Date.now(),
    //     PostRemoved:420,
    //     UserLocation:"Los Angeles, CA"

    // }, (err, test) => {
    //     if (err) return console.error(err);
    //     console.log(test.toString() + " Added");
    // });

}

exports.comment = (req, res) => {
    var contextPostID = req.query.postID;
    var contextPost = postData.findById(contextPostID, (err, cPost) => {
        if (err) return console.error(err);
        res.render('comment', {
            "title": "Comment",
            "postContent": cPost.TextBody,
            "postID": contextPostID
        })
    })
}

exports.createComment = (req, res) => {
    var contextPostID = req.body.postID;
    commentData.findById(contextPostID, (err, cPost) => {
        if (err) {
            return console.error(err)
        } else {
            console.log(req.body.postText);
            commentData.create({
                CommentID: Date.now().toString(),
                PostID: req.body.postID,
                UserID: currentUser.UserID,
                CommentTextBody: req.body.postText,
                CommentDate: Date.now()
            }, (err, test) => {
                if (err) return console.error(err);
                console.log(test.toString() + "Added");
            });
        }

    })

    res.redirect('/feed');
}

const getAge = (DOB) => {
    var today = new Date();
    var birthDate = new Date(DOB);
    var age = today.getFullYear() - birthDate.getFullYear();
    var month = today.getMonth() - birthDate.getMonth();
    if (month < 0 || (month === 0 && today.getDate() < birthDate.getDate())) {
        age = age - 1;
    }

    return age;
}
const validateEmail = (email) => {
    console.log(email);
    userData.findOne({
        Email: email
    }, (err, user) => {
        if (user != null) {
            console.log(user.Email);
            if (String(user.Email) === String(email)) {
                return true;
            }
        }
        return false;
    })
}