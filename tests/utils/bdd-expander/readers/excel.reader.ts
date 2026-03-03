import { ExcelOperations } from "../../excel-operations.utils";
import { DataReader } from '../data-reader.factory';

/*
* ExcelReader implementation to read Excel files and convert them into an array of objects.
* Each object represents a row in the Excel sheet, with keys derived from the header row.
* It uses the ExcelOperations utility to read the specified sheet and return the data in the desired format.
*/
export class ExcelReader implements DataReader {

  constructor(
    private filePath: string,
    private sheetName: string
  ) {}

  async read(): Promise<Array<Record<string, string>>> {
    return ExcelOperations.read(this.filePath, this.sheetName);
  }
}