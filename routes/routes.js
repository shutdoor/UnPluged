var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');



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
    Name: String,
    Wsername: String,
    Password: String,
    Email: String,
    DOB: Date,
    Age: Number,
    Role: String,
    CreationDate: Date,
    PostRemoved: Number,
    UserLocation: String
});

var PostTextSchema = new mongoose.Schema({
    UserID: String,
    PostID: String,
    Tile: String,
    TextBody: String,
    Likes: Number,
    Dislikes: Number,
    Reports: Number,
    PostDate: Date
});

var PostImageSchema = new mongoose.Schema({
    UserID: String,
    PostID: String,
    Tile: String,
    ImageLink: String,
    Likes: Number,
    Dislikes: Number,
    Reports: Number,
    PostDate: Date
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
var textPostData = mongoose.model("textPost", PostTextSchema, "User Post");
var imagePostData = mongoose.model("imagePost", PostImageSchema, "User Post");
var commentData = mongoose.model("comment", CommentSchema, "Comments");
var userData = mongoose.model("Users", UserSchema, "User Infomration");


var fs = require('fs')
const config = require('../config')

exports.index = (req, res) => { //login page
    Account.find((err, account) => {
        if (err) return console.error(err);
        res.render('index', {
            title: 'Log In To Your Account',
            accounts: account
        });
    });
    // res.render('login', {
    //     "title": 'Log In To Your Account',
    //     "config": config
    // })
};

exports.main = (req, res) => {
    textPostData.find({}, (err, postData) => {
        if (err) {
            console.error(err)
        } else {
            commentData.find({}, (err, commentData) => {
                if (err) {
                    console.error(err)
                } else {
                    // console.log(data);
                    res.render('main', {
                        Title: 'Home',
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
    res.render('usercreating', {
        title: 'Add Person'
    });
};

exports.createUser = (req, res) => {

    var user = new userData({
        name: req.body.firstName + " " + req.body.lastName,
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
        email: req.body.email,
        dateofbirth: req.body.DOB
    });

    user.save((err, user) => {
        if (err) return console.error(err);
        console.log(req.body.username + ' added');
    });

    // req.session.user = {
    //     isAuthenticated: true
    // }
    // res.render('displayUser', {
    //     user : user
    // });
};



exports.signUp = (req, res) => { //signing up
    res.render('signUp', {
        "title": 'Sign Up For An Account',
        "config": config
    })
};

// exports.createTextPostWHYWONTYOUWORK = (req,res)=>{
//     console.log("------------------create text post--------------")
//     // textPostData.create({
//     //     UserID: "TestUser",
//     //     TextBody: req.body.postText,
//     //     Likes:0,
//     //     Dislikes:0,
//     //     PostDate:Date.now()
//     // },(err, test)=>{
//     //     if (err) return console.error(err);
//     //     console.log(test.toString() + " Added");
//     // });
//     // res.redirect('/feed');
//     res.send("<h1>Nani the fuck</h1>")

// }

// exports.whatthefrick=(req,res)=>{
//     res.send("<h1>Nani the fuck</h1>")
// }




exports.createImagePost = (req, res) => { //Image Post
    res.render('createImagePost', {
        "title": 'Upload a Post!',
        "config": config
    })
};

exports.createTextPost = (req, res) => { //Text Post
    res.render('createTextPost', {
        "title": 'Upload a Post!',
        "config": config
    })
};
exports.uploadTextPost = (req, res) => {
    // console.log(req.body.postText);
    textPostData.create({
        UserID: "TestUser",
        TextBody: req.body.postText,
        Likes: 0,
        Dislikes: 0,
        PostDate: Date.now(),
        PostID:Date.now().toString()
    }, (err, test) => {
        if (err) return console.error(err);
        console.log(test.toString() + " Added");
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
    if (req.body.Vote == "Up") {
        scoreUp++;
        res.redirect('/feed')
    } else if (req.body.Vote == "Down") {
        scoreDown++;
        res.redirect('/feed')
    } else if (req.body.Vote == "comment") {
        var postID = encodeURIComponent(req.body.dbID)
        res.redirect('/comment' +"/?postID="+ postID);
    }
    textPostData.findByIdAndUpdate(req.body.dbID, {
        $set: {
            'Likes': scoreUp,
            "Dislikes": scoreDown
        }
    }, (err, todo) => {
        if (err) throw err;
    });

}

exports.comment = (req, res) => {
    var contextPostID = req.query.postID;
    var contextPost = textPostData.findById(contextPostID, (err, cPost) => {
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
                UserID: "TestUser",
                CommentTextBody: req.body.postText,
                CommentDate:Date.now()
            }, (err, test) => {
                if (err) return console.error(err);
                console.log(test.toString() + "Added");
            });
        }

    })

    res.redirect('/feed');
}