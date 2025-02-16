export const RECTANGLE_COLORS = {  blue: "#3498db",green: "#2ecc71", yellow:"#f1c40f", red: "#e74c3c"};
export const CANVAS_COLORS = {  blue: "#2b72ff",white: "#ffffff"};
export const ROTATE_SPEED = 0.02;

export enum CanvaState {
  idle = "idle",
  drawing = "drawing",
  moving = "moving",
  rotating = "rotating",
  drag = "drag",
}