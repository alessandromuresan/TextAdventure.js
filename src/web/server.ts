import express, { NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import path from 'path';
import fs from 'fs';
import { ICartridge } from '../core/shims/textadventurejs.shim';
import { CartridgeBuilder } from '../builders/cartridge.builder';

const port = parseInt((process.env.NECRO_PORT || '3000'), 10);
const debugEnabled = process.env.NECRO_DEBUG ? (process.env.NECRO_DEBUG.toLowerCase() === 'true') : false;
const devmodeEnabled = process.env.NECRO_DEVMODE ? (process.env.NECRO_DEVMODE.toLowerCase() === 'true') : false;
const savesDirectory = process.env.NECRO_SAVESDIRECTORY || path.resolve(path.join(__dirname, '..', '..', 'saves'));
const cartridgeName = process.env.NECRO_CARTRIDGE || 'necro';
const sessionSecret = process.env.NECRO_SESSION_SECRET || '1234567890QWERTY';

// import all available cartridges
import necroCartridgeFactory from '../cartridges/necro/cartridge';
import createConsole, { IConsoleOptions, IConsoleInputResponse, IConsole } from '../core/console/console';
import { FileSystemCartridgeRepository } from '../core/repositories/file-system.cartridge.repository';

const cartridgeFactories: { [cartridgeName: string]: (cartridgeBuilder: CartridgeBuilder, introText: string) => ICartridge } = {
    necro: necroCartridgeFactory
};

const cartridgeFactory = cartridgeFactories[cartridgeName];

const introText = fs.readFileSync(path.join(__dirname, 'static', 'assets', 'text', 'introtext.txt'), 'utf8').toString();

async function startServer() {

    const app = express();
    
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    
    app.use(express.static(path.join(__dirname, 'static')));
    
    app.use(session({secret: sessionSecret, resave: false, saveUninitialized: true}));
    
    app.post('/console/input', async (req: any, res: any) => {
    
        const sessionId = req.sessionID;
    
        console.log(`Session id: ${sessionId}`);
    
        const engine = await loadEngineAsync(sessionId);

        const response = engine.console.input(req.body.input);
    
        const saveFile = path.join(savesDirectory, `${sessionId}.savefile.json`);
        const cartridgeRepository = new FileSystemCartridgeRepository(saveFile);
    
        await cartridgeRepository.saveCartridgeAsync(response.cartridge);
    
        res.json(response);
    });
    
    app.post('/console/getIntro', async (req: any, res: any) => {
    
        const sessionId = req.sessionID;
    
        console.log(`Session id: ${sessionId}`);

        const engine = await loadEngineAsync(sessionId);
    
        const response: IConsoleInputResponse = {
            actionResult: {
                message: engine.console.getIntroText(),
                success: true
            },
            cartridge: engine.cartridge
        };
    
        res.json(response);
    });
    
    app.listen(port, () => {
        console.log(`Listening on port ${port}`);
    });
}

async function loadEngineAsync(sessionId: string): Promise<{ console: IConsole, cartridge: ICartridge }> {

    const saveFile = path.join(savesDirectory, `${sessionId}.savefile.json`);
    const cartridgeRepository = new FileSystemCartridgeRepository(saveFile);

    const savedCartridge = await cartridgeRepository.loadCartridgeAsync();

    const cartridgeBuilder = new CartridgeBuilder(savedCartridge);
    const cartridge = cartridgeFactory(cartridgeBuilder, introText);

    const consoleOptions: IConsoleOptions = {};

    if (debugEnabled) {
        consoleOptions.onDebugLog = (message: string) => {
            console.log(`    [DEBUG] ${message}`);
        };
    }

    const con = createConsole(cartridge, consoleOptions);

    return {
        console: con,
        cartridge: cartridge
    };
}

startServer();
