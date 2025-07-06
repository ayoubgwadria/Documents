import { Course } from "./Course";
import { User } from "./User";


export interface Grade {
  id?: number;
  type: string;      
  value: number;
  outOf: number;
  date: string;      

  student?: User;
  course?: Course;
}
