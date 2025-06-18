import { AudioAlignerDTO, AudioToVisemeResponse } from "../../config/types";

export const Phone2Viseme: Record<string, string> = {
  'a': 'A',
  'i': 'A',

  'e': 'B',
  'ẽ': 'B',
  'ɛ': 'B',
  't': 'B',
  'd': 'B',
  's': 'B',
  'z': 'B',
  'n': 'B',
  'k': 'B',
  'g': 'B',
  'ɡ': 'B',
  'c': 'B',
  'ɟ': 'B',
  'ɲ': 'B',
  'ʃ': 'B',
  'ʒ': 'B',
  'tʃ': 'B',
  'dʒ': 'B',
  'j': 'B',
  'j̃': 'B',
  'ɾ': 'B',
  'h': 'B',
  'x': 'B',

  'l': 'C',
  'θ': 'C',
  'ð': 'C',

  'u': 'D',
  'ũ': 'D',

  'o': 'E',
  'õ': 'E',
  'ɔ': 'E',
  'r': 'E',
  'w': 'E',
  'w̃': 'E',

  'm': 'X',
  'p': 'X',
  'b': 'X',
  'silence': 'X',

  'f': 'F',
  'v': 'F'
}


export interface VisemeAlignerClient {
    alignViseme(input: AudioAlignerDTO): Promise<AudioToVisemeResponse>;
}