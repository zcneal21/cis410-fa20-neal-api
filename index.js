const express = require("express")
const db = require('./dbConnectExec.js')
const app = express()


app.get("/hi", (request, response) => {response.send("Hello world")})

app.get("/product", (req, res) =>{
    //get data from database
    db.executeQuery(`
    SELECT * 
        FROM product
        LEFT JOIN ProductType
        ON ProductType.TypeID = Product.ProductTypeFK
    `)
    .then((result) => {
        res.status(200).send(result)
    })
    .catch((err) => {
        console.log(err)
        res.status(500).send()

    })

})


app.listen(5000, () => {console.log("App is running on port 5000")})