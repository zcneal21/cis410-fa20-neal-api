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

app.get("/product/:pk", (req, res) => {
    var pk = req.params.pk
    // console.log("My pk: " + pk)

    var myQuery = `SELECT * 
    FROM product
    LEFT JOIN ProductType
    ON ProductType.TypeID = Product.ProductTypeFK
    WHERE product.ProductID = ${pk}`

    db.executeQuery(myQuery)
    .then((product) => {
        // console.log("Products: ", product)
        if(product[0]){
            res.send(product[0])
        }else{res.status(404).send('bad request')}
    }).catch((err) => {
        console.log("Error in /product/pk", err)
        res.status(500).send()
        
    })
})


app.listen(5000, () => {console.log("App is running on port 5000")})