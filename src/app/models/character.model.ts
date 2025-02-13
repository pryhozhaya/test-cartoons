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
  canvas: Canvas;
}

export interface Canvas{
  polygons: Shape[]
}

export interface Shape {
  x: number;
  y: number;
  w: number;
  h: number;
}

