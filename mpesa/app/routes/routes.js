let {mpesaController} = require('../controllers/mpesaController');

let appRouter = (app)=>{
    // confirmation url
    app.all("/confirmation",(req,res)=>{
        console.log("confirmed")
    })   

    // validation url
    app.all("/validation",(req,res)=>{
        console.log("validated")
    })

    // timeout url
    app.all("/timeout",mpesaController.post,(req,res)=>{
        console.log("timeout")
    })

    // result url
    app.all("/result",mpesaController.post,(req,res)=>{
        console.log("result :",res)
        res.json()
    })

    // callback url
    // app.all("/callback",mpesaController.post,(req,res)=>{
    //     console.log("result :",res)
    //     res.json()
    // })    
}

module.exports = appRouter