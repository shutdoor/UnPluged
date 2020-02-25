var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');



mongoose.Promise = global.Promise;
mongoose.connect("mongodb+srv://tester:a@unplugged-a8oex.azure.mongodb.net/UnPlugged?retryWrites=true&w=majority", {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).catch(error => console.log("error"));
// mongoose.connect("mongodb://localhost:27017/Test", {
//     useNewUrlParser: true
// }).catch(error => console.log("error"));

var mdb = mongoose.connection;
mdb.on('error', console.error.bind(console, 'connection error:'));

mdb.once('open', function (callback) {
    console.log(mdb.name);
});

var UserSchema = new mongoose.Schema({
    "User ID": String,
    Name: String,
    Wsername: String,
    Password: String,
    Email: String,
    "Date of Birth": Date,
    Age: Number,
    Role: String,
    "Creation Date":Date,
    "Post Removed": Number,
    "User Location": String
});

var PostTextSchema = new mongoose.Schema({
    "User ID": String,
    "Post ID": String,
    Tile: String,
    "Text Body": String,
    Likes: Number,
    Dislikes: Number,
    Reports: Number,
    "Post Date": Date
});

var PostImageSchema = new mongoose.Schema({
    "User ID": String,
    "Post ID": String,
    Tile: String,
    "Image Link": String,
    Likes: Number,
    Dislikes: Number,
    Reports: Number,
    "Post Date": Date
});

var CommentSchema = new mongoose.Schema({
    "User ID": String,
    "Post ID": String,
    "Comment ID": String,
    "Comment Text Body":String,
    "Comment Date": Date
});

var userData = mongoose.model("Users", UserSchema, "User Infomration");
var imagePostData = mongoose.model("textPost", PostTextSchema, "Text Post");
var textPostData = mongoose.model("imagePost", PostImageSchema, "Image Post");
var commentData = mongoose.model("comment", CommentSchema, "Comments");

var fs = require('fs')
const config = require('../config')

exports.index = (req, res) => {
    // post.create({
    //     time: Date.now().toString(),
    //     user: "Test",
    //     content: "Test Content",
    //     score: 10
    // },(err, test)=>{
    //     if (err) return console.error(err);
    //     console.log(test.toString() + " Added");
    // });

    var posts = post.find({}, (err, data) => {
        if (err) {
            console.error(err)
        } else {
            // console.log(data);
            res.render('index', {
                title: 'Home',
                "posts": data,
                "config": config
            });
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


exports.vote = (req, res) => {
    console.log(req.body);
    var score = req.body.currentScore
    if (req.body.Vote == "Up") {
        score++;
    } else if (req.body.Vote == "Down") {
        score--;
    }
    post.findByIdAndUpdate(req.body.id, {
        $set: {
            'score': score
        }
    }, (err, todo) => {
        if (err) throw err;
    });

    res.redirect('/')
}
