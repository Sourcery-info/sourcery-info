/** @type {import('./$types').PageServerLoad} */
// import { File as SourceryFile } from "@sourcery/common/src/file";
import { getManifest } from "@sourcery/common/src/manifest";
export async function load({ params }) {
    const project = params.project;
    const file_uid = params.file;
    const manifest = getManifest(project);
    const file = manifest.find(f => f.uid === file_uid);
    return {
        props: {
            project,
            manifest,
            file,
        }
    };
};