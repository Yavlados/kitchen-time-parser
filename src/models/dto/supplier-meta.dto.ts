export class SupplierMeta {
  url: string = "";
  brands: string[] = [];

  constructor(url: string, brands: string[]) {
    this.url = url;
    this.brands = brands;
  }
}

export class SupplierMetaLocal extends SupplierMeta {
  key: string = "";

  constructor(key: string, url: string, brands: string[]) {
    super(url, brands);
    this.key = key;
  }

  clear() {
    this.brands = [];
    this.url = "";
    this.key = "";
  }
}
