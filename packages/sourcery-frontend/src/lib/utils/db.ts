export const getRecords = async (collection: string) => {
    const response = await fetch(`http://localhost:9100/collections/${collection}/records`);
    const records = (await response.json());
    return records;
}