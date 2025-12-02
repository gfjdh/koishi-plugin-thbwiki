export interface Game {
  id: string;
  name: string;
  releaseDate: string;
  description: string;
}

export interface Character {
  id: string;
  name: string;
  alias: string[];
  introduction: string;
  lifestyle: string;
  abilities: string;
  appearance: string;
  relationships: string;
}

export interface SpellCard {
  id: string;
  owner: string;
  name: string;
  game: string;
  description: string;
}

export interface Music {
  id: string;
  name: string;
  game: string;
  description: string;
}
