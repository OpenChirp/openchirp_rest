//During the test the env variable is set to test
process.env.NODE_ENV = 'test';

let mongoose = require('mongoose');
let Device = require('../src/models/device');
let User = require('../src/models/user');
let commandSchema = require('../src/models/command_schema');
let Command = mongoose.model('Command', commandSchema);

//Require the dev-dependencies
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../src/app');
let should = chai.should();

chai.use(chaiHttp);


// saved user id, to be owner of created objects
var ownerUserId;

// saved device, to add commands to it
var theDevice;

// saved command, to test get and
var theCommand;

//Our parent block
describe('Commands', function() {
    before('Creating User and Device for tests...', (done) => { // Before all tests we add a user to be owner of our new test devices and a device
        User.findOne({
            email: 'test@test.com'
        }, function(err, user) {
            if (user == undefined) {
                let user = new User({
                    name: 'test',
                    email: 'test@test.com'
                });
                user.save();
                ownerUserId = user.id
            } else ownerUserId = user.id;
            let device = new Device({
                'name': 'Test Device',
                'type': 'LORA',
                'enabled': 'true',
                'owner': ownerUserId,
                'transducers': [{
                    'name': 'Temperature',
                    'unit': 'Celsius',
                    'is_actuable': 'true'
                }]
            });
            device.save((err, device) => {
                if (err) console.log('***error!');
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
    describe('/GET command', function() {
        it('it should GET all the commands', (done) => {
            chai.request(server)
                .get('/api/device/' + theDevice.id + '/command')
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
    describe('/POST command', function() {
        it('it should POST a new command', (done) => {
            let cmd = {
                'name': 'Open Door',
                'transducer_id': theDevice.transducers[0].id,
                'value': '1'
            }
            chai.request(server)
                .post('/api/device/' + theDevice.id + '/command')
                .send(cmd)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.id.should.equal(theDevice.id); // only check id of device ... 
                    res.body.should.have.property('commands');
                    res.body.transducers.length.should.be.eql(1);
                    res.body.commands[0].should.have.property('name');
                    res.body.commands[0].name.should.equal('Open Door');
                    res.body.commands[0].should.have.property('transducer_id');
                    res.body.commands[0].transducer_id.should.equal(theDevice.transducers[0].id);
                    res.body.commands[0].should.have.property('value');
                    res.body.commands[0].value.should.equal('1');
                    theCommand = res.body.commands[0];
                    done();
                });
        });
    });

    /*
     * Test the /POST/:id route
     */
    /*
        describe('/POST/:id command', function() {
            it('it should EXECUTE a command by id', (done) => {
                let newCmd = new Command({
      				'name':'Open Door',
      				'transducer_id': theDevice.transducers[0].id,
      				'value' :'1'
                });
                newCmd.save((err, newCmd) => {
                	theDevice.commands.push(newCmd);
                	theDevice.save();
                    chai.request(server)
                        .post('/api/device/' + theDevice.id + '/command/' + newCmd._id)
                        .end((err, res) => {
                            res.should.have.status(200);
                            res.body.should.be.a('object');
                    		res.body.should.have.property('message');
                    		res.body.message.id.should.equal('Done');
                            done();
                        });
                });
            });
        });
    */
    describe('/POST/:id command', function() {
        it('it should EXECUTE a command by id', (done) => {
            chai.request(server)
                .post('/api/device/' + theDevice.id + '/command/' + theCommand._id)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    res.body.should.have.property('message');
                    res.body.message.should.equal('Done');
                    done();
                });
        });
    });

    /*
     * Test the /DELETE/:id route
     */
    describe('/DELETE/:id command', function() {
        it('it should DELETE a command by id', (done) => {

            chai.request(server)
                .delete('/api/device/' + theDevice.id + '/command/' + theCommand._id)
                .end((err, res) => {
                    res.should.have.status(200);
                    res.body.should.be.a('object');
                    /**expected a return message: 
                        res.body.should.have.property('message');
                        res.body.message.should.equal('Delete successful'); */
                    done();
                });
        });
    });

});