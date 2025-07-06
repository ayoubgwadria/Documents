import { Group } from "./Group";
import { User } from "./User";


export interface ClassSession {
  id?: number;
  subjectName: string;
  date: string;          
  startTime: string;     
  endTime: string;        
  room: string;
  integratedClassroom: boolean;
  teacher?: User;
  group?: Group;
}
