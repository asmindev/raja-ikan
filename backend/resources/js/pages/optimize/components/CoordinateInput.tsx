import type { Coordinate } from '../types';

interface CoordinateInputProps {
    coordinates: Coordinate[];
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, coord: Coordinate) => void;
}

export default function CoordinateInput({
    coordinates,
    onAdd,
    onRemove,
    onUpdate,
}: CoordinateInputProps) {
    return (
        <div className="space-y-3">
            {coordinates.map((coord, index) => (
                <div key={index} className="flex items-start gap-2">
                    <div className="flex h-10 w-8 shrink-0 items-center justify-center">
                        <span className="text-sm font-medium text-gray-600">
                            {index + 1}
                        </span>
                    </div>
                    <div className="grid flex-1 grid-cols-2 gap-2">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700">
                                Latitude
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={coord.latitude}
                                onChange={(e) =>
                                    onUpdate(index, {
                                        ...coord,
                                        latitude: parseFloat(e.target.value),
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                placeholder="-3.9778"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-700">
                                Longitude
                            </label>
                            <input
                                type="number"
                                step="0.0001"
                                value={coord.longitude}
                                onChange={(e) =>
                                    onUpdate(index, {
                                        ...coord,
                                        longitude: parseFloat(e.target.value),
                                    })
                                }
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-transparent focus:ring-2 focus:ring-blue-500"
                                placeholder="122.5194"
                            />
                        </div>
                    </div>
                    <button
                        onClick={() => onRemove(index)}
                        disabled={coordinates.length <= 2}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-red-600 transition-colors hover:bg-red-50 disabled:text-gray-300 disabled:hover:bg-transparent"
                        title="Remove waypoint"
                    >
                        <svg
                            className="h-5 w-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                        </svg>
                    </button>
                </div>
            ))}
            <button
                onClick={onAdd}
                className="w-full rounded-lg border-2 border-dashed border-gray-300 py-2 text-sm font-medium text-gray-600 transition-colors hover:border-blue-400 hover:text-blue-600"
            >
                + Add Waypoint
            </button>
        </div>
    );
}
