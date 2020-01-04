export interface ICartridge {
    gameData: IGameData;
    gameActions: IGameActions;
}

export interface IGameData {
    gameID?: string;
    commandCounter: number;
	gameOver: boolean;
	introText: string;
	outroText: string;
	player: IPlayer;
	map : IMap;
}

export interface IPlayer {
    currentLocation: string;
    inventory: IItemCollection;
    properties: any;
    // [otherProps: string]: any;
}

export interface IMap {
    [locationName: string]: ILocation;
}

export interface ILocation {
    firstVisit: boolean;
    description: string;
    displayName?: string;
    items?: IItemCollection;
    interactables?: IInteractableCollction;
    exits?: IExitCollection;

    setup?: (...args: any[]) => void;
    teardown?: (...args: any[]) => void;
    updateLocation?: (command: ICommand) => string;
}

export interface IItemCollection { [itemName: string]: IItem };
export interface IInteractableCollction { [interactableName: string]: IInteractable; };
export interface IExitCollection { [exitName: string]: IExit; };

export interface IItem {
    description: string;
    displayName: string;
    hidden: boolean;
    quantity: number;
    use?: (object: string) => (string | IGameActionResult);
    onTaken?: () => void;
    interactions?: { [interactionName: string]: (string | IGameActionResult) | (() => (string | IGameActionResult)); };
}

export interface IInteractable {
    [interactionName: string]: (string | IGameActionResult) | (() => (string | IGameActionResult))
}

export interface IExit {
    displayName: string;
    destination: string;
}

export interface IGameActions {
    [actionName: string]: (gameData: IGameData, command: ICommand, consoleInterface: ConsoleInterfaceFn) => IGameActionResult;
}

export type ConsoleInterfaceFn = (gameData: IGameData, command: ICommand) => IGameActionResult;

export interface IGameActionResult {
    message: string;
    success: boolean;
    audioAssetToPlay?: string;
}

export interface ICommand {
    action: string;
    subject: string;
    object?: string;
}

export enum DefaultConsoleActons {
	die = 'die',
	drop = 'drop',
	go = 'go',
	inventory = 'inventory',
	load = 'load',
	look = 'look',
	take = 'take',
	use = 'use'
}
