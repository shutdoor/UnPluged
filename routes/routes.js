var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect("mongodb+srv://tester:a@unplugged-a8oex.azure.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true , useUnifiedTopology: true }).catch(error=> console.log("error"));
// mongoose.connect("mongodb://localhost:27017/Test", {
//     useNewUrlParser: true
// }).catch(error => console.log("error"));

var mdb = mongoose.connection;
mdb.on('error', console.error.bind(console, 'connection error:'));

mdb.once('open', function (callback) {
    console.log(mdb.name);
});

var PostSchema = new mongoose.Schema({
    time: String,
    user: String,
    content: String,
    score: Number
});

var accountSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String
});

var post = mongoose.model("Post_Collection", PostSchema)
var Account = mongoose.model('Account_Collection', accountSchema);


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
    // post.create({
    //     time: Date.now().toString(),
    //     user: "Test",
    //     content: "Test Content",
    //     score: 10
    // },(err, test)=>{
    //     if (err) return console.error(err);
    //     console.log(test.toString() + " Added");
    // });

    var posts = post.find({}, (err, data)=>{
        if (err){console.error(err)} 
        else{
            // console.log(data);
            res.render('main', {
                title: 'Home',
                "posts": data,
                "config": config
            });
        }
    })
};


exports.vote = (req, res)=>{
    console.log(req.body);
    var score = req.body.currentScore
    if(req.body.Vote == "Up"){
        score++;
    } else if (req.body.Vote == "Down"){
        score--;
    }
    post.findByIdAndUpdate(req.body.id, {
        $set:{
            'score': score
        }
    }, (err, todo)=>{
        if (err) throw err;
    });

    res.redirect('/')
}

exports.signUp = (req, res) => { //signing up
    res.render('signUp', {
        "title": 'Sign Up For An Account',
        "config": config
    })
};

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
