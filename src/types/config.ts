export default interface Config {
    audition: boolean;
    links: Array<{
        text: string;
        link: string;
        external: boolean;
    }>;
}