let helper = require('./../Helpers')
let mpesa = require('../mpesa')
var moment = require('moment');
let ApiHelpers = require('../mpesa/ApiHelpers')

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
            console.log("BAL DATA MEMBER NO", data)
            let memberNo = data
            let balanceEnqStr = `ENQUIRY.SELECT,,INPUTT/Le@ve123/KE0010001,KBS.APPL.GUARANT,CUSTOMER.NO:EQ=${memberNo},TRANSACTION.CODE:EQ=BAL`
            // let balanceEnqStr = `ENQUIRY.SELECT,,MBK/123455/KE0010001,KBS.MB.PROC,CUSTOMER.NO:EQ=${memberNo},TRANSACTION.CODE:EQ=BAL`            
            /*helper.T24Request(String(balanceEnqStr))*/
            T24Request(String(balanceEnqStr))
            .then((data)=>{
                let stringifiedData = data.toString('utf-8')
                

                let dataArray = data.toString('utf-8').split(",",-3)
                console.log("BAL ENQ DATA:",dataArray)
                /*
                console.log("BAL ENQ DATA:",data.toString('utf-8'))
                
                // Process data to neat json before sending to client
                let dataArray = data.toString('utf-8').split(",",-3)

                let filteredAndMapped = dataArray.filter((i)=>{
                    return i[0] === 'F' || i[0] ===  'M' || i[0] === 'S' 
                }).map((j)=>{
                    return Object.assign({},j.split(";"))
                }).slice(0,2)
                
                // emit
                // socket.emit('balEnqData',{data:filteredAndMapped})
                */
                socket.emit('balEnqData',{data:dataArray})
            })
            
        })

        socket.on('transaction',(data) => {
            console.log("INCOMING TRANSACTION DATA: ", data)
            let str = `ENQUIRY.SELECT,,INPUTT/Le@ve123/KE0010001,KBS.APPL.GUARANT,CUSTOMER.NO:EQ=${data.mno},TRANSACTION.CODE:EQ=MIN,CREDIT.AC.NO:EQ=${data.accountNum}`
            T24Request(String(str))
            .then((data)=>{
                let stringifiedData = data.toString('utf-8')
                console.log('STRING DATA: ',stringifiedData)                

                let dataArray = data.toString('utf-8').split(",",-3)
                console.log("TRANSACTION ENQ DATA:",dataArray)
                socket.emit('transactionData',{data:dataArray})
            })            
        })

        
        socket.on('miniStatEnq',(data)=>{
            console.log("Balance Enquiries: ", data)
        })

        socket.on('fullStatEnq',(data)=>{
            console.log("Balance Enquiries: ", data)
        })  
        
        // Loans
        // Get Loan Bal
        // socket.on('getLoanBal',(data)=>{
        //     let loanBalEnqStr = `ENQUIRY.SELECT,,MBK/123455/KE0010001,KBS.MB.PROC,CUSTOMER.NO:EQ=${parseInt(data.membernumber)},TRANSACTION.CODE:EQ=LBAL`
        //     helper.T24Request(String(loanBalEnqStr))
        //     console.log("getting loan balance.")
        // })

        // Apply Loan
        socket.on('applyMLoan',(data)=>{
            // let memberNo = data.membernumber 
            // let memberNo = 40256
            // let memberNo = 43307
            console.log("INCOMING MLOAN DATA: ",data)
            let mloanStr = `FUNDS.TRANSFER,KBS.MLOAN/I/PROCESS,MBK/123455/KE0010001,,MB.MEMBER.NO=${data.mno},DEBIT.AMOUNT=${data.amount},MLOAN.TYPE=30`

            T24Request(String(mloanStr)).then(data=>{
                let stringifiedData = data.toString('utf-8');
                /*
                let firstElOfSplitStr = data.toString('utf-8').split(',')[0]
                  
                let lastElOfAboveArray = firstElOfSplitStr.split('/').slice(-1)[0]  

                console.log("M-LOAN DATA: ",data.toString('utf-8').split(',')[0].split('/').slice(-1)[0])

                if(lastElOfAboveArray == '1'){
                    socket.emit('applyMLoanResult',{data:`Your M-LOAN request of Ksh ${parseInt(data.data)} will be disbursed shortly.`})
                }else if(lastElOfAboveArray == 'NO'){
                    socket.emit('applyMLoanResult',{data:"Sorry, you do not qualify for M-LOAN"})
                }         
                */
               socket.emit('applyMLoanResult',stringifiedData)         
            })
        })

        socket.on('applyFosaAdvance',(data)=>{
            // let memberNo = data.membernumber
            // let memberNo = 40256            
            // let memberNo = data.mno
            console.log("INCOMING FOSA DATA: ",data)
            let fosaAdvStr = `FUNDS.TRANSFER,KBS.MB.FOSA.ADVANCE/I/PROCESS,MBK/123455/KE0010001,,MB.MEMBER.NO=${data.mno},DEBIT.AMOUNT=${data.amount}`
            T24Request(String(fosaAdvStr)).then(data=>{
                let stringifiedData = data.toString('utf-8');
                /*
                let firstElOfSplitStr = data.toString('utf-8').split(',')[0]
                  
                let lastElOfAboveArray = firstElOfSplitStr.split('/').slice(-1)[0]     

                console.log("FOSA DATA: ",data.toString('utf-8').split(',')[0].split('/').slice(-1)[0])

                if(lastElOfAboveArray == '1'){
                    socket.emit('applyFosaAdvanceResult',{data:`Your FOSA Advance request of Ksh ${parseInt(data.data)} will be disbursed shortly.`})
                }else if(lastElOfAboveArray == 'NO'){
                    socket.emit('applyFosaAdvanceResult',{data:"Sorry, you do not qualify for FOSA Advance"})
                }  
                */
               socket.emit('applyFosaAdvanceResult',stringifiedData)             
            })
        }) 
        
        socket.on('loanApplication',(data) => {
            console.log("INCOMING LOAN APPLICATION DATA:",data)
            let str = `ENQUIRY.SELECT,,INPUTT/Le@ve123/KE0010001,KBS.LOAN.APPL.APP,CUSTOMER.NO:EQ=${data.memberNumber},PHONE.NO:EQ=${data.phoneNumber},LOAN.AMOUNT:EQ=${data.amount},LOAN.TERM:EQ=${data.term + 'M'},LOAN.TYPE:EQ=${data.type},LOAN.PURPOSE:EQ=${data.purpose},GUARANTORS:EQ=${data.guarantors.join(':')/*'29991:40304:30469:30155'*/}`
            console.log("STR:",str)
            T24Request(String(str)).then((data)=>{
                let stringifiedData = data.toString('utf-8');
                console.log("LOAN APPLICATION DATA FEEDBACK:",stringifiedData)
                socket.emit('loanApplicationFeedback',stringifiedData)
            })
        })
        
        // Get Accounts
        socket.on('memberAccounts',(data) => {
            console.log('INCOMING MEMBER ACC REQUEST: ', data);
            let accountsStr = `CUSTOMER_POSITION=ENQUIRY.SELECT,,MBK/123455/KE0010001,KBS.MB.PROC,CUSTOMER.NO:EQ=${data},TRANSACTION.CODE:EQ=CSP `;
            T24Request(String(accountsStr)).then((data) => {
                console.log("MEMBER ACCOUNTS RESULTS: ", data.toString('utf-8'));
            })
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

        socket.on('estatement',(data)=>{
            // let memberNo = ${parseInt(data.membernumber)}
            // let memberNo = 30469                          
            let memberNo = 43307  
            console.log("inside e-statement")
            console.log("ESTAT INCOMING: ", data)
            
            let estatStr = `ENQUIRY.SELECT,,MBK/********/KE0010001,KBS.MB.PROC,CUSTOMER.NO:EQ=${memberNo},TRANSACTION.CODE:EQ=EST`
            
            T24Request(String(estatStr))
            .then((data)=>{
                let dataArray = data.toString('utf-8').split(",",-3)
                console.log(dataArray[4].split('.'))
                // [4].split('.')
                socket.emit('eStatementData',{data:dataArray[4].split('.')[0]})
            })
        })

        // accounts

        // Guarantee = TEE
        // Guarantor

        socket.on('memberAccounts',(data)=>{
            // let memberNo = parseInt(data.membernumber)
            // let memberNo = 30469            
            let memberNo = 43307
            let memAccStr = `CUSTOMER_POSITION=ENQUIRY.SELECT,,MBK/123455/KE0010001,KBS.MB.PROC,CUSTOMER.NO:EQ=${memberNo},TRANSACTION.CODE:EQ=CSP `   

            T24Request(String(memAccStr))
            .then((data)=>{
                console.log(data.toString('utf-8'))

                if(data.toString('utf-8') == '0023EB.RTN.APP.MISS.2|01|$$'){
                    socket.emit('memberAccountsResponse',{data:"No Accounts Found"})
                }
                // let dataArray = data.toString('utf-8').split(",",-3)
            })             
        })

        // Guarantees Guarantors
        socket.on('guarantors',(data)=>{
            console.log("inside Guarantors")
            console.log("Guarantors INCOMING: ", data)

            // let memberNo = ${parseInt(data.membernumber)}
            // let memberNo = 30469     
            let memberNo = 43307  
            // 29991    

            let grtorStr = `ENQUIRY.SELECT,,INPUTT/Le@ve123/KE0010001,KBS.APPL.GUARANT,CUSTOMER.NO:EQ=${data},TRANSACTION.CODE:EQ=TOR`
            
            // let guarantorStr = `LIST_GUARANTORS=ENQUIRY.SELECT,,MBK/123455/KE0010001,KBS.APPL.GUARANT,CUSTOMER.NO:EQ=${memberNo},TRANSACTION.CODE:EQ=TOR`
            
            T24Request(String(grtorStr))
            .then((data)=>{
                let stringifiedData = data.toString('utf-8');
                console.log(data.toString('utf-8'))
                // let dataArray = data.toString('utf-8').split(",",-3)
                // console.log(dataArray[4].split('.'))
                // [4].split('.')
                // socket.emit('eStatementData',{data:dataArray[4].split('.')[0]})
                socket.emit('guarantorsResult',{data:stringifiedData})
            })            
        })

        socket.on('guarantees',(data)=>{
            // let memberNo = ${parseInt(data.membernumber)}
            // let memberNo = 30469        
            let memberNo = 43307          
            console.log("inside Guarantees")
            console.log("Guarantees INCOMING: ", data)
            
            let grteeStr = `ENQUIRY.SELECT,,INPUTT/Le@ve123/KE0010001,KBS.APPL.GUARANT,CUSTOMER.NO:EQ=${data},TRANSACTION.CODE:EQ=TEE`
            // let guaranteeStr = `LIST_GUARANTEES=ENQUIRY.SELECT,,MBK/123455/KE0010001,KBS.APPL.GUARANT,CUSTOMER.NO:EQ=${memberNo},TRANSACTION.CODE:EQ=TEE`
            
            T24Request(String(grteeStr))
            .then((data)=>{
                let stringifiedData = data.toString('utf-8');
                console.log(data.toString('utf-8'))
                let dataArray = data.toString('utf-8').split(",",-3)
                // console.log(dataArray[4].split('.'))
                // [4].split('.')
                // socket.emit('eStatementData',{data:dataArray[4].split('.')[0]})
                socket.emit('guaranteesResult',{data:stringifiedData})
            })             
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
            let memberNo = 43307      
            // let memberNo = parseInt(data.membernumber)
            let airtimePurchStr = `FUNDS.TRANSFER,KBS.AIRTIME/I/PROCESS,MBK/123455/KE0010001,,MB.MEMBER.NO=${memberNo},DEBIT.AMOUNT=${parseInt(data.data)}`

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

        socket.on('kopaAirtime',data=>{
            console.log("KOPA CREDO DATA:",data)

            // let memberNO = parseInt(data.membernumber)
            // let memberNO = 30469         
            let memberNO = 43307   
            console.log(memberNO)   

            let kopaAirtimeStr = `KOPA_CREDIT=FUNDS.TRANSFER,KBS.KOPA.CREDIT/I/PROCESS,MBK/123455/KE0010001,,MB.MEMBER.NO=${memberNO},DEBIT.AMOUNT=${parseInt(data.data)}`

            T24Request(String(kopaAirtimeStr))
            .then((data)=>{

                console.log(data.toString('utf-8'))

                // let firstElOfSplitStr = data.toString('utf-8').split(',')[0]
                  
                // let lastElOfAboveArray = firstElOfSplitStr.split('/').slice(-1)[0]     
                
                // if(lastElOfAboveArray == '1'){
                //     socket.emit('tokenPurchaseData',{data:`You have received Airtime worth Ksh ${parseInt(data.data)}`})
                // }else if(lastElOfAboveArray == 'NO'){
                //     socket.emit('tokenPurchaseData',{data:"Sorry, you have insufficient funds. Please top your account up"})
                // }  
            })            
        })

        socket.on('tokenPurchase',(data)=>{
            console.log("TOKEN PURCHASE DATA:",data)
            // ${parseInt(data.membernumber)}
            // 40256
            let memberNO = 43307
            // let memberNO = parseInt(data.membernumber)        
            let tokenPurchStr = `FUNDS.TRANSFER,KBS.ELECT/I/PROCESS,MBK/123455/KE0010001,,MB.MEMBER.NO=${memberNO},DEBIT.AMOUNT=${parseInt(data.data)}`
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

        socket.on('loanEligibility',(data)=>{
            console.log("INCOMING LOAN ELIG DATA: ",data)
            let memberNo = data
            let loanEligibilityStr = `ENQUIRY.SELECT,,MBK/123455/KE0010001,KBS.MB.PROC,CUSTOMER.NO:EQ=${data},TRANSACTION.CODE:EQ=LAE`

            T24Request(String(loanEligibilityStr))
            .then(data=>{
                let stringifiedData = data.toString('utf-8')
                /*
                console.log("unfiltered eligibility data",stringifiedData)
                console.log("HERE COME LOAN ELIGIBILITY DATA:",stringifiedData.split(':')[5].split('.'))

                let mappedRes = stringifiedData.split(':')[5].split('.').map((el)=>{
                    return el.slice(3)
                })

                console.log("MAPPED RES: ", mappedRes)
                */

                socket.emit('loanEligibilityResult',stringifiedData)
            })
        })

        socket.on('loanBalances',(data)=>{

            console.log("inside lonaBalances")
            console.log("INCOMING LOAN BAL DATA: ",data)
            // let memberNo = 40256
            // let memberNo = parseInt(data.membernumber)
            let memberNo = data
            let loanBalStr = `ENQUIRY.SELECT,,MBK/123455/KE0010001,KBS.MB.PROC,CUSTOMER.NO:EQ=${memberNo},TRANSACTION.CODE:EQ=LBAL`

            T24Request(String(loanBalStr))
            .then(data=>{
                let stringifiedData = data.toString('utf-8')
                console.log("LOAN BAL RES: ",stringifiedData)
                /*
                console.log("HERE COME LOAN BAL DATA:",stringifiedData.split(':')[4].split(',')[2])

                let loanBalanceResult = stringifiedData.split(':')[4].split(',')[2]

                if(stringifiedData.split(':')[4].split(',')[2] !== undefined){
                    socket.emit('loanBalanceResult',{data:loanBalanceResult})
                }else if(stringifiedData.split(':')[4].split(',')[2] == undefined){
                    socket.emit('loanBalanceResult',{data:stringifiedData})
                }
                */
               socket.emit('loanBalanceResult',{data:stringifiedData})
            })
        })        

        socket.on('depositFromMpesa',data=>{
            console.log("DEPOSIT MPESA DATA",data)
            // mpesa.handleMpesa(data)
            console.log("inside depositfrommpesa. DATA: ", data)

            ApiHelpers.genOAuth().then(body => {  
                console.log("inside genOauth")
                let _body = JSON.parse(body);
                let oauth_token = _body.access_token;
                let auth = "Bearer " + oauth_token;
        
                console.log("auth:",auth)

                ApiHelpers.lipaNaMpesa(auth).then(body => { 
                    console.log("inside lipanampesa")           
                    console.log("Body :",body)
                }).catch(error => {
                    console.log("Error :",error)
                })                
            })            
        })

        socket.on('disconnect',()=>{

        })        
    })
}

// BUY TO ANOTHER NUMBER
// MINI, FULL STATEMENT
// ENCRYPTION
// MISSING OFSs
// INTERCEPTION OF TEXTS
// TIMEOUT LOCK AND PIN BEFORE TRANSACTION
// SMS FOR ALL TRANSACTIONS