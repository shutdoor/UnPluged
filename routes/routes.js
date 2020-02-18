var fs = require('fs')
const config = require('../config')

exports.index= (req, res)=>{
    res.render('index', {
        title: 'Home',
        "config":config
    });
};
