# [APIdaze](https://voipinnovations.com/programmable) Javascript API

This library provides video conferences, automated voice responses, selecting dialtone option and [more](https://voipinnovations.com/programmable).\
User will not be able to select phone number. Instead he will call an "External Script" which is a XML definition of what will happen during the call. External Scripts are stored on APIdaze server.

For use cases where user can type phone number consider [REST API](https://vi-api.trybelabs.com/?version=latest).

# Installation

Either execute in your project directory\
`npm install apidaze-js`\
and add to your code\
`const APIdaze = require('apidaze-js')`

or add a html tag\
`<script src="https://api4.apidaze.io/javascript/releases/APIdaze-3.0.0-dev-master.js" />`

# Usage

Make sure you can access [this page](https://backoffice.voipinnovations.com/ProgrammableTelco/ExternalScripts.aspx) that is used to define External Scripts.\
If you don't have account, you can create one [here](https://backoffice.voipinnovations.com/SignUp/Packages.aspx).\
To initialize a client, follow [these instructions](https://vi-api.trybelabs.com/?version=latest#6bf958bf-5ab5-6db9-7dd5-21f415ae413d).\
And to read more about possibilites of External Scripts, go [here](https://vi-api.trybelabs.com/?version=latest#21716538-c967-9c7b-bb24-60ca07bc004a).

# How to run examples

1. Visit https://backoffice.voipinnovations.com/ProgrammableTelco/ExternalScripts.aspx
2. Click create new script button
3. Enter name of your choice and this content of External Script
```xml
<document>
  <work>
    <answer />
    <wait>1</wait>
    <speak>Welcome, you are joining the conference.</speak>
    <conference>test</conference>
    <hangup />
  </work>
</document>
```
![](docs/images/run-examples-01.png)
4. Click create script, wait for cofirmation, close the editor\
5. Find script by the name and copy the visible apiKey (c7fee939 on screenshot)
![](docs/images/run-examples-02.png)
6. Clone repository `git clone https://github.com/apidaze/apidaze-js.git`\
7. Install npm dependencies `cd apidaze-js` and `npm install`\
8. Start a webserver `npm run start`\
9. Open https://localhost:9000 \
10. Warning about missing certificate will be displayed, click "advanced" and "proceed to localhost (unsafe)"\
11. Select "API key check" from list of examples\
12. Type apiKey from step 4. and click "check" button

If all went good, result should look like this

![](docs/images/run-examples-03.png)

# How to contribute

1. Fork this repository
2. Make a copy of file `cypress/config.template.js` named `cypress/config.js` and inside its content write apiKey from step 4. of [How to run examples](#how-to-run-examples)
3. Work on your change
4. When ready, please verify that code is matching linter and tests are passing by running `npm run start` and in separate console: `npm run test:all`
5. If integration tests are failing use `npm run cypress` to find a reason
6. When all tests are passing create a pull request
