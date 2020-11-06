const express = require("express")
const db = require('./dbConnectExec.js')
const bcrypt = require('bcryptjs')


const app = express()
app.use(express.json())


app.get("/hi", (request, response) => {response.send("Hello world")})

app.post("/customer", async (req,res) => {
    // res.send("creating user")
    // console.log("request body",req.body)
    var nameLast = req.body.LastName
    var nameFirst = req.body.FirstName
    var phone = req.body.Phone
    var street = req.body.StreetAdd
    var city = req.body.City
    var state = req.body.State
    var zip = req.body.ZIP
    var email = req.body.email
    var password = req.body.Password

    if(!nameFirst || !nameLast || !email || !phone || !street || !city || !state || !zip || !password){
        return res.status(400).send("bad request")
    }

    nameFirst = nameFirst.replace("'", "''")
    nameLast = nameLast.replace("'", "''")

    var emailCheckQuery = `SELECT email 
    FROM Customer
    WHERE email = '${email}'`

    var existingUser = await db.executeQuery(emailCheckQuery)

    console.log("existing user", existingUser)
    if(existingUser[0]){
        return res.status(409).send("Please enter different email")
    }

    var hashedPassword = bcrypt.hashSync(password)

    var insertQuery = `INSERT INTO customer(LastName,FirstName,Phone,StreetAdd,City,State,ZIP,email,Password)
     VALUES('${nameLast}','${nameFirst}','${phone}','${street}','${city}','${state}','${zip}','${email}','${hashedPassword}')`
    //  console.log(insertQuery)
    db.executeQuery(insertQuery).then(()=>{
        res.status(201).send()
    }).catch((err)=> {console.log("error in post /customer", err)
        res.status(500).send()
})



})

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