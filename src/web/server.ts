import express from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import { ICartridge } from '../core/shims/textadventurejs.shim';
import { CartridgeBuilder } from '../builders/cartridge.builder';

const port = parseInt((process.env.NECRO_PORT || '3000'), 10);
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

const cartridgeFactory = cartridgeFactories[cartridgeName];

const introText = fs.readFileSync(path.join(__dirname, 'static', 'assets', 'text', 'introtext.txt'), 'utf8').toString();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'static')));

app.use(session({secret: sessionSecret, resave: false, saveUninitialized: true}));

const cartridgeBuilder = new CartridgeBuilder();
const cartridge = cartridgeFactory(cartridgeBuilder, introText);

const consoleOptions: IConsoleOptions = {};

if (debugEnabled) {
    consoleOptions.onDebugLog = (message: string) => {
        console.log(`    [DEBUG] ${message}`);
    };
}

const con = createConsole(cartridge, consoleOptions);

app.post('/console/input', (req, res) => {

    const sessionId = req.sessionID;

    console.log(`Session id: ${sessionId}`);

    const response = con.input(req.body.input);

    res.json(response);
});

app.post('/console/getIntro', (req, res) => {

    const sessionId = req.sessionID;

    console.log(`Session id: ${sessionId}`);

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
