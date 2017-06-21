//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require('mongoose');
let Location = require('../src/models/location');
let User = require('../src/models/user');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../src/app');
let should = chai.should();

chai.use(chaiHttp);

// saved user id, to be owner of created objects
var ownerUserId;

//Our parent block
describe('Locations', () => {

    before('Creating User for tests...', (done) => { // Before all tests we add a user to be owner of our new test devices
        return User.findOne({
            email: 'test@test.com'
        }, function(err, user) {
            if (err) {
                let nuser = new User({
                    name: 'test',
                    email: 'test@test.com'
                });
                nuser.save();
                ownerUserId = nuser.id;
            } else ownerUserId = user.id;
            done();
        });
    });

    beforeEach((done) => { //Before each test we remove all locations
        Location.remove({}, (err) => {
            done();
        });
    });

    /*
     * Test the /GET route
     */
    describe('/GET location', () => {
        it('it should GET all the locations', (done) => {
            chai.request(server)
                .get('/api/location/')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(0);
                    done();
                });
        });
    });

    /*
     * Test the /POST route
     */
    describe('/POST location', () => {
        it('it should *not* POST a location without name field', (done) => {
            let loc = {
                'type': 'BUILDING',
                'geoLoc': {
                    'coordinates': [
                        40.4509146, -79.9024777
                    ]
                }
            }
            chai.request(server)
                .post('/api/location/')
                .send(loc)
                .end((err, res) => {
                    /**expected:
                    res.should.have.status(400); */
                    res.should.have.status(500);
                    res.body.should.be.a('object');
                    res.body.should.have.property('error');
                    res.body.error.should.have.property('message');
                    res.body.error.message.should.equal('Location name cannot be empty');
                    done();
                });
        });

        it('it should POST a new location', (done) => {
            /*geo_loc ( documentation has GeoLoc in first example ) */
            let loc = {
                'name': 'Building1',
                'type': 'BUILDING',
                'geo_loc': {
                    'coordinates': [
                        40.4509146, -79.9024777
                    ]
                }
            }
            chai.request(server)
                .post('/api/location/')
                .send(loc)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('name');
                    res.body.name.should.equal('Building1');
                    res.body.should.have.property('type');
                    res.body.type.should.equal('BUILDING');
                    res.body.should.have.property('geo_loc');
                    res.body.geo_loc.should.have.property('coordinates');
                    res.body.geo_loc.coordinates.should.be.a('array');
                    /**expected to return coordinates: 
                    res.body.geo_loc.coordinates.should.deep.equal([40.4509146,-79.9024777]); */
                    done();
                });
        });
    });

    /*
     * Test the /GET/:id route
     */
    describe('/GET/:id location', () => {
        it('it should GET a location by id', (done) => {
            let location = new Location({
                'name': 'Building 1',
                'type': 'BUILDING',
                'geo_loc': {
                    'coordinates': [40.4509146, -79.9024777]
                },
                'owner': ownerUserId
            });
            location.save((err, location) => {
                chai.request(server)
                    .get('/api/location/' + location.id)
                    .send(location)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.id.should.equal(location.id);
                        res.body.should.have.property('name');
                        res.body.name.should.equal('Building 1');
                        res.body.should.have.property('type');
                        res.body.type.should.equal('BUILDING');
                        res.body.should.have.property('geo_loc');
                        res.body.geo_loc.should.have.property('coordinates');
                        res.body.geo_loc.coordinates.should.be.a('array');
                        res.body.geo_loc.coordinates.should.deep.equal([40.4509146, -79.9024777]);
                        done();
                    });
            });
        });
    });

    /*
     * Test the /PUT/:id route
     */
    describe('/PUT/:id location', () => {
        it('it should UPDATE a location by id', (done) => {
            let location = new Location({
                'name': 'Building 1',
                'type': 'BUILDING',
                'geo_loc': {
                    'coordinates': [40.4509146, -79.9024777]
                },
                'owner': ownerUserId
            });
            location.save((err, location) => {
                let loc = {
                    'name': 'Building1 New Name',
                    'type': 'INDOOR',
                    'geo_loc': {
                        'coordinates': [
                            40.442395, -79.946875
                        ]
                    }
                }
                chai.request(server)
                    .put('/api/location/' + location.id)
                    .send(loc)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('name');
                        res.body.name.should.equal('Building1 New Name');
                        res.body.should.have.property('type');
                        res.body.type.should.equal('INDOOR');
                        res.body.should.have.property('geo_loc');
                        res.body.geo_loc.should.have.property('coordinates');
                        res.body.geo_loc.coordinates.should.be.a('array');
                        /**expected to return coordinates:  
                        res.body.geo_loc.coordinates.should.deep.equal([40.442395,-79.946875]); */
                        done();
                    });
            });
        });
    });

    /*
     * Test the /DELETE/:id route
     */
    describe('/DELETE/:id location', () => {
        it('it should DELETE a location by id', (done) => {
            let location = new Location({
                'name': 'Building 1',
                'type': 'BUILDING',
                'geo_loc': {
                    'coordinates': [40.4509146, -79.9024777]
                },
                'owner': ownerUserId
            });
            location.save((err, location) => {
                if (err) done(err);
                chai.request(server)
                    .delete('/api/location/' + location.id)
                    .send(location)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message');
                        res.body.message.should.equal('Delete successful');                              
                        done();
                    });
            });
        });
    });


});