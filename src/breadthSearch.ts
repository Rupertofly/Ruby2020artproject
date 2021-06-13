type neighbourGetter<T = number> = (source: T) => Iterable<T>
type distanceGetter<T = number> = (source: T, dest: T) => number

export function breadthSearch<T = number>(
    start: T,
    end: T,
    getNeighbours: neighbourGetter<T>,
    getDistance: distanceGetter<T> = () => 1
) {
    let visited = [start]
    let route = [start]
}
export default breadthSearch
