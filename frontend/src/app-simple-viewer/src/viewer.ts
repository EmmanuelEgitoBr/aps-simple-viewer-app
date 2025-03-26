async function getAccessToken(callback: (arg0: any, arg1: any) => void) {
    try {
        const resp = await fetch('/api/auth/token');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const { access_token, expires_in } = await resp.json();
        callback(access_token, expires_in);
    } catch (err) {
        alert('Could not obtain access token. See the console for more details.');
        console.error(err);
    }
}

declare const Autodesk: any;

export function initViewer(container: HTMLElement | null) {
    return new Promise(function (resolve, reject) {
        Autodesk.Viewing.Initializer({ env: 'AutodeskProduction', getAccessToken }, function () {
            const config = {
                extensions: ['Autodesk.DocumentBrowser']
            };
            const viewer = new Autodesk.Viewing.GuiViewer3D(container, config);
            viewer.start();
            viewer.setTheme('light-theme');
            resolve(viewer);
        });
    });
}

export function loadModel(viewer: { loadDocumentNode: (arg0: any, arg1: any) => unknown; setLightPreset: (arg0: number) => void; }, urn: string) {
    return new Promise(function (resolve, reject) {
        function onDocumentLoadSuccess(doc: { getRoot: () => { (): any; new(): any; getDefaultGeometry: { (): any; new(): any; }; }; }) {
            resolve(viewer.loadDocumentNode(doc, doc.getRoot().getDefaultGeometry()));
        }
        function onDocumentLoadFailure(code: any, message: any, errors: any) {
            reject({ code, message, errors });
        }
        viewer.setLightPreset(0);
        Autodesk.Viewing.Document.load('urn:' + urn, onDocumentLoadSuccess, onDocumentLoadFailure);
    });
}