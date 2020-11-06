const sql = require('mssql')

const zcneal21Config = require('./config')

const config = {
    user: zcneal21Config.DB.user,
    password: zcneal21Config.DB.password,
    server: zcneal21Config.DB.server, // You can use 'localhost\\instance' to connect to named instance
    database: zcneal21Config.DB.database,
}

async function executeQuery(aQuery){
    var connection = await sql.connect(config)
    var result = await connection.query(aQuery)

    return(result.recordset)
}

module.exports = {executeQuery: executeQuery}

// executeQuery(`
// SELECT * 
// FROM product
// LEFT JOIN ProductType
// ON ProductType.TypeID = Product.ProductTypeFK
// `)

