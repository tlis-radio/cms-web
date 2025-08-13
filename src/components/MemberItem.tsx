"use client"
import { Member } from "./MembersGrid";

export default function MemberGridItem({ member } :{ member: Member }) {
    return (
        <div
            key={member.id}
            className="group text-center relative"
            onMouseEnter={() => {
                const crown = document.getElementById(`crown-${member.id}`);
                if (crown) crown.style.animation = "crownParty 0.8s forwards";
            }}
            onMouseLeave={() => {
                const crown = document.getElementById(`crown-${member.id}`);
                if (crown) crown.style.animation = "none";
            }}
        >
        <div className="aspect-square relative rounded-full overflow-hidden shadow-lg mb-2 mx-auto w-3/4 transition-transform duration-700 group-hover:rotate-[720deg] group-hover:scale-110">
            <img
                src={`${process.env.NEXT_PUBLIC_DIRECTUS_URL}/assets/` + member.Picture}
                alt={member.Name}
                className="object-cover group-hover:scale-105 transition-transform h-full w-full"
            />
        </div>
        {member.BestOfTheMonth && (
            <img
                src="/images/crown.webp"
                alt="Best of the Month"
                id={`crown-${member.id}`}
                className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/3 w-40 h-40 z-10 transition-all duration-500 ease-[cubic-bezier(0.68,-0.6,0.32,1.6)]"
                style={{
                    transform: "translate(-50%, -33%) rotate(-18deg)",
                    transformOrigin: "bottom center",
                }}
            />

        )}
        <h3 className="text-white font-medium">{member.Name}</h3>
        {member.BestOfTheMonth && (
            <span className="text-[#D43C4A] text-sm">Tlisák Mesiaca</span>)}
    </div>
    );
}