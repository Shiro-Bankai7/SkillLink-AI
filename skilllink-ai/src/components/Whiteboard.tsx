import { Excalidraw } from '@excalidraw/excalidraw';


export default function Whiteboard() {
  return (
    <div className="relative w-full max-w-2xl aspect-video bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col items-stretch overflow-hidden">
      <div className="px-5 py-2 bg-gradient-to-r from-purple-100 to-indigo-100 border-b border-gray-100 text-lg font-semibold text-purple-700 tracking-tight">
        Collaborative Whiteboard
      </div>
      <div className="flex-1 min-h-[350px] min-w-[300px]">
        <Excalidraw UIOptions={{ canvasActions: { changeViewBackgroundColor: false } }} />
      </div>
    </div>
  );
}
