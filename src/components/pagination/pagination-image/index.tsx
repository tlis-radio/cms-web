const PaginationImage = ({ src, alt }: { src: string, alt: string }) => {
   return (
   <img src={src} alt={alt} className="w-48" />
   )
};

export default PaginationImage