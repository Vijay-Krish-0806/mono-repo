import { Server, Member, Channel, User } from "./apps/discord/db/schema";



export type ServerWithMembersWithProfiles = Server & {
  members: (Member & {
    user: User;
  })[];
  channels: Channel[];
};

