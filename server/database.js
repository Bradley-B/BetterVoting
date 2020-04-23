const mysql = require('mysql');
const tools = require('./tools.js');

module.exports = class Database {
    constructor(password) {
        let config = {
            host: 'localhost',
            user: process.env.DB_USER || 'root',
            password: password,
            database: process.env.DB_NAME || 'polls',
            charset: 'utf8mb4'
        };
        this.db = mysql.createConnection( config );
        this.db.connect();
    }
    query( sql, args ) {
        return new Promise( ( resolve, reject ) => {
            this.db.query( sql, args, ( err, rows ) => {
                if ( err )
                    return reject( err );
                resolve( rows );
            } );
        } );
    }
    close() {
        return new Promise( ( resolve, reject ) => {
            this.db.end( err => {
                if ( err )
                    return reject( err );
                resolve();
            } );
        } );
    }
    escape(value) {
        return this.db.escape(value);
    }

    createPoll(newPollId, pollName, questions) {
        return this.query(`INSERT INTO poll (id, name) VALUES ('${newPollId}', ${this.escape(pollName)})`).then(() => {
            console.log("created row in table for poll with id: " + newPollId);

            let queries = [];
            questions.forEach(questionName => {
                let questionId = tools.randomString();
                queries.push(this.query(`INSERT INTO question (id, name, pollid) VALUES ('${questionId}', ${this.escape(questionName)}, '${newPollId}')`));
                console.log("created row in table for question with id: " + questionId);
            });
            return Promise.all(queries);
        });
    }
};