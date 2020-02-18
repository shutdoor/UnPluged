var mongoose = require('mongoose');
mongoose.Promise = global.Promise;
// mongoose.connect("mongodb+srv://JavaScriptMain:5LBF$7=pVaVt3ta@unplugged-a8oex.azure.mongodb.net/test?retryWrites=true&w=majority", { useNewUrlParser: true , useUnifiedTopology: true }).catch(error=> console.log("error"));
mongoose.connect("mongodb://localhost:27017/Test", {
    useNewUrlParser: true
}).catch(error => console.log("error"));

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

var post = mongoose.model("Post_Collection", PostSchema)


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

    var posts = post.find({}, (err, data)=>{
        if (err){console.error(err)} 
        else{
            // console.log(data);
            res.render('index', {
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