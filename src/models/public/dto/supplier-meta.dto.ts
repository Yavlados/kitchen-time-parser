export class SupplierMeta {
  url: string = "";
  brands: Map<string, number> = new Map<string, number>();

  constructor(url: string, brands: Map<string, number>) {
    this.url = url;
    this.brands = new Map(brands)
  }
}

export class SupplierMetaLocal extends SupplierMeta {
  key: string = "";

  constructor(key: string, url: string, brands: Map<string, number> ) {
    super(url, brands);
    this.key = key;
  }

  clear() {
    this.brands = new Map<string, number>();
    this.url = "";
    this.key = "";
  }
}
