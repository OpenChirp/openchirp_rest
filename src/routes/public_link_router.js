var express = require('express');
var router = express.Router();
var nconf = require('nconf');

var publicLinkManager = require('../middleware/resource_managers/public_link_manager');

router.get('/:_payload', function(req, res, next) {
	console.log("original URL " + req.originalUrl);
	console.log(" URL " + req.url);
	console.log(" host " + req.hostname);
	var link = String(nconf.get('pc_base_url')) + "/pc/"+_payload;
	console.log(link);
	var html = '<html><title>Run Command On Openchirp</title><form method="POST" action="' +link +'"><button type="submit" class="btn btn-success">Run</button></form></html>';
    res.send(html);
});
router.post('/:_payload', function(req, res, next) {
    publicLinkManager.run(req, function(err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })
});

module.exports = router;