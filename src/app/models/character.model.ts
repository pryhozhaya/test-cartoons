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
  polygons: Polygon[]
}

export interface Polygon{
  points: { x: number; y: number }[];
  fillColor: string;
}

