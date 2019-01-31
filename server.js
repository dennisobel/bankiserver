let app    = require('express')()
let routes = require("./app/routes/routes.js");
let http = require('http').Server(app)
let io = require('socket.io')(http)
let net = require('net')

// var cors = require('cors');
var logger = require('morgan');
var mongoose = require('mongoose');

// let t24connect = net.createServer((socket)=>{
//   console.log(socket)
// });

// t24connect.listen(9080,'10.133.17.171')

let passport   = require('passport')
let session    = require('express-session')
let bodyParser = require('body-parser')
let env        = require('dotenv').load()
// let exphbs     = require('express-handlebars')

let HOST = '10.133.17.171'
let PORT = 9080
let t24Socket = net.createConnection(PORT,HOST)

//For BodyParser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


// For Passport
app.use(session({ secret: 'keyboard cat',resave: true, saveUninitialized:true})); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions


//For Handlebars
app.set('views', './app/views')
// app.engine('hbs', exphbs({extname: '.hbs'}));
app.set('view engine', '.hbs');

app.get('/', function(req, res){
  res.send('Welcome to Passport with Sequelize');
});


//Models
var models = require("./app/models");


//Routes
// var authRoute = require('./app/routes/auth.js')(app,passport);


//load passport strategies
require('./app/config/_passport/passport.js')(passport,models.user);


//Sync Database
/*
  models.sequelize.sync().then(function(){
console.log('Nice! Database looks fine')

}).catch(function(err){
console.log(err,"Something went wrong with the Database Update!")
});
*/

io.on('connection',(socket)=>{
  let verified;
  // Oauth
  socket.on('joinApp',function(_data){
    console.log(_data)

    let sock = new net.Socket()
    let str = '0093ENQUIRY.SELECT,,MBK/123455/KE0010001,KBS.MB.PROC,CUSTOMER.NO:EQ=30469,TRANSACTION.CODE:EQ=BAL'
    // let strlen = str.length

    sock.connect(PORT,HOST,()=>{
      console.log('CONNECTED TO: ' + HOST + ':' + PORT);
      // Write a message to the socket as soon as the client is connected, the server will   receive it as message from the client 
      // socket.write('@!>\n');  
      
      // console.log(strlen)
      sock.write(str);      
    })

    sock.on('data',(data)=>{
      console.log('DATA: ' + data);
        // Close the client socket completely
        // client.destroy();
    })

    sock.on('error', function(exception){
      console.log('Exception:');
      console.log(exception);
    });
    
    
    sock.on('drain', function() {
      console.log("drain!");
    });
    
    sock.on('timeout', function() {
      console.log("timeout!");
    });
    
    // Add a 'close' event handler for the client socket
    sock.on('close', function() {
       console.log('Connection closed');
    });

    // t24Socket
    // .on('data',(data)=>{
    //   console.log('received: '+data);
    // })
    // .on('connect',()=>{
    //   console.log('connected');
    //   t24Socket.write("ENQUIRY.SELECT,,MBK/123455/KE0010001,KBS.MB.PROC,CUSTOMER.NO:EQ=30469,TRANSACTION.CODE:EQ=BAL\r\n")      
    // })
    // .on('end',()=>{
    //   console.log('connection closed');
    // })


    // check if member number exists
    // check if member number and id are tied
    // if above cases true, send verification code
    socket.emit('verified',{
      verified:true
    })
  })

  socket.on('signIn',function(data){
    console.log(data)
    // verify signin data
    // allow access
  })

  socket.on('signUp',function(data){
    console.log(data)
  })

  // Enquiries
  socket.on('balanceEnq',(data)=>{
    console.log("Balance Enquiries: ", data)
  })

  socket.on('miniStatEnq',(data)=>{
    console.log("Balance Enquiries: ", data)
  })

  socket.on('fullStatEnq',(data)=>{
    console.log("Balance Enquiries: ", data)
  })

  // Loans
  // Get Loan Bal
  socket.on('getLoanBal',()=>{
    console.log("getting loan balance.")
  })

  // Apply Loan
  socket.on('applyMLoan',(data)=>{
    console.log(data)
  })

  socket.on('applyExpressLoan',(data)=>{
    console.log(data)
  })

  socket.on('applyFosaAdvance',(data)=>{
    console.log(data)
  })

  // Pay Loan
  socket.on('payLoan',(data)=>{
    console.log(data)
  })

  // Guarantees Guarantors
  socket.on('guaranteesGuarantors',()=>{
    console.log("fetch guarantors")
  })

  // Funds Transfer
  // account balances
  socket.on('accountBalances',()=>{
    console.log('getting account balances...')
  })

  socket.on('internalFundsTransfer',(data)=>{
    console.log("Internal funds transfer called: ",data)
  })

  socket.on('mpesaFundsTransfer',(data)=>{
    console.log("M-Pesa funds transfer called: ",data)
  })

  socket.on('bankFundsTransfer',(data)=>{
    console.log("Bank funds transfer called: ",data)
  })

  // utills and bills
  socket.on('utillsAndBills',(data)=>{
    console.log("requesting utils: ",data)
  })

  socket.on('disconnect',()=>{

  })
})

let port = process.env.PORT || 3000;

http.listen(port, function(err){
  if(!err)
  console.log("Site is live on ", port); else console.log(err)
});





