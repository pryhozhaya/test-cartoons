export const RECTANGLE_COLORS = {
  blue: "100,150,185",
  green: "46, 204, 113",
  yellow: "241, 196, 15",
  red: "231, 76, 60",
};
export const CANVAS_COLORS = { blue: "#2b72ff", white: "#ffffff" };
export const ROTATE_SPEED = 0.02;

export enum CanvaState {
  idle = "idle",
  drawing = "drawing",
  moving = "moving",
  rotating = "rotating",
  drag = "drag",
}
