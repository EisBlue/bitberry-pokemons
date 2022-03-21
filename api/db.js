const mysql = require('mysql');

dbConnection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'pokemon'
})

dbConnection.connect((err) => {
    if (err) {
        console.log('Could not connect to the database: ' + err.message);
    } else {
        console.log('Successfully connected the the database');
    }
    const sqlPokemon = "CREATE TABLE IF NOT EXISTS pokemon (\
            id int AUTO_INCREMENT PRIMARY KEY ,\
            name VARCHAR(255) NOT NULL \
            )";
    dbConnection.query(sqlPokemon, (err, result) => {
        if (err) {
            console.log('could not create the pokemon table.\n' + err.message)
        } else {
            console.log('created the pokemon table successfully');
        }
    });
    const sqlAbilites = "CREATE TABLE IF NOT EXISTS ability(\
        id int AUTO_INCREMENT PRIMARY KEY, \
        name VARCHAR(255) NOT NULL ,\
        url VARCHAR(255) \
        )";
    dbConnection.query(sqlAbilites, (err, result) => {
        if (err) {
            console.log('could not create the ability table.\n' + err.message)
        } else {
            console.log('created the ability table successfully');
        }
    });

    const sqlPokemonAbilities = "CREATE TABLE IF NOT EXISTS pokemon_abilities ( \
        pokemon_id int NOT NULL, \
        ability_id int NOT NULL, \
        FOREIGN KEY (pokemon_id) REFERENCES pokemon(id), \
        FOREIGN KEY (ability_id) REFERENCES ability(id) )";
    dbConnection.query(sqlPokemonAbilities, (err, result) => {
        if (err) {
            console.log('could not create the pokemon abilities table.\n' + err.message)
        } else {
            console.log('created the pokemon abilities table successfully');
        }
    });
})

module.exports.dbConnection = this.dbConnection();