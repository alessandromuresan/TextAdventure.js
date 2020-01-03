import { CartridgeBuilder } from "../../builders/cartridge.builder";
import { LocationNames } from "./locations/location-names";

import createVillageSchool from './locations/village/school';
import createVillageSquare from './locations/village/square';

export = (cartridgeBuilder: CartridgeBuilder, introText: string) => {

    cartridgeBuilder
    .introText(introText)
    .configureMap(map => {

        map.configureLocation(LocationNames.villageSchool, createVillageSchool);
        map.configureLocation(LocationNames.villageSquare, createVillageSquare);
    })
    .configurePlayer(player => {

        player.startingLocation(LocationNames.villageSchool);
    });

    return cartridgeBuilder.build();
}
