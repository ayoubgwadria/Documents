import { Course } from "./Course";
import { User } from "./User";


export interface Task {
  id?: number;
  title: string;
  description: string;
  dueDate: string;  

  course?: Course;
  createdBy?: User;
}
