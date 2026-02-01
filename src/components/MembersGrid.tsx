import React from "react";
import CmsApiService from "@/services/cms-api-service";
import Image from "next/image";
import MemberGridItem from "./MemberItem";
import { CastDto } from "@/types/show";

export interface Member {
  id: string;
  Name: string;
  Picture: string;
  Role: string;
  BestOfTheMonth: boolean;
  Cast: CastDto; 
}

var roles = {
  boss: "Vedúci a zástupcovia",
  moderator: "Moderátori",
  technic: "Technici",
  pr: "PR-isti",
  web: "Webový tím",
  dj: "DJi",
  playwright: "Dramaturgovia",
};

interface MembersProps {
  header?: boolean;
}

const Members: React.FC<MembersProps> = async ({ header = true }) => {
  var loadingError = false;
  const members = await CmsApiService.Member.listMembers().catch((error) => {
    console.error("Error fetching members:", error);
    loadingError = true;
    return [];
  });

  // Group members by role
  const membersByRole: { [key: string]: Member[] } = {};

  members.forEach((member: any) => {
    if (!membersByRole[member.Role]) {
      membersByRole[member.Role] = [];
    }
    membersByRole[member.Role].push(member);
  });

  return (
    <div className="space-y-12 mb-12 px-4 md:px-8 overflow-hidden">
      {header && (
        <h2 className="text-4xl text-white font-semibold pb-0 text-left">
          Členovia
        </h2>
      )}

      {loadingError && (
        <div className="relative py-8" style={{ marginTop: "0 !important" }}>
          <h3 className="font-argentumSansMedium text-xl mb-3 text-white">
            Chyba pri načítaní členov
          </h3>
          <p className="text-gray-200 mb-4">Skúste to prosím neskôr.</p>
        </div>
      )}

      {Object.entries(roles).map(([roleKey, roleTitle]) => {
        const roleMembers = membersByRole[roleKey] || [];

        if (roleMembers.length === 0) return null;

        return (
          <div key={roleKey} className="space-y-6">
            <h2 className="font-argentumSansLight text-2xl text-left text-white font-semibold">
              {roleTitle}
            </h2>

            <div className="font-argentumSansLight grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
              {roleMembers.map((member) => (
                <MemberGridItem member={member} key={member.id} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Members;
