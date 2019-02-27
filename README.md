# APIdaze WebRTC JavaScript API

You need to create an application on APIdaze at VoIP Innovations: https://voipinnovations.com/programmable. The `API key` that matches with your application 
will be used in the various examples.

# Installation

You may install this library either as an NPM module or by downloading the JavaScript file.

## As an NPM module

    npm install apidaze-js

Then in your .js script

    const APIdaze = require('apidaze-js')

## JavaScript API

Just add a `<script/>` tag to your HTML page like so :

    <script src="https://api4.apidaze.io/javascript/releases/APIdaze-3.0.0-dev-master.js" />

# Usage

Instantiate a client in your JavaScript code :

    const client = new APIdaze.CLIENT({apiKey: "YOUR_API_KEY", wsurl: "fs-us-ny-1.apidaze.io:8082"})

This will connect you to the server named `fs-us-ny-1.apidaze.io`, and check your `apiKey` there. Once `client` has been properly instanciated, you'll be allowed to make calls, conferencing and send text messages and SMS according to the instructions available in your `External Script`.
   

# Run the examples locally

Just clone the repository, install and start to test various examples locally

    git clone https://github.com/apidaze/apidaze-js.git
    cd apidaze-js
    npm install
    npm start

Open your browser at `http://localhost:9000/`

# Add to your JavaScript application

API can be downloaded at https://api4.apidaze.io/javascript/releases/APIdaze-3.0.0-dev-master.js
