const express = require("express")
const db = require('./dbConnectExec.js')
const bcrypt = require('bcryptjs')
const jwt = require("jsonwebtoken")
const cors = require("cors")

const config = require('./config.js')

const auth = require("./middleware/authenticate")


const app = express()
app.use(express.json())
app.use(cors())



app.post("/order", auth, async (req,res)=> {

    try{
    var ProductFK = req.body.ProductFK;
    var Quantity = req.body.Quantity
    var OrderDate = req.body.OrderDate
    
    if(!ProductFK || !Quantity || !OrderDate){
        res.status(400).send("bad request")
    }



    // console.log(req.customer)
    // 
    
    let insertQuery = `INSERT INTO [Order](OrderDate, Quantity, CustomerFK, ProductFK)
    OUtPUT inserted.OrderID, inserted.OrderDate, inserted.Quantity, inserted.ProductFK
    VALUES('${OrderDate}', ${Quantity}, ${req.customer.CustomerID}, ${ProductFK})`

    let insertedOrder = await db.executeQuery(insertQuery)

    // console.log(insertedOrder)
    res.status(201).send(insertedOrder[0])

}
    catch(error){
        console.log("error in POST /order", error)
        res.status(500).send()
    }

})

app.get('/customer/me', auth, (req, res) => {

    res.send(req.customer)

})


app.get("/hi", (request, response) => {response.send("Hello world")})

app.post("/customer/login", async (req, res)=> {
    // console.log(req.body)

    var email = req.body.email
    var password = req.body.Password

    if(!email || !password){
        return res.status(400).send("bad request")
    }

    //1. chech that email exists
    var query = `SELECT *
    FROM Customer
    WHERE email = '${email}'`

    let result;

    try{
        result = await db.executeQuery(query)
    }catch(myError){
        console.log("error in /contacts/login", myError)
        return res.status(500).send()
    }

    // console.log(result)

    if(!result[0]){
        return res.status(400).send('Invalid user credentials')
    }

    //2. check that password matches

    let user = result[0]
    // console.log(user)

    if(!bcrypt.compareSync(password, user.Password)){
        console.log("invalid password")
        return res.status(400).send("Invalid user credentials")
    }
    // console.log(result)

    //3. generate a token

    let token = jwt.sign({pk: user.CustomerID}, config.JWT, {expiresIn: '60 minutes'} )
    // console.log(token)

    //4. Save the token in the database and send token and user infor back to user

    let setTokenQuery = `UPDATE Customer
    SET Token = '${token}'
    WHERE CustomerID = ${user.CustomerID}`

    try{
        await db.executeQuery(setTokenQuery)

        res.status(200).send({
            token: token,
            user: {
                NameFirst: user.FirstName,
                NameLast: user.LastName,
                Email: user.email,
                CustomerID: user.CustomerID
            }
        })
    }
    catch(myError){
        console.log("error setting user token", myError)
        res.status(500).send()
    }
})

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

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {console.log(`App is running on port ${PORT}`)})