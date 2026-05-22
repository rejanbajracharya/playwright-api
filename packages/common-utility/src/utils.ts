class Utils {
    static getXmlTagValue = (xml: string, tagName: string): string | undefined => {
        const match = xml.match(new RegExp(`<${tagName}>([\\s\\S]*?)<\\/${tagName}>`));
        return match?.[1]?.trim();
    };
}

const applyTemplateValues = <T>(payload: T, values: Record<string, string>): T => {
    const asString = typeof payload === "string" ? payload : JSON.stringify(payload);

    const replaced = Object.entries(values).reduce((current, [key, value]) => {
        return current.replaceAll(`<<${key}>>`, value);
    }, asString);

    if (typeof payload === "string") {
        return replaced as T;
    }

    return JSON.parse(replaced) as T;
};

const defaultUtils = new Utils();

export { applyTemplateValues, defaultUtils, Utils };