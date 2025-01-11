import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import {objecttobeadded } from './caller.js';

// Scene setup
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd6d6d6);

// Camera setup
export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 30);

// Renderer setup
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 1.5 : 1); // Adjust for high-DPI screens
const canvasContainer = document.getElementById('canvas-container');
canvasContainer.appendChild(renderer.domElement);

// Handle window resizing
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera); // Optional: Trigger a render after resizing
}

// Add event listener for window resize
window.addEventListener('resize', onWindowResize);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
scene.add(directionalLight);

// Ground Plane
const planeGeometry = new THREE.PlaneGeometry(1000, 1000);
const planeMaterial = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    transparent: true, // Allow transparency
    opacity: 0,        // Set opacity to 0 to make it invisible
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.name = 'ground';
scene.add(plane);


// Variables for the outlines (removed)
let ceiling;
export { ceiling };
import { modelname } from './modelprovider.js';
import { log } from 'three/src/nodes/TSL.js';

console.log(modelname);

const loader = new GLTFLoader();
let model;
loader.load(
    modelname,
    (gltf) => {
        model = gltf.scene;
        model.position.set(0, 0, 0);
        scene.add(model);

        ceiling = model.getObjectByName("Ceiling");
        if (ceiling) {
            ceiling.visible = true; // Hide the first outline
        } else {
            console.warn("Ceiling not found in the model.");
        }

        // Traverse the model and log each object's name and type
        model.traverse((child) => {
            console.log(`Name: ${child.name}, Type: ${child.type}`);
        });

        // Calculate the bounding box of the model
        const box = new THREE.Box3().setFromObject(model);

        // Get the size of the bounding box
        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        // Create a box to match the size of the model, but increase the height by 1.5 times
        const boundingBoxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z); // Scale the height
        const boundingBoxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, visible: false });
        const boundingBoxMesh = new THREE.Mesh(boundingBoxGeometry, boundingBoxMaterial);

        // Position the bounding box at the same center as the model
        boundingBoxMesh.position.copy(center);

        // Add the bounding box to the scene
        scene.add(boundingBoxMesh);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the model:', error);
    }
);

highlightObject("FOLEY__corona001",modelname)

// Function to highlight an object
function highlightObject(objectName, model) {
    // Traverse the model to find the target object by name
    let targetObject = null;
    model.traverse((child) => {
        if (child.isMesh && child.name === objectName) {
            targetObject = child;
        }
    });

    if (targetObject) {
        // Store the original material
        const originalMaterial = targetObject.material;

        // Create a new material for highlighting
        const highlightMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff00, // Bright yellow
            emissive: 0x333300,
            wireframe: false,
        });

        // Apply the highlight material
        targetObject.material = highlightMaterial;

        // Revert to the original material after a delay (e.g., 2 seconds)
        setTimeout(() => {
            targetObject.material = originalMaterial;
        }, 2000);
    } else {
        console.error(`Object with name "${objectName}" not found in the model.`);
    }
}


// OrbitControls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 5, 0);

// WASD Controls
const moveSpeed = 0.25;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let isMoving = false; // Flag to track if the camera is moving

// Box to block camera movement
const boxGeometry = new THREE.BoxGeometry(11, 5, 26);
const boxMaterial = new THREE.MeshStandardMaterial({
    color: 0x00000,
    wireframe: true,
    transparent: true,
    opacity: 0
});
const box = new THREE.Mesh(boxGeometry, boxMaterial);
box.position.set(0, 2.5, 1);
scene.add(box);

// Event listeners for hover effect
renderer.domElement.addEventListener('pointerdown', () => {
    isHovering = false;
    controls.enableRotate = true;
});

renderer.domElement.addEventListener('pointerup', () => {
    isHovering = true;
});

// Keyboard event listeners
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
            moveForward = true;
            break;
        case 'KeyS':
            moveBackward = true;
            break;
        case 'KeyA':
            moveLeft = true;
            break;
        case 'KeyD':
            moveRight = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
            moveForward = false;
            break;
        case 'KeyS':
            moveBackward = false;
            break;
        case 'KeyA':
            moveLeft = false;
            break;
        case 'KeyD':
            moveRight = false;
            break;
    }
});

// Hover effect settings
const clock = new THREE.Clock();
const hoverAmplitude = 0.002;
const hoverSpeed = 0.5;
let isHovering = true;  // Controls whether hover effect is enabled

// Raycasting setup to detect if camera is colliding with any walls
const raycaster = new THREE.Raycaster();
const collisionDistance = 1.5; // Distance threshold for detecting collision

// Function to check if the camera is too close to any walls
function isCameraCollidingWithWalls() {
    // Raycast in the direction the camera is facing
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.rotation);
    raycaster.ray.origin.copy(camera.position);
    raycaster.ray.direction.copy(direction);

    // Check if the ray intersects any object (e.g., walls) within the specified distance
    const intersects = raycaster.intersectObject(scene, true);  // Check all objects in the scene

    if (intersects.length > 0 && intersects[0].distance < collisionDistance) {
        return true; // Camera is too close to a wall
    }
    return false; // No collision detected
}




// Function to check if the camera is inside the box
function isCameraInsideBox() {
    const minBounds = new THREE.Vector3(-5.5, 0, -13);  // Define min boundaries
    const maxBounds = new THREE.Vector3(5.5, 5, 13);    // Define max boundaries

    return (
        camera.position.x >= minBounds.x &&
        camera.position.x <= maxBounds.x &&
        camera.position.y >= minBounds.y &&
        camera.position.y <= maxBounds.y &&
        camera.position.z >= minBounds.z &&
        camera.position.z <= maxBounds.z
    );
}

// Restrict WASD movement inside the box with respect to the camera's local direction
function restrictWASDMovement() {
    const cameraInside = isCameraInsideBox();
    const moveVector = new THREE.Vector3();

    const forward = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.quaternion);
    const right = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);

    forward.normalize();
    right.normalize();

    if (moveForward) moveVector.add(forward);
    if (moveBackward) moveVector.add(forward.negate());
    if (moveLeft) moveVector.add(right.negate());
    if (moveRight) moveVector.add(right);

    moveVector.normalize().multiplyScalar(moveSpeed);

    if (!cameraInside) {
        camera.position.add(moveVector);
        isMoving = moveVector.lengthSq() > 0;
    } else {
        isMoving = false;
    }

    camera.position.y = Math.max(camera.position.y, 0);
}

let hoverpossible=true;



// Function to animate the camera to a target position and set OrbitControls target
// Function to clamp the camera position within the bounding box
function clampPositionToBox(position) {
    const minBounds = boundingBox.min;
    const maxBounds = boundingBox.max;

    position.x = Math.max(minBounds.x, Math.min(position.x, maxBounds.x));
    position.y = Math.max(minBounds.y, Math.min(position.y, maxBounds.y));
    position.z = Math.max(minBounds.z, Math.min(position.z, maxBounds.z));

    return position;
}

// Function to animate the camera to a target position and set OrbitControls target (same as before)
export function moveCameraTo(location, point, duration = 1, blur = "no") {
    const startPosition = new THREE.Vector3().copy(camera.position);
    const startTarget = new THREE.Vector3().copy(controls.target);

    const endPosition = new THREE.Vector3(location.x, location.y, location.z);
    const endTarget = new THREE.Vector3(point.x, point.y, point.z);

    let startTime = null;

    if (blur === "yes") {
        applyBlurEffect("yes");
    }

    function animateCamera(time) {
        if (!startTime) startTime = time;
        const elapsedTime = (time - startTime) / 1000;
        const t = Math.min(elapsedTime / duration, 1);

        // Smoothly interpolate the camera position and target
        camera.position.lerpVectors(startPosition, endPosition, t);

        const currentTarget = new THREE.Vector3().lerpVectors(startTarget, endTarget, t);

        // Explicitly make the camera look at the interpolated target
        camera.lookAt(currentTarget);

        controls.target.copy(currentTarget); // Keep controls synced for smooth interaction
        controls.update();
        renderer.render(scene, camera);

        if (t < 1) {
            requestAnimationFrame(animateCamera);
        } else {
            // Ensure the final position and target are precisely set
            camera.position.copy(endPosition);
            controls.target.copy(endTarget);
            camera.lookAt(endTarget);

            if (blur === "yes") {
                applyBlurEffect("no");
            }
        }
    }

    requestAnimationFrame(animateCamera);
}




// Apply blur effect
function applyBlurEffect(blur) {
    if (blur === "yes") {
        renderer.domElement.style.transition = "filter 0.3s";
        renderer.domElement.style.filter = "blur(10px)";
    }
    if (blur === "no") {
        renderer.domElement.style.filter = "none";
    }
}


// Raycasting for wall collision detection
const mouse = new THREE.Vector2();
let isCtrlPressed = false;
let isAltPressed = false;

document.addEventListener('keydown', (event) => {
    if (event.key === 'Control') isCtrlPressed = true;
    if (event.key === 'Alt') isAltPressed = true;
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'Control') isCtrlPressed = false;
    if (event.key === 'Alt') isAltPressed = false;
});

renderer.domElement.addEventListener('pointerdown', (event) => {
    if (isCtrlPressed && event.button === 0) {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(model, true);

        if (intersects.length > 0) {
            const intersectPoint = intersects[0].point;
            const collisionNormal = intersects[0].face.normal.clone(); // Get the normal of the intersected face

            // Move the camera 0.5 units away from the collision point in the direction opposite to the normal
            const cameraNewPosition = intersectPoint.clone().add(collisionNormal.multiplyScalar(-0.5));

            // Calculate the camera's view direction
            const viewDirection = new THREE.Vector3();
            camera.getWorldDirection(viewDirection);

            // Determine the new target position based on the view direction
            const targetNewPosition = cameraNewPosition.clone().add(viewDirection);

            // Print the camera's view direction as +x, -x, +z, -z
            const direction = getCameraCardinalDirection(viewDirection);
            
            if(direction=='+x'){
                moveCameraTo(
                    { x: cameraNewPosition.x, y: 1.5, z: cameraNewPosition.z },
                    { x: cameraNewPosition.x+0.01, y: 1.5, z: cameraNewPosition.z },
                    1,
                    "no"
                );
            }else if(direction=='-x'){
                moveCameraTo(
                    { x: cameraNewPosition.x, y: 1.5, z: cameraNewPosition.z },
                    { x: cameraNewPosition.x-0.01, y: 1.5, z: cameraNewPosition.z },
                    1,
                    "no"
                );
            }else if(direction=='+z'){
                moveCameraTo(
                    { x: cameraNewPosition.x, y: 1.5, z: cameraNewPosition.z },
                    { x: cameraNewPosition.x, y: 1.5, z: cameraNewPosition.z+0.01 },
                    1,
                    "no"
                );
            }else if(direction=='-z'){
                moveCameraTo(
                    { x: cameraNewPosition.x, y: 1.5, z: cameraNewPosition.z },
                    { x: cameraNewPosition.x, y: 1.5, z: cameraNewPosition.z-0.01 },
                    1,
                    "no"
                );
            }
            console.log(direction);
            
            setTimeout(()=>{
                console.log(camera.position);
                
            },1000)

            hoverpossible = false;
        }
    }else if (isAltPressed && event.button === 0){
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObject(model, true);

        if (intersects.length > 0) {
            const intersectPoint = intersects[0].point;
            const collisionNormal = intersects[0].face.normal.clone(); // Get the normal of the intersected face

            // Move the camera 0.5 units away from the collision point in the direction opposite to the normal
            const cameraNewPosition = intersectPoint.clone().add(collisionNormal.multiplyScalar(-0.5));

            // Calculate the camera's view direction
            const viewDirection = new THREE.Vector3();
            camera.getWorldDirection(viewDirection);

            // Determine the new target position based on the view direction
            const targetNewPosition = cameraNewPosition.clone().add(viewDirection);

            // Print the camera's view direction as +x, -x, +z, -z
            const direction = getCameraCardinalDirection(viewDirection);
            
            if(objecttobeadded!=null){
                placeObjectAtLocationm(objecttobeadded,cameraNewPosition.x,0,cameraNewPosition.z);
                console.log(objecttobeadded);
                
                console.log(cameraNewPosition.x,0,cameraNewPosition.z);
                
            }
            console.log(direction);
            
            setTimeout(()=>{
                console.log(camera.position);
                
            },1000)

            hoverpossible = false;
        }
    }
});

// Function to map view direction to cardinal directions
function getCameraCardinalDirection(viewDirection) {
    const absX = Math.abs(viewDirection.x);
    const absZ = Math.abs(viewDirection.z);

    if (absX > absZ) {
        return viewDirection.x > 0 ? "+x" : "-x";
    } else {
        return viewDirection.z > 0 ? "+z" : "-z";
    }
}

// Function to change the texture of a specific object in the model
export function changeObjectTexture(textureFilePath, objectName) {
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

    // Load the texture
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
        textureFilePath,
        (texture) => {
            // Apply the texture to the object's material
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


// Animation loop with constant frame rate (30 FPS)
let lastFrameTime = 0;
const frameInterval = 1000 / 120; // 30 FPS = 33.33 ms per frame

export const animate = (time) => {
    requestAnimationFrame(animate);

    if (time - lastFrameTime < frameInterval) {
        return; // Skip this frame
    }
    lastFrameTime = time;

    restrictWASDMovement();
    controls.update();
    renderer.render(scene, camera);
};

// Start the animation loop
animate();


// Function to duplicate an object and place the copy at a specific location
export function placeObjectAtLocationm(objectName, x, y, z) {
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
    scene.add(clonedObject);

    console.log(`Duplicated "${objectName}" and placed it at location (${x}, ${y}, ${z}).`);
}