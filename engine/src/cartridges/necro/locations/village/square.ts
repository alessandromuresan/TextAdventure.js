import { LocationBuilder } from "../../../../builders/location.builder";
import { LocationNames } from "../location-names";

export = (location: LocationBuilder) => {

    location
        .displayName("Square")
        .description("The village's square")
        .onSetup(context => {
            // context.setGameOver("Eh, nothing to do from here... Type 'exit' to end game");
        })
        .configureExits(exits => {

            exits.add('school')
                .destination(LocationNames.villageSchool)
                .displayName('School');
        });
}
