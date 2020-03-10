var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
const formidable = require('formidable');
const expressSession = require('express-session');

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
// userData.findById("5e59b9380237258e8071509a", (err, user)=>{



exports.index = (req, res) => { //landing page
    console.log(config);
    Account.find((err, account) => {
        if (err) return console.error(err);
        res.render('index', {
            title: 'UnPlugged',
            accounts: account,
            "config": config
        });
    });
    
};

exports.main = (req, res) => {
    var currentLocation = currentUser.UserLocation;
    var isMod = (currentUser.Role === "Moderator");
    // console.log(currentUser.Role);
    // console.log(isMod);
    // console.log(currentLocation);
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
                        "config": config,
                        "isMod": isMod
                    })
                }
            })
        }
    })
};

exports.tags = (req, res) => {
    var currentLocation = currentUser.UserLocation;
    var isMod = (currentUser.Role === "Moderator");
    console.log(currentLocation);
    console.log(req.body)
    if (req.body == null) {
        tagsFiltering = "Sports";
        // req.body == "Sports";
        console.log(req.body)
    } else {
        var tagsFiltering = req.body.category;
        console.log(tagsFiltering);
    }
    postData.find({
        Category: tagsFiltering,
        UserLocation: currentLocation
    }, (err, postData) => {
        if (err) {
            console.error(err)
        } else {
            commentData.find({}, (err, commentData) => {
                if (err) {
                    console.error(err)
                } else {
                    res.render('tagsPage', {
                        title: 'UnPlugged',
                        "posts": postData,
                        "comments": commentData,
                        "config": config,
                        "isMod": isMod

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
exports.createUser = async (req, res) => {
    var usernameBool = false;
    var emailBool = false;

    const usernameValid = await userData.findOne({
        Username: req.body.username
    }, (err, user) => {
        if (err) console.error(err);
        else if (user != null) {
            if (String(user.Username) == String(req.body.username)) {
                console.log(req.body.username + user.Username);
                usernameBool = true;
            }
        }
    });

    const emailValid = await userData.findOne({
        Email: req.body.email
    }, (err, user) => {
        if (err) console.error(err);
        else if (user != null) {
            if (String(user.Email) == String(req.body.email)) {
                console.log(req.body.email + user.Email);
                emailBool = true;
            }
        }
        return false;
    });

    if (!emailValid && !usernameValid) {

        console.log(req.body.location);
        var user = new userData({
            Name: {
                First: req.body.firstName,
                Last: req.body.lastName
            },
            Username: req.body.username,
            Password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
            Email: req.body.email,
            DOB: req.body.DOB,
            Age: getAge(req.body.DOB),
            UserLocation: req.body.location
        });

        currentUser = user;

        user.save((err, user) => {
            if (err) return console.error(err);
            console.log(req.body.username + ' added');
        });

        req.session.user = {
            isAuthenticated: true
        }

        res.redirect("/feed")
    } else {
        res.redirect("/signup")
    }

};

exports.signUp = (req, res) => { //signing up
    res.render('userCreator', {
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
        UserLocation: currentUser.UserLocation,
        Reports: 0
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
    console.log(req.body.category);

    const form = formidable({
        multiples: true
    });
    var imagePath;
    form.parse(req)
    //Upload File
    form.on('fileBegin', (name, file) => {
        file.path = __dirname + '/uploads/' + file.name;
        imagePath = __dirname + '/uploads/' + file.name;
        // console.log(imagePath);
    });
    var category = "";
    form.on('field', (fieldName, fieldValue) => {
        category = fieldValue;
      });
    
    form.on('file', (name, file) => {
        //Encode File
        fs.readFile(imagePath, (err, data) => {
            if (err) console.error(err);
            var imgEncode = new Buffer(data).toString('base64');
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
                Category: category,
                UserLocation: currentUser.UserLocation,
                Image: imgEncode,
                Reports: 0
            }, (err, test) => {
                if (err) return console.error(err);
                // console.log(test.toString() + " Added");
            });

            //Delete local file
            fs.unlink(imagePath, (err) => {
                if (err) console.error(err)
            });

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

exports.likePost = (req, res) => {
    postID = req.headers.postid;
    var postLikes = 0;
    postData.findOne({
        PostID: postID
    }, (err, post) => {
        if (err) console.error(err)
        postLikes = (post.Likes + 1);
        postData.findByIdAndUpdate(post._id, {
            Likes: postLikes
        }, (err, newPost) => {
            if (err) console.error(err)
            res.send(`${(newPost.Likes)}`);
        })
    });
}
exports.dislikePost = (req, res) => {
    postID = req.headers.postid;
    var postLikes = 0;
    postData.findOne({
        PostID: postID
    }, (err, post) => {
        if (err) console.error(err)
        postLikes = (post.Dislikes + 1);
        postData.findByIdAndUpdate(post._id, {
            Dislikes: postLikes
        }, (err, newPost) => {
            if (err) console.error(err)
            res.send(`${(newPost.Dislikes)}`);
        })
    });
}
exports.reportPost = (req, res) => {
    postID = req.headers.postid;
    var postReports = 0;
    postData.findOne({
        PostID: postID
    }, (err, post) => {
        if (err) console.error(err)
        postReports = (post.Reports + 1);
        postData.findByIdAndUpdate(post._id, {
            Reports: postReports
        }, (err, newPost) => {
            if (err) console.error(err)
            res.send(`${(newPost.Reports)}`);
        })
    });
}
exports.removePost=(req,res)=>{
    postData.findByIdAndDelete(req.body.dbID, (err,post)=>{
        if (err) console.error(err)

        res.redirect('/feed')
    })
}




exports.comment = (req, res) => {
    var contextPostID = req.query.postID;
    postData.findOne({
        PostID: contextPostID
    }, (err, cPost) => {
        if (err) return console.error(err);
        res.render('comment', {
            "title": "Comment",
            "postContent": cPost.TextBody,
            "postID": cPost._id
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
                UserID: currentUser.Username,
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

exports.login = (req, res) => {
    res.render('login',{
        title: 'Login',
        "config": config
    });
};

exports.loginUser = (req, res) => {
    console.log(req.body.Username);
    userData.findOne({
        Username: req.body.Username
    }, (err, user) => {
        if (err) {
            console.log(err);
        } else {
            if (user && bcrypt.compareSync(req.body.Password, user.Password)) {
                currentUser = user;
                req.session.user = {
                    isAuthenticated: true
                }
                // console.log("FICK MA")
                res.redirect('/feed');
                // console.log(`Current User is ${user}`);
            } else {
                res.redirect("/login")
            }
        }
    });
};

exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        } else {
            res.redirect('/');
        }
    });
};

exports.account = (req, res) => {
    res.render('displayUser', {
        currentUser: currentUser
    })
};

exports.edit = (req, res) => {
    // console.log("Edit Page: " + currentUser);
    res.render('editUser', {
        user: currentUser
    });
};

exports.editUser = async (req, res) => {
    var usernameBool = false;
    var emailBool = false;

    console.log("Edit Post: " + currentUser);

    const usernameValid = await userData.findOne({
        Username: req.body.username
    }, (err, user) => {
        if (err) console.error(err);
        else if (user != null) {
            if (String(user.Username) == String(req.body.username)) {
                if (currentUser.Username == user.Username) {
                    usernameBool = false;
                } else {
                    console.log(req.body.username + user.Username);
                    usernameBool = true;
                }
            }
        }
    });

    const emailValid = await userData.findOne({
        Email: req.body.email
    }, (err, user) => {
        if (err) console.error(err);
        else if (user != null) {
            if (String(user.Email) == String(req.body.email)) {
                if (currentUser.Email == req.body.email) {
                    emailBool = false;
                } else {
                    console.log(req.body.email + user.Email);
                    emailBool = true;
                }
            }
        }
    });

    if (!emailBool && !usernameBool) {
        if (req.body.password != '') {
            userData.findByIdAndUpdate(currentUser._id, {
                $set: {
                    Username: req.body.username,
                    Name: {
                        First: req.body.firstName,
                        Last: req.body.lastName,
                    },
                    Password: bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(10)),
                    Email: req.body.email,
                    UserLocation: req.body.location
                }
            }, (err, todo) => {
                if (err) throw err;
            });
        } else {
            userData.findByIdAndUpdate(currentUser._id, {
                $set: {
                    Username: req.body.username,
                    Name: {
                        First: req.body.firstName,
                        Last: req.body.lastName
                    },
                    Email: req.body.email,
                    UserLocation: req.body.location
                }
            }, (err, todo) => {
                if (err) throw err;
            });
        }

        res.redirect("/logout")

    } else {
        res.redirect('/edit');
    }
};

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