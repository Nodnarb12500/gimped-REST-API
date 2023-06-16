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

This Needs rewritten lmao. but i want to make configuring a little easier first.

This will be kinda difficult to explain and it might change in future versions.
a large amount of configuration can happen in config.js some other configuration has to be done manually in db/database.js to set up the databases how you would want them.
while not all the settings are there, it might be enough for most people and if its not knex.js is what i use to connect to a database. you can even just mySQL and it will apperently work without modifications to the code outside of the knex.js i wrote.

# Progress

Progress might slow done on some of the more "fun" ideas i have for this template. if for some reason it wasnt clear this is a template i use for meny projects ive so far made atleast 5 nodeJS projects using older versions of this template. once i get this to a decent level of working ill attempt to remake some of those projects in some forks. the reason why i bring this up is my current work flow is catered to my next project so some of the pushes might be overly biased to that project and will make some of the features i want to add harder to test such as pagination. or sorting on the database. with the current data im testing with theres no way i can use multipul search terms.