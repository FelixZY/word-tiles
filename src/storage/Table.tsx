type TableData<T> = {
  version: number;
  name: string;
  data: T;
};
export abstract class DataStore<T> {
  constructor(
    protected readonly version: number,
    protected readonly name: string,
    protected readonly defaultData: T
  ) {}

  public mutate(callback: (data: T) => void) {
    const data = this.read();
    callback(data);
    this.write(data);
  }

  public write(data: T) {
    localStorage.setItem(this.name, JSON.stringify(this.toTableData(data)));
  }

  public read(): T {
    function loadInternal(self: DataStore<T>): T {
      const tableData = JSON.parse(
        localStorage.getItem(self.name) ??
          JSON.stringify(self.toTableData(self.defaultData))
      ) as TableData<T>;

      if (tableData.version !== self.version) {
        tableData.data = self.migrate(tableData.version, tableData.data);
      }
      return tableData.data;
    }

    try {
      return loadInternal(this);
    } catch (e) {
      console.error(`Failed to load table "${this.name}":\n`, e);
      localStorage.removeItem(this.name);
      return loadInternal(this);
    }
  }

  protected abstract migrate(fromVersion: number, data: any): T;

  private toTableData(data: T): TableData<T> {
    return {
      version: this.version,
      name: this.name,
      data,
    };
  }
}
