import Members from "@/components/MembersGrid";

export default function Clenovia() {
    return <>
        <h1 className="text-4xl text-white font-semibold mb-8 text-left ml-8"><span className="text-[#d43c4a] italic text-[1.4em] mr-2">TLIS</span> členovia</h1>
        <Members header={false} />

    </>
}