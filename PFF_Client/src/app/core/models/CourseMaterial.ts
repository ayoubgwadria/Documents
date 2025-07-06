import { Course } from "./Course";
import { User } from "./User";

export interface CourseMaterial {
  id?: number;
  title: string;
  fileUrl: string;
  uploadedAt: string; 
  course?: Course;
  uploadedBy?: User;
}