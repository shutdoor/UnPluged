var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
mongoose.connect("mongodb+srv://tester:a@unplugged-a8oex.azure.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true , useUnifiedTopology: true }).catch(error=> console.log("error"));
// mongoose.connect("mongodb://localhost:27017/Test", {useNewUrlParser: true}).catch(error => console.log("error"));

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
var CommentSchema = new mongoose.Schema({
    time: String,
    user: String,
    content: String,
    score: Number,
    contextPostID :String
});

var accountSchema = mongoose.Schema({
    username: String,
    password: String,
    email: String
});

var post = mongoose.model("Post_Collection", PostSchema)
var comment = mongoose.model("Comment_Collection", PostSchema)
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
    //     user: "TestUser",
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
    // console.log(req.body);
    var score = req.body.currentScore
    if (req.body.Vote == "comment"){
        var postID = encodeURIComponent(req.body.id)
        res.redirect('/comment' +"/?postID="+ postID);
    } else if (req.body.Vote == "Down"){
        score--;
        res.redirect('/feed')
    } else if(req.body.Vote == "Up"){
        score++;
        res.redirect('/feed')
    }
    post.findByIdAndUpdate(req.body.id, {
        $set:{
            'score': score
        }
    }, (err, todo)=>{
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
            "postContent":cPost.content
        })
    })
}

exports.createComment = (req,res)=>{
    var contextPostID =  req.query.postID;
    var contextPost = post.findById(contextPostID, (err,cPost)=>{
        if (err) return console.error(err)
        comment.create({
            time: Date.now().toString(),
            user: "TestUser",
            content: req.body.postText,
            score: 0,
            contextPostID: contextPostID
        },(err, test)=>{
            if (err) return console.error(err);
            console.log(test.toString() + " Added");
        });

    })

    res.redirect('/feed');
}