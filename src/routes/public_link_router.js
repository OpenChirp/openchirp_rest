var express = require('express');
var router = express.Router();
var nconf = require('nconf');

var publicLinkManager = require('../middleware/resource_managers/public_link_manager');

router.get('/:linkId', function(req, res, next) {
	var link = String(nconf.get('pc_base_url')) + "/" + String(nconf.get('pc_prefix')) + req.params.linkId;
	var html = '<html><title>Run Command On Openchirp</title><body align="center" style="margin:10%;"><form method="POST" action="' +link +'"><button type="submit" style="cursor:hand;background-color:#aad1e2;width:75%;height:50%;"><div style="font-size:500%;">Run Command</div></button></form></body></html>';
    res.send(html);
});
router.post('/:_payload', function(req, res, next) {
    publicLinkManager.run(req, function(err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })
});

module.exports = router;
