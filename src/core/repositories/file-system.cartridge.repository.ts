import { ICartridgeRepository } from './cartridge.repository';
import { ICartridge } from '../shims/textadventurejs.shim';
import * as fse from 'fs-extra';
import path = require('path');

export class FileSystemCartridgeRepository implements ICartridgeRepository {

    private _saveFilePath: string;

    constructor(saveFilePath: string) {
        this._saveFilePath = saveFilePath;
    }

    public async saveCartridgeAsync(cartridge: ICartridge): Promise<void> {

        const saveFileDirname = path.dirname(this._saveFilePath);

        await fse.ensureDir(saveFileDirname);

        // do not save map, as it can contain dynamically-added functionality (which needs to be rebuilt everytime)
        const cartridgeToSave: ICartridge = {
            gameData: {
                commandCounter: cartridge.gameData.commandCounter,
                gameOver: cartridge.gameData.gameOver,
                gameID: cartridge.gameData.gameID,
                introText: cartridge.gameData.introText,
                outroText: cartridge.gameData.outroText,
                player: cartridge.gameData.player,
                map: cartridge.gameData.map
            },
            gameActions: undefined
        };

        await fse.writeJson(this._saveFilePath, cartridgeToSave, {
            encoding: 'utf8'
        });
    }

    public async loadCartridgeAsync(): Promise<ICartridge> {

        const saveFileExits = await this.saveFileExistsAsync();

        if (!saveFileExits) {
            return undefined;
        }

        return await fse.readJson(this._saveFilePath, {
            encoding: 'utf8'
        });
    }

    private async saveFileExistsAsync(): Promise<boolean> {

        return await fse.pathExists(this._saveFilePath);           
    }
}
