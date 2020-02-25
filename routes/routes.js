var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var bcrypt = require('bcrypt');



mongoose.Promise = global.Promise;
mongoose.connect("mongodb+srv://tester:a@unplugged-a8oex.azure.mongodb.net/UnPlugged?retryWrites=true&w=majority").catch(error=> console.log("error"));
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

var accountSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String
});

var Account = mongoose.model('Account_Collection', accountSchema);
var imagePostData = mongoose.model("textPost", PostTextSchema, "Text Post");
var textPostData = mongoose.model("imagePost", PostImageSchema, "Image Post");
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
    post.find({}, (err, postData)=>{
        if (err){console.error(err)} 
        else{
            comment.find({}, (err, commentData)=>{
                if (err){console.error(err)} 
                else{
            // console.log(data);
            res.render('main', {
                Title: 'Home',
                "posts": postData,
                "comments":commentData,
                "config": config
            })}})}})};


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
        res.redirect('/feed')
    } else if (req.body.Vote == "Down") {
        score--;
        res.redirect('/feed')
    } else if(req.body.Vote == "Comment"){
        res.redirect('/comment')
    }
    post.findByIdAndUpdate(req.body.id, {
        $set: {
            'score': score
        }
    }, (err, todo) => {
        if (err) throw err;
    });

}

exports.signUp = (req, res) => { //signing up
    res.render('signUp', {
        "title": 'Sign Up For An Account',
        "config": config
    })
};

exports.makePost = (req, res)=>{
    res.render('post', {
        "title": 'Make Post'
    } )
}

exports.createPost = (req,res)=>{
    post.create({
        time: Date.now().toString(),
        user: "TestUser",
        content: req.body.postText,
        score: 0
    },(err, test)=>{
        if (err) return console.error(err);
        console.log(test.toString() + " Added");
    });




    res.redirect('/feed');
}

exports.comment= (req,res)=>{
    var contextPostID =  req.query.postID;
    var contextPost = post.findById(contextPostID, (err,cPost)=>{
        if (err) return console.error(err);
        res.render('comment', {
            "title":"Comment",
            "postContent":cPost.content,
            "postID": contextPostID
        })
    })
}

exports.createComment = (req,res)=>{
    var contextPostID =  req.body.postID;
    post.findById(contextPostID, (err,cPost)=>{
        if (err) {return console.error(err)} 
        else {
            // console.log(contextPostID);
            comment.create({
                contextPostID: req.body.postID,
                time: Date.now().toString(),
                user: "TestUser",
                content: req.body.postText,
                score: 0
            },(err, test)=>{
                if (err) return console.error(err);
                console.log(test.toString() +"Added");
            });
        }

    })

    res.redirect('/feed');
}
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

exports.createVideoPost = (req, res) => { //Video Post
    res.render('createVideoPost', {
        "title": 'Upload a Post!',
        "config": config
    })
};
