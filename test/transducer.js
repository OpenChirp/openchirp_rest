//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let Device = require('../src/models/device');
let User = require('../src/models/user');
let Transducer = require('../src/models/transducer_schema');

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../src/app');
let should = chai.should();

chai.use(chaiHttp);

// saved user id, to be owner of created objects
var ownerUserId;

// saved device, to add transducers to it
var theDevice;

//Our parent block
describe('Devices', function() {
    before('Creating User and Device for tests...', (done) => { // Before all tests we add a user to be owner of our new test devices and a device
        User.findOne({
            email: "test@test.com"
        }, function(err, user) {
            if (err) {
                let user = new User({
                    name: "test",
                    email: "test@test.com"
                });
                user.save();
                ownerUserId = user.id              
            }            
            ownerUserId = user.id;
            let device = new Device({
                "name": "Test Device",
                "type": "LORA",
                "enabled": "true",
                "owner": ownerUserId,
                "transducers": [{
                    "name": "Temperature",
                    "unit": "Celsius",
					"is_actuable": "true"
                }]
            });
            device.save((err, device) => {
                if (err) console.log("***error!");
                theDevice = device;
                done();
            });            
        });
    });

	// After all tests, cleanup
    after('Cleaning up...', function() {
    	theDevice.remove();
 	});    

    /*
     * Test the /GET route
     */
    describe('/GET transducer', function() {
        it('it should GET all the transducers', (done) => {
            chai.request(server)
                .get('/api/device/'+theDevice.id+'/transducer')
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('array');
                    res.body.length.should.be.eql(1);   
                    res.body[0].should.have.property('name');
                    res.body[0].name.should.equal("temperature");  // transducer names are changes to all small caps
                    res.body[0].should.have.property('unit');
                    res.body[0].unit.should.equal("Celsius");  
                    res.body[0].should.have.property('is_actuable'); 
                    res.body[0].is_actuable.should.equal(true); 
                    done();
                });
        });
    });

   /*
     * Test the /POST route
     */
    describe('/POST transducer', function() {
        it('it should POST a new transducer', (done) => {
            let trsdcr = {
                    "name": "New Temperature Sensor",
                    "unit": "Fahrenheit"
                }
            chai.request(server)
                .post('/api/device/'+theDevice.id+'/transducer')
                .send(trsdcr)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.id.should.equal(theDevice.id); // only check id of device ...                 
                    res.body.should.have.property('transducers');
                    res.body.transducers.length.should.be.eql(2);
                    res.body.transducers[0].should.have.property('name');                 
                    res.body.transducers[0].name.should.equal("temperature");  
                    res.body.transducers[0].should.have.property('unit');
                    res.body.transducers[0].unit.should.equal("Celsius");  
                    res.body.transducers[0].should.have.property('is_actuable'); 
                    res.body.transducers[0].is_actuable.should.equal(true);         
                    res.body.transducers[1].should.have.property('name');                 
                    res.body.transducers[1].name.should.equal("new_temperature_sensor");  // spaces are converted into '_'
                    res.body.transducers[1].should.have.property('unit');
                    res.body.transducers[1].unit.should.equal("Fahrenheit");  
                    res.body.transducers[1].should.have.property('is_actuable'); 
                    res.body.transducers[1].is_actuable.should.equal(false); // default                      
                    done();
                });
        });
    });

   /*
     * Test the /POST:id route
     */
/*     
    describe('/POST message to a transducer', function() {
        it('it should PUBLISH to a transducer', (done) => {  
        		let msg = {
					"test":"Hello"
				}
                chai.request(server)
                    .post('/api/device/'+theDevice.id+'/transducer/'+theDevice.transducers[0].id)
                    .send(msg)
                    .end((err, res) => {
                        res.should.have.status(200);
                        res.body.should.be.a('object');
                        res.body.should.have.property('message');
                        res.body.message.should.equal("Done");
                        done();
                    });
                   
        });
    });
*/    
});    