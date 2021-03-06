import React, { Component } from "react";
import { withFirebase } from "../Firebase";
import * as THREE from "three";


// import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
// import OrbitControls from 'orbit-controls-es6';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { Button } from "antd";
import ThreeAssetPreviewControls from './ThreeAssetPreviewControls';
import Frame from '../PlanBuilder/Frame';
import Floor from '../PlanBuilder/Floor';
import WallObject from '../PlanBuilder/WallObject';
import Surroundings from '../PlanBuilder/Surroundings';
import Sculpture from '../PlanBuilder/Sculpture';

import { emptyScene } from "../../Helpers/TextureAdder"


const wallWidth = 20;


class ThreeAssetPreview extends Component {
    frameWidth = 2;
    state = {
        assetRef: null,
        selectedItem: null,
        voxelsX: 10,
        voxelsY: 13,
        wallWidth: 20,
        animations: null
    }

    constructor(props) {
        super(props);
        console.log("FramePreview", props);
        this.type = props.type;
        this.gridWidth = 16 * wallWidth;
        this.gridDepth = 12 * wallWidth;
        this.preview = true;
    this.clock = new THREE.Clock();

        this.typeMap = {
            frame: {
                add: this.addFrame,
                obj: "group",
                cameraPos: [0, 0, 36]
            },
            floor: {
                add: this.addFloor,
                obj: "floorMesh",
                cameraPos: [0, 60, 260]
            },
            wall: {
                add: this.addWall,
                obj: "wallGroup",
                cameraPos: [0, 0, 110]

            },
            surrounds: {
                add: this.addSurrounds,
                obj: null,
                cameraPos: [0, 0, 110]

            },
            "3d object": {
                add: this.addSculpture,
                obj: "gltfScene",
                cameraPos: [0, 0, 80]

            }
        }
    }

    componentDidMount() {
        this.sceneSetup();
        this.addCustomSceneObjects();
        this.startAnimationLoop();
        this.typeMap[this.type]["add"]();

    }
    componentDidUpdate(oldProps) {
        console.log("ThreeAssetPreview newProps", oldProps, this.oldProps, oldProps.selectedItem !== this.props.selectedItem)
        if (oldProps.item !== this.props.item) {
            this.props.item && this.handleTileSelected();//!this.props.item && 
        }
    }

    componentWillUnmount() {
        // window.removeEventListener('resize', this.handleWindowResize);
        window.cancelAnimationFrame(this.requestID);
        this.controls.dispose();
        emptyScene(this.scene);
        this.renderer.forceContextLoss()
        this.renderer.dispose();
    }

    handleTileSelected() {
        console.log("handleTileSelected", this.props.item)
        this.setState({ selectedItem: this.props.item });
        this.resetFrame();
        this.frameObject.setDataToMaterial(this.props.item);
        if (this.props.item.roughness) this.frameObject.setDataToMaterial({ roughness: this.props.item.roughness });
        this.setState({ assetRef: this.props.firebase.getAssetRef(this.type, this.props.item.key) })
    }

    sceneSetup = () => {
        const width = this.el.clientWidth;
        const height = this.el.clientHeight;
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
            45, // fov = field of view
            width / height, // aspect ratio
            0.1, // near plane
            1000 // far plane
        );
        this.camera.position.set(...this.typeMap[this.type].cameraPos);

        this.renderer = new THREE.WebGLRenderer({
            antialias: true
        });
        this.renderer.setSize(width, height);
        this.el.appendChild(this.renderer.domElement); // mount using React ref};
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    }
    addFrame = () => {
        this.frameObject = new Frame();
        console.log("addFrame this.frameObject", this.frameObject)
        this.frameObject.setPreviewFrame();
        this.scene.add(this.frameObject.group);
    }

    addFloor = () => {
        const options = {
            builder: this
        }
        this.frameObject = new Floor(options);
        this.frameObject.addFloorMesh();
        console.log("addFloor lookAt", this.frameObject.floorMesh.position)
        this.camera.lookAt(this.frameObject.floorMesh.position)
        console.log("addFloor this.scene", this.camera)
    }

    addWall = () => {
        const options = {
            builder: this,
            pos: 1,
            preview: true
        }
        this.frameObject = new WallObject(options);
        this.frameObject.animateWallBuild();
        this.meshRatio = this.frameObject.wallMesh.geometry.parameters.width / this.frameObject.wallMesh.geometry.parameters.height;
        console.log("this.meshRatio", this.meshRatio)
        this.camera.target = this.frameObject.wallMesh;
        console.log("addFloor this.scene", this.camera)
    }

    addSurrounds = () => {
        console.log("addSurrounds", this)
        this.frameObject = new Surroundings(this);
    }

    addSculpture = () => {
        console.log("addSculpture");
        this.frameObject = new Sculpture(this);
    }
    sculptureCallback = gltf => {
        // this.scene.add(this.frameObject.gltfScene);
        console.log("sculptureCallback added", this.frameObject);
        if (this.frameObject.clips.length > 0) {
            const animations = {
                mixer: this.frameObject.mixer,
                clips: this.frameObject.clips
            }
            this.setState({ animations });
            this.frameObject.playAnimation(this.props.item.animation)
        }
    }



    resetFrame() {
        this.scene.background = null;
        this.scene.remove(this.frameObject[this.typeMap[this.type]["obj"]]);
        this.addCustomSceneObjects()
        this.typeMap[this.type]["add"]();
    }

    addCustomSceneObjects = () => {
        this.addLights();
    };

    addLights() {
        const lights = [];
        lights[0] = new THREE.PointLight(0xffffff, 1, 0);
        lights[1] = new THREE.PointLight(0xffffff, 1, 0);
        lights[2] = new THREE.PointLight(0xffffff, 1, 0);
        lights[3] = new THREE.AmbientLight(0xa0a0a0);
        lights[4] = new THREE.DirectionalLight(0x002288);

        lights[0].position.set(0, 200, 0);
        lights[1].position.set(0, 60, 60);
        lights[2].position.set(0, 0, 100);
        lights[4].position.set(- 100, - 200, - 100);

        // this.scene.add(lights[0]);
        this.scene.add(lights[1]);
        // this.scene.add(lights[2]);
        this.scene.add(lights[3]);
        // this.scene.add(lights[4]);

    }
    startAnimationLoop = () => {
        this.renderer.render(this.scene, this.camera);
        if (this.frameObject && this.frameObject.clips?.length > 0) {
            this.frameObject.mixer.update(this.clock.getDelta());
        }

        
        this.requestID = window.requestAnimationFrame(this.startAnimationLoop);
    };

    createNewHandler = () => {
        this.setState({ assetRef: this.props.firebase.getNewAssetRef(this.type) }, () => { console.log("newasset created") })
    }
    
    finishedCallback = () => {
        console.log("finishedCallback");
        this.resetFrame();
        this.setState({ assetRef: null, selectedItem: null });
    }

    render() {
        const { assetRef, selectedItem, animations } = this.state;
        return (<div>
            <div style={{ height: 400, marginBottom: 16 }} ref={ref => (this.el = ref)} />
            {(this.frameObject && (selectedItem || assetRef)) ?
                (<ThreeAssetPreviewControls frameObject={this.frameObject} finishedCallback={this.finishedCallback}
                    type={this.type} assetRef={assetRef} selectedItem={selectedItem} firebase={this.props.firebase} meshRatio={this.meshRatio} help={this.props.help} animations={animations} />)
                :
                (<div>Select from Vault below to edit a {this.type} or...
                    <div> <Button onClick={this.createNewHandler}>Create New {this.type.toUpperCase()}</Button></div>
                </div>)}
        </div>
        )

    }
}

export default withFirebase(ThreeAssetPreview);