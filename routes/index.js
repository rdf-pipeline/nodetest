var express = require('express');
var router = express.Router();

router.get('/', function (req, res, next) {
    var myHostName = req.headers.host;
    res.render('index', {title: 'RDF Pipeline Node Management on ' + myHostName.split(":")[0]});
});


module.exports = router;
