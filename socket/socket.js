let helper = require('./../Helpers')
/*
let net = require('net')
let HOST = '10.133.17.171'
let PORT = 9080
let t24Socket = net.createConnection(PORT,HOST)
*/
// let payments = require('../nifty/nifty')

makePayment = function(_data){
    // console.log("incoming: ",_data)
    var spawn = require('child_process').spawn;
    
    var scriptExecution = spawn("python", ["./nifty.py"]); 

   // Handle normal output
   scriptExecution.stdout.on('data', (data) => {
       console.log("python output",String.fromCharCode.apply(null, data));
   });

   var data = JSON.stringify([_data.phoneNumber,parseInt(_data.amount),'kbsacco','f861c6cc-4efa-4306-8eee-08f035b03772']);
   console.log("data: ",data)
   // Write data (remember to send only strings or numbers, otherwhise python wont understand)
   scriptExecution.stdin.write(data);
   // End data write
   scriptExecution.stdin.end();        
}

let balEnqData 

T24Request = (str) => {
    console.log("inside req")
    let net = require('net')
    let HOST = '10.133.17.171'
    let PORT = 9080
  
    let sock = new net.Socket()
  
    // count string
    let strlen = (str.length).toString()
    // pad str
    let paddedStr = strlen.padStart(4,0)+str  
  
    // console.log("PADDEDSTR:",paddedStr)  
  
    // VALIDATE ROUTINES
    return new Promise((resolve,reject)=>{
        sock.connect(PORT,HOST,()=>{
            console.log('CONNECTED TO: ' + HOST + ':' + PORT);
            // Write a message to the socket as soon as the client is connected, the server will   receive it as message from the client     
            sock.write(paddedStr)
        })        

        sock.on('data',(data)=>{
            // console.log('DATA: ' + data);    
            resolve(data)                    
            // Close the client socket completely
            // client.destroy();
        })

        sock.on('error', function(exception){
            console.log('Exception:');
            console.log(exception);
            reject(exception)
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
    })
  }

  

module.exports = (io,clients) => {
    
    io.on('connection',(socket)=>{
        console.log("a new client has connected with the id " + socket.id + "!"); 
        socket.emit("socketId",{data:socket.id})	
        // 30469
        // ${parseInt(data.membernumber)}

        // Enquiries
        socket.on("balanceEnq",(data)=>{
            console.log("We hit balanceenq. Here the data: ", data)
            let balanceEnqStr = `ENQUIRY.SELECT,,MBK/123455/KE0010001,KBS.MB.PROC,CUSTOMER.NO:EQ=${parseInt(data.membernumber)},TRANSACTION.CODE:EQ=BAL`            
            /*helper.T24Request(String(balanceEnqStr))*/
            T24Request(String(balanceEnqStr))
            .then((data)=>{
                
                // Process data to neat json before sending to client
                let dataArray = data.toString('utf-8').split(",",-3)

                let filteredAndMapped = dataArray.filter((i)=>{
                    return i[0] === 'F' || i[0] ===  'M' || i[0] === 'S' 
                }).map((j)=>{
                    return Object.assign({},j.split(";"))
                }).slice(0,2)
                
                // emit
                socket.emit('balEnqData',{data:filteredAndMapped})
            })
            
        })

        
        socket.on('miniStatEnq',(data)=>{
            console.log("Balance Enquiries: ", data)
        })

        socket.on('fullStatEnq',(data)=>{
            console.log("Balance Enquiries: ", data)
        })  
        
        socket.on('estatement',(data)=>{
            console.log("inside e-statement")
            console.log("ESTAT INCOMING: ", data)
            
            let estatStr = `ENQUIRY.SELECT,,MBK/********/KE0010001,KBS.MB.PROC,CUSTOMER.NO:EQ=${parseInt(data.data.membernumber)},TRANSACTION.CODE:EQ=EST`
            
            T24Request(String(estatStr))
            .then((data)=>{
                let dataArray = data.toString('utf-8').split(",",-3)
                console.log(dataArray[4].split('.'))
                // [4].split('.')
                socket.emit('eStatementData',{data:dataArray[4].split('.')[0]})
            })
        })
        
        // Loans
        // Get Loan Bal
        socket.on('getLoanBal',(data)=>{
            let loanBalEnqStr = `ENQUIRY.SELECT,,MBK/123455/KE0010001,KBS.MB.PROC,CUSTOMER.NO:EQ=${parseInt(data.membernumber)},TRANSACTION.CODE:EQ=LBAL`
            helper.T24Request(String(loanBalEnqStr))
            console.log("getting loan balance.")
        })

        // Loan Eligibility
        socket.on('loanEligibility',(data)=>{
            let loanEligStr = `ENQUIRY.SELECT,,MBK/123455/KE0010001,KBS.MB.PROC,CUSTOMER.NO:EQ=${parseInt(data.membernumber)},TRANSACTION.CODE:EQ=LAE`
            helper.T24Request(String(loanEligStr))
        })

        // Apply Loan
        socket.on('applyMLoan',(data)=>{
            console.log(data)
        })

        socket.on('applyExpressLoan',(data)=>{
            console.log(data)
        })

        socket.on('applyFosaAdvance',(data)=>{
            let fosaAdvStr = `FUNDS.TRANSFER,KBS.MB.FOSA.ADVANCE/I/PROCESS,MBK/123455/KE0010001,,MB.MEMBER.NO=38213,DEBIT.AMOUNT=10000.0`
            helper.T24Request(String(fosaAdvStr))
        })     

        // Pay Loan
        socket.on('payLoan',(_data)=>{
            console.log("Here comes loan repayment: ",_data)
            // payments.makePayment(data.phone_number,data.amount) 

            var data = {
                phoneNumber:_data.phoneNumber,
                amount:_data.amount
            }
            makePayment(data)
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
        socket.on('airtimePurchase',(data)=>{
            console.log(data)
            // ${parseInt(data.membernumber)}
            // 30469
            let airtimePurchStr = `FUNDS.TRANSFER,KBS.AIRTIME/I/PROCESS,MBK/123455/KE0010001,,MB.MEMBER.NO=${parseInt(data.membernumber)},DEBIT.AMOUNT=${parseInt(data.data)}`

            T24Request(String(airtimePurchStr))
            .then((data)=>{
                let firstElOfSplitStr = data.toString('utf-8').split(',')[0]
                  
                let lastElOfAboveArray = firstElOfSplitStr.split('/').slice(-1)[0]     
                
                if(lastElOfAboveArray == '1'){
                    socket.emit('airtimePurchaseData',{data:`You have received Airtime worth Ksh ${parseInt(data.data)}`})
                }else if(lastElOfAboveArray == 'NO'){
                    socket.emit('airtimePurchaseData',{data:"Sorry, you have insufficient funds. Please top your account up"})
                }                
                
            })
        })

        socket.on('tokenPurchase',(data)=>{
            console.log(data)
            // ${parseInt(data.membernumber)}
            // 40256
            let tokenPurchStr = `FUNDS.TRANSFER,KBS.ELECT/I/PROCESS,MBK/123455/KE0010001,,MB.MEMBER.NO=${parseInt(data.membernumber)},DEBIT.AMOUNT=${parseInt(data.data)}`
            // helper.T24Request(String(tokenPurchStr))

            T24Request(String(tokenPurchStr))
            .then((data)=>{

                let firstElOfSplitStr = data.toString('utf-8').split(',')[0]
                  
                let lastElOfAboveArray = firstElOfSplitStr.split('/').slice(-1)[0]     
                
                if(lastElOfAboveArray == '1'){
                    socket.emit('tokenPurchaseData',{data:`You have received Airtime worth Ksh ${parseInt(data.data)}`})
                }else if(lastElOfAboveArray == 'NO'){
                    socket.emit('tokenPurchaseData',{data:"Sorry, you have insufficient funds. Please top your account up"})
                }  
            })
        })

        socket.on('disconnect',()=>{

        })        
    })
}