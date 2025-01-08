import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { lastClickedButton } from './caller.js';

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0xd6d6d6);

export const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 15, 30);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio > 1 ? 1.5 : 1); 
const canvasContainer = document.getElementById('canvas-container');
canvasContainer.appendChild(renderer.domElement);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.render(scene, camera); 
}

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
    transparent: true, 
    opacity: 0,       
});
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.name = 'ground';
scene.add(plane);


let ceiling;
export { ceiling };
import { modelname } from './modelprovider.js';

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
            ceiling.visible = true; 
        } else {
            console.warn("Ceiling not found in the model.");
        }

        model.traverse((child) => {
            console.log(`Name: ${child.name}, Type: ${child.type}`);
        });

        const box = new THREE.Box3().setFromObject(model);

        const size = box.getSize(new THREE.Vector3());
        const center = box.getCenter(new THREE.Vector3());

        const boundingBoxGeometry = new THREE.BoxGeometry(size.x, size.y, size.z); // Scale the height
        const boundingBoxMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true, visible: false });
        const boundingBoxMesh = new THREE.Mesh(boundingBoxGeometry, boundingBoxMaterial);

        boundingBoxMesh.position.copy(center);

        scene.add(boundingBoxMesh);
    },
    undefined,
    (error) => {
        console.error('An error occurred while loading the model:', error);
    }
);


const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 5, 0);

const moveSpeed = 0.25;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let isMoving = false; 

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

const clock = new THREE.Clock();
const hoverAmplitude = 0.002;
const hoverSpeed = 0.5;
let isHovering = true;

const raycaster = new THREE.Raycaster();
const collisionDistance = 1.5;

function isCameraCollidingWithWalls() {
    const direction = new THREE.Vector3(0, 0, -1).applyQuaternion(camera.rotation);
    raycaster.ray.origin.copy(camera.position);
    raycaster.ray.direction.copy(direction);

    const intersects = raycaster.intersectObject(scene, true);

    if (intersects.length > 0 && intersects[0].distance < collisionDistance) {
        return true; 
    }
    return false; 
}

function isCameraInsideBox() {
    const minBounds = new THREE.Vector3(-6.1, 0, -13);
    const maxBounds = new THREE.Vector3(5.5, 5, 13);  

    return (
        camera.position.x >= minBounds.x &&
        camera.position.x <= maxBounds.x &&
        camera.position.y >= minBounds.y &&
        camera.position.y <= maxBounds.y &&
        camera.position.z >= minBounds.z &&
        camera.position.z <= maxBounds.z
    );
}

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

function clampPositionToBox(position) {
    const minBounds = boundingBox.min;
    const maxBounds = boundingBox.max;

    position.x = Math.max(minBounds.x, Math.min(position.x, maxBounds.x));
    position.y = Math.max(minBounds.y, Math.min(position.y, maxBounds.y));
    position.z = Math.max(minBounds.z, Math.min(position.z, maxBounds.z));

    return position;
}

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

        camera.position.lerpVectors(startPosition, endPosition, t);

        const currentTarget = new THREE.Vector3().lerpVectors(startTarget, endTarget, t);

        camera.lookAt(currentTarget);

        controls.target.copy(currentTarget);
        controls.update();
        renderer.render(scene, camera);

        if (t < 1) {
            requestAnimationFrame(animateCamera);
        } else {
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

function applyBlurEffect(blur) {
    if (blur === "yes") {
        renderer.domElement.style.transition = "filter 0.3s";
        renderer.domElement.style.filter = "blur(10px)";
    }
    if (blur === "no") {
        renderer.domElement.style.filter = "none";
    }
}

const mouse = new THREE.Vector2();
let isCtrlPressed = false;

document.addEventListener('keydown', (event) => {
    if (event.key === 'Control') isCtrlPressed = true;
});

document.addEventListener('keyup', (event) => {
    if (event.key === 'Control') isCtrlPressed = false;
});

renderer.domElement.addEventListener('pointerdown', (event) => {
    if (lastClickedButton != null) {
        ceiling.visible=true;
        if (isCtrlPressed && event.button === 0) {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
    
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(model, true);
    
            if (intersects.length > 0) {
                const intersectPoint = intersects[0].point;
                const collisionNormal = intersects[0].face.normal.clone(); 
    
                const cameraNewPosition = intersectPoint.clone().add(collisionNormal.multiplyScalar(-0.5));
    
                const viewDirection = new THREE.Vector3();
                camera.getWorldDirection(viewDirection);
    
                const targetNewPosition = cameraNewPosition.clone().add(viewDirection);
    
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
        }
    }
});

function getCameraCardinalDirection(viewDirection) {
    const absX = Math.abs(viewDirection.x);
    const absZ = Math.abs(viewDirection.z);

    if (absX > absZ) {
        return viewDirection.x > 0 ? "+x" : "-x";
    } else {
        return viewDirection.z > 0 ? "+z" : "-z";
    }
}

export function changeObjectTexturemain(textureFilePath, objectName) {
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


let lastFrameTime = 0;
const frameInterval = 1000 / 120; 

export const animate = (time) => {
    requestAnimationFrame(animate);

    if (time - lastFrameTime < frameInterval) {
        return;
    }
    lastFrameTime = time;

    restrictWASDMovement();
    controls.update();
    renderer.render(scene, camera);
};

// Start the animation loop
animate();