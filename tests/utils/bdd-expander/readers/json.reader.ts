import fs from 'fs';
import { DataReader } from '../data-reader.factory';

/*
* JsonReader implementation to read JSON files and convert them into an array of objects.
* Each object represents a row in the JSON array. The JSON file must contain an array of objects at the root level.
*/
export class JsonReader implements DataReader {

  constructor(private filePath: string) {}

  async read(): Promise<Array<Record<string, string>>> {
    const data = JSON.parse(fs.readFileSync(this.filePath, 'utf8'));

    if (!Array.isArray(data)) {
      throw new Error('JSON data must be an array of objects');
    }

    return data;
  }
}