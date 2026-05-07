class Utils {
    static getXmlTagValue = (xml: string, tagName: string): string | undefined => {
        const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`));
        return match?.[1]?.trim();
    };
}

const defaultUtils = new Utils();

export { defaultUtils, Utils };