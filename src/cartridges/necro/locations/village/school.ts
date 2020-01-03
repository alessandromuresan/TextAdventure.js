import { LocationBuilder } from "../../../../builders/location.builder";
import { DefaultConsoleActons } from "../../../../core/shims/textadventurejs.shim";
import { LocationNames } from "../location-names";

export = (location: LocationBuilder) => {

    location
        .description("You're in the village's school. There's a window, a door, and a cabinet.")
        .displayName("School")
        .configureInteractables(interactables => {

            interactables.add("door")
                .on(DefaultConsoleActons.look, () => {
                    return "the door leads outside.";
                })
                .on("open", context => {

                    if (context.getPlayerProperty('isVillageSchoolDoorOpened')) {

                        context.spawnExitInLocation(LocationNames.villageSchool, 'outside', exit => {
                            exit
                                .displayName('Outside')
                                .destination(LocationNames.villageSquare);
                        });

                        return "The door opens. You can go outside.";
                    } else {
                        return { message: "The door is locked.", success: true, audioAssetToPlay: 'doorLocked' };
                    }
                })

            interactables.add("window")
                .on(DefaultConsoleActons.look, () => {
                    return "The window is baricaded.";
                });

            interactables.add("cabinet")
                .on(DefaultConsoleActons.look, context => {

                    context.spawnInteractableInLocation(LocationNames.villageSchool, 'drawer', interactable => {

                        interactable
                            .on('open', context => {

                                context.spawnItemInLocation(LocationNames.villageSchool, 'key', item => {

                                    item
                                        .onUse((context, object) => {
                                            
                                            if (object === 'door') {
                                                context.setPlayerProperty('isVillageSchoolDoorOpened', true);
                                                return "The door is unlocked."
                                            }

                                            return "Key must be used on something.";
                                        });
                                });
                                    
                                return "There's a key inside.";
                            });
                    })

                    return "An old cabinet with a single drawer.";
                });
        })
        .configureItems(items => {
            
        })
        .configureExits(exits => {
            
        });
};
