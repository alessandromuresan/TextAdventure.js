import { LocationBuilder } from "../../../../builders/location.builder";
import { DefaultConsoleActons } from "../../../../core/shims/textadventurejs.shim";
import { LocationNames } from "../location-names";

export = (location: LocationBuilder) => {

    location
        .description("You're in the village's school. There's a window, a door, and a cabinet.")
        .displayName("School")
        .configureInteractables(interactables => {

            interactables.add("door");
            interactables.add("window");
            interactables.add("cabinet");
        });

    location.onInteractableInteraction("look", "door", (context, subject) => {
        return "the door leads outside.";
    });

    location.onInteractableInteraction("look", "window", (context, subject) => {
        return "The window is baricaded.";
    });

    location.onInteractableInteraction("open", "drawer", (context, subject) => {
        return "The window is baricaded.";
    });


    location.onInteractableInteraction("look", "cabinet", (context, subject) => {

        // context.spawnInteractableInLocation("currentLocation", "drawer");

        return "it's a cabinet.";
    });
};
