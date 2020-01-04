import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import { ConsoleHttpServer } from '../core/server/http-server';
import { ICartridge } from '../core/shims/textadventurejs.shim';
import { CartridgeBuilder } from '../builders/cartridge.builder';

const port = parseInt((process.env.PORT || '3000'), 10);
const debugEnabled = process.env.NECRO_DEBUG ? (process.env.NECRO_DEBUG.toLowerCase() === 'true') : false;
const devmodeEnabled = process.env.NECRO_DEVMODE ? (process.env.NECRO_DEVMODE.toLowerCase() === 'true') : false;
const saveFilePath = process.env.NECRO_SAVEFILE || path.join(__dirname, 'savefile.json');
const cartridgeName = process.env.NECRO_CARTRIDGE || 'necro';
const sessionSecret = process.env.NECRO_SESSION_SECRET || '1234567890QWERTY';

// import all available cartridges
import necroCartridgeFactory from '../cartridges/necro/cartridge';
import createConsole, { IConsoleOptions, IConsoleInputResponse } from '../core/console/console';

const cartridgeFactories: { [cartridgeName: string]: (cartridgeBuilder: CartridgeBuilder, introText: string) => ICartridge } = {
    necro: necroCartridgeFactory
};
  
const cartridgeDirectories: { [cartridgeName: string]: string } = {
    necro: path.resolve(path.join(__dirname, '..', 'cartridges', 'necro'))
};

const cartridgeFactory = cartridgeFactories[cartridgeName];
const cartridgeDirectory = cartridgeDirectories[cartridgeName];

const introText = fs.readFileSync(path.join(cartridgeDirectory, 'assets', 'text', 'introtext.txt'), 'utf8').toString();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'static')));

app.use(session({secret: sessionSecret, resave: false, saveUninitialized: true}));

app.post('/console/input', (req, res) => {

    const sessionId = req.sessionID;

    console.log(`Session id: ${sessionId}`);

    const cartridgeBuilder = new CartridgeBuilder();
    const cartridge = cartridgeFactory(cartridgeBuilder, introText);

    const consoleOptions: IConsoleOptions = {};

    if (debugEnabled) {
        consoleOptions.onDebugLog = (message: string) => {
            console.log(`    [DEBUG] ${message}`);
        };
    }

    const con = createConsole(cartridge, consoleOptions);

    res.json(con.input(req.body.input));
});

app.post('/console/getIntro', (req, res) => {

    const sessionId = req.sessionID;

    console.log(`Session id: ${sessionId}`);

    const cartridgeBuilder = new CartridgeBuilder();
    const cartridge = cartridgeFactory(cartridgeBuilder, introText);

    const consoleOptions: IConsoleOptions = {};

    if (debugEnabled) {
        consoleOptions.onDebugLog = (message: string) => {
            console.log(`    [DEBUG] ${message}`);
        };
    }

    const con = createConsole(cartridge, consoleOptions);

    const response: IConsoleInputResponse = {
        actionResult: {
            message: con.getIntroText(),
            success: true
        },
        cartridge: cartridge
    };

    res.json(response);
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
