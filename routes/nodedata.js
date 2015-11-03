var async = require('async');
var express = require('express');
var router = express.Router();

// Make a couple asynchronous calls to the mongo DB to get the node data and collate
// it for use by this program's UI
router.get('/nodes', function (req, res) {

    var myHostName = req.headers.host;
    var db = req.db;

    // Helper function to add the specified node number to an array of json objects
    var appendCollectionName = function( data, name ) {
        data = data.map( function( jsonObj ) {
            jsonObj["collectionName"] = name;
            return jsonObj;
        })
        return data;
    }

    async.parallel([

            function (callback) {
                db.get('node0').find( {}, {}, function (err, node_data) {
                    if (err) {
                        callback(err);
                    }

                    // Insert the node number so we know how to get back to it later if need be.
                    appendCollectionName(node_data, 'node0');
                    callback(null, node_data);
                });
            },

            function (callback) {
                db.get('node1').find( {}, {}, function (err, node_data) {
                    if (err) {
                        callback(err);
                    }
                    appendCollectionName(node_data, 'node1');
                    callback(null, node_data);
                });
            },
        ],

        function (err, results) {
            if (err) {
                console.log(err);
                return res.send(400);
            }

            if (results == null || results[0] == null) {
                return res.send(400);
            }

            var node0_data = results[0] || [];
            var node1_data = results[1] || [];

            res.json(node0_data.concat(node1_data));
        });
});

/*
 * POST to adduser.
 */
router.post('/adduser', function(req, res) {
    var db = req.db;
    var nodeName = 'node'+Math.floor(Math.random()+1); // alternate between collection node0 and node1
    var collection = db.get(nodeName);
    collection.insert(req.body, function(err, result){
        res.send(
            (err === null) ? { msg: '' } : { msg: err }
        );
    });
});

router.delete('/deleteuser/:id', function(req, res) {
    var db = req.db;

    // Should have an ID parameter in format userId:collectionName
    // Split it into it's component pieces.
    var array = req.params.id.split(':');
    var userId = array[0];
    var collection = db.get(array[1]);

    collection.remove({ '_id' : userId }, function(err) {
        res.send((err === null) ? { msg: '' } : { msg:'error: ' + err });
    });
});

module.exports = router;