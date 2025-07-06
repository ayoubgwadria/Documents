import { ClassSession } from "./ClassSession";
import { Course } from "./Course";
import { User } from "./User";

export interface Absence {
  id?: number;
  date: string;      
  reason?: string;
  student?: User;
  course?: Course;
  session?: ClassSession;
}