// Shape of a product specification table (the tables themselves are stored in the database).

export type SpecGroup = { label?: string; rows: (string | number)[][] };
export type SpecTableData = {
  title: string;
  columns: string[];
  groups: SpecGroup[];
  note?: string;
};
