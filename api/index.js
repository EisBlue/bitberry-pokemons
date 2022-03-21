const express = require('express');
const app = express();
var bodyParser = require('body-parser');
const port = 5050;

const mysql = require('mysql');
const {
    json
} = require('express/lib/response');
const res = require('express/lib/response');

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
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json())
app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
})



app.listen(port, () => {
    console.log('Listening on port ' + port);
});

// ############## API REQUESTS HANDLING ###################
app.get('/pokemon', (req, res) => {
    //res.json(items);
    dbConnection.query('select * from pokemon;', (err, result) => {
        if (err) {
            console.log('Can not fetch data');
            return res.status(500).end('Can not fetch data');
        }
        return res.end(JSON.stringify(result));
    });
});

app.get('/pokemon/:id', (req, res) => {
    const pokemonId = req.params.id;
    sql = `select * from pokemon where id = ?`;
    dbConnection.query(sql, [pokemonId], (err, result) => {
        if (err) {
            console.log('Can not fetch the requested pokemon' + err.message);
            return res.end(500, 'Can not fetch the requested pokemon');
        }
        let pokemon = result[0];
        sql = `select ability_id from pokemon_abilities where pokemon_id = ${pokemonId}`;
        dbConnection.query(sql, (err, abilitiesResult) => {
            if (err) {
                console.log('Can not fetch pokemon abilities\n' + err.message);
                return res.status(500).end('Failed to fetch pokemon abilities\n' + err.message)
            }
            pokemon.abilities = parseAbilities(abilitiesResult);
            return res.end(JSON.stringify({
                pokemon
            }));
        })
    });
})

const parseAbilities = (abilities) => {
    let resultArray = [];
    for (let ability of abilities) {
        resultArray.push(ability.ability_id);
    }
    return resultArray;
}


app.get('/ability/:id', (req, res) => {
    sql = `select * from ability where id = ?`;
    dbConnection.query(sql, [req.params.id], (err, result) => {
        if (err) {
            console.log('Can not fetch the requested ability ' + err.message);
            return res.end(500, 'Can not fetch the requested ability');
        }
        return res.end(JSON.stringify(result));
    })
})

app.get('/abilities', (req, res) => {
    sql = 'select * from ability;';
    dbConnection.query(sql, (err, result) => {
        if (err) {
            console.log('Can not fetch all abilities\n' + err.message);
            return res.end(500, 'Can not fetch  all abilities\n' + err.message);
        }
        return res.end(JSON.stringify(result));
    })
})


app.post('/ability', (req, res) => {
    if (!req.body.name) {
        return res.end(422, 'Can not create an ability without a name');
    }
    const name = req.body.name;
    const url = req.body.url === undefined ? null : req.body.url;
    sql = `insert into ability (name, url) values (?, ?)`
    dbConnection.query(sql, [name, url], (err, result) => {
        if (err) {
            console.log('Can not create the ability:\n' + err.message);
            return res.end(500, 'Can not create the ability:\n' + err.message);
        }
        return res.status(201).end('Created ability');
    })
})

app.post('/pokemon', (req, res) => {
    // validate
    const pokemonRequestValidation = validatePokemon(req);
    if (!pokemonRequestValidation.valid) {
        return res.status(422).end(pokemonRequestValidation.errorMsg)
    };

    const abilities = req.body.abilities;

    let sqlAbilities = `select * from ability where id in (` 
    for (abilityId of abilities){
        sqlAbilities += '?,'
    }
    const preparedSqlAbilities = sqlAbilities.slice(0,-1) + `);`
    dbConnection.query(preparedSqlAbilities, abilities, (err, result) => {
        if (err) {
            console.log('Error fetching abilities:\n' + err.message);
            return res.end(500, 'Error fetching abilities:\n');
        }
        if (result.length !== abilities.length) {
            return res.status(422).end('One or more of the provided abilities does not exist.')
        }
    })

    const name = req.body.name;
    const sqlPokemon = `insert into pokemon (name) values (?)`
    dbConnection.query(sqlPokemon, [name], (err, result) => {
        if (err) {
            console.log('Filed to create pokemon:\n' + err.message);
            return res.end(500, 'Filed to create pokemon:\n');
        }
        const pokemon_id = result.insertId;


        sqlAbilities = `insert into pokemon_abilities (pokemon_id, ability_id) values `;
        let idsArray = [];
        for (ability of abilities) {
            sqlAbilities += `(?,?),`
            idsArray.push(pokemon_id);
            idsArray.push(ability)
        }
        const sql = sqlAbilities.slice(0, -1);

        dbConnection.query(sql, idsArray, (err, result) => {
            if (err) {
                console.log('Failed to create the pokemon-ability association:\n' + err.message);
                return res.end(500, 'Failed to create the pokemon-ability association:\n');
            }
            res.status(201).end(`Successfully created pokemon ${pokemon_id}`);
        })
    })
})

function validatePokemon(req) {
    const name = req.body.name;
    if (!name) {
        console.log('Can not create an unnamed pokemon');
        return {
            valid: false,
            errorMsg: 'Can not create an unnamed pokemon'
        }
    }
    console.log(req.body.abilities)
    const abilities = req.body.abilities;
    if (!abilities || abilities.length === 0) {
        console.log('Can not create a pokemon without abilities');
        return {
            valid: false,
            errorMsg: 'Can not create a pokemon without abilities'
        }
    }
    return {valid: true, errorMsg: ''};
}
