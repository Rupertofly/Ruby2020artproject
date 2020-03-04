declare module '*.frag' {
    const shader: string;
    export = shader;
}
declare module '*.vert' {
    export const shader: string;
    export default shader;
}
