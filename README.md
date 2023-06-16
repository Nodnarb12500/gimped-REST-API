# gimped-REST-API
This is a template ive been working on for a while. its not really a REST API because its made to be useable with only a browser.

I have just realized I might be adding to much stuff to this template. My next project might be influencing what I add to this more then I thought it might.
If I end up remove large sections of this program its because it became to big, and my projects required me to remove sections of this template.

# Dependencies
    NodeJS
        - bcrypt
        - body-parser
        - express
        - knex
        - sqlite3

# Installation
```
git clone https://github.com/Nodnarb12500/gimped-REST-API
cd gimped-REST-API
npm i
npm start
```

# Configuration

This will be kinda difficult to explain and it might change in future versions.
a large amount of configuration can happen in config.js some other configuration has to be done manually in db/database.js to set up the databases how you would want them.
while not all the settings are there, it might be enough for most people and if its not knex.js is what i use to connect to a database. you can even just mySQL and it will apperently work without modifications to the code outside of the knex.js i wrote.