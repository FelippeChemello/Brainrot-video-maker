import { AudioAlignerDTO, AudioAlignerResponse } from "../../config/types";

export interface AudioAlignerClient {
    alignAudio(input: AudioAlignerDTO): Promise<AudioAlignerResponse>;
}