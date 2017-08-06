var express = require('express');
var router = express.Router();

var publicLinkManager = require('../middleware/resource_managers/public_link_manager');

router.get('/:_payload', function(req, res, next) {
    publicLinkManager.run(req, function(err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })
});
router.post('/:_payload', function(req, res, next) {
    publicLinkManager.run(req, function(err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })
});

module.exports = router;