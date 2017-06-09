var express = require('express');
var router = express.Router();

var groupManager = require('../middleware/resource_managers/group_manager');

/* Create Group */
router.post('/group', function(req, res, next) {
  userManager.createCommandShortcut(req, function (err, result) {
        if(err) { return next(err); }
        return res.json(result);
    })  
});

module.exports = router;