import TlisImage from "@/components/TlisImage";

const PaginationImage = ({ src, alt }: { src: string, alt: string }) => {
   return (
      <div className="w-48" >
         <TlisImage src={src} alt={alt}/>
      </div>
   )
};

export default PaginationImage