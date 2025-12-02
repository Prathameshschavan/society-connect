import type { IProfile } from "./user.types";

export interface IUnit {
  id?: string;
  unit_number: string;
  square_footage: number;
  unit_type: string;
  organization_id: string;
  profile_id?: string | null;
  profile?: IProfile;
}
