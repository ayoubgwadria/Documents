import { Group } from "./Group";
import { User } from "./User";

export interface Course {
  id?: number;
  name: string;
  code: string;
  teacher?: User;
  group?: Group;
}