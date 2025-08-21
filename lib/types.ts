// A user type used throughout the app to capture user session information from the session
export type User = {
  name: string;
  username:string;
  roles: string[];
  dbId: number;
};