module.exports = (url,auth,ShortCode,ResponseType,ConfirmationURL,ValidationURL) => {
    request(
        {
            method:"POST",
            url:url,
            headers:{
                "Authorization":auth
            },
            json:{
                "ShortCode": ShortCode,
                "ResponseType": ResponseType,
                "ConfirmationURL": ConfirmationURL,
                "ValidationURL": ValidationURL
            }
        },
        function(error,response,body){
            console.log("here come c2b registration body: ",body)
        }
    )
}