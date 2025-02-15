import { Rectangle2D } from "../classes/rectangle.class";

export interface Character {
  id: number;
  name: string;
  status: string;
  species: string;
  gender: string;
  origin: {
    name: string;
    url: string;
  };
  location: {
    name: string;
    url: string;
  };
  image: string;
}
export interface CharacterCanvas {
  characterId: number;
  canvas: Rectangle2D[]
}

export enum CanvaState {
  idle = "idle",
  drawing = "drawing",
  moving = "moving",
  rotating = "rotating",
  drag = "drag"
}

