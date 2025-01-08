import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { camera } from './main.js';
import { modelname } from './modelprovider.js';

const minimapScene = new THREE.Scene();
minimapScene.background = new THREE.Color(0xd6d6d6);

const ambientLight = new THREE.AmbientLight(0xffffff, 1);
minimapScene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
minimapScene.add(directionalLight);

const minimapSize = 200;
const minimapRenderer = new THREE.WebGLRenderer({ alpha: true });
minimapRenderer.setSize(minimapSize, minimapSize);
minimapRenderer.setClearColor(0x000000, 0);

const minimapContainer = document.getElementById('minimap-container');
minimapContainer.appendChild(minimapRenderer.domElement);

minimapContainer.style.display = 'none';

const minimapCamera = new THREE.OrthographicCamera(
    -5.2,  
    5,     
    5,     
    -5,   
    1,    
    100  
);

minimapCamera.position.set(5, 10, 1); 
minimapCamera.lookAt(minimapCamera.position.x, 0, minimapCamera.position.z);

const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16);
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cameraSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

minimapScene.add(cameraSphere);

let ceiling;
const minimapLoader = new GLTFLoader();
let model;

minimapLoader.load(
    modelname, 
    (gltf) => {
        model = gltf.scene;
        model.position.set(0, 0, 0);
        
        minimapScene.add(model);

        ceiling = model.getObjectByName("Ceiling");
        if (ceiling) {
            ceiling.visible = false; 
            console.log("Ceiling object found and made visible.");
        } else {
            console.warn("Ceiling not found in the model.");
        }

        model.traverse((child) => {
            console.log(`Name: ${child.name}, Type: ${child.type}`);
            if (child.material && child.material.map) {
                console.log(`Texture for ${child.name}:`, child.material.map);
            }
        });

        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const boundingBoxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z); 
        const boundingBoxMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, wireframe: true, visible: false 
        });
        const boundingBoxMesh = new THREE.Mesh(boundingBoxGeometry, boundingBoxMaterial);

        boundingBoxMesh.position.copy(center);

        minimapScene.add(boundingBoxMesh);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the model:', error);
    }
);

function isCameraInsideBox() {
    const minBounds = new THREE.Vector3(-5.5, 0, -6); 
    const maxBounds = new THREE.Vector3(10, 5, 6);  

    return (
        camera.position.x >= minBounds.x &&
        camera.position.x <= maxBounds.x &&
        camera.position.y >= minBounds.y &&
        camera.position.y <= maxBounds.y &&
        camera.position.z >= minBounds.z &&
        camera.position.z <= maxBounds.z
    );
}

export function changeObjectTextureminimap(textureFilePath, objectName) {
    if (!model) {
        console.error("Model is not loaded yet.");
        return;
    }

    const targetObject = model.getObjectByName(objectName);

    if (!targetObject) {
        console.error(`Object with name "${objectName}" not found in the model.`);
        return;
    }

    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        textureFilePath,
        (texture) => {
            if (targetObject.material) {
                targetObject.material.map = texture;
                targetObject.material.needsUpdate = true;
                console.log(`Texture applied to object "${objectName}".`);
            } else {
                console.error(`Object "${objectName}" does not have a material.`);
            }
        },
        undefined,
        (error) => {
            console.error(`Failed to load texture from "${textureFilePath}":`, error);
        }
    );
}

function updateMiniMap() {
    cameraSphere.position.set(camera.position.x, 5, camera.position.z);

    if (isCameraInsideBox()) {
        minimapContainer.style.display = 'block';
        cameraSphere.visible = true; 
    } else {
        minimapContainer.style.display = 'none';
        cameraSphere.visible = false; 
    }

    minimapRenderer.render(minimapScene, minimapCamera);

    requestAnimationFrame(updateMiniMap);
}

updateMiniMap();
