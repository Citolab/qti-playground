import { ItemInfoWithContent } from "../app/store/store";

export interface ItemInfoExt extends ItemInfoWithContent {
  answered?: boolean;
  score?: number;
  thumbnail?: string;
}

// export interface PackageInfo {
//   id: string;
//   name: string;
//   itemCount: number;
//   qtiVersion: number;
//   errorMessage: string;
//   items: ItemInfo[];
//   packageZip: string;
// }

// export interface ItemInfo {
//   id: string;
//   itemRefId: string;
//   identifier: string;
//   title: string;
//   location: string;
//   thumbnail: string;
// }

// export interface Item extends ItemInfo {
//   packageId: string;
//   packageZip: string;
//   xml: string;
//   created: number;
// }
