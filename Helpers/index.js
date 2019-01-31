var Observable = require('rxjs/Observable').Observable;
require('rxjs/add/observable/of');
require('rxjs/add/operator/map');
let axios = require('axios');
var request = require("request");

exports.observable = (URL) =>{
    console.log(URL)
  let observable$ = Observable.create((observer)=>{
    axios.post(URL)
    .then((response)=>{
      observer.next(response.data);
      observer.complete();
    })
    .catch((error)=>{
      observer.error(error);
    })
  })

  return observable$;   
}

exports.sendMessage = (URL) => {
  let options = {
      "method":"POST",
      "url":URL,
      "headers":{
          "Content-Type": 'application/json;charset=utf-8'
      },
      body: { value: 8.5 },
      json: true 
  }

  request(options, function (error, response, body) {
      if (error) {throw new Error(error)};
      
      console.log(body);
  });    
}

exports.T24Request = (str) => {
  let net = require('net')
  let HOST = '10.133.17.171'
  let PORT = 9080

  let sock = new net.Socket()

  // count string
  let strlen = (str.length).toString()
  // pad str
  let paddedStr = strlen.padStart(4,0)+str  

  console.log("PADDEDSTR:",paddedStr)


  // VALIDATE ROUTINES

  sock.connect(PORT,HOST,()=>{
    console.log('CONNECTED TO: ' + HOST + ':' + PORT);
    // Write a message to the socket as soon as the client is connected, the server will   receive it as message from the client     
    sock.write(paddedStr);      
  })

  sock.on('data',(data)=>{
    return data
    console.log('DATA: ' + data);
    _data = data
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
}
