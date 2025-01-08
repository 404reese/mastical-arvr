import { camera, moveCameraTo, animate, changeObjectTexturemain, ceiling } from './main.js';
import { changeObjectTextureminimap } from './minimap.js';

let lastClickedButton = null;
export { lastClickedButton };
let ismoving = false;

const overview = document.querySelector(".overview");
const topview = document.querySelector(".topview");
const appartment = document.querySelector(".appartment");
const bedroom1 = document.querySelector(".bedroom1");
const bedroom2 = document.querySelector(".bedroom2");
const kitchen = document.querySelector(".kitchen");

overview.addEventListener("click", () => {
    ceiling.visible=true;
    if (ismoving === false){
        if (lastClickedButton != null) {
            ismoving = true;
            moveCameraTo({ x: 0, y: 15, z: 30 }, { x: 0, y: 5, z: 0 }, 1, "yes");
            setTimeout(() => {
                lastClickedButton = null;
                ismoving = false;
            }, 1000);
        }
    }
});

appartment.addEventListener("click", () => {
    if (ismoving === false){
        if (lastClickedButton==null) {
            ismoving = true;
            moveCameraTo({ x: 0.67, y: 1.5, z: -5.8 }, { x: 0.67, y: 1.5, z: -5.799 }, 0.5, "yes");
            setTimeout(() => {
                ceiling.visible=true;
                moveCameraTo({ x: 1, y: 1.5, z: 0 }, { x: 1, y: 1.5, z: 0.5 }, 1, "no");
                setTimeout(() => {
                    moveCameraTo({ x: 1, y: 1.5, z: 0 }, { x: 1.5, y: 1.5, z: 0.5 }, 1, "no");
                    setTimeout(() => {
                        lastClickedButton = "appartment";
                        ismoving = false;
                    }, 1000);
                }, 1000);
            }, 550);
        }else if (lastClickedButton=="topview") {
            ismoving = true;
            moveCameraTo({ x: 1, y: 1.5, z: 0 }, { x: 1.5, y: 1.5, z: 0.5 }, 1, "no");
            setTimeout(() => {
                ceiling.visible=true;
                lastClickedButton = "appartment";
                ismoving = false;
            }, 1000);
        }
    }
});

bedroom1.addEventListener("click", () => {
    if (ismoving === false){
        if (lastClickedButton=="appartment") {
            ismoving = true;
            moveCameraTo({ x: 3.85, y: 1.5, z: 0.9 }, { x: 3.855, y: 1.5, z: 0.905 }, 1, "no");
            setTimeout(() => {
                ceiling.visible=true;
                moveCameraTo({ x: 3.85, y: 1.5, z: 0.9 }, { x: 3.85, y: 1.5, z: 0.905 }, 1, "no");
                setTimeout(() => {
                    moveCameraTo({ x: 3.88, y: 1.5, z: 1.76 }, { x: 3.881, y: 1.5, z: 1.761 }, 1, "no");
                    setTimeout(() => {
                        moveCameraTo({ x: 4.99, y: 1.5, z: 3.6 }, { x: 4.991, y: 1.5, z: 3.601 }, 1, "no");
                        setTimeout(() => {
                            lastClickedButton = "bedroom1";
                            ismoving = false;
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
            lastClickedButton = "bedroom1";
        }else if (lastClickedButton=="topview") {
            ismoving = true;
            ceiling.visible=true;
            moveCameraTo({ x: 4.99, y: 1.5, z: 3.6 }, { x: 4.991, y: 1.5, z: 3.601 }, 1, "no");
            setTimeout(() => {
                lastClickedButton = "bedroom1";
                ismoving = false;
            }, 1000);
        }
    }
});

bedroom2.addEventListener("click", () => {
    if (ismoving === false){
        if (lastClickedButton=='appartment') {
            ismoving = true;
            moveCameraTo({ x: 3.65, y: 1.5, z: 0.98 }, { x: 3.655, y: 1.5, z: 0.985 }, 1, "no");
            setTimeout(() => {
                ceiling.visible=true;
                moveCameraTo({ x: 3.65, y: 1.5, z: 0.98 }, { x: 3.655, y: 1.5, z: 0.98 }, 1, "no");
                setTimeout(() => {
                    moveCameraTo({ x: 6.97, y: 1.5, z: 0.97 }, { x: 6.983, y: 1.5, z: 0.97 }, 1, "no");
                    setTimeout(() => {
                        moveCameraTo({ x: 7.94, y: 1.5, z: 2.84 }, { x: 7.945, y: 1.5, z: 2.845 }, 1, "no");
                        setTimeout(() => {
                            lastClickedButton = "bedroom2";
                            ismoving = false;
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        }else if (lastClickedButton=='bedroom1') {
            ismoving = true;
            moveCameraTo({ x: camera.position.x, y: 1.5, z: camera.position.z }, { x: 3.65, y: 1.5, z: 0.98 }, 1, "no");
            setTimeout(()=>{
                ceiling.visible=true;
                moveCameraTo({ x: 3.65, y: 1.5, z: 0.98 }, { x: 3.655, y: 1.5, z: 0.98 }, 1, "no");
                setTimeout(() => {
                    moveCameraTo({ x: 3.65, y: 1.5, z: 0.98 }, { x: 3.655, y: 1.5, z: 0.98 }, 1, "no");
                    setTimeout(() => {
                        moveCameraTo({ x: 6.97, y: 1.5, z: 0.97 }, { x: 6.983, y: 1.5, z: 0.97 }, 1, "no");
                        setTimeout(() => {
                            moveCameraTo({ x: 7.94, y: 1.5, z: 2.84 }, { x: 7.945, y: 1.5, z: 2.845 }, 1, "no");
                            setTimeout(() => {
                                lastClickedButton = "bedroom2";
                                ismoving = false;
                            }, 1000);
                        }, 1000);
                    }, 1000);
                }, 1000);
            },1000)
        }
    }
});

kitchen.addEventListener("click", () => {
    if (ismoving === false){
        if (lastClickedButton=='appartment'&&ismoving === false) {
            ismoving = true;
            moveCameraTo({ x: 4.5, y: 1.5, z: 0.98 }, { x: 4.505, y: 1.5, z: 0.985 }, 1, "no");
            setTimeout(() => {
                ceiling.visible=true;
                moveCameraTo({ x: 4.5, y: 1.5, z: 0.98 }, { x: 4.5, y: 1.5, z: 0.975 }, 1, "no");
                setTimeout(() => {
                    moveCameraTo({ x: 4.6, y: 1.5, z: -1}, { x: 4.6, y: 1.5, z: -1.005 }, 1, "no");
                    setTimeout(() => {
                        moveCameraTo({ x: 4.6, y: 1.5, z: -1}, { x: 4.595, y: 1.5, z: -1 }, 1, "no");
                        setTimeout(() => {
                            lastClickedButton = "bedroom";
                            ismoving = false;
                        }, 1000);
                    }, 1000);
                }, 1000);
            }, 1000);
        }
    }
});

let change_texture1 = document.querySelector(".change_texture1");

change_texture1.addEventListener('click',()=>{
    changeObjectTexturemain('textures/floor1.jpg','Cube041');
    changeObjectTextureminimap('textures/floor1.jpg','Cube041');
})


topview.addEventListener("click",()=>{
    ceiling.visible=false;
    ismoving=true;
    moveCameraTo({ x: 4, y: 12, z: 1.6}, { x: 4, y: 5, z: 1.6 }, 1, "no");
    setTimeout(()=>{
        ismoving=false;
    },1000);
    lastClickedButton="topview";
})


animate();
