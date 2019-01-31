/*
var PythonShell = require('python-shell');

var pyshell = new PythonShell('test.py');

pyshell.send(JSON.stringify([1,2,3,4,5]));

pyshell.on('message', function (message) {
  console.log(message);
});
*/

/*
var options = {
    mode: 'text',
    pythonOptions: ['-u'],
    args:['herrow']
};

PythonShell.run('./test.py',options,function(err,results){
    if(err) throw err;
    console.log(results);
})
*/

const spawn = require('child_process').spawn;
const scriptExecution = spawn("python", ["test.py"]);

// Handle normal output
scriptExecution.stdout.on('data', (data) => {
    console.log(String.fromCharCode.apply(null, data));
});

// Write data (remember to send only strings or numbers, otherwhise python wont understand)
var data = JSON.stringify([1,2,3,4,5]);
scriptExecution.stdin.write(data);
// End data write
scriptExecution.stdin.end();