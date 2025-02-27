export interface Profile {
  firstName: string;
  lastName: string;
  course: string;
  yearOfStudy: number;
  bio: string;
  gender: string;
  location: string;
  interests: string[];
  userId: string;
  id: string;
  createdAt: Date;
  updatedAt: Date;
  email: string;
  phoneNumber: string;
  dateOfBirth: Date;
  profilePhoto: string | null;
  
}
export interface ActionResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

