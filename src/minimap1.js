import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { camera } from './main1.js'; // Assuming this imports the main camera from main.js
import { modelname } from './modelprovider.js'; // Assuming modelname is the path to the model

// New minimap scene setup
const minimapScene = new THREE.Scene();
minimapScene.background = new THREE.Color(0xd6d6d6); // Set the background color of the minimap

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
minimapScene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
minimapScene.add(directionalLight);

// New renderer for minimap
const minimapSize = 200;
const minimapRenderer = new THREE.WebGLRenderer({ alpha: true });
minimapRenderer.setSize(minimapSize, minimapSize);
minimapRenderer.setClearColor(0x000000, 0); // Transparent background for the minimap

// Append mini-map renderer to the container
const minimapContainer = document.getElementById('minimap-container');
minimapContainer.appendChild(minimapRenderer.domElement);

// Initially hide the mini-map container
minimapContainer.style.display = 'none';

// Create a top-down camera for the mini-map (Orthographic camera)
const minimapCamera = new THREE.OrthographicCamera(
    -5.2,  // left
    5,     // right
    5,     // top
    -5,    // bottom
    1,     // near plane
    100    // far plane
);

minimapCamera.position.set(5, 10, 1);  // Adjusted camera height for the minimap
minimapCamera.lookAt(minimapCamera.position.x, 0, minimapCamera.position.z);

// Create a red sphere to represent the camera's position in the minimap
const sphereGeometry = new THREE.SphereGeometry(0.2, 16, 16); // Small red sphere
const sphereMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
const cameraSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);

// Add the sphere to the minimap scene
minimapScene.add(cameraSphere);

// Load the model using GLTFLoader
let ceiling;
const minimapLoader = new GLTFLoader();
let model;

minimapLoader.load(
    modelname,  // The path to your 3D model (e.g., 'path/to/model.glb')
    (gltf) => {
        model = gltf.scene;
        model.position.set(0, 0, 0);
        
        // Add the model to the minimap scene (not the main scene)
        minimapScene.add(model);

        // Find and show the "Ceiling" object if it exists
        ceiling = model.getObjectByName("Ceiling");
        if (ceiling) {
            ceiling.visible = false; // Ensure it's visible
            console.log("Ceiling object found and made visible.");
        } else {
            console.warn("Ceiling not found in the model.");
        }

        // Traverse the model and log each object's name and type for debugging
        model.traverse((child) => {
            console.log(`Name: ${child.name}, Type: ${child.type}`);
            if (child.material && child.material.map) {
                console.log(`Texture for ${child.name}:`, child.material.map);
            }
        });

        // Calculate the bounding box of the model to match the model's scale
        const box = new THREE.Box3().setFromObject(model);
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Create a box that matches the size of the model
        const boundingBoxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z); 
        const boundingBoxMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00ff00, wireframe: true, visible: false 
        });  // Set to false to keep it invisible for now
        const boundingBoxMesh = new THREE.Mesh(boundingBoxGeometry, boundingBoxMaterial);

        // Position the bounding box at the same center as the model
        boundingBoxMesh.position.copy(center);

        // Add the bounding box to the minimap scene for debugging purposes
        minimapScene.add(boundingBoxMesh);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the model:', error);
    }
);

// Function to check if the camera is inside the box
function isCameraInsideBox() {
    const minBounds = new THREE.Vector3(-5.5, 0, -6);  // Define min boundaries
    const maxBounds = new THREE.Vector3(10, 5, 6);    // Define max boundaries

    return (
        camera.position.x >= minBounds.x &&
        camera.position.x <= maxBounds.x &&
        camera.position.y >= minBounds.y &&
        camera.position.y <= maxBounds.y &&
        camera.position.z >= minBounds.z &&
        camera.position.z <= maxBounds.z
    );
}

// Mini-map update logic
function updateMiniMap() {
    // Update the red sphere's position to match the camera's position (with a fixed height)
    cameraSphere.position.set(camera.position.x, 5, camera.position.z);

    // Check if the camera is inside the box
    if (isCameraInsideBox()) {
        minimapContainer.style.display = 'block'; // Show the mini-map
        cameraSphere.visible = true; // Show the sphere
    } else {
        minimapContainer.style.display = 'none'; // Hide the mini-map
        cameraSphere.visible = false; // Hide the sphere
    }

    // Render the mini-map with the minimap scene
    minimapRenderer.render(minimapScene, minimapCamera);

    // Call the function on the next frame
    requestAnimationFrame(updateMiniMap);
}

// Start the update loop
updateMiniMap();


// Function to duplicate an object and place the copy at a specific location
export function placeObjectAtLocationmm(objectName, x, y, z) {
    // Ensure the model is loaded
    if (!model) {
        console.error("Model is not loaded yet.");
        return;
    }

    // Find the object by its name in the model's hierarchy
    const targetObject = model.getObjectByName(objectName);

    if (!targetObject) {
        console.error(`Object with name "${objectName}" not found in the model.`);
        return;
    }

    // Clone the object (this creates a new copy of the object)
    const clonedObject = targetObject.clone();

    // Set the cloned object's position to the given coordinates (x, y, z)
    clonedObject.position.set(x, y, z);

    // Add the cloned object to the scene
    minimapScene.add(clonedObject);

    console.log(`Duplicated "${objectName}" and placed it at location (${x}, ${y}, ${z}).`);
}