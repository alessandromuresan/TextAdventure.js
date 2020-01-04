const io = require('console-read-write');
const chalk = require('chalk');

import createConsole, { IConsoleInputResponse } from '../core/console/console';

import { FileSystemCartridgeRepository } from '../core/repositories/file-system.cartridge.repository';
import { CartridgeBuilder } from '../builders/cartridge.builder';
import { ICartridge } from '../core/shims/textadventurejs.shim';

import path from 'path';
import fs from 'fs';

// import all available cartridges
import necroCartridgeFactory from '../cartridges/necro/cartridge';

const debugEnabled = process.env.NECRO_DEBUG ? (process.env.NECRO_DEBUG.toLowerCase() === 'true') : false;
const devmodeEnabled = process.env.NECRO_DEVMODE ? (process.env.NECRO_DEVMODE.toLowerCase() === 'true') : false;
const saveFilePath = process.env.NECRO_SAVEFILE || path.join(__dirname, 'savefile.json');
const cartridgeName = process.env.NECRO_CARTRIDGE || 'necro';
const musicEnabled = process.env.NECRO_MUSICENABLED ? (process.env.NECRO_MUSICENABLED.toLowerCase() === 'true') : false;
const musicVolume = process.env.NECRO_MUSICVOLUME || '50';
const assetsDirectory = process.env.NECRO_ASSETSDIRECTORY || path.resolve(path.join(__dirname, '..', 'cartridges', 'necro', 'assets'));

const cartridgeFactories: { [cartridgeName: string]: (cartridgeBuilder: CartridgeBuilder, introText: string) => ICartridge } = {
  necro: necroCartridgeFactory
};

async function main() {

  if (!cartridgeFactories[cartridgeName]) {
    throw new Error(`Cartridge '${cartridgeName}' was not found`);
  }

  await playSoundFileAsync(path.join(assetsDirectory, 'audio', 'ashes.mp3'), true);

  const repository = new FileSystemCartridgeRepository(saveFilePath);

  const savedCartridge = await repository.loadCartridgeAsync();
  const cartridgeBuilder = new CartridgeBuilder(savedCartridge);

  const cartridgeFactory = cartridgeFactories[cartridgeName];

  const introText = fs.readFileSync(getTextAssetPath('introtext.txt'), 'utf8').toString();
  const cartridge = cartridgeFactory(cartridgeBuilder, introText);

  const cons = createConsole(cartridge, {
    onDebugLog: logDebug
  });

  logDev(`Process pid: ${process.pid}`);
  logDev('Started CLI server');
  logDev(`Using cartridge '${cartridgeName}'`);
  logDev(`Cartridge data will be saved to ${saveFilePath}`);

  logGameMessage(cons.getIntroText());

  while (true) {

    const command: string = await io.read();

    if (command === 'exit') {
      io.write('Game ended. Use ctrl + c to exit');
      break;
    }

    let response: IConsoleInputResponse;

    if (devmodeEnabled) {

      const commandComponents = command.split(' ');

      if (commandComponents[0] === 'dev') {

        const componentsAfterDev = commandComponents.slice(1).join(' ');
        const individualCommands = componentsAfterDev.split(';');
  
        for(let i = 0; i < individualCommands.length; i++) {
  
          const individualCommand = individualCommands[i];

          if (!individualCommand) {
            continue;
          }
  
          logDev(individualCommand);
  
          response = cons.input(individualCommand.trim());
          await handleConsoleResponseAsync(response);
        }
  
      } else {
        response = cons.input(command);
        await handleConsoleResponseAsync(response);
      }

    } else {

      response = cons.input(command);
      await handleConsoleResponseAsync(response);
    }

    await repository.saveCartridgeAsync(response.cartridge);
  }
}

function logDev(message: string) {

  if (devmodeEnabled) {
    console.log(chalk.cyanBright(`[DEV]> ${message}`));
  }
}

function logDebug(message: string) {

  if (debugEnabled) {
    console.log(chalk.cyanBright(`    [DEBUG]> ${message}`));
  }
}

function logGameMessage(message: string) {
  console.log(chalk.cyan(message));
}

async function handleConsoleResponseAsync(response: IConsoleInputResponse) {

  logGameMessage(response.actionResult.message);

  if (response.actionResult.audioAssetToPlay) {
    await playSoundFileAsync(getAudioAssetPath(response.actionResult.audioAssetToPlay));
  }
}

async function playSoundFileAsync(soundFile: string, loop?: boolean): Promise<void> {

  if (musicEnabled) {

    /*
    return new Promise((resolve, reject) => {
      const worker = new Worker(path.join(__dirname, './audio.worker.js'), {
        workerData: {
          loop: loop,
          soundFile: soundFile,
          volume: musicVolume
        }
    });

      worker.on('message', resolve);
      worker.on('error', reject);
      worker.on('exit', (code: number) => {
        if (code !== 0)
          reject(new Error(`Worker stopped with exit code ${code}`));
      });
    });
    */

    /*
    player.play(soundFile, { mplayer: ['-volume', musicVolume] }, (err: any) => {

      logDev(`Encountered an error while playing sound file: ${soundFile}`);
      logDev(`Error: ${err}`);
    });
    */

    /*
    return new Promise((resolve, reject) => {
      player.play(soundFile, { mplayer: ['-volume', musicVolume] }, (err: any) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
    */
  }

  return Promise.resolve();
}

function getAudioAssetPath(assetName: string): string {
  return path.join(assetsDirectory, 'audio', assetName);
}

function getTextAssetPath(assetName: string): string {
  return path.join(assetsDirectory, 'text', assetName);
}

main();
