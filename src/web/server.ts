import express from 'express';
import path from 'path';
import fs from 'fs';
import { ConsoleHttpServer } from '../core/server/http-server';
import { ICartridge } from '../core/shims/textadventurejs.shim';
import { CartridgeBuilder } from '../builders/cartridge.builder';

const port = parseInt((process.env.PORT || '3000'), 10);
const ipAddress = process.env.IP_ADDRESS || '127.0.0.1';
const debugEnabled = process.env.NECRO_DEBUG ? (process.env.NECRO_DEBUG.toLowerCase() === 'true') : false;
const devmodeEnabled = process.env.NECRO_DEVMODE ? (process.env.NECRO_DEVMODE.toLowerCase() === 'true') : false;
const saveFilePath = process.env.NECRO_SAVEFILE || path.join(__dirname, 'savefile.json');
const cartridgeName = process.env.NECRO_CARTRIDGE || 'necro';

// import all available cartridges
import necroCartridgeFactory from '../cartridges/necro/cartridge';

const cartridgeFactories: { [cartridgeName: string]: (cartridgeBuilder: CartridgeBuilder, introText: string) => ICartridge } = {
    necro: necroCartridgeFactory
};
  
const cartridgeDirectories: { [cartridgeName: string]: string } = {
    necro: path.resolve(path.join(__dirname, '..', 'cartridges', 'necro'))
};

const cartridgeFactory = cartridgeFactories[cartridgeName];
const cartridgeDirectory = cartridgeDirectories[cartridgeName];

const introText = fs.readFileSync(path.join(cartridgeDirectory, 'assets', 'text', 'introtext.txt'), 'utf8').toString();
const cartridgeBuilder = new CartridgeBuilder();
const cartridge = cartridgeFactory(cartridgeBuilder, introText);

const server = new ConsoleHttpServer(cartridge, {
    ipAddress: ipAddress,
    port: port
});

server
    .use(express.static(path.join(__dirname, 'static')))
    .listen();
