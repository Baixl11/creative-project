import { defaultPetId } from "../types";
import { lineAlpacaDefinition } from "./lineAlpaca";
import { lineCatDefinition } from "./lineCat";
import { lineCowDefinition } from "./lineCow";
import { lineDogDefinition } from "./lineDog";
import { lineRabbitDefinition } from "./lineRabbit";
import { PetDefinition } from "./types";

export const petDefinitions = [
  lineDogDefinition,
  lineCatDefinition,
  lineRabbitDefinition,
  lineAlpacaDefinition,
  lineCowDefinition
] as const satisfies readonly PetDefinition[];

export const petDefinitionById = new Map<string, PetDefinition>(
  petDefinitions.map((definition) => [definition.id, definition])
);

export function getPetDefinition(petId: string): PetDefinition {
  return petDefinitionById.get(petId) ?? petDefinitionById.get(defaultPetId) ?? petDefinitions[0];
}
