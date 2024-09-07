const PaginationImage = async ({ src, alt }: { src: Promise<string>, alt: string }) => {
   const resolvedSrc = await src; // Await the promise to get the actual URL
   return (
   <img src={resolvedSrc} alt={alt} className="w-48" />
   )
};

export default PaginationImage