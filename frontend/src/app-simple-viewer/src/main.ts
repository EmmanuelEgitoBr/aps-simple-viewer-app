import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { initViewer, loadModel } from './viewer';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

  initViewer(document.getElementById('preview')).then(viewer => {
    const urn = window.location.hash?.substring(1);
    setupModelSelection(viewer, urn);
    setupModelUpload(viewer);
});

async function setupModelSelection(viewer: unknown, selectedUrn: string) {
    const dropdown = document.getElementById('models') as HTMLInputElement;
    dropdown!.innerHTML = '';
    try {
        const resp = await fetch('/api/models');
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const models = await resp.json();
        dropdown!.innerHTML = models.map((model: { urn: any; name: any; }) => `<option value=${model.urn} ${model.urn === selectedUrn ? 'selected' : ''}>${model.name}</option>`).join('\n');
        dropdown!.onchange = () => onModelSelected(viewer, dropdown!.value);
        if (dropdown!.value) {
            onModelSelected(viewer, dropdown!.value);
        }
    } catch (err) {
        alert('Could not list models. See the console for more details.');
        console.error(err);
    }
}

async function setupModelUpload(viewer: unknown) {
    const upload = document.getElementById('upload');
    const input = document.getElementById('input') as HTMLInputElement;
    const models = document.getElementById('models');
    upload!.onclick = () => input!.click();
    input!.onchange = async () => {
        let file = input!.files![0];
        let data = new FormData();
        data.append('model-file', file);
        if (file.name.endsWith('.zip')) { // When uploading a zip file, ask for the main design file in the archive
            const entrypoint = window.prompt('Please enter the filename of the main design inside the archive.');
            data.append('model-zip-entrypoint', entrypoint!);
        }
        upload!.setAttribute('disabled', 'true');
        models!.setAttribute('disabled', 'true');
        showNotification(`Uploading model <em>${file.name}</em>. Do not reload the page.`);
        try {
            const resp = await fetch('/api/models', { method: 'POST', body: data });
            if (!resp.ok) {
                throw new Error(await resp.text());
            }
            const model = await resp.json();
            setupModelSelection(viewer, model.urn);
        } catch (err) {
            alert(`Could not upload model ${file.name}. See the console for more details.`);
            console.error(err);
        } finally {
            clearNotification();
            upload!.removeAttribute('disabled');
            models!.removeAttribute('disabled');
            input!.value = '';
        }
    };
}

async function onModelSelected(viewer: any, urn: string) {
    //if (window.onModelSelectedTimeout) {
    //    clearTimeout(window.onModelSelectedTimeout);
    //    delete window.onModelSelectedTimeout;
    //}
    window.location.hash = urn;
    try {
        const resp = await fetch(`/api/models/${urn}/status`);
        if (!resp.ok) {
            throw new Error(await resp.text());
        }
        const status = await resp.json();
        switch (status.status) {
            case 'n/a':
                showNotification(`Model has not been translated.`);
                break;
            case 'inprogress':
                showNotification(`Model is being translated (${status.progress})...`);
                //window.onModelSelectedTimeout = setTimeout(onModelSelected, 5000, viewer, urn);
                break;
            case 'failed':
                showNotification(`Translation failed. <ul>${status.messages.map((msg: any) => `<li>${JSON.stringify(msg)}</li>`).join('')}</ul>`);
                break;
            default:
                clearNotification();
                loadModel(viewer, urn);
                break; 
        }
    } catch (err) {
        alert('Could not load model. See the console for more details.');
        console.error(err);
    }
}

function showNotification(message: string) {
    const overlay = document.getElementById('overlay');
    overlay!.innerHTML = `<div class="notification">${message}</div>`;
    overlay!.style.display = 'flex';
}

function clearNotification() {
    const overlay = document.getElementById('overlay');
    overlay!.innerHTML = '';
    overlay!.style.display = 'none';
}