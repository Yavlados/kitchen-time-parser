import { resolve } from "path";
import { readdir } from "fs";
import { readFile, utils } from "xlsx";
import { SupplierMeta, SupplierMetaLocal } from "../dto/supplier-meta.dto";

class XMLFileRow {
  supplier: string = "";
  url: string = "";
  format: string = "";
  brand: string = "";
}

export class XMLListReader {
  dirPath = resolve(__dirname, "..", "..", "..", "files", "meta", "xml-list");
  xmlListFilePath: string;
  xmlListFileHeaders = Object.keys(new XMLFileRow());

  public supplierMeta = new Map<string, SupplierMeta>();

  prepareList() {
    return new Promise((res, rej) => {
      readdir(this.dirPath, (err, filesRaw: string[]) => {
        if (err) rej(err);
        const winFilter = "~$";
        const files = filesRaw.filter(
          (fileName) => !fileName.includes(winFilter)
        );
        this.xmlListFilePath = files[0] || "";
        if (!this.xmlListFilePath) rej("XML list file was not found");
        else {
          this.updateSupplierMeta();
          res("");
        }
      });
    });
  }

  updateSupplierMeta() {
    const wb = readFile(resolve(this.dirPath, this.xmlListFilePath), { sheetStubs: true });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const wsAsJson = utils.sheet_to_json(ws, {
      header: this.xmlListFileHeaders
    }) as XMLFileRow[];
    // remove header row
    wsAsJson.shift();
    const localRow = new SupplierMetaLocal("", "", new Map<string, number>());

    for (let i = 0; i <= wsAsJson.length; i++) {
      // for adding last row of excel
      if (i === wsAsJson.length) {
        this.setNewSupplierMeta(localRow);
        break;
      }

      const row = wsAsJson[i];
      if (row.supplier === 'EOF') { continue }

      if (row.supplier) {
        if (localRow.key) {
          this.setNewSupplierMeta(localRow);
          localRow.clear();
        }
        localRow.key = row.supplier;
      }

      if (row.url) localRow.url = row.url;
      localRow.brands.set(row.brand.toUpperCase(), 1);
    }

  }

  setNewSupplierMeta(localRow: SupplierMetaLocal) {
    this.supplierMeta.set(
      localRow.key.trim(),
      new SupplierMeta(localRow.url, localRow.brands)
    );
  }
}
