import React from "react";
import CmsApiService from "@/services/cms-api-service";
import Image from "next/image";

interface Member {
    id: string;
    Name: string;
    Picture: string;
    Role: string;
}

var roles = {
    moderator: "Moderátori",
    technic: "Technici",
    pr: "PRisti",
    web: "Webový tím",
    dj: "DJi",
    playwright: "Dramaturgovia",
}

interface MembersProps {
    header?: boolean;
}

const Members: React.FC<MembersProps> = async ({ header = true }) => {
    const members = await CmsApiService.Member.listMembers();

    // Group members by role
    const membersByRole: { [key: string]: Member[] } = {};

    members.forEach((member: any) => {
        if (!membersByRole[member.Role]) {
            membersByRole[member.Role] = [];
        }
        membersByRole[member.Role].push(member);
    });

    return (
        <div className="space-y-12 mb-12 px-4 md:px-8">
            {header && <h2 className="text-5xl italic text-white font-semibold pb-0 text-left">Členovia</h2>}

            {Object.entries(roles).map(([roleKey, roleTitle]) => {
                const roleMembers = membersByRole[roleKey] || [];

                if (roleMembers.length === 0) return null;

                return (
                    <div key={roleKey} className="space-y-6">
                        <h2 className="text-2xl text-left text-white font-semibold">{roleTitle}</h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            {roleMembers.map((member) => (
                                <div key={member.id} className="group text-center">
                                    <div className="aspect-square relative rounded-full overflow-hidden shadow-lg mb-2 mx-auto w-3/4">
                                        <img
                                            src={"https://directus.tlis.sk/assets/" + member.Picture}
                                            alt={member.Name}
                                            className="object-cover group-hover:scale-105 transition-transform h-full w-full"
                                        />
                                    </div>
                                    <h3 className="text-white font-medium">{member.Name}</h3>
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default Members;