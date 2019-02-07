
// Among other things, the following two options make the "id" field
// appear in the queried object. The _id field remains present.
exports = {
    toObject: { virtuals: true },
    toJSON: { virtuals: true }
};

module.exports = exports;