import { Course } from "./Course";
import { Group } from "./Group";


export interface ExamPlanning {
  id?: number;
  examDate: string;   
  startTime: string; 
  endTime: string;    
  room?: string;
  course?: Course;
  group?: Group;
}
