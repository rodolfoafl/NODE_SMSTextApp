const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');

//https://dashboard.nexmo.com/
const Nexmo = require('nexmo');
const socketio = require('socket.io');



//Init Nexmo
const nexmo = new Nexmo({
    apiKey: 'cf1403c3',
    apiSecret: '2UBellgB3zY5xD0/H72nYAwoO9rhp3kGPwRdc0k4dF8='
}, {debug: true});

//Init app
const app = express();

//Template engine setup
app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

//Public folder setup
app.use(express.static(__dirname + '/public'));

//Body parser middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true}));

//Index route
app.get('/', (req, res) => {
    res.render('index');
})

//Catch form submit
app.post('/', (req, res) => {
    //res.send(req.body);
    //console.log(req.body);
    const number = req.body.number;
    const text = req.body.text;

    nexmo.message.sendSms(
        'Nexmo', number, text, { type: 'unicode' },
        (err, responseData) => {
            if(err){
                console.log(err);
            }else{
                console.dir(responseData);
                
                //Get data from response
                const data = {
                    id: responseData.messages[0]['message-id'],
                    number: responseData.messages[0]['to']
                };

                //Emit to the client
                io.emit('smsStatus', data);
            }
        }
    );
});

//Define port
const PORT = 3000;

//Start server
const SERVER = app.listen(PORT, () => console.log(`Server started on PORT ${PORT}`));

//Connect to socket.io
const io = socketio(SERVER);
io.on('connection', (socket) => {
    console.log('Connected');
    io.on('disconnect', () => {
        console.log('Disconnected');
    })
})