import * as THREE from "three";

export class CameraMotion
{
    public lat      :number = 20;
    public lng      :number = 90;
    public distance :number = 35;

    public latMov           :number = 0;
    public latMovSpeed      :number = 2;
    public lngMov           :number = 0;
    public lngMovSpeed      :number = 2;
    public distanceMov      :number = 0;
    public distanceMovSpeed :number = 2;

    public targetPos      :THREE.Vector3 = new THREE.Vector3();
    public targetMov      :THREE.Vector3 = new THREE.Vector3();
    public targetMovSpeed :THREE.Vector3 = new THREE.Vector3(2, 2, 2);

    public camup         :THREE.Vector3 = new THREE.Vector3(0, 1, 0);
    public camupMov      :THREE.Vector3 = new THREE.Vector3();
    public camupMovSpeed :THREE.Vector3 = new THREE.Vector3(2, 2, 2);

    constructor ()
    {

    }

    public setupLatLng (lat :number, lng :number, latMov :number = 0, lngMov :number = 0, latMovSpeed :number = 2, lngMovSpeed :number = 2)
    {
        this.lat = lat;
        this.lng = lng;
        this.latMov = latMov;
        this.lngMov = lngMov;
        this.latMovSpeed = latMovSpeed;
        this.lngMovSpeed = lngMovSpeed;
        return this;
    }
    public setupDistance (distance :number, distanceMov :number = 0, distanceMovSpeed :number = 2)
    {
        this.distance         = distance;
        this.distanceMov      = distanceMov;
        this.distanceMovSpeed = distanceMovSpeed;
        return this;
    }
    public setupTarget (x :number, y :number, z :number, movX :number = 0, movY :number = 0, movZ :number = 0, speedX :number = 0, speedY :number = 0, speedZ :number = 0)
    {
        this.targetPos.set(x, y, z);
        this.targetMov.set(movX, movY, movZ);
        this.targetMovSpeed.set(speedX, speedY, speedZ);
        return this;
    }
    public setupCamUp (x :number, y :number, z :number, movX :number = 0, movY :number = 0, movZ :number = 0, speedX :number = 0, speedY :number = 0, speedZ :number = 0)
    {
        this.camup.set(x, y, z);
        this.camupMov.set(movX, movY, movZ);
        this.camupMovSpeed.set(speedX, speedY, speedZ);
        return this;
    }
}